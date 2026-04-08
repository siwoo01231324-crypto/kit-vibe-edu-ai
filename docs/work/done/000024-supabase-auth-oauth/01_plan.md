# 01_plan.md — 이슈 #24 구현 계획 v2

> v2: Architect + Critic 피드백 반영. Option C 하이브리드 채택, SECURITY DEFINER 하드닝, middleware `getUser()` 강제, open redirect 방어, 음성/멱등성 테스트 추가.

## Acceptance Criteria

- [ ] Google OAuth Provider 연동 (Supabase 로컬 또는 원격 프로젝트에서 동작)
- [ ] `/login` 페이지 → Google 로그인 → `/teacher/dashboard` 리다이렉트
- [ ] 로그아웃 버튼 → 세션 만료 + 랜딩으로 리다이렉트
- [ ] `auth.users` INSERT 시 `teachers` row 자동 생성 트리거 동작 (Option C: 트리거 + callback upsert 하이브리드)
- [ ] `apps/web/src/middleware.ts`: 미인증 사용자가 `(teacher)/*` 접근 시 `/login` 리다이렉트
- [ ] 통합 테스트: 인증된 교사만 `sessions` INSERT 가능 확인 (+ 음성 케이스 + 멱등성 케이스)

## 구현 계획

### 1. RALPLAN-DR 요약

#### Principles (설계 원칙)

1. **Defense in depth**: 프로필 row 생성은 단일 경로에 의존하지 않는다 (DB 레벨 + 애플리케이션 레벨 이중화).
2. **Idempotency first**: 모든 쓰기 경로는 멱등해야 한다 (동일 요청 N회 실행 = 1회 실행과 동일한 상태).
3. **Least privilege at boundary**: middleware는 쿠키를 신뢰하지 않고 Auth 서버에 검증 요청(`getUser()`)한다.
4. **Fail-open for profile sync, fail-closed for auth**: 프로필 동기화 실패는 로그인을 차단하지 않으나(경고 로그), 인증 실패는 즉시 리다이렉트한다.
5. **Schema constraint as source of truth**: `teachers.name NOT NULL` 제약을 우회하지 않고, 삽입 경로가 항상 fallback 값을 보장한다.

#### Decision Drivers (설계 결정 요인 — 우선순위)

1. **스키마 제약 준수**: `teachers.name NOT NULL` + Google `raw_user_meta_data->>'full_name'` 의 불확실성(쿼리 시점에 null 가능성) → 삽입 경로가 NOT NULL 위반을 절대 일으키지 않아야 함.
2. **SPoF 제거**: 트리거 단독 경로 실패 시 로그인 전체가 깨지는 리스크.
3. **보안**: SECURITY DEFINER 트리거의 search_path 취약점(CVE-2018-1058), open redirect (`next` 파라미터), middleware의 쿠키 스푸핑 위험.

#### Options 분석 및 ADR

**Option A — 순수 DB 트리거 only**
- 장점: 단일 진실 공급원, 애플리케이션 코드 단순.
- 단점: `full_name` 이 없는 경우 NOT NULL 위반 가능, SPoF, 트리거 실패 디버깅 난이도.

**Option B — 순수 Callback handler only**
- 장점: TypeScript에서 완전 제어, 디버깅 용이.
- 단점: admin API 직접 생성 경로(향후 SQL, 관리자 콘솔 등)에서 teachers row 누락 → 데이터 무결성 구멍.

**Option C — 하이브리드 (채택)** ⭐
- **트리거**: 최소한의 방어적 INSERT로 row 존재 보장 (`COALESCE` fallback).
- **Callback**: 정확한 프로필 값으로 upsert 동기화 (`ON CONFLICT (id) DO UPDATE`).
- 장점: 트리거가 SPoF 제거 + callback이 최신 프로필 값 보장, 두 경로 모두 멱등.
- 단점: 두 경로 유지보수 필요 → Guardrail로 역할 분리 명시.

