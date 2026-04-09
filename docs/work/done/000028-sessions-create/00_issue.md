# feat: 세션 생성 API + 폼 (POST /api/sessions + 교사 대시보드 연동)

## 사용자 관점 목표
교사가 로그인 후 "새 세션 만들기" 버튼으로 제목·과목·학년을 입력해 세션을 생성한다.

## 배경
dev-spec §4 `POST /api/sessions` + dev-spec §5 IU-05. `join_code` 자동 생성 후 세션 row INSERT. RLS 로 교사 본인 row 만 조회 가능.

## 완료 기준 (AC)
- [ ] `POST /api/sessions` 구현 (`apps/web/src/app/api/sessions/route.ts`)
  - [ ] zod 스키마로 body 검증 (`{title, subject, grade}`)
  - [ ] 미인증 → 401 `UNAUTHORIZED`
  - [ ] 성공 → `{id, join_code}` 반환
- [ ] `apps/web/src/app/(teacher)/sessions/new/page.tsx` — 세션 생성 폼 (제목/과목/학년 필수)
- [ ] 생성 후 `/teacher/sessions/[id]/edit` 리다이렉트
- [ ] 통합 테스트 IT-03: 세션 INSERT → `sessions` 테이블 row + `join_code` 반환 + 다른 교사 차단 RLS

## 구현 플랜
1. RED: `apps/web/tests/integration/api/sessions-create.test.ts` 작성
2. GREEN: API Route 핸들러 + `createSession` 서비스 함수
3. 폼 UI 구현 (Server Action 또는 클라이언트 fetch)
4. 에러 핸들링 통일 (`ApiError` 포맷 — dev-spec §4.4)

## 환경 세팅
- 별도 세팅 없음 (앞 이슈에서 완료됨)

## 의존성
- 선행: #24 (Auth), #26 (join_code 생성기), #23 (DB)
- 병렬 가능: **#32, #36** (Phase 3·4 시작 이슈와 병렬)

## 참고
- dev-spec §4.1 API 엔드포인트
- dev-spec §5 IU-05 세션 생성
- dev-spec §4.4 에러 응답 형식

## 개발 체크리스트
- [ ] 단위/통합 테스트 코드 작성 (Vitest)
- [ ] `apps/web/src/app/api/sessions/.ai.md`, `apps/web/src/app/(teacher)/sessions/.ai.md` 작성
- [ ] `docs/ai-report/daily-log.md` 기록 (불변식 1)
- [ ] AI 생성 코드 인간 검토 후 커밋 (불변식 2)
- [ ] 불변식 위반 없음



## 작업 내역

