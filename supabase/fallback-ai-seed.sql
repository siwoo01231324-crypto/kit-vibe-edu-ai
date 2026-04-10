-- ============================================================
-- fallback-ai-seed.sql — AI 장애 시 폴백 전용 스크립트
-- ============================================================
-- ⚠️  정상 데모 플로우에서는 실행하지 마세요.
-- ⚠️  Anthropic API 호출이 실패하거나 응답이 너무 느릴 때만 사용합니다.
--
-- 전제: seed.sql 이 먼저 실행되어 세션·문항·응답이 이미 존재해야 합니다.
--
-- 실행 방법:
--   psql "$DATABASE_URL" -v teacher_uuid="'교사-UUID'" -f supabase/fallback-ai-seed.sql
-- ============================================================

-- ai_insights 삽입 (이미 존재하면 SKIP)
INSERT INTO public.ai_insights (session_id, insights)
SELECT
  s.id,
  '{
    "overall_understanding_rate": 0.68,
    "top_weak_concepts": [
      "통분 개념 (분모가 다른 분수 더하기)",
      "분자와 분모의 역할 구분"
    ],
    "strong_concepts": [
      "분모가 같은 분수의 뺄셈",
      "기본 분수 표기 이해"
    ],
    "next_class_focus": "통분을 활용한 분수 덧셈 집중 연습이 필요합니다. 특히 1/2 + 1/4처럼 분모가 다른 경우 공통 분모를 찾는 과정을 시각 자료와 함께 반복 학습하세요.",
    "question_analysis": [
      {"question_order": 1, "correct_rate": 0.80, "comment": "통분이 필요한 문제에서 일부 혼동"},
      {"question_order": 2, "correct_rate": 1.00, "comment": "분모 같은 뺄셈 완전 이해"},
      {"question_order": 3, "correct_rate": 0.60, "comment": "통분 없이 분모끼리 더하는 오류 빈발"},
      {"question_order": 4, "correct_rate": 0.60, "comment": "분자만 연산한다는 개념 부족"},
      {"question_order": 5, "correct_rate": 0.60, "comment": "뺄셈 결과를 잘못 표기하는 오류"}
    ]
  }'::jsonb
FROM public.sessions s
WHERE s.join_code = 'DEMO-001'
ON CONFLICT (session_id) DO NOTHING;

-- class_drafts 삽입 (이미 존재하면 SKIP)
INSERT INTO public.class_drafts (session_id, content)
SELECT
  s.id,
  $draft$# 다음 수업 초안: 분모가 다른 분수의 덧셈 (통분 집중)

## 학습 목표
- 통분의 개념을 이해하고 분모가 다른 두 분수를 더할 수 있다.
- 최소공배수를 이용해 공통 분모를 구하는 과정을 설명할 수 있다.

## 전시 학습 복습 (5분)
- 오늘 퀴즈 결과 공유: 전체 정답률 68%
- 잘한 점: 분모가 같은 분수 뺄셈은 100% 정답
- 보강할 점: 통분이 필요한 덧셈 (Q1, Q3)에서 어려움

## 도입 (5분)
- 피자 1/2판과 피자 1/4판을 합치면 몇 판일까? (시각 자료 활용)
- "분모가 다르면 어떻게 더할까?" 질문으로 흥미 유발

## 전개 1: 통분 개념 설명 (10분)
- 통분 정의: 분모를 같게 만드는 과정
- 최소공배수(LCM) 찾기 연습: 2와 4의 LCM → 4
- 1/2 = 2/4 변환 시각화 (분수 막대 모형)
- 2/4 + 1/4 = 3/4 계산

## 전개 2: 모둠 활동 (10분)
- 문제 카드 배부: 분모가 다른 분수 덧셈 6문제
- 모둠별로 통분 과정 화이트보드에 적어 발표
- 교사: 오류 패턴(분모끼리 더하는 실수) 집중 피드백

## 정리 (5분)
- 통분 3단계 요약: ① LCM 찾기 → ② 분수 변환 → ③ 분자 더하기
- 다음 시간 예고: 뺄셈에도 통분 적용

## 숙제
- 교과서 72~73쪽 문제 5번까지 (통분 포함 덧셈 3문제)

---
*이 수업 초안은 AI가 퀴즈 응답 데이터를 분석해 생성했습니다. 담당 교사의 검토 후 사용하세요.*
$draft$
FROM public.sessions s
WHERE s.join_code = 'DEMO-001'
ON CONFLICT (session_id) DO NOTHING;

SELECT 'ai_insights 삽입 완료' AS 결과
WHERE EXISTS (SELECT 1 FROM public.ai_insights ai
  JOIN public.sessions s ON s.id = ai.session_id
  WHERE s.join_code = 'DEMO-001');

SELECT 'class_drafts 삽입 완료' AS 결과
WHERE EXISTS (SELECT 1 FROM public.class_drafts cd
  JOIN public.sessions s ON s.id = cd.session_id
  WHERE s.join_code = 'DEMO-001');