**ADR**

- **Decision**: Option C 하이브리드 채택.
- **Drivers**: 스키마 제약 준수 + SPoF 제거 + 보안.
- **Alternatives considered**: Option A (NOT NULL 위반 리스크 탈락), Option B (admin 경로 무결성 공백 탈락).
- **Why chosen**: 두 경로가 상호 보완하며 각각 멱등이기 때문에 중복 실행이 안전하고, 트리거가 DB 레벨에서 최소 보장을 제공한다.
- **Consequences**:
  - (+) 어떤 경로로 `auth.users` 가 생성되든 `teachers` row 존재 보장.
  - (+) Callback 실패해도 row 는 존재 → 다음 로그인 시 복구 가능.
  - (-) 역할 경계 문서화 필수 (아래 Guardrails 참조).
- **Follow-ups**:
  - 향후 migration 에서 `teachers.name` 을 `default 'Unknown Teacher'` 로 완화할지 재검토.
  - 운영 전 Sentry/로그 기반으로 트리거 WARNING 감지 알람 구성.

---

### 2. 단계별 구현 계획 (AC 별, 파일 경로 명시)

#### Step 1 — Google OAuth Provider 활성화 (AC1)

**파일**: `supabase/config.toml`

- `[auth]` 섹션에 `additional_redirect_urls = ["http://localhost:3000/auth/callback"]` 추가.
- 신규 섹션 추가:
  ```toml
  [auth.external.google]
  enabled = true
  client_id = "env(SUPABASE_AUTH_GOOGLE_CLIENT_ID)"
  secret    = "env(SUPABASE_AUTH_GOOGLE_SECRET)"
  redirect_uri = "http://127.0.0.1:54321/auth/v1/callback"
  ```
- `apps/web/.env.local.example` 신규 (있으면 수정) 에 `SUPABASE_AUTH_GOOGLE_CLIENT_ID=`, `SUPABASE_AUTH_GOOGLE_SECRET=` placeholder 추가.

**수락 기준**: `supabase stop && supabase start` 재기동 후 Studio Auth 섹션에서 Google provider 가 활성화된 상태로 표시된다.

---

#### Step 2 — 트리거 마이그레이션 (AC4 DB 경로)

**파일 (신규)**: `supabase/migrations/20260408000001_auth_trigger.sql`

