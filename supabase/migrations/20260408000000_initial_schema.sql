-- Migration: 2026-04-08 initial schema — 7 tables + RLS
-- Source: docs/specs/dev-spec.md §3.2

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. teachers: 교사 프로필 (Supabase Auth 연동)
-- ============================================================
CREATE TABLE public.teachers (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  email       text NOT NULL,
  school      text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- 교사는 자신의 row만 조회/수정 가능
CREATE POLICY "teachers_select_own"
  ON public.teachers FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "teachers_insert_own"
  ON public.teachers FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "teachers_update_own"
  ON public.teachers FOR UPDATE
  USING (id = auth.uid());


-- ============================================================
-- 2. sessions: 수업/퀴즈 세션
-- ============================================================
CREATE TABLE public.sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  title       text NOT NULL,
  subject     text NOT NULL,
  grade       text NOT NULL,
  join_code   text NOT NULL UNIQUE,
  status      text NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'active', 'ended')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  started_at  timestamptz,
  ended_at    timestamptz
);

CREATE INDEX idx_sessions_join_code ON public.sessions(join_code);
CREATE INDEX idx_sessions_teacher_id ON public.sessions(teacher_id);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- 교사: 자기 세션 전체 권한
CREATE POLICY "sessions_teacher_all"
  ON public.sessions FOR ALL
  USING (teacher_id = auth.uid())
  WITH CHECK (teacher_id = auth.uid());

-- 학생(익명): active 세션 SELECT만
CREATE POLICY "sessions_anon_select_active"
  ON public.sessions FOR SELECT
  TO anon
  USING (status = 'active');


-- ============================================================
-- 3. questions: 퀴즈 문항
-- ============================================================
CREATE TABLE public.questions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  content         text NOT NULL,
  options         jsonb NOT NULL,   -- ["선택지A", "선택지B", "선택지C", "선택지D"]
  correct_answer  int  NOT NULL,   -- 0-based 인덱스
  question_order  int  NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_questions_session_order ON public.questions(session_id, question_order);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- 교사: 자기 세션의 문항 전체 권한
CREATE POLICY "questions_teacher_all"
  ON public.questions FOR ALL
  USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.sessions WHERE teacher_id = auth.uid()
    )
  );

-- 학생(익명): active 세션의 문항 SELECT만
CREATE POLICY "questions_anon_select_active"
  ON public.questions FOR SELECT
  TO anon
  USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE status = 'active'
    )
  );


-- ============================================================
-- 4. responses: 학생 응답
-- ============================================================
CREATE TABLE public.responses (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  question_id      uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  nickname         text NOT NULL,
  selected_answer  int  NOT NULL,   -- 0-based 인덱스
  is_correct       boolean NOT NULL,
  response_time_ms int  NOT NULL,   -- 응답 소요 시간 (밀리초)
  score            int  NOT NULL DEFAULT 0,
  submitted_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_responses_session_submitted ON public.responses(session_id, submitted_at);

ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- 학생(익명): active 세션에 INSERT만
CREATE POLICY "responses_anon_insert_active"
  ON public.responses FOR INSERT
  TO anon
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.sessions WHERE status = 'active'
    )
  );

-- 교사: 자기 세션의 응답 SELECT
CREATE POLICY "responses_teacher_select"
  ON public.responses FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE teacher_id = auth.uid()
    )
  );


-- ============================================================
-- 5. ai_insights: AI 분석 결과 캐시
-- ============================================================
CREATE TABLE public.ai_insights (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL UNIQUE REFERENCES public.sessions(id) ON DELETE CASCADE,
  insights    jsonb NOT NULL,
  -- 구조: {
  --   "top_weak_concepts": ["개념A", "개념B"],
  --   "strong_concepts": ["개념C"],
  --   "next_class_focus": "다음 수업 핵심 포인트",
  --   "question_analysis": [...],
  --   "overall_understanding_rate": 0.72
  -- }
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- 교사: 자기 세션의 인사이트만 SELECT/INSERT
CREATE POLICY "ai_insights_teacher_all"
  ON public.ai_insights FOR ALL
  USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.sessions WHERE teacher_id = auth.uid()
    )
  );


-- ============================================================
-- 6. class_drafts: AI 수업 초안
-- ============================================================
CREATE TABLE public.class_drafts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL UNIQUE REFERENCES public.sessions(id) ON DELETE CASCADE,
  content     text NOT NULL,  -- 마크다운 형식
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.class_drafts ENABLE ROW LEVEL SECURITY;

-- 교사: 자기 세션의 초안만 SELECT/INSERT
CREATE POLICY "class_drafts_teacher_all"
  ON public.class_drafts FOR ALL
  USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.sessions WHERE teacher_id = auth.uid()
    )
  );


-- ============================================================
-- 7. thumbs_feedback: 따봉 업/다운 피드백
-- ============================================================
CREATE TABLE public.thumbs_feedback (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  nickname    text NOT NULL,
  type        text NOT NULL CHECK (type IN ('up', 'down')),
  comment     text,  -- nullable
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.thumbs_feedback ENABLE ROW LEVEL SECURITY;

-- 학생(익명): active 세션에 INSERT만
CREATE POLICY "thumbs_feedback_anon_insert_active"
  ON public.thumbs_feedback FOR INSERT
  TO anon
  WITH CHECK (
    session_id IN (
      SELECT id FROM public.sessions WHERE status = 'active'
    )
  );

-- 교사: 자기 세션의 피드백 SELECT
CREATE POLICY "thumbs_feedback_teacher_select"
  ON public.thumbs_feedback FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM public.sessions WHERE teacher_id = auth.uid()
    )
  );
