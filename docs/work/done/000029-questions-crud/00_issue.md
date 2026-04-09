# feat: 퀴즈 문항 CRUD + 편집 UI (Supabase Direct + validateQuestion)

## 사용자 관점 목표
교사가 세션 편집 화면에서 객관식 문항을 추가/수정/삭제/순서변경 할 수 있다.

## 배경
dev-spec §4.2 — 문항 CRUD 는 API Route 대신 Supabase Direct 쿼리. RLS 가 교사 본인 세션만 허용. dev-spec §5 IU-05 `validateQuestion` — 옵션 2~5개, 정답 인덱스 범위 내.

## 완료 기준 (AC)
- [ ] `apps/web/src/app/(teacher)/sessions/[id]/edit/page.tsx` — 문항 목록 + 추가/편집/삭제 UI
- [ ] `apps/web/src/lib/validation.ts` 확장: `validateQuestion({content, options, correct_answer})`
- [ ] Supabase Direct INSERT/UPDATE/DELETE 동작
- [ ] 순서 변경은 `question_order` 숫자 기반 상/하 버튼 (드래그앤드롭 X — Phase 2)
- [ ] 단위 테스트 TEST-IU5-U02~U05 (빈 내용/옵션/정답 인덱스 범위)
- [ ] 통합 테스트 TEST-IU5-I03: questions INSERT → 본인 세션만 성공, 다른 교사 차단

## 구현 플랜
1. RED: `apps/web/tests/unit/validate-question.test.ts` + `apps/web/tests/integration/questions-crud.test.ts`
2. GREEN: `validateQuestion` + Supabase CRUD 훅 (`useQuestions`)
3. 편집 UI: 카드 리스트 + 인라인 편집
4. 순서 변경 로직 (이전/다음 문항과 `question_order` swap)

## 환경 세팅
- 별도 세팅 없음

## 의존성
- 선행: #28 (세션이 존재해야 문항 편집 가능)
- 병렬 가능: #32, #36

## 참고
- dev-spec §4.2 Supabase Direct
- dev-spec §5 IU-05 `validateQuestion`
- dev-spec §3 questions 테이블 RLS

## 개발 체크리스트
- [ ] 단위/통합 테스트 코드 작성 (Vitest)
- [ ] `apps/web/src/app/(teacher)/sessions/.ai.md` 최신화
- [ ] `docs/ai-report/daily-log.md` 기록 (불변식 1)
- [ ] AI 생성 코드 인간 검토 후 커밋 (불변식 2)
- [ ] 불변식 위반 없음



## 작업 내역

