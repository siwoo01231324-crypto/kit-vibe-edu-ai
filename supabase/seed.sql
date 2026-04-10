-- ============================================================
-- seed.sql — 데모용 시드 데이터 (이슈 #41)
-- ============================================================
-- supabase start 가 자동 실행합니다.
-- CI 환경(교사 없음): 교사 UUID를 찾지 못하면 조용히 건너뜁니다.
-- 원격 DB: 교사가 Google OAuth로 먼저 로그인한 뒤 실행하면
--          첫 번째 교사 계정에 데모 데이터가 자동 삽입됩니다.
--
-- 수동 실행 (원격):
--   psql "$DATABASE_URL" -f supabase/seed.sql
--
-- 주의사항:
--   - teachers INSERT 하지 않음: handle_new_user 트리거가 로그인 시 자동 생성합니다
--   - ai_insights, class_drafts 시드 없음: 데모 당일 AI 호출이 실시간 생성합니다
--   - 재실행 안전: session ON CONFLICT SKIP, 문항/응답은 DELETE → INSERT 갱신
-- ============================================================

DO $$
DECLARE
  v_teacher_uuid uuid;
BEGIN
  -- 교사 UUID 조회 (없으면 CI 환경 — 건너뜀)
  SELECT id INTO v_teacher_uuid FROM public.teachers LIMIT 1;

  IF v_teacher_uuid IS NULL THEN
    RAISE NOTICE 'seed.sql: 교사 없음 — CI 환경으로 판단, 건너뜁니다.';
    RETURN;
  END IF;

  -- Step 1: 교사 학교 정보 설정
  UPDATE public.teachers
    SET school = '서울시 강남구 OO초등학교'
    WHERE id = v_teacher_uuid;

  -- Step 2: 데모 세션 생성 (join_code 충돌 시 SKIP)
  INSERT INTO public.sessions (
    teacher_id, title, subject, grade, join_code, status, started_at
  ) VALUES (
    v_teacher_uuid,
    '분수의 덧셈과 뺄셈 퀴즈',
    '수학',
    '4학년',
    'DEMO-001',
    'active',
    now()
  )
  ON CONFLICT (join_code) DO NOTHING;

  -- Step 3: 문항 5개 (재실행 시 기존 삭제 후 재삽입)
  DELETE FROM public.questions
    WHERE session_id = (SELECT id FROM public.sessions WHERE join_code = 'DEMO-001');

  INSERT INTO public.questions (session_id, content, options, correct_answer, question_order)
  SELECT
    s.id,
    q.content,
    q.options::jsonb,
    q.correct_answer,
    q.question_order
  FROM public.sessions s,
  (VALUES
    (
      '1/2 + 1/4 를 계산하면?',
      '["1/6", "3/4", "2/4", "5/6"]',
      1, 1
    ),
    (
      '3/4 - 1/4 를 계산하면?',
      '["2/4", "4/8", "1/2", "2/8"]',
      2, 2
    ),
    (
      '2/5 + 2/5 를 계산하면?',
      '["4/10", "4/5", "2/5", "1/5"]',
      1, 3
    ),
    (
      '분모가 같은 분수의 덧셈을 할 때 더하는 것은?',
      '["분모", "분자", "분모와 분자 모두", "아무것도 더하지 않음"]',
      1, 4
    ),
    (
      '5/6 - 1/6 를 계산하면?',
      '["4/0", "4/12", "4/6", "6/6"]',
      2, 5
    )
  ) AS q(content, options, correct_answer, question_order)
  WHERE s.join_code = 'DEMO-001';

  -- Step 4: 학생 응답 25개 (5명 × 5문항, 정답률 약 68%)
  -- 정답: Q1=1, Q2=2, Q3=1, Q4=1, Q5=2
  -- 지민: 5/5 정답 (100%) — 강한 학생
  -- 서연: 4/5 정답 (80%) — Q3 틀림 (통분 혼동)
  -- 민준: 3/5 정답 (60%) — Q3·Q4 틀림 (분자/분모 개념 약함)
  -- 하윤: 3/5 정답 (60%) — Q1·Q5 틀림 (통분 계산 약함)
  -- 도현: 2/5 정답 (40%) — Q2·Q4·Q5 틀림 (분수 연산 전반 약함)
  DELETE FROM public.responses
    WHERE session_id = (SELECT id FROM public.sessions WHERE join_code = 'DEMO-001');

  INSERT INTO public.responses (
    session_id, question_id, nickname, selected_answer, is_correct, response_time_ms, score
  )
  SELECT
    s.id,
    q.id,
    r.nickname,
    r.selected_answer,
    r.selected_answer = q.correct_answer,
    r.response_time_ms,
    CASE WHEN r.selected_answer = q.correct_answer THEN 100 ELSE 0 END
  FROM public.sessions s
  JOIN public.questions q ON q.session_id = s.id
  JOIN (VALUES
    -- 지민 (100%)
    ('지민', 1, 1, 2100),
    ('지민', 2, 2, 1800),
    ('지민', 3, 1, 2400),
    ('지민', 4, 1, 1500),
    ('지민', 5, 2, 2200),
    -- 서연 (80%, Q3 틀림)
    ('서연', 1, 1, 3200),
    ('서연', 2, 2, 2900),
    ('서연', 3, 0, 4100),
    ('서연', 4, 1, 2300),
    ('서연', 5, 2, 3500),
    -- 민준 (60%, Q3·Q4 틀림)
    ('민준', 1, 1, 4500),
    ('민준', 2, 2, 3800),
    ('민준', 3, 0, 5200),
    ('민준', 4, 0, 6100),
    ('민준', 5, 2, 4800),
    -- 하윤 (60%, Q1·Q5 틀림)
    ('하윤', 1, 2, 5800),
    ('하윤', 2, 2, 4200),
    ('하윤', 3, 1, 3900),
    ('하윤', 4, 1, 3100),
    ('하윤', 5, 0, 7200),
    -- 도현 (40%, Q2·Q4·Q5 틀림)
    ('도현', 1, 1, 7800),
    ('도현', 2, 0, 8000),
    ('도현', 3, 1, 6500),
    ('도현', 4, 2, 7100),
    ('도현', 5, 3, 7600)
  ) AS r(nickname, q_order, selected_answer, response_time_ms)
  ON r.q_order = q.question_order
  WHERE s.join_code = 'DEMO-001';

  RAISE NOTICE 'seed.sql: 시드 완료 (교사: %, 세션: DEMO-001)', v_teacher_uuid;
END $$;

-- 완료 확인 쿼리
SELECT '세션' AS 항목, count(*)::text AS 개수
FROM public.sessions WHERE join_code = 'DEMO-001'
UNION ALL
SELECT '문항', count(*)::text
FROM public.questions
WHERE session_id = (SELECT id FROM public.sessions WHERE join_code = 'DEMO-001')
UNION ALL
SELECT '응답', count(*)::text
FROM public.responses
WHERE session_id = (SELECT id FROM public.sessions WHERE join_code = 'DEMO-001');
-- CI 환경: 세션=0, 문항=0, 응답=0 (정상)
-- 원격 환경: 세션=1, 문항=5, 응답=25 (정상)