```sql
-- handle_new_user: auth.users INSERT 시 teachers row 최소 보장
-- SECURITY DEFINER + SET search_path (CVE-2018-1058 방어)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.teachers (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.email,
      'Unknown Teacher'
    ),
    COALESCE(NEW.email, '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- 상위 트랜잭션 롤백 금지 (auth.users 생성은 성공해야 함)
  RAISE WARNING 'handle_new_user failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**수락 기준**:
- `supabase db reset` 후 `auth.users` 에 test user INSERT → `teachers` row 자동 생성 확인.
- `raw_user_meta_data = '{}'` 인 경우도 `name = email or 'Unknown Teacher'` 로 row 생성 성공.

---

#### Step 3 — Supabase ssr middleware 헬퍼 (AC5)

**파일 (신규)**: `apps/web/src/lib/supabase/middleware.ts`

- `updateSession(request: NextRequest)` 함수 export.
- `createServerClient` + `request.cookies.getAll` / `setAll` 패턴.
- **반드시 `await supabase.auth.getUser()` 호출** (NOT `getSession()`) — Auth 서버 검증.
- 리턴: `{ response, user }` 또는 리다이렉트 `NextResponse`.

**파일 (신규)**: `apps/web/src/middleware.ts` (루트)

- matcher: `['/((?!_next/static|_next/image|favicon.ico|auth/callback|api).*)']`
- `updateSession` 호출 → user 없으면 `(teacher)/*` 경로에서 `/login?next=<pathname>` 리다이렉트.
- 그 외 경로(랜딩, `/login`, `/join`) 는 통과.

**수락 기준**:
- 미로그인 상태로 `/teacher/dashboard` 접근 → `/login?next=%2Fteacher%2Fdashboard` 리다이렉트.
- 로그인 후 `/teacher/dashboard` 접근 → 200 응답.

---

#### Step 4 — Login 페이지 (AC2 진입)

**파일 (신규)**:
- `apps/web/src/app/login/page.tsx` — 서버 컴포넌트 + 클라이언트 버튼.
- `apps/web/src/app/login/GoogleSignInButton.tsx` (Client Component) — `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '${origin}/auth/callback?next=${next}' } })`.
- `apps/web/src/app/login/.ai.md` — 목적/구조/역할.

**수락 기준**: `/login` 렌더 → 버튼 클릭 → Google 동의 화면 → `/auth/callback` 으로 code 와 함께 돌아옴.

---

#### Step 5 — OAuth Callback handler (AC2 착지 + AC4 App 경로)

**파일 (신규)**: `apps/web/src/app/auth/callback/route.ts`

로직:
1. `url.searchParams` 에서 `code`, `next`, `error` 추출.
2. `error` 가 있으면 `/login?error=<encoded>` 로 리다이렉트.
3. **`next` allowlist 검증**: `/^\/teacher(\/|$)/` 패턴에 맞지 않으면 `/teacher/dashboard` 로 폴백 (open redirect 방어).
4. `supabase.auth.exchangeCodeForSession(code)` 호출.
5. 성공 시: `supabase.auth.getUser()` → user metadata 로부터 `teachers` upsert:
   ```ts
   await supabase
     .from('teachers')
     .upsert({
       id: user.id,
       name: user.user_metadata?.full_name
         ?? user.user_metadata?.name
         ?? user.email
         ?? 'Unknown Teacher',
       email: user.email ?? '',
     }, { onConflict: 'id' });
   ```
6. `NextResponse.redirect(new URL(safeNext, origin))`.
7. 실패(exchange 에러) 시: `/login?error=exchange_failed`.

**수락 기준**:
- 정상 플로우: `/auth/callback?code=...&next=/teacher/dashboard` → 세션 쿠키 세팅 → `/teacher/dashboard`.
- 악성 `next`: `?next=https://evil.com` → `/teacher/dashboard` 로 폴백.
- `error` 파라미터 존재: `/login?error=...`.

---

#### Step 6 — (teacher) 레이아웃 가드 + 로그아웃 (AC2, AC3)

**파일 (신규)**:
- `apps/web/src/app/(teacher)/layout.tsx` — 서버 컴포넌트, `supabase.auth.getUser()` 재확인, null 이면 `redirect('/login')`.
- `apps/web/src/app/(teacher)/SignOutButton.tsx` (Client Component) — `supabase.auth.signOut()` 후 `router.replace('/')`.
- `apps/web/src/app/(teacher)/dashboard/page.tsx` (최소 placeholder) — `Hello, {teacher.name}` 표시.
- `apps/web/src/app/(teacher)/.ai.md`, `apps/web/src/app/(teacher)/dashboard/.ai.md` 작성.

**수락 기준**:
- 로그아웃 버튼 클릭 → 세션 쿠키 제거 → 랜딩 `/` 리다이렉트.
- 랜딩에서 `/teacher/dashboard` 재접근 시 → `/login` 리다이렉트.

---

#### Step 7 — 통합 테스트 (AC6 + v2 음성/멱등성)

**파일 (신규)**: `apps/web/tests/integration/auth-trigger.test.ts`

Vitest + Supabase admin client(`createAdminClient()`) 사용, `supabase db reset` 상태를 가정.

Test cases:
1. **양성 케이스** — `auth.admin.createUser({ email, user_metadata: { full_name: 'Test Teacher' } })` → `teachers` 에 `name = 'Test Teacher'` row 존재.
2. **음성 케이스** — `auth.admin.createUser({ email, user_metadata: {} })` → 트리거가 실패하지 않고 `teachers` row 가 생성되며 `name = email` (또는 fallback) 확인.
3. **멱등성 케이스** — 동일 user 에 대해 callback upsert 로직(테스트에서는 직접 SQL 또는 client 호출)을 2회 실행 → `teachers` row 가 정확히 1개, 두 번째 호출이 update 로 동작.

**파일 (신규)**: `apps/web/tests/integration/session-insert-guard.test.ts`

1. 미인증(anon) 클라이언트로 `sessions` INSERT 시도 → RLS 거부.
2. teacher A 로그인 세션에서 `sessions` INSERT → 성공.
3. teacher A 가 teacher B 의 `teacher_id` 로 INSERT 시도 → `WITH CHECK` 실패.

**수락 기준**: `cd apps/web && npm run test` 에서 3개 케이스 모두 green.

---

### 3. 파일 변경 목록

**신규 (13개)**
- `supabase/migrations/20260408000001_auth_trigger.sql`
- `apps/web/src/lib/supabase/middleware.ts`
- `apps/web/src/middleware.ts`
- `apps/web/src/app/login/page.tsx`
- `apps/web/src/app/login/GoogleSignInButton.tsx`
- `apps/web/src/app/login/.ai.md`
- `apps/web/src/app/auth/callback/route.ts`
- `apps/web/src/app/(teacher)/layout.tsx`
- `apps/web/src/app/(teacher)/SignOutButton.tsx`
- `apps/web/src/app/(teacher)/dashboard/page.tsx`
- `apps/web/src/app/(teacher)/.ai.md`
- `apps/web/src/app/(teacher)/dashboard/.ai.md`
- `apps/web/tests/integration/auth-trigger.test.ts`
- `apps/web/tests/integration/session-insert-guard.test.ts`

**수정 (3개)**
- `supabase/config.toml` — `[auth.external.google]` 섹션 + `additional_redirect_urls`.
- `apps/web/.env.local.example` — Google OAuth env 키 추가 (없으면 신규).
- `docs/ai-report/daily-log.md` — 작업 기록 추가 (불변식 1).

**영향 (읽기만)**
- `apps/web/src/lib/supabase/client.ts`, `server.ts` — 변경 없음, import 만 사용.
- `supabase/migrations/20260408000000_initial_schema.sql` — 변경 없음, 트리거 마이그레이션이 이후 순번으로 추가됨.

---

### 4. Guardrails (v2 수정)

#### Must Have

- **프로필 row 존재는 DB 트리거가 보장한다** (`auth.users` INSERT → `teachers` row 생성 최소 보장).
- **프로필 필드 동기화는 callback이 수행한다** (`full_name`, `email` 등 최신 값 upsert).
- **두 경로 모두 멱등이어야 한다** — 트리거는 `ON CONFLICT DO NOTHING`, callback 은 `ON CONFLICT DO UPDATE`.
- **트리거는 `SECURITY DEFINER` + `SET search_path = public, pg_temp`** (CVE-2018-1058 방어).
- **트리거 내부 `EXCEPTION WHEN OTHERS` 블록** — 실패 시 `RAISE WARNING` 만, 상위 트랜잭션 롤백 금지.
- **Callback handler 의 `next` 파라미터는 `/^\/teacher(\/|$)/` allowlist** 로 검증 후 미매칭 시 `/teacher/dashboard` 폴백.
- **Callback handler 는 `error` query param 을 처리**하여 `/login?error=...` 로 리다이렉트.
- **`apps/web/src/lib/supabase/middleware.ts` 의 `updateSession()` 은 반드시 `supabase.auth.getUser()` 사용** (Auth 서버 검증).
- **`teachers.name` 삽입 시 항상 fallback 체인** (`full_name → name → email → 'Unknown Teacher'`).
- 신규 디렉토리 모두 `.ai.md` 작성.
- `docs/ai-report/daily-log.md` 기록 (불변식 1).

#### Must NOT Have

- **Middleware 에서 `getSession()` 사용 금지** — 쿠키만 신뢰하므로 스푸핑 위험.
- **Callback handler 에서 `next` 파라미터를 검증 없이 `NextResponse.redirect` 에 전달 금지** — open redirect 취약점.
- **트리거 내부에서 `public.` 스키마 prefix 없이 함수/테이블 참조 금지** (search_path 공격 방어).
- **트리거 EXCEPTION 블록에서 `RAISE EXCEPTION` 금지** — 상위 트랜잭션 롤백 유발 → 로그인 전면 차단.
- **Callback handler 에서 admin client 로 `teachers` insert 금지** — RLS를 우회하면 teacher 소유권 검증이 깨진다. `exchangeCodeForSession` 이 세션을 세팅한 동일 `supabase` 인스턴스로 upsert.
- **Supabase 서비스 역할 키(`SUPABASE_SERVICE_ROLE_KEY`) 를 클라이언트/브라우저에 노출 금지**.
- **`/teacher/*` 경로에 대한 가드를 middleware에만 의존 금지** — `(teacher)/layout.tsx` 에서도 `getUser()` 재확인 (defense in depth).
- **`teachers.name` 을 `DEFAULT ''` 로 변경하는 스키마 수정 금지** — 본 이슈의 스코프 아님.

---

### 5. 테스트 전략

**Layer 1 — 마이그레이션 테스트 (DB)**
- `supabase db reset` 후 `psql` 또는 admin client 로 `auth.users` 에 INSERT.
- 양성 케이스: `raw_user_meta_data = '{"full_name": "홍길동"}'` → `teachers.name = '홍길동'`.
- 음성 케이스: `raw_user_meta_data = '{}'` → `teachers.name = email` (fallback 동작).
- 검증: `search_path` 공격 시뮬레이션 — 동일 스키마에 악성 `public.teachers` 함수/테이블이 있더라도 트리거가 `public, pg_temp` 경로만 사용하는지 확인.

**Layer 2 — 통합 테스트 (Vitest)**
- `apps/web/tests/integration/auth-trigger.test.ts`
  - 양성 / 음성 / 멱등성 3 케이스 (Step 7 참조).
- `apps/web/tests/integration/session-insert-guard.test.ts`
  - RLS 가드: anon 거부, teacher A 자기 세션 INSERT 허용, teacher A → teacher B 위장 INSERT 거부.

**Layer 3 — Middleware/Callback 단위 테스트**
- `apps/web/tests/unit/middleware.test.ts` (신규 고려)
  - Mock `NextRequest` 로 `updateSession()` 이 `getUser()` 를 호출하는지 확인 (spy).
  - 미인증 `/teacher/*` → 리다이렉트 응답 확인.
- `apps/web/tests/unit/auth-callback.test.ts`
  - Open redirect 방어: `next=https://evil.com` → `/teacher/dashboard` 리턴.
  - `next=/teacher/sessions/abc` → 그대로 전달.
  - `error=access_denied` → `/login?error=access_denied`.

**Layer 4 — E2E (Playwright, 선택)**
- 수동 QA 또는 `@supabase/auth-helpers-nextjs` mock 세션으로 로그인 플로우 확인.
- 본 이슈의 DoD 에는 필수 아님, 후속 이슈에서 보강.

**테스트 실행 커맨드**
```bash
supabase db reset        # 마이그레이션 + 트리거 반영
cd apps/web
npm run lint             # ESLint clean
npm run test             # Vitest (unit + integration)
```

---

### 6. 리스크 및 주의사항

| 리스크 | 영향 | 완화책 |
|---|---|---|
| `raw_user_meta_data->>'full_name'` 이 Google 응답에서 누락 | `teachers.name` NOT NULL 위반 → 로그인 전체 실패 | Option C 트리거에서 `COALESCE` fallback 체인으로 보장 |
| 트리거 내부 에러가 auth.users INSERT 를 롤백 | 모든 Google 로그인 실패 | `EXCEPTION WHEN OTHERS RAISE WARNING` 으로 격리 |
| SECURITY DEFINER + search_path 누락 | CVE-2018-1058 권한 상승 | `SET search_path = public, pg_temp` 강제 |
| Callback `next` 파라미터 open redirect | 피싱 공격 벡터 | allowlist regex `/^\/teacher(\/|$)/` + fallback |
| Middleware `getSession()` 사용 시 쿠키 스푸핑 | 가드 우회 | Guardrail: `getUser()` 만 허용 + 리뷰 체크 |
| Callback upsert 실패 (네트워크/DB) | 프로필 필드 오래됨 | 트리거가 row 는 보장 → 다음 로그인 시 복구, Sentry 알람 (후속) |
| `.env.local` 의 Google client secret 커밋 사고 | 크리덴셜 유출 | `.env.local` 은 `.gitignore`, `.env.local.example` 만 커밋 |
| Admin client (`createAdminClient`) 가 callback 에서 사용될 경우 RLS 우회 | teacher 소유권 검증 깨짐 | Guardrail: callback 에서는 세션 기반 client 만 사용 |
| 트리거 migration 순서 역전 | 트리거가 teachers 테이블 없는 상태에서 생성 시도 | 파일명 `20260408000001` 로 initial_schema(`20260408000000`) 이후 보장 |
| `(teacher)` route group 과 `middleware.ts` matcher 불일치 | 가드 우회 또는 과도한 리다이렉트 | matcher 패턴을 `(teacher)` 그룹이 해석된 실제 경로 `/teacher/*` 로 작성 |

**주의사항 (운영/수동 작업)**
- Google Cloud Console 에서 OAuth 2.0 Client ID 생성 및 승인된 리디렉트 URI 등록은 사용자 수동 작업 (`http://127.0.0.1:54321/auth/v1/callback` + `http://localhost:3000/auth/callback`).
- `supabase stop && supabase start` 재기동 필요 (config.toml 변경 반영).
- 로컬 개발 시 `enable_confirmations = false` 유지 (이미 설정됨).

---

## 완료 기준 (DoD)

- [ ] `supabase db reset` 성공 → 트리거 마이그레이션 반영.
- [ ] `cd apps/web && npm run test` green — 통합 테스트 3 케이스(양성/음성/멱등성) + RLS 가드 3 케이스 통과.
- [ ] `cd apps/web && npm run lint` clean.
- [ ] 수동 QA: `/login` → Google → `/teacher/dashboard` → 로그아웃 → 랜딩 리다이렉트 플로우 성공.
- [ ] `.ai.md` 신규 디렉토리 모두 작성 (`login`, `(teacher)`, `(teacher)/dashboard`).
- [ ] `docs/ai-report/daily-log.md` 기록 완료 (불변식 1).
- [ ] AI 생성 코드 인간 검토 후 커밋 (불변식 2).
- [ ] 모든 Guardrails 위반 없음.

## 개발 체크리스트

- [ ] 통합 테스트 코드 작성 (auth-trigger + session-insert-guard)
- [ ] `apps/web/src/app/login/.ai.md`, `apps/web/src/app/(teacher)/.ai.md`, `apps/web/src/app/(teacher)/dashboard/.ai.md` 작성
- [ ] `docs/ai-report/daily-log.md` 기록 (불변식 1)
- [ ] AI 생성 코드 인간 검토 후 커밋 (불변식 2)
- [ ] 불변식 위반 없음

## 다음 단계

1. `/remind-issue 24` 로 v2 플랜 품질 확인
2. TDD 사이클로 구현 시작 — Red(테스트 먼저) → Green → Refactor
3. 구현 중 Guardrail 위반 발견 시 즉시 중단 후 계획 재검토
