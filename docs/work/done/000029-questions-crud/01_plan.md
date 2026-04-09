# 구현 계획 — #29 feat: 퀴즈 문항 CRUD + 편집 UI

> ⚠️ 이 파일은 AC 체크리스트 초안입니다. 구현 전 `/plan` 커맨드로 구체적 계획을 작성하세요.

## AC 체크리스트

- [x] `apps/web/src/app/teacher/sessions/[id]/edit/page.tsx` — 문항 목록 + 추가/편집/삭제 UI
- [x] `apps/web/src/lib/validation.ts` 확장: `validateQuestion({content, options, correct_answer})`
- [x] Supabase Direct INSERT/UPDATE/DELETE 동작 (useQuestions 훅)
- [x] 순서 변경은 `question_order` 숫자 기반 상/하 버튼 (드래그앤드롭 X — Phase 2)
- [x] 단위 테스트 TEST-IU5-U02~U05 (빈 내용/옵션/정답 인덱스 범위)
- [x] 통합 테스트 TEST-IU5-I03: questions INSERT → 본인 세션만 성공, 다른 교사 차단

## 개발 체크리스트

- [x] 단위/통합 테스트 코드 작성 (Vitest)
- [x] `apps/web/src/app/teacher/sessions/.ai.md` 최신화
- [x] `docs/ai-report/daily-log.md` 기록 (불변식 1)
- [ ] AI 생성 코드 인간 검토 후 커밋 (불변식 2)
- [x] 불변식 위반 없음
