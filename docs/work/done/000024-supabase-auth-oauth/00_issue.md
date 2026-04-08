# chore: Supabase Auth (Google OAuth) + 미들웨어 + teachers 자동 생성

## 목적
Supabase Auth (Google OAuth) 를 연동해 교사 로그인/로그아웃 플로우를 구현하고, `auth.users` 생성 시 `teachers` row 를 자동 생성하는 트리거를 둔다.

## 배경
dev-spec §5 IU-05: 교사 Google OAuth 원클릭. dev-spec §3 `teachers.id` = `auth.users.id` FK. `apps/web/src/middleware.ts` 로 `(teacher)/*` 라우트를 인증 보호한다.

## 완료 기준 (AC)
- [x] Google OAuth Provider 연동 (Supabase 로컬 — config.toml + db reset 확인)
- [x] `/login` 페이지 → Google 로그인 → `/teacher/dashboard` 리다이렉트 (브라우저 확인 완료)
- [x] 로그아웃 버튼 → 세션 만료 + 랜딩으로 리다이렉트 (브라우저 확인 완료)
- [x] `auth.users` INSERT 시 `teachers` row 자동 생성 트리거 동작 (통합 테스트 통과)
- [x] `apps/web/src/middleware.ts`: 미인증 사용자가 `(teacher)/*` 접근 시 `/login` 리다이렉트
- [x] 통합 테스트: 인증된 교사만 `sessions` INSERT 가능 확인 (10/10 green)

## 구현 플랜
1. Supabase Dashboard 또는 `supabase/config.toml` 에서 Google OAuth Provider 활성화
2. `supabase/migrations/20260408000001_auth_trigger.sql` — `handle_new_user()` 함수 + `on_auth_user_created` 트리거
3. `apps/web/src/lib/supabase/middleware.ts` 작성 (`@supabase/ssr` 세션 쿠키 갱신)
4. `apps/web/src/middleware.ts` 루트 작성: `(teacher)/*` 경로 보호
5. `apps/web/src/app/login/page.tsx` — Google 로그인 버튼 (`supabase.auth.signInWithOAuth`)
6. `apps/web/src/app/auth/callback/route.ts` — OAuth 콜백 핸들러
7. `apps/web/src/app/(teacher)/layout.tsx` — 서버 컴포넌트에서 `supabase.auth.getUser()` 체크
8. 통합 테스트 작성

## 환경 세팅 (사용자 수동 작업 포함)
- **Google Cloud Console 세팅**:
  1. OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션)
  2. 승인된 리디렉션 URI에 `http://127.0.0.1:54321/auth/v1/callback` 추가
  3. Client ID + Client Secret 복사
- `supabase/config.toml` 의 `[auth.external.google]` 섹션 enable + env 참조 추가
- `apps/web/.env.local` 에 추가:
  ```
  SUPABASE_AUTH_GOOGLE_CLIENT_ID=...
  SUPABASE_AUTH_GOOGLE_SECRET=...
  ```
- `supabase stop && supabase start` 재기동으로 config 반영

## 의존성
- 선행: #23
- 병렬 가능: 없음

## 참고
- dev-spec §3 teachers RLS 정책
- dev-spec §5 IU-05 수업/퀴즈 생성·관리
- `@supabase/ssr` 공식 문서

## 개발 체크리스트
- [x] 통합 테스트 코드 작성 (인증 가드)
- [x] `apps/web/src/app/login/.ai.md`, `apps/web/src/app/(teacher)/.ai.md` 작성
- [x] `docs/ai-report/daily-log.md` 기록 (불변식 1)
- [ ] AI 생성 코드 인간 검토 후 커밋 (불변식 2)
- [ ] 불변식 위반 없음

## 작업 내역

### 2026-04-09

**현황**: 0/6 완료 (플랜 수립 완료, 구현 대기)
**완료된 항목**: 없음 (AC 미착수)
**미완료 항목**:
- Google OAuth Provider 연동
- /login 페이지 → Google 로그인 → /teacher/dashboard 리다이렉트
- 로그아웃 버튼 → 세션 만료 + 랜딩으로 리다이렉트
- auth.users INSERT 시 teachers row 자동 생성 트리거 동작
- apps/web/src/middleware.ts 미인증 가드
- 통합 테스트: 인증된 교사만 sessions INSERT 가능 확인
**변경 파일**: 1개 (01_plan.md v2 작성 완료)
**비고**: ralplan consensus (Planner→Architect→Critic×2) 완료. Option C 하이브리드 채택, SECURITY DEFINER 하드닝, middleware getUser() 규약, open redirect 방어, 음성/멱등성 테스트 전략 확정.
