# 기술 개발 명세 (Dev Spec)

> **이슈**: #18 — 기술 개발 명세 및 MVP 구현 계획 작성
> **작성일**: 2026-04-08
> **대상 프로젝트**: AI 교육 플랫폼 MVP (공모전 제출용, 마감 04/13)
> **작성 원칙**: 일론 머스크 5단계 엔지니어링 원칙 + TDD-first
> **상위 문서**: [`docs/whitepaper/project-plan.md`](../whitepaper/project-plan.md) (기획서)
> **우선순위 규칙**: 본 문서는 project-plan.md의 설계를 구현 수준으로 구체화한다. **상충 시 본 문서가 우선한다.**

---

## 목차

- [§1. 문서 개요](#1-문서-개요)
- [§2. 프로젝트 구조 + 기술 스택](#2-프로젝트-구조--기술-스택)
- [§3. DB 스키마 (Supabase PostgreSQL DDL)](#3-db-스키마-supabase-postgresql-ddl)
- [§4. API 설계](#4-api-설계)
- [§5. 구현 단위별 상세 명세 (IU-01 ~ IU-06)](#5-구현-단위별-상세-명세-iu-01--iu-06)
- [§6. TDD 테스트 전략](#6-tdd-테스트-전략)
- [§7. MVP → 고도화 로드맵](#7-mvp--고도화-로드맵)

---


## §1. 문서 개요

본 문서는 `docs/whitepaper/project-plan.md`의 기획/설계 내용을 **구현 수준으로 구체화**한 기술 개발 명세서다. DDL, TypeScript 인터페이스, API 스키마, RLS 정책, 테스트 기준 등 구현자가 즉시 코딩에 착수할 수 있는 상세를 제공한다. project-plan.md 내용의 단순 반복은 지양하며, 구현 상세가 기획서와 상충할 경우 **본 문서가 우선한다**.

**Next.js 버전 확정**: project-plan.md에서 Next.js 14/15가 혼용되어 있으나, 본 문서에서 **Next.js 15 (App Router)**로 확정한다.

---

## §2. 프로젝트 구조 + 기술 스택

### 2.1 디렉토리 구조

```
kit-vibe-edu-ai/
├── app/
│   ├── (student)/                  # 학생 퀴즈 게임 페이지 (레이아웃 분리)
│   │   ├── join/
│   │   │   └── page.tsx            # join_code 입력 + 닉네임 입력
│   │   ├── quiz/
│   │   │   └── [sessionId]/
│   │   │       └── page.tsx        # 실시간 퀴즈 + 리더보드
│   │   └── layout.tsx
│   ├── (teacher)/                  # 교사 대시보드 (인증 필요)
│   │   ├── dashboard/
│   │   │   └── page.tsx            # 세션 목록
│   │   ├── sessions/
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # 세션 생성 + 문항 편집
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # 세션 상세 (실시간 집계)
│   │   │       ├── insights/
│   │   │       │   └── page.tsx    # AI 인사이트 + 수업 초안
│   │   │       └── live/
│   │   │           └── page.tsx    # 라이브 진행 화면
│   │   └── layout.tsx
│   ├── api/
│   │   ├── sessions/
│   │   │   ├── route.ts            # POST /api/sessions
│   │   │   └── [id]/
│   │   │       ├── activate/
│   │   │       │   └── route.ts    # POST /api/sessions/[id]/activate
│   │   │       └── end/
│   │   │           └── route.ts    # POST /api/sessions/[id]/end
│   │   ├── insights/
│   │   │   └── generate/
│   │   │       └── route.ts        # POST /api/insights/generate
│   │   └── class-draft/
│   │       └── generate/
│   │           └── route.ts        # POST /api/class-draft/generate
│   ├── globals.css
│   ├── layout.tsx                  # 루트 레이아웃
│   └── page.tsx                    # 랜딩 (→ join 또는 로그인)
├── components/
│   ├── ui/                         # shadcn/ui 컴포넌트 (Button, Card 등)
│   ├── quiz/
│   │   ├── QuestionCard.tsx
│   │   ├── AnswerOptions.tsx
│   │   ├── Leaderboard.tsx
│   │   └── Timer.tsx
│   ├── dashboard/
│   │   ├── SessionCard.tsx
│   │   ├── ResponseChart.tsx
│   │   └── InsightPanel.tsx
│   └── shared/
│       ├── QRCodeDisplay.tsx
│       └── LoadingSpinner.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # 브라우저 Supabase 클라이언트
│   │   ├── server.ts               # 서버 컴포넌트용 Supabase 클라이언트
│   │   └── middleware.ts           # Auth 미들웨어
│   ├── anthropic.ts                # Claude API 클라이언트
│   ├── scoring.ts                  # 점수 계산 로직
│   ├── join-code.ts                # join_code 생성 유틸
│   └── prompts/
│       ├── insights.ts             # AI 인사이트 프롬프트 템플릿
│       └── class-draft.ts          # 수업 초안 프롬프트 템플릿
├── types/
│   ├── database.ts                 # Supabase generated types
│   ├── api.ts                      # API Request/Response 인터페이스
│   └── domain.ts                   # 도메인 모델 타입
├── middleware.ts                   # Next.js 미들웨어 (Auth 라우팅)
├── .env.local                      # (gitignore)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

### 2.2 기술 스택 + npm 의존성

#### Runtime

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `next` | `15.2.x` | App Router, Server Components, API Routes |
| `react` | `19.x` | UI 렌더링 |
| `react-dom` | `19.x` | DOM 렌더링 |
| `typescript` | `5.x` | 정적 타입 |

#### Supabase

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `@supabase/supabase-js` | `2.x` | DB/Auth/Realtime 클라이언트 |
| `@supabase/ssr` | `0.6.x` | Next.js SSR/SSG 쿠키 기반 세션 |

#### AI

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `@anthropic-ai/sdk` | `0.39.x` | Claude API (claude-sonnet-4-6) 호출 |

#### UI

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `tailwindcss` | `3.x` | 유틸리티 CSS |
| `@tailwindcss/typography` | `0.5.x` | 마크다운 렌더링용 prose 스타일 |
| `clsx` | `2.x` | 조건부 클래스 조합 |
| `tailwind-merge` | `2.x` | Tailwind 클래스 충돌 해결 |
| `class-variance-authority` | `0.7.x` | shadcn/ui variant 시스템 |
| `lucide-react` | `0.x` | 아이콘 |
| `qrcode` | `1.5.x` | QR 코드 생성 |
| `@types/qrcode` | `1.5.x` | qrcode 타입 정의 |

#### 검증

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `zod` | `3.x` | API 요청/응답 스키마 검증 |

#### 테스트

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `vitest` | `2.x` | 단위/통합 테스트 러너 |
| `@vitest/ui` | `2.x` | Vitest 브라우저 UI |
| `@playwright/test` | `1.x` | E2E 테스트 |

### 2.3 환경변수 템플릿 (`.env.local`)

```dotenv
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-...
```

> `SUPABASE_SERVICE_ROLE_KEY`와 `ANTHROPIC_API_KEY`는 서버 전용. `NEXT_PUBLIC_` 접두사 절대 금지.

### 2.4 일론 5단계 "삭제한 기술" 목록

| 삭제한 기술 | 대체 방법 | 삭제 이유 |
|------------|----------|---------|
| Redux / Zustand | `useState` + Supabase Realtime | 30명 규모 MVP에서 전역 상태 관리 라이브러리 불필요. Realtime 구독이 상태 동기화를 담당 |
| 별도 WebSocket 서버 | Supabase Realtime (내장) | Supabase Realtime이 PostgreSQL 변경 이벤트를 WebSocket으로 푸시. 별도 서버 운영 비용 제거 |
| 별도 인증 서버 | Supabase Auth (내장) | JWT 발급, 세션 관리, 이메일 인증 모두 Supabase Auth 내장. 7일 MVP에서 별도 구현 불필요 |
| ORM (Prisma / Drizzle) | Supabase JS SDK 직접 쿼리 | 30명 규모, 7개 테이블 수준에서 ORM 마이그레이션/타입 생성 오버헤드가 이점을 초과 |
| 별도 테스트 DB | Supabase 로컬 개발 환경 (`supabase start`) | `supabase start`로 로컬 PostgreSQL + Auth + Realtime 스택 즉시 구동. 별도 테스트 DB 세팅 불필요 |
| Redis / Memcached | 없음 (캐시 불필요) | AI 인사이트는 세션당 1회 생성 후 `ai_insights` 테이블에 저장. 반복 조회는 Supabase SELECT로 충분 |

---

## §3. DB 스키마 (Supabase PostgreSQL DDL)

> 모든 테이블은 `public` 스키마. UUID 기본 키. `gen_random_uuid()` 기본값.

### 3.1 학생 엔티티 결정

**MVP에서 학생은 `responses.nickname`으로만 식별한다. 별도 `accounts` 테이블 없음. 세션 간 학생 추적 불가 (의도적 설계 결정).** 리더보드는 세션 내 nickname 기준 집계. Phase 2에서 `students` 테이블 추가 + `responses.student_id` FK 추가 마이그레이션 예정.

### 3.2 DDL

```sql
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
```

---

## §4. API 설계

### 4.1 API Route 엔드포인트

모든 API Route는 교사 인증(Supabase Auth JWT)이 필요하다. 미인증 요청은 `401 UNAUTHORIZED` 반환.

| 메서드 | 경로 | 용도 | Request Body / Params | Response |
|--------|------|------|----------------------|----------|
| POST | `/api/sessions` | 세션 생성 | `{title, subject, grade}` | `{id, join_code}` |
| POST | `/api/sessions/[id]/activate` | 세션 활성화 | - | `{status: 'active', started_at}` |
| POST | `/api/sessions/[id]/end` | 세션 종료 | - | `{status: 'ended', ended_at}` |
| POST | `/api/insights/generate` | AI 인사이트 생성 | `{session_id}` | `{insights: InsightsPayload}` |
| POST | `/api/class-draft/generate` | 수업 초안 생성 | `{session_id}` | `{content: string}` |

#### TypeScript 인터페이스

```typescript
// ── 세션 생성 ──────────────────────────────────────────────
interface CreateSessionRequest {
  title: string;
  subject: string;
  grade: string;
}

interface CreateSessionResponse {
  id: string;
  join_code: string;
}

// ── 세션 활성화 ────────────────────────────────────────────
// Request: 없음 (path param: id)
interface ActivateSessionResponse {
  status: 'active';
  started_at: string; // ISO 8601
}

// ── 세션 종료 ──────────────────────────────────────────────
// Request: 없음 (path param: id)
interface EndSessionResponse {
  status: 'ended';
  ended_at: string; // ISO 8601
}

// ── AI 인사이트 생성 ───────────────────────────────────────
interface GenerateInsightsRequest {
  session_id: string;
}

interface QuestionAnalysis {
  question_id: string;
  question_order: number;
  correct_rate: number;       // 0.0 ~ 1.0
  avg_response_time_ms: number;
  most_common_wrong_answer: number | null; // 0-based 인덱스
}

interface InsightsPayload {
  top_weak_concepts: string[];          // 취약 개념 (최대 3개)
  strong_concepts: string[];            // 잘 이해한 개념 (최대 3개)
  next_class_focus: string;             // 다음 수업 집중 포인트
  question_analysis: QuestionAnalysis[];
  overall_understanding_rate: number;   // 0.0 ~ 1.0
}

interface GenerateInsightsResponse {
  insights: InsightsPayload;
}

// ── 수업 초안 생성 ─────────────────────────────────────────
interface GenerateClassDraftRequest {
  session_id: string;
}

interface GenerateClassDraftResponse {
  content: string; // 마크다운 형식 수업 계획서
}
```

### 4.2 Supabase Direct (API Route 불필요)

아래 작업은 클라이언트에서 Supabase JS SDK를 통해 직접 처리한다. API Route를 별도로 만들지 않는다.

| 작업 | 방법 | 테이블 | RLS 보호 |
|------|------|--------|---------|
| 퀴즈 문항 CRUD | `supabase.from('questions').insert/update/delete` | questions | 교사 RLS |
| 학생 응답 제출 | `supabase.from('responses').insert` | responses | 익명 INSERT RLS |
| 따봉 피드백 제출 | `supabase.from('thumbs_feedback').insert` | thumbs_feedback | 익명 INSERT RLS |
| 세션 참여 (join_code 조회) | `supabase.from('sessions').select().eq('join_code', code)` | sessions | 익명 SELECT RLS |
| 리더보드 조회 | `supabase.from('responses').select().eq('session_id', id)` | responses | RLS |
| 교사 대시보드 세션 목록 | `supabase.from('sessions').select()` | sessions | 교사 RLS |

**결정 근거**: POST /api/responses, POST /api/feedback 엔드포인트를 의도적으로 삭제. RLS가 접근 제어를 자동화하므로 API Route에서 별도 인증 체크 불필요. 서버 왕복 1회 감소 → 응답 시간 단축.

### 4.3 Supabase Realtime 채널 매트릭스

| 채널명 | 테이블 | 이벤트 | 구독자 | 용도 |
|--------|--------|--------|--------|------|
| `session:{id}:responses` | responses | INSERT | 교사 + 학생 | 실시간 리더보드 업데이트 (응답 제출 시 전체 동기화) |
| `session:{id}:status` | sessions | UPDATE | 학생 | 세션 상태 변경 감지 (draft→active: 퀴즈 시작, active→ended: 결과 화면 전환) |
| `session:{id}:questions` | questions | INSERT / UPDATE | 학생 | 문항 공개 이벤트 (교사가 다음 문항으로 넘길 때 학생 화면 갱신) |

#### 구독 코드 패턴 (참고)

```typescript
// 응답 실시간 구독 (교사 리더보드)
const channel = supabase
  .channel(`session:${sessionId}:responses`)
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'responses', filter: `session_id=eq.${sessionId}` },
    (payload) => { /* 리더보드 갱신 */ }
  )
  .subscribe();
```

### 4.4 에러 응답 형식 (통일)

모든 API Route는 에러 시 아래 형식을 반환한다.

```typescript
interface ApiError {
  error: {
    code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR';
    message: string;
    details?: unknown;
  };
}
```

HTTP 상태 코드 매핑:

| code | HTTP 상태 |
|------|----------|
| `UNAUTHORIZED` | 401 |
| `NOT_FOUND` | 404 |
| `VALIDATION_ERROR` | 400 |
| `INTERNAL_ERROR` | 500 |

### 4.5 일론 5단계 API 적용 결과

| 원칙 | 적용 내용 |
|------|---------|
| **삭제** | `POST /api/responses` — Supabase Direct INSERT로 대체. 서버 왕복 제거 |
| **삭제** | `POST /api/feedback` — Supabase Direct INSERT로 대체 |
| **삭제** | `GET` 엔드포인트 대다수 — Supabase client SDK SELECT로 대체. API Route 5개로 최소화 |
| **단순화** | 에러 포맷을 `ApiError` 단일 인터페이스로 통일. 호출자 에러 처리 로직 단순화 |
| **자동화** | RLS로 인증/인가 자동화. API Route 핸들러에서 수동 권한 체크 불필요 |

---


## §5. 구현 단위별 상세 명세

---

### IU-01: 실시간 퀴즈 게임 (피드백 수집 + 게이미피케이션)

**PRD 매핑**: F-01, F-02 (통합)
**예상 공수**: 1.5일
**의존성**: 없음 (IU-05 세션 생성 선행 권장)

#### 입력 (Input)

- 사용자 액션:
  - 학생: QR 스캔 또는 URL 직접 접속 → `join_code` 입력 (또는 URL 파라미터) → 닉네임 입력 → 문제 화면에서 객관식 옵션 선택
  - 교사: 세션 활성화 버튼 → 다음 문제 공개 버튼
- API 요청/데이터:
  - `GET /sessions?join_code={code}` (Supabase client SDK) → session row
  - `INSERT responses` (Supabase client SDK): `{ question_id, session_id, nickname, answer: number, response_time_ms: number }`

#### 처리 (Process)

```pseudo
// 학생 참여 플로우
function joinSession(joinCode, nickname):
  session = supabase.from('sessions').select().eq('join_code', joinCode).eq('status', 'active').single()
  if !session: return error('세션을 찾을 수 없습니다')
  validateNickname(nickname)  // 2~12자, 특수문자 제한
  store session_id, nickname in local state (sessionStorage)
  subscribe to channel `session:{session_id}:status` (sessions UPDATE)
  render 대기 화면

// 학생 응답 제출 플로우
function submitAnswer(questionId, answerIndex, startedAt):
  if alreadyAnswered(questionId): return  // 중복 응답 방지 (client-side guard)
  responseTimeMs = Date.now() - startedAt
  question = getQuestion(questionId)
  isCorrect = question.correct_answer === answerIndex
  score = calculateScore(isCorrect, responseTimeMs)
  supabase.from('responses').insert({
    question_id: questionId,
    session_id: currentSessionId,
    nickname: currentNickname,
    answer: answerIndex,
    is_correct: isCorrect,
    response_time_ms: responseTimeMs,
    score: score
  })
  markAnswered(questionId)
  render 정답/오답 애니메이션

// 점수 계산 순수 함수
function calculateScore(isCorrect: boolean, responseTimeMs: number): number:
  if !isCorrect: return 0
  return Math.max(100, Math.round(1000 - responseTimeMs / 10))

// 닉네임 유효성 검사
function validateNickname(nickname: string): boolean:
  return nickname.length >= 2 && nickname.length <= 12 && /^[가-힣a-zA-Z0-9_]+$/.test(nickname)

// 리더보드 집계 (Realtime 구독 콜백)
function onNewResponse(payload):
  leaderboard = supabase.from('responses')
    .select('nickname, sum(score)')
    .eq('session_id', sessionId)
    .group('nickname')
    .order('sum', desc)
  updateLeaderboardUI(leaderboard)
```

#### 출력 (Output)

- UI 렌더링:
  - 학생 화면: 대기 화면 → 문제 + 선택지 (객관식 4지선다) → 정답/오답 애니메이션 → 현재 순위 표시 → 리더보드
  - 교사 화면: 실시간 응답률 진행바 → 정답률 표시 → 다음 문제 이동 버튼
  - 리더보드: Supabase Realtime `session:{id}:responses` INSERT 구독으로 자동 갱신
- 데이터 저장:
  - `responses` 테이블 INSERT (nickname, answer, is_correct, response_time_ms, score)

#### 일론 5단계 적용 결과

- **의심한 요구사항**: 닉네임 중복을 막아야 하는가? → MVP는 세션 내 동일 닉네임 허용. 리더보드는 nickname 기준 합산 점수로 표시. 중복 방지는 UX 복잡도 대비 가치 낮음.
- **삭제한 것**: 스트릭(연속 정답 보너스), 배지 시스템, 커스텀 아바타, 사운드 이펙트, 주관식/OX/순서맞추기 퀴즈 유형 — 모두 Phase 2
- **단순화한 것**: 점수 공식 `max(100, 1000 - responseTimeMs/10)` 단일 수식. 상태 관리는 React useState + sessionStorage (Zustand/Redux 불필요). F-01(피드백 수집)과 F-02(게이미피케이션)를 하나의 IU로 통합.

#### TDD 테스트 기준

**단위 테스트 (Vitest)**:
- [ ] TEST-IU1-U01: `calculateScore(true, 0)` → `1000` (즉시 정답)
- [ ] TEST-IU1-U02: `calculateScore(true, 9000)` → `100` (최솟값 하한 보장)
- [ ] TEST-IU1-U03: `calculateScore(false, 500)` → `0` (오답 시 0점)
- [ ] TEST-IU1-U04: `validateNickname('홍길동')` → `true`
- [ ] TEST-IU1-U05: `validateNickname('a')` → `false` (1자 미만)
- [ ] TEST-IU1-U06: `validateNickname('verylongnickname!')` → `false` (12자 초과 + 특수문자)
- [ ] TEST-IU1-U07: `calculateScore(true, 5000)` → `500` (중간값 정확성)

**통합 테스트 (Vitest + Supabase 로컬)**:
- [ ] TEST-IU1-I01: 유효한 `join_code`로 세션 조회 → session row 반환
- [ ] TEST-IU1-I02: 비활성 세션 `join_code` → 오류 응답
- [ ] TEST-IU1-I03: 학생 응답 INSERT → `responses` 테이블에 row 생성됨 + RLS 통과
- [ ] TEST-IU1-I04: 동일 `(question_id, nickname)` 응답 두 번 → 두 번째는 client-side guard로 차단 (중복 INSERT 방지)
- [ ] TEST-IU1-I05: Realtime 구독 → responses INSERT 후 리더보드 콜백 호출됨

**E2E 테스트 (Playwright)**:
- [ ] TEST-IU1-E01: 학생 브라우저 — 세션 URL 접속 → 닉네임 입력 → 문제 표시 대기 → 교사가 문제 공개 → 선택지 클릭 → 정답 애니메이션 표시 → 리더보드에 본인 닉네임 확인
- [ ] TEST-IU1-E02: 다중 학생 (3개 브라우저 컨텍스트) 동시 응답 → 리더보드 순위 실시간 반영

---

### IU-02: AI 이해도 분석

**PRD 매핑**: F-03
**예상 공수**: 1.0일
**의존성**: IU-01 (responses 데이터 필요)

#### 입력 (Input)

- 사용자 액션: 교사가 세션 결과 페이지에서 "분석하기" 버튼 클릭
- API 요청/데이터:
  - `POST /api/insights/generate` with body `{ session_id: string }`
  - 헤더: Supabase Auth JWT (교사 인증)

#### 처리 (Process)

```pseudo
// API Route: POST /api/insights/generate
async function generateInsights(req):
  { session_id } = req.body
  teacher = await verifyTeacher(req)  // Supabase Auth JWT 검증

  // 1. 세션 소유권 확인
  session = await supabase.from('sessions').select('*, questions(*)').eq('id', session_id).eq('teacher_id', teacher.id).single()
  if !session: return 403

  // 2. 이미 생성된 인사이트가 있으면 캐시 반환
  existing = await supabase.from('ai_insights').select().eq('session_id', session_id).single()
  if existing: return { insights: existing.insights }

  // 3. 응답 데이터 집계
  responses = await supabase.from('responses').select().eq('session_id', session_id)
  stats = aggregateResponses(session.questions, responses)

  // 4. 프롬프트 구성 + Claude API 호출
  prompt = buildPrompt(session, stats)
  rawJson = await callClaudeAPI(prompt)

  // 5. zod 런타임 검증
  insights = parseInsightResponse(rawJson)  // throws ZodError on invalid

  // 6. DB 저장
  await supabase.from('ai_insights').insert({ session_id, insights })

  return { insights }

// 집계 함수
function aggregateResponses(questions, responses):
  return questions.map(q =>
    qResponses = responses.filter(r => r.question_id === q.id)
    total = qResponses.length
    correctCount = qResponses.filter(r => r.is_correct).length
    wrongAnswers = qResponses.filter(r => !r.is_correct).map(r => r.answer)
    {
      question_id: q.id,
      content: q.content,
      correct_rate: total > 0 ? correctCount / total : 0,
      avg_response_time: total > 0 ? mean(qResponses.map(r => r.response_time_ms)) : 0,
      wrong_pattern: mostFrequent(wrongAnswers)  // 가장 많이 선택된 오답 인덱스
    }
  )
```

**AI 프롬프트 템플릿**:

```
System Prompt:
"당신은 한국 교육 도메인 전문가입니다.
교사의 수업 이해도 데이터를 분석하여 실행 가능한 인사이트를 제공합니다.
반드시 아래 JSON 스키마를 정확히 따르는 JSON만 반환하세요. 마크다운 코드 블록 없이 순수 JSON만 출력합니다."

User Prompt:
{
  "subject": "{subject}",
  "grade": "{grade}",
  "question_stats": [
    {
      "content": "{문항 내용}",
      "correct_rate": 0.65,
      "avg_response_time": 4200,
      "wrong_pattern": 2
    }
  ]
}
```

**출력 JSON 스키마 (zod)**:

```typescript
const InsightSchema = z.object({
  top_weak_concepts: z.array(z.object({
    concept: z.string(),
    correct_rate: z.number().min(0).max(1),
    evidence: z.string()
  })).max(3),
  strong_concepts: z.array(z.object({
    concept: z.string(),
    correct_rate: z.number().min(0).max(1)
  })).max(3),
  next_class_focus: z.array(z.object({
    focus: z.string(),
    reason: z.string(),
    suggested_activity: z.string()
  })).max(3)
})
```

#### 출력 (Output)

- UI 렌더링: 분석 결과 카드 (취약 개념 목록, 강한 개념 목록, 다음 수업 집중 포인트 3개)
- 데이터 저장: `ai_insights` 테이블 INSERT `{ session_id, insights: JSONB }`

#### 일론 5단계 적용 결과

- **의심한 요구사항**: 학생 개인별 분석이 필요한가? → MVP는 세션 집계 수준만. 개인 분석은 학생 계정 추가(Phase 2) 이후에 의미 있음.
- **삭제한 것**: 캐시 레이어(Redis 등) — 세션당 1회 생성이므로 DB 중복 체크로 충분. 학생 개인 분석 — Phase 2.
- **단순화한 것**: 단일 프롬프트, 단일 Claude API 호출. zod로 런타임 스키마 검증 자동화 (수동 파싱 불필요). 오답 패턴은 "가장 많이 선택된 오답 인덱스" 단일 값으로 단순화.

#### TDD 테스트 기준

**단위 테스트 (Vitest)**:
- [ ] TEST-IU2-U01: `aggregateResponses(questions, responses)` — 정답률 0.5 계산 정확성
- [ ] TEST-IU2-U02: `aggregateResponses(questions, [])` — 응답 없을 때 `correct_rate: 0` 반환
- [ ] TEST-IU2-U03: `buildPrompt(session, stats)` — 반환 값에 subject, grade, question_stats 포함됨
- [ ] TEST-IU2-U04: `parseInsightResponse(validJson)` → InsightSchema 통과
- [ ] TEST-IU2-U05: `parseInsightResponse(invalidJson)` → ZodError throw
- [ ] TEST-IU2-U06: `aggregateResponses` — wrong_pattern이 가장 빈번한 오답 인덱스를 반환

**통합 테스트 (Vitest + Supabase 로컬)**:
- [ ] TEST-IU2-I01: `POST /api/insights/generate` with valid session_id → Claude API mock 반환 → `ai_insights` 테이블에 row 생성됨
- [ ] TEST-IU2-I02: 동일 session_id로 두 번 요청 → 두 번째는 캐시(기존 row) 반환, Claude API 미호출
- [ ] TEST-IU2-I03: 다른 교사 session_id → 403 반환
- [ ] TEST-IU2-I04: Claude API가 잘못된 JSON 반환 → 500 에러 + 클라이언트에 에러 메시지

**E2E 테스트 (Playwright)**:
- [ ] TEST-IU2-E01: 교사 — 게임 종료 후 결과 페이지 → "분석하기" 클릭 → 15초 내 인사이트 카드 표시 → top_weak_concepts 항목 1개 이상 렌더링

---

### IU-03: 교사 대시보드 (실시간 집계 + 인사이트 표시)

**PRD 매핑**: F-05
**예상 공수**: 1.5일
**의존성**: IU-01 (responses), IU-02 (ai_insights)

#### 입력 (Input)

- 사용자 액션: 교사가 로그인 후 대시보드 접속 → 세션 목록에서 세션 선택 → 실시간 현황 열람
- API 요청/데이터:
  - `GET /sessions?teacher_id={id}` (Supabase client SDK) → 세션 목록
  - `GET /sessions/{id}` + `GET /questions?session_id={id}` + `GET /responses?session_id={id}` (Supabase client SDK)
  - Realtime 구독: `session:{id}:responses` (responses INSERT)

#### 처리 (Process)

```pseudo
// 대시보드 데이터 로드
async function loadDashboard(sessionId):
  [session, questions, responses, insights] = await Promise.all([
    supabase.from('sessions').select().eq('id', sessionId).single(),
    supabase.from('questions').select().eq('session_id', sessionId).order('order'),
    supabase.from('responses').select().eq('session_id', sessionId),
    supabase.from('ai_insights').select().eq('session_id', sessionId).maybeSingle()
  ])
  return {
    session,
    questions,
    stats: groupByQuestion(questions, responses),
    insights: insights?.insights ?? null
  }

// 문항별 집계
function groupByQuestion(questions, responses):
  return questions.map(q =>
    qResponses = responses.filter(r => r.question_id === q.id)
    {
      question: q,
      total: qResponses.length,
      correct_rate: calculateCorrectRate(qResponses),
      option_distribution: [0,1,2,3].map(i => qResponses.filter(r => r.answer === i).length)
    }
  )

function calculateCorrectRate(responses):
  if responses.length === 0: return 0
  return responses.filter(r => r.is_correct).length / responses.length

// Realtime 구독 (세션 진행 중)
function subscribeRealtime(sessionId, onUpdate):
  supabase.channel(`session:${sessionId}:responses`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'responses',
        filter: `session_id=eq.${sessionId}` },
      payload => onUpdate(payload.new))
    .subscribe()
```

**차트 렌더링**: shadcn/ui 내장 차트 컴포넌트 또는 CSS 바 차트 (Recharts/Chart.js 사용 금지). 문항별 정답률은 `option_distribution` 배열 기반 간단한 수평 바로 표시.

#### 출력 (Output)

- UI 렌더링:
  - 세션 목록 사이드바 (과목/날짜 단일 select 필터)
  - 세션 상세: 실시간 참여 인원수, 문항별 정답률 바 차트, 옵션 분포 표시
  - AI 인사이트 패널 (insights가 있으면 표시, 없으면 "분석하기" 버튼)
- 데이터 저장: 없음 (읽기 전용)

#### 일론 5단계 적용 결과

- **의심한 요구사항**: 복잡한 필터링(과목+날짜+학년 복합 검색)이 필요한가? → MVP 교사 1명 기준 세션 수 적음. 단일 select로 충분.
- **삭제한 것**: 복잡한 차트 라이브러리(Recharts, Chart.js) — shadcn/ui 내장 또는 CSS만으로 구현. 복합 검색 필터 — Phase 2. 세션 수정/삭제 기능 — Phase 2.
- **단순화한 것**: 데이터 fetch는 `Promise.all` 병렬 단일 호출. 차트는 CSS flex 바 차트로 외부 의존성 없음.

#### TDD 테스트 기준

**단위 테스트 (Vitest)**:
- [ ] TEST-IU3-U01: `calculateCorrectRate([])` → `0`
- [ ] TEST-IU3-U02: `calculateCorrectRate([{is_correct:true},{is_correct:false}])` → `0.5`
- [ ] TEST-IU3-U03: `groupByQuestion(questions, responses)` — 각 question에 `total`, `correct_rate`, `option_distribution` 포함
- [ ] TEST-IU3-U04: `groupByQuestion(questions, [])` — 모든 질문에 `total: 0`, `correct_rate: 0`

**통합 테스트 (Vitest + Supabase 로컬)**:
- [ ] TEST-IU3-I01: 교사 인증 후 본인 세션 목록 조회 → 본인 세션만 반환 (RLS 검증)
- [ ] TEST-IU3-I02: 세션 데이터 fetch (`Promise.all`) → questions, responses, insights 올바른 구조 반환
- [ ] TEST-IU3-I03: Realtime 구독 → responses INSERT 후 onUpdate 콜백 호출됨

**E2E 테스트 (Playwright)**:
- [ ] TEST-IU3-E01: 교사 로그인 → 대시보드 접속 → 세션 선택 → 문항별 정답률 차트 표시
- [ ] TEST-IU3-E02: 학생이 응답 제출 → 교사 대시보드 실시간으로 참여 인원수 증가 확인
- [ ] TEST-IU3-E03: AI 인사이트 있는 세션 → 인사이트 패널 렌더링

---

### IU-04: 다음 수업 초안 자동 생성

**PRD 매핑**: F-04
**예상 공수**: 0.5일
**의존성**: IU-02 (ai_insights 필요)

#### 입력 (Input)

- 사용자 액션: 교사가 인사이트 페이지에서 "수업 초안 생성" 버튼 클릭
- API 요청/데이터:
  - `POST /api/class-draft/generate` with body `{ session_id: string }`
  - 헤더: Supabase Auth JWT (교사 인증)

#### 처리 (Process)

```pseudo
// API Route: POST /api/class-draft/generate
async function generateClassDraft(req):
  { session_id } = req.body
  teacher = await verifyTeacher(req)

  // 1. 소유권 확인 + insights 로드
  session = await supabase.from('sessions').select().eq('id', session_id).eq('teacher_id', teacher.id).single()
  if !session: return 403

  insights = await supabase.from('ai_insights').select().eq('session_id', session_id).single()
  if !insights: return 400 ('인사이트를 먼저 생성해주세요')

  // 2. 기존 초안 있으면 반환
  existing = await supabase.from('class_drafts').select().eq('session_id', session_id).single()
  if existing: return { content: existing.content }

  // 3. 프롬프트 구성 + Claude API 호출
  prompt = buildDraftPrompt(insights.insights, session.subject, session.grade)
  markdownContent = await callClaudeAPI(prompt)  // 마크다운 텍스트 반환

  // 4. DB 저장
  await supabase.from('class_drafts').insert({ session_id, content: markdownContent })

  return { content: markdownContent }
```

**AI 프롬프트 템플릿**:

```
System Prompt:
"지난 수업 이해도 분석 결과를 바탕으로 다음 수업의 오프닝 슬라이드 초안을 마크다운으로 작성합니다.
아래 구조를 반드시 포함하세요:
1. # 제목 (오늘 수업 주제)
2. ## 지난 수업 요약 (2~3문장)
3. ## 오늘 집중할 개념 (취약 개념 기반, bullet list)
4. ## 권장 활동 (suggested_activity 기반, 구체적)"

User Prompt:
{
  "subject": "{subject}",
  "grade": "{grade}",
  "insights": {
    "top_weak_concepts": [...],
    "strong_concepts": [...],
    "next_class_focus": [...]
  }
}
```

#### 출력 (Output)

- UI 렌더링:
  - 마크다운 미리보기 (react-markdown 렌더링)
  - "클립보드 복사" 버튼 (copyToClipboard 유틸)
- 데이터 저장: `class_drafts` 테이블 INSERT `{ session_id, content: markdown string }`

#### 일론 5단계 적용 결과

- **의심한 요구사항**: PPT/슬라이드 직접 생성이 필요한가? → 교사가 복사-붙여넣기로 사용하는 마크다운이면 충분. PPT 생성은 외부 API 의존성 추가 + 포맷팅 복잡도 상승.
- **삭제한 것**: PPT/Google Slides 직접 생성. 다양한 템플릿 선택 — 단일 템플릿으로 통일. 편집 에디터 — Phase 2.
- **단순화한 것**: 마크다운 텍스트만 반환. 클립보드 복사는 `navigator.clipboard.writeText` 단일 라인.

#### TDD 테스트 기준

**단위 테스트 (Vitest)**:
- [ ] TEST-IU4-U01: `buildDraftPrompt(insights, subject, grade)` — 반환 문자열에 subject, grade, next_class_focus 내용 포함
- [ ] TEST-IU4-U02: `buildDraftPrompt(insights, '수학', '중2')` — 시스템 프롬프트와 사용자 프롬프트 분리된 객체 반환
- [ ] TEST-IU4-U03: `copyToClipboard('text')` → `navigator.clipboard.writeText` 호출됨 (mock)

**통합 테스트 (Vitest + Supabase 로컬)**:
- [ ] TEST-IU4-I01: `POST /api/class-draft/generate` with valid session_id + insights → Claude API mock → `class_drafts` 테이블에 row 생성됨
- [ ] TEST-IU4-I02: insights 없는 session_id → 400 에러 반환
- [ ] TEST-IU4-I03: 동일 session_id 두 번 요청 → 두 번째는 기존 content 반환, Claude API 미호출
- [ ] TEST-IU4-I04: 다른 교사 session_id → 403 반환

**E2E 테스트 (Playwright)**:
- [ ] TEST-IU4-E01: 교사 — 인사이트 페이지 → "수업 초안 생성" 클릭 → 마크다운 미리보기 렌더링 → "복사" 클릭 → 클립보드 내용 확인

---

### IU-05: 수업/퀴즈 생성·관리

**PRD 매핑**: F-06
**예상 공수**: 1.0일
**의존성**: 없음 (인프라/Auth 필요)

#### 입력 (Input)

- 사용자 액션:
  - 교사 Google OAuth 로그인 → Supabase Auth 처리
  - 새 세션 생성 폼 (제목, 과목, 학년) → 제출
  - 문항 추가/편집 폼 (문항 내용, 선택지 2~5개, 정답 인덱스, 순서)
  - 세션 활성화 버튼 → QR 코드 생성 + 학생 참여 링크 표시
- API 요청/데이터:
  - `POST /api/sessions` body: `{ title, subject, grade }`
  - Supabase client SDK: `INSERT questions`, `UPDATE sessions.status`

#### 처리 (Process)

```pseudo
// 세션 생성
async function createSession(title, subject, grade):
  teacher = await supabase.auth.getUser()
  joinCode = await generateUniqueJoinCode()  // 충돌 시 재시도
  session = await supabase.from('sessions').insert({
    teacher_id: teacher.id,
    title, subject, grade,
    status: 'draft',
    join_code: joinCode
  }).select().single()
  redirect to /teacher/sessions/{session.id}/edit

// join_code 생성 (충돌 방지)
async function generateUniqueJoinCode(): string:
  MAX_RETRY = 5
  for i in range(MAX_RETRY):
    code = randomAlphanumeric(6).toUpperCase()  // 예: 'A3K9PZ'
    existing = await supabase.from('sessions').select('id').eq('join_code', code).eq('status', 'active').maybeSingle()
    if !existing: return code
  throw Error('join_code 생성 실패')

// 문항 유효성 검사
function validateQuestion(question):
  return (
    question.content.trim().length > 0 &&
    question.options.length >= 2 &&
    question.options.length <= 5 &&
    question.correct_answer >= 0 &&
    question.correct_answer < question.options.length
  )

// 세션 활성화 + QR 생성
async function activateSession(sessionId):
  await supabase.from('sessions').update({ status: 'active' }).eq('id', sessionId)
  joinUrl = `${NEXT_PUBLIC_BASE_URL}/join/${session.join_code}`
  qrDataUrl = await QRCode.toDataURL(joinUrl)  // qrcode 패키지
  render QR 이미지 + join_code 텍스트
```

#### 출력 (Output)

- UI 렌더링:
  - 세션 생성/편집 폼
  - 문항 목록 (드래그 순서 변경 — 단순 버튼 기반 Phase 1, 드래그앤드롭 Phase 2)
  - QR 코드 이미지 + 참여 URL + join_code 텍스트
  - QR 이미지 다운로드 버튼
- 데이터 저장:
  - `sessions` 테이블 INSERT/UPDATE
  - `questions` 테이블 INSERT/UPDATE/DELETE

#### 일론 5단계 적용 결과

- **의심한 요구사항**: AI 퀴즈 자동 생성이 MVP에 필요한가? → 교사가 직접 입력하는 방식이 더 신뢰 가능. AI 자동 생성은 F-11 (Phase 2).
- **삭제한 것**: AI 퀴즈 자동 생성 (Phase 2, F-11). 드래그앤드롭 문항 순서 변경 (버튼으로 단순화). 문항 복사/가져오기 기능.
- **단순화한 것**: join_code는 6자리 영숫자 대문자 랜덤. Google OAuth 원클릭 (Supabase Auth 내장). QR은 `qrcode` npm 패키지 단일 함수 호출.

#### TDD 테스트 기준

**단위 테스트 (Vitest)**:
- [ ] TEST-IU5-U01: `generateJoinCode()` → 길이 6, 영숫자 대문자만 포함
- [ ] TEST-IU5-U02: `validateQuestion({ content:'Q', options:['A','B'], correct_answer:0 })` → `true`
- [ ] TEST-IU5-U03: `validateQuestion({ content:'', options:['A'], correct_answer:0 })` → `false` (빈 내용 + 옵션 1개)
- [ ] TEST-IU5-U04: `validateQuestion({ content:'Q', options:['A','B'], correct_answer:2 })` → `false` (정답 인덱스 범위 초과)
- [ ] TEST-IU5-U05: `validateQuestion({ content:'Q', options:['A','B','C','D','E','F'], correct_answer:0 })` → `false` (옵션 5개 초과)

**통합 테스트 (Vitest + Supabase 로컬)**:
- [ ] TEST-IU5-I01: 교사 인증 후 세션 생성 → `sessions` 테이블에 row 생성, join_code 포함됨
- [ ] TEST-IU5-I02: join_code 중복 발생 시 재시도 → 다른 code 반환
- [ ] TEST-IU5-I03: 문항 INSERT → `questions` 테이블에 row 생성됨
- [ ] TEST-IU5-I04: 세션 활성화 → `sessions.status = 'active'` 업데이트됨
- [ ] TEST-IU5-I05: 다른 교사가 세션 수정 시도 → RLS 차단

**E2E 테스트 (Playwright)**:
- [ ] TEST-IU5-E01: 교사 Google 로그인 → 세션 생성 폼 → 문항 3개 추가 → 세션 활성화 → QR 코드 이미지 렌더링 → QR 다운로드 버튼 클릭

---

### IU-06: 따봉 업/다운 피드백

**PRD 매핑**: F-10
**예상 공수**: 0.5일
**의존성**: IU-01 (세션 필요, 독립적으로 구현 가능)

#### 입력 (Input)

- 사용자 액션: 학생 또는 교사가 세션/수업에 대해 👍 또는 👎 버튼 클릭 (선택적 한 줄 코멘트)
- API 요청/데이터:
  - Supabase client SDK: `INSERT thumbs_feedback` `{ session_id, nickname, type: 'up'|'down', comment?: string }`

#### 처리 (Process)

```pseudo
// 따봉 피드백 제출
async function submitThumbsFeedback(sessionId, nickname, type, comment?):
  validateThumbsType(type)  // 'up' | 'down' 외 거부
  await supabase.from('thumbs_feedback').insert({
    session_id: sessionId,
    nickname: nickname,
    type: type,
    comment: comment ?? null
  })
  updateLocalCount(type)  // 낙관적 UI 업데이트

// 타입 유효성 검사
function validateThumbsType(type: string): boolean:
  return type === 'up' || type === 'down'

// 피드백 집계 (교사 대시보드용)
async function getFeedbackSummary(sessionId):
  rows = await supabase.from('thumbs_feedback').select('type').eq('session_id', sessionId)
  return {
    up: rows.filter(r => r.type === 'up').length,
    down: rows.filter(r => r.type === 'down').length
  }
```

#### 출력 (Output)

- UI 렌더링:
  - 학생 화면: 세션 종료 시 👍/👎 버튼 표시 (이미 제출 시 비활성화)
  - 교사 대시보드: 세션 카드에 up/down 카운트 표시
- 데이터 저장: `thumbs_feedback` 테이블 INSERT

#### 일론 5단계 적용 결과

- **의심한 요구사항**: 감정 분석, 다단계 평점(1~5점 등)이 필요한가? → MVP에서 교사에게 필요한 신호는 "좋음/나쁨" 이진 피드백으로 충분.
- **삭제한 것**: 복잡한 감정 분석. 다단계 평점. 피드백 수정/삭제 기능.
- **단순화한 것**: 이진(up/down) 피드백 + 선택적 한 줄 코멘트. RLS로 중복 제출 제한 (세션당 닉네임당 1회 — DB unique constraint).

#### TDD 테스트 기준

**단위 테스트 (Vitest)**:
- [ ] TEST-IU6-U01: `validateThumbsType('up')` → `true`
- [ ] TEST-IU6-U02: `validateThumbsType('down')` → `true`
- [ ] TEST-IU6-U03: `validateThumbsType('neutral')` → `false`
- [ ] TEST-IU6-U04: `getFeedbackSummary` — up 2개, down 1개 데이터 → `{ up: 2, down: 1 }` 반환

**통합 테스트 (Vitest + Supabase 로컬)**:
- [ ] TEST-IU6-I01: `INSERT thumbs_feedback` type='up' → DB row 생성됨
- [ ] TEST-IU6-I02: 동일 `(session_id, nickname)` 두 번 제출 → unique constraint 위반으로 에러
- [ ] TEST-IU6-I03: type='neutral' 제출 → 유효성 검사 실패

**E2E 테스트 (Playwright)**:
- [ ] TEST-IU6-E01: 학생 — 세션 종료 화면 → 👍 버튼 클릭 → 버튼 비활성화 + 카운트 증가

---

## §5.7. 기능 매핑 표

| IU | PRD 기능 ID | 기능명 | 우선순위 | 예상 공수 |
|----|-------------|--------|---------|-----------|
| IU-01 | F-01 + F-02 | 실시간 퀴즈 게임 (피드백 수집 + 게이미피케이션) | P0 | 1.5일 |
| IU-02 | F-03 | AI 이해도 분석 | P0 | 1.0일 |
| IU-03 | F-05 | 교사 대시보드 (실시간 집계 + 인사이트 표시) | P0 | 1.5일 |
| IU-04 | F-04 | 다음 수업 초안 자동 생성 | P0 | 0.5일 |
| IU-05 | F-06 | 수업/퀴즈 생성·관리 | P0 | 1.0일 |
| IU-06 | F-10 | 따봉 업/다운 피드백 | P1 | 0.5일 |
| **합계** | | | | **6.0일** |

> P0 = MVP 데드라인(D7) 내 필수 완료. P1 = D5 여유 시 포함, 아니면 Phase 2.

---

## §6. TDD 테스트 전략

### 6.1 테스트 원칙

- **Iron Law**: 구현 코드는 반드시 실패하는 테스트 이후에만 작성한다
- **사이클**: Red → Green → Refactor 완료 단위로 커밋
- **커버리지 목표**: 7일 데드라인 하 P0 기능 핵심 경로 80%+
- **커밋 단위**: 각 Red-Green-Refactor 사이클 완료 시 커밋 (테스트 + 구현 + 리팩토링 포함)

---

### 6.2 테스트 레벨별 전략

| 레벨 | 도구 | 대상 | 실행 시점 | 우선순위 |
|------|------|------|----------|---------|
| 단위 | Vitest | 순수 함수 (점수 계산, 검증, 프롬프트 빌더, 파서) | pre-commit + CI | P0 |
| 통합 | Vitest + Supabase 로컬 + MSW (Claude API mock) | API Route → DB → 응답 | pre-push + CI | P0 (핵심 경로만) |
| E2E | Playwright | 데모 시나리오 전체 흐름 | CI 배포 전 | P1 (데모 경로 우선) |

---

### 6.3 도구별 설정 명세

#### Vitest (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',          // 기본값; 컴포넌트 테스트는 파일별 @vitest-environment jsdom
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',             // @vitest/coverage-v8
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: ['src/**/*.test.*', 'src/types/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- 환경: `node` (기본) + `jsdom` (컴포넌트 테스트 파일에 `@vitest-environment jsdom` 주석)
- 커버리지: `@vitest/coverage-v8`
- 경로 alias: `@/` → `./src`

#### Playwright (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // 7일 제약: Chromium만 실행
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

- 브라우저: Chromium만 (7일 제약, Firefox/Safari는 Phase 2)
- Base URL: `http://localhost:3000`
- 테스트 유저: Supabase 로컬에 시드된 테스트 교사 계정 (`seed.sql` 참조)

#### Supabase 로컬 개발 환경

```bash
# 로컬 Postgres + Realtime 구동
supabase start

# 마이그레이션 적용
supabase db push

# 시드 데이터 삽입
supabase db reset   # migrations + seed.sql 일괄 적용
```

- 마이그레이션: `supabase/migrations/` 디렉토리에 DDL 파일 순서대로 저장
- 시드 데이터: `supabase/seed.sql` — 테스트 교사 계정, 데모 세션/문항/응답 포함
- 로컬 환경 변수: `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321`

#### MSW (Mock Service Worker)

- 용도: Claude API 호출 mock (`/api/insights/generate`, `/api/class-draft/generate` 통합 테스트)
- 통합 테스트 셋업 파일(`tests/setup.ts`)에서 MSW 서버 인스턴스 구동

```typescript
// tests/setup.ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const server = setupServer(
  http.post('/api/insights/generate', () => {
    return HttpResponse.json({
      insights: [
        { type: 'weak_point', question_id: 'q1', description: '문항 1 정답률 45% — 개념 보강 필요' },
      ],
      summary: '전반적으로 기초 개념 부족',
    });
  }),
  http.post('/api/class-draft/generate', () => {
    return HttpResponse.json({ draft: '## 다음 수업 초안\n...' });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

### 6.4 TDD 사이클 예시 (IU-01 실시간 퀴즈 게임)

#### RED 1: `calculateScore` 테스트 작성 (실패)

```typescript
// tests/unit/score.test.ts
import { calculateScore } from '@/lib/score';

describe('calculateScore', () => {
  it('정답이면 기본 점수 + 속도 보너스를 반환한다', () => {
    expect(calculateScore(true, 500)).toBeGreaterThan(0);
  });
  it('오답이면 0점을 반환한다', () => {
    expect(calculateScore(false, 500)).toBe(0);
  });
  it('응답 시간이 0ms면 최대 점수를 반환한다', () => {
    expect(calculateScore(true, 0)).toBe(100);
  });
  it('응답 시간이 1000ms 초과면 최소 점수(1)를 반환한다', () => {
    expect(calculateScore(true, 1500)).toBe(1);
  });
});
```

→ `@/lib/score` 모듈 없음 → 테스트 실패 (Red)

#### GREEN 1: 최소 구현

```typescript
// src/lib/score.ts
const MAX_SCORE = 100;
const MIN_SCORE = 1;
const MAX_RESPONSE_MS = 1000;

export function calculateScore(isCorrect: boolean, responseTimeMs: number): number {
  if (!isCorrect) return 0;
  const ratio = Math.max(0, (MAX_RESPONSE_MS - responseTimeMs) / MAX_RESPONSE_MS);
  return Math.max(MIN_SCORE, Math.floor(ratio * MAX_SCORE));
}
```

→ 테스트 통과 (Green)

#### REFACTOR 1

- 상수 `MAX_SCORE`, `MIN_SCORE`, `MAX_RESPONSE_MS`를 `src/lib/constants.ts`로 추출
- JSDoc 추가

→ 커밋: `test(IU-01): calculateScore unit tests + implementation`

#### RED 2: 다음 실패 테스트 작성 (반복)

- `validateNickname`, `buildLeaderboard`, `parseInsightsResponse` 등 순서대로 진행

---

### 6.5 CI/CD 자동화

GitHub Actions 파이프라인 (`.github/workflows/ci.yml`):

```
push / PR
  └─ lint (ESLint + TypeScript check)
  └─ vitest (단위 + 통합)
       └─ supabase start (서비스 컨테이너)
       └─ MSW mock 활성화
  └─ playwright E2E (Vercel Preview URL or localhost)
       └─ 실패 시 머지 차단
```

- **Pre-commit hook** (husky): vitest 단위 테스트만 실행 (빠른 피드백)
- **Pre-push hook**: vitest 통합 테스트까지 실행
- **Vercel Preview**: PR마다 자동 배포 → E2E 테스트 실행
- **실패 시**: GitHub Status Check로 머지 차단

---

### 6.6 테스트 케이스 요약 (IU 참조)

각 IU별 구체 테스트 케이스는 §5 참조. 총 예상 테스트 수:

| 유형 | 수량 | 비고 |
|------|------|------|
| 단위 (Vitest) | ~30개 | 순수 함수 위주 |
| 통합 (Vitest + Supabase 로컬 + MSW) | ~15개 | API Route 핵심 경로 |
| E2E (Playwright) | ~8개 | 데모 시나리오 3개 경로 커버 |

#### 단위 테스트 목록 (주요)

| ID | 대상 함수 | 테스트 내용 | IU |
|----|----------|------------|-----|
| UT-01 | `calculateScore` | 정답/오답/속도 보너스 | IU-01 |
| UT-02 | `validateNickname` | 빈값/길이초과/특수문자 | IU-01 |
| UT-03 | `buildLeaderboard` | 점수 정렬, 동점 처리 | IU-01 |
| UT-04 | `generateJoinCode` | 6자리 대문자 영숫자, 고유성 | IU-05 |
| UT-05 | `buildInsightsPrompt` | 문항 데이터 → 프롬프트 문자열 | IU-02 |
| UT-06 | `parseInsightsResponse` | Claude JSON 응답 파싱, 누락 필드 처리 | IU-02 |
| UT-07 | `buildClassDraftPrompt` | 인사이트 → 수업 초안 프롬프트 | IU-04 |
| UT-08 | `aggregateResponses` | 문항별 정답률, 평균 응답시간 계산 | IU-03 |

#### 통합 테스트 목록 (주요)

| ID | 대상 경로 | 테스트 내용 | IU |
|----|----------|------------|-----|
| IT-01 | POST `/api/insights/generate` | 응답 데이터 → Claude mock → insights 저장 | IU-02 |
| IT-02 | POST `/api/class-draft/generate` | 인사이트 → Claude mock → draft 저장 | IU-04 |
| IT-03 | POST `/api/sessions` | 세션 생성 → DB 저장 → join_code 반환 | IU-05 |
| IT-04 | POST `/api/sessions/[id]/activate` | 상태 변경 → Realtime 이벤트 트리거 | IU-05 |
| IT-05 | Supabase Realtime | responses INSERT → 리더보드 구독자 수신 | IU-01 |

#### E2E 테스트 목록 (데모 시나리오)

| ID | 시나리오 | 경로 |
|----|---------|------|
| E2E-01 | 교사 로그인 → 세션 생성 → 퀴즈 활성화 → QR 표시 | 교사 플로우 |
| E2E-02 | 학생 코드 입력 → 퀴즈 참여 → 응답 → 리더보드 확인 | 학생 플로우 |
| E2E-03 | 교사 AI 인사이트 생성 → 대시보드 확인 → 수업 초안 생성 | AI 기능 플로우 |

---

## §7. MVP → 고도화 로드맵

### 7.1 Phase별 기능 로드맵

| Phase | 기간 | 핵심 기능 | 비즈니스 모델 | 완료 조건 |
|-------|------|-----------|--------------|---------|
| 1 (MVP) | 7일 (04/07~04/13) | F-01~F-06 핵심 (IU-01~IU-06), 공모전 제출 | 없음 (공모전) | 데모 시나리오 3분 성공 |
| 2 (PMF) | 1~6개월 | 스트릭, 배지, 학생 계정, 수업 이력 비교 (F-08), AI 퀴즈 자동 생성 (F-11), 문항별 차트 (F-07) | 교사 개인 무료 | MAU 100명 도달 |
| 3 (B2B) | 6~12개월 | 멀티테넌시, 운영자 대시보드 (F-12), 학원/기관 관리 | B2B SaaS (강사당 월 2~5만원) | 파일럿 기관 3곳 계약 |
| 4 (B2G/기업) | 12개월~ | 학교/교육청 연동, 기업교육 대시보드, 다국어 (F-13) | B2G (학교당 연 200~500만원), 기업 B2B | 기관 20곳 계약 |

---

### 7.2 Phase 2 마이그레이션 경로 (학생 엔티티)

MVP는 닉네임 기반 익명이지만, Phase 2에서 학생 계정을 도입한다.

**마이그레이션 전략 (무중단)**:

1. 신규 테이블 `students` 추가

```sql
-- Phase 2 migration
CREATE TABLE students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  grade text,
  school text,
  created_at timestamptz DEFAULT now()
);
```

2. `responses.student_id` nullable FK 추가 (기존 `nickname` 컬럼 유지)

```sql
ALTER TABLE responses ADD COLUMN student_id uuid REFERENCES students(id);
-- 기존 responses는 student_id = null 유지 (하위 호환)
```

3. 점진적 활성화: 학생 가입 후 세션 내 nickname 매칭으로 과거 이력 연결 기능 제공

**MVP 제약 (의도적)**:
- 세션 간 학생 추적 불가
- 리더보드는 세션 내 nickname 기준 집계만
- 학생 누적 성취도 없음 → Phase 2에서 `student_id` 활성화 시 자동 연결

---

### 7.3 D1~D7 일별 구현 일정 (MVP Phase 1)

| 일차 | 날짜 | 작업 | IU 매핑 | 주요 산출물 | TDD 포커스 |
|------|------|------|---------|------------|-----------|
| D1 | 04/07 (월) | 프로젝트 셋업 + Supabase 셋업 + DB 마이그레이션 + Auth | 인프라 | `next.js init`, `supabase/migrations/*.sql`, 로그인 페이지, `.env.local` 템플릿 | 셋업 확인 스모크 테스트 (Supabase 연결, Auth 리다이렉트) |
| D2 | 04/08 (화) | 실시간 퀴즈 게임 (학생 참여 + 점수 + 리더보드) | IU-01 | `app/(student)/join/[code]/page.tsx`, 리더보드 컴포넌트, Realtime 구독 훅 | UT-01~03, IT-05 전체 (단위 + Realtime 통합) |
| D3 | 04/09 (수) | AI 인사이트 생성 + 프롬프트 엔지니어링 | IU-02 | `app/api/insights/generate/route.ts`, 프롬프트 모듈, insights JSON 파서 | UT-05~06, IT-01 (MSW mock 활용) |
| D4 | 04/10 (목) | 교사 대시보드 (실시간 집계 + 인사이트 표시) | IU-03 | `app/(teacher)/sessions/[id]/page.tsx`, 집계 훅, 인사이트 카드 컴포넌트 | UT-08, IT-05 Realtime 통합 |
| D5 | 04/11 (금) | 수업 초안 생성 + 수업/퀴즈 생성·관리 + 따봉 피드백 | IU-04, IU-05, IU-06 | 세션 생성 UI, QR 생성 컴포넌트, 초안 생성 API, 따봉 버튼 | UT-04, UT-07, IT-02~04 |
| D6 | 04/12 (토) | E2E 통합 테스트 + 배포 + 데모 시드 데이터 | 검증 | Playwright 시나리오 3개, Vercel 배포 URL, `supabase/seed.sql` | E2E-01~03 전체 통과 |
| D7 | 04/13 (일) | 발표 자료 + 데모 시나리오 리허설 + 제출 | 발표 | 데모 스크립트, 백업 영상, 공모전 제출 패키지 | 스모크 테스트 (라이브 URL 동작 확인) |

---

### 7.4 공모전 제출 체크리스트 (D6 말)

- [ ] Vercel 라이브 데모 URL 정상 동작
- [ ] 시드 데이터로 빈 상태 / 데모 상태 모두 시연 가능
- [ ] Playwright E2E-01~03 데모 경로 통과
- [ ] 3분 데모 스크립트 완성 (교사 플로우 + 학생 플로우 + AI 기능)
- [ ] 백업 영상 녹화 완료 (네트워크 장애 대비)
- [ ] Claude API 키 Vercel 환경변수 등록 확인

---

### 7.5 리스크 관리

| 리스크 | 영향 | 발생 확률 | 완화 방안 |
|--------|------|---------|---------|
| Claude API 지연/장애 | 높음 | 중간 | MSW 페이크 응답 백업 모드, 데모용 사전 녹화 영상 준비 |
| Supabase 무료 플랜 한도 초과 | 낮음 | 낮음 | 30명 동시 접속 + 7일 사용 → 충분; 모니터링 대시보드 확인 |
| 실시간 리더보드 지연 | 중간 | 낮음 | Realtime 구독 + 낙관적 UI 업데이트로 체감 지연 최소화 |
| 학생 닉네임 중복 | 낮음 | 높음 | 허용 (세션 내 구분은 row ID 기준); 표시만 nickname |
| D2~D4 일정 지연 | 높음 | 중간 | IU-06(따봉)은 D5로 후순위; E2E는 D6에 몰아서 작성 |
| Vercel 빌드 실패 | 중간 | 낮음 | D6에 여유 시간 확보; TypeScript strict 모드 D1부터 유지 |
