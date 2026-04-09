# 구현 계획 — #28 feat: 세션 생성 API + 폼

> ⚠️ 이 파일은 AC 체크리스트 초안입니다. 구현 전 `/plan` 커맨드로 구체적 계획을 작성하세요.

## AC 체크리스트

- [x] `POST /api/sessions` 구현 (`apps/web/src/app/api/sessions/route.ts`)
  - [x] zod 스키마로 body 검증 (`{title, subject, grade}`)
  - [x] 미인증 → 401 `UNAUTHORIZED`
  - [x] 성공 → `{id, join_code}` 반환
- [x] `apps/web/src/app/teacher/sessions/new/page.tsx` — 세션 생성 폼 (제목/과목/학년 필수)
- [x] 생성 후 `/teacher/sessions/[id]/edit` 리다이렉트
- [x] 통합 테스트 IT-03: 세션 INSERT → `sessions` 테이블 row + `join_code` 반환 + 다른 교사 차단 RLS

## 개발 체크리스트

- [x] 단위/통합 테스트 코드 작성 (Vitest)
- [x] `apps/web/src/app/api/sessions/.ai.md`, `apps/web/src/app/teacher/sessions/.ai.md` 작성
- [x] `docs/ai-report/daily-log.md` 기록 (불변식 1)
- [ ] AI 생성 코드 인간 검토 후 커밋 (불변식 2)
- [x] 불변식 위반 없음
