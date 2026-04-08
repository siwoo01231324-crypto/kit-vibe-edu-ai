# 01_plan — Issue #23 Supabase 로컬 환경 + DB 스키마

> 작성: 2026-04-08 (`/plan` 으로 구체화)
> 선행: #22 (Next.js 스캐폴드 완료)

## AC 체크리스트

- [ ] `supabase start` 로 로컬 Postgres + Realtime 구동 성공
- [ ] `supabase/migrations/` 에 DDL 파일(들) 커밋 (7개 테이블 + 인덱스 + RLS 정책)
- [ ] `supabase db reset` 실행 시 전체 스키마 재생성 성공
- [ ] 익명 사용자: `sessions` SELECT(active만), `responses`/`thumbs_feedback` INSERT(active 세션만) 가능 검증
- [ ] 교사 외 접근: 다른 교사 세션 SELECT/UPDATE 차단 검증
- [ ] 통합 테스트 1개: Supabase 로컬에 연결해 sessions INSERT → SELECT 성공

## 개발 체크리스트 (불변식)

- [ ] 통합 테스트 코드 작성 (schema 스모크)
- [ ] `supabase/.ai.md`, `apps/web/src/lib/supabase/.ai.md` 작성
- [ ] `docs/ai-report/daily-log.md` 기록 (불변식 1)
- [ ] AI 생성 DDL 인간 검토 후 커밋 (불변식 2)
- [ ] 불변식 위반 없음

---

## 구현 계획

### 리서치 현황

- **Spec 원본**: `docs/specs/dev-spec.md` §3.1 ~ §3.2 (line 225~472) — 7개 테이블 DDL + 14개 RLS 정책 완비.
- **스택 결정**: ORM 없음, Supabase JS SDK 직접 쿼리 (일론 5단계 원칙 = 가능한 한 단순히). `@supabase/supabase-js` + `@supabase/ssr` (Next.js 15 App Router 쿠키 기반 세션).
- **현재 상태**: `supabase/` 디렉토리·CLI·SDK 패키지 모두 미도입. `apps/web/src/lib/supabase/`, `apps/web/src/types/database.ts`, `apps/web/tests/integration/` 아직 비어있음.
- **테스트 방식**: Vitest 2.1.9 이미 설치됨 → 통합 테스트는 로컬 Supabase(`http://127.0.0.1:54321`) 에 직접 붙는다. `vitest.config` 에 integration 프로젝트가 있는지 확인 필요.
- **환경변수**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — dev-spec §2.3 기준.

### Task Flow (단계 순서)

#### Phase A: 스캐폴드 & CLI 부트스트랩 (AC1)

**A1. Supabase CLI 존재 확인 + 문서화**
- `supabase --version` 실행. 없으면 `apps/web/.env.example` 또는 README 에 설치 안내 (`npm i -g supabase` / `scoop install supabase`) 명시.
- Docker Desktop 필요 사실 README/.ai.md 에 명시.
- **Blocker 주의**: CLI·Docker 미설치 시 `supabase start` 는 사용자 수동 작업. 자동 검증이 불가능하면 `SKIP_SUPABASE_LOCAL=1` 환경변수로 통합 테스트를 스킵 모드로 돌린다.

**A2. `supabase init` 실행 → 프로젝트 루트에 `supabase/` 생성**
- 루트(`.worktree/000023-supabase-schema/`)에서 `npx supabase init` 실행.
- 결과물: `supabase/config.toml`, `supabase/.gitignore`, `supabase/seed.sql` 등.
- `supabase/config.toml` 의 포트(54321~54324) 확인, 변경 불필요하면 기본값 유지.

**A3. `.gitignore` 정리**
- 루트 `.gitignore` 에 다음이 포함되었는지 확인·추가:
  - `.env.local`, `.env*.local`, `apps/web/.env.local`
  - `supabase/.branches`, `supabase/.temp` (CLI 로컬 캐시)
- `supabase/migrations/` 와 `supabase/config.toml` 은 **커밋 대상**.

**A4. `.env.local` 템플릿 작성**
- `apps/web/.env.example` 생성 (없으면): 위 3개 키 + 주석 "`supabase start` 출력값으로 채우세요".
- `apps/web/.env.local` 은 직접 생성하지 않음 (사용자 수동).

#### Phase B: SQL 마이그레이션 (AC2)

**B1. `supabase/migrations/20260408000000_initial_schema.sql` 생성**
- 내용: dev-spec §3.2 DDL 전체 (teachers/sessions/questions/responses/ai_insights/class_drafts/thumbs_feedback).
- 각 테이블 뒤에 `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` + 정책들 포함.
- 인덱스 2개: `idx_sessions_join_code`, `idx_sessions_teacher_id`, `idx_questions_session_order`, `idx_responses_session_submitted`.
- 헤더 주석: `-- Migration: 2026-04-08 initial schema — 7 tables + RLS` + dev-spec §3.2 원본 링크.
- **주의**: `pgcrypto` 또는 `gen_random_uuid()` 확장 필요 — Supabase 로컬은 기본 활성화되지만 명시적으로 `CREATE EXTENSION IF NOT EXISTS pgcrypto;` 추가 권장.

**B2. 마이그레이션 파일 문법·구조 검증 (자가 검토)**
- 7개 CREATE TABLE, 14개 CREATE POLICY, 4개 CREATE INDEX 카운트 확인.
- FK 참조 순서 검증: teachers → sessions → questions → responses / ai_insights / class_drafts / thumbs_feedback.
- 각 익명 정책(`TO anon`)이 spec 과 일치하는지 재확인.

#### Phase C: 스택 기동 & 재현성 (AC1, AC3)

**C1. `supabase start` 기동 (사용자 수동 가능)**
- Docker Desktop 실행 중인 경우 에이전트가 `supabase start` 시도.
- 실패 시 가이드 출력: "Docker Desktop 실행 후 `supabase start` 를 직접 실행해주세요".
- 성공 시 출력된 anon key, service role key 를 사용자가 `.env.local` 에 복사.

**C2. `supabase db reset` 재현 테스트**
- 마이그레이션 파일 적용 재현 확인.
- 실패 시 SQL 오류 원인 수정 후 재시도.

#### Phase D: TypeScript 클라이언트 (Supabase JS SDK)

**D1. SDK 패키지 설치**
- `apps/web/package.json` 에 추가:
  - `@supabase/supabase-js@^2.47.0`
  - `@supabase/ssr@^0.5.2`
- `cd apps/web && npm install`

**D2. `apps/web/src/lib/supabase/client.ts` 작성 (브라우저용)**
- `createBrowserClient` from `@supabase/ssr`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 사용
- 싱글턴 export: `supabase`

**D3. `apps/web/src/lib/supabase/server.ts` 작성 (서버용)**
- `createServerClient` from `@supabase/ssr`
- Next.js 15 `cookies()` (async) 바인딩
- 두 가지 팩토리 export:
  - `createClient()` — 요청 컨텍스트 내 RSC/Route Handler 용 (anon key)
  - `createAdminClient()` — `SUPABASE_SERVICE_ROLE_KEY` 기반 서비스용 (RLS 우회, 관리 작업 한정)

**D4. `apps/web/src/types/database.ts` 생성**
- `supabase gen types typescript --local > apps/web/src/types/database.ts` 시도.
- CLI 부재 시 임시로 수동 타입 인터페이스 작성 + TODO 주석 ("`supabase gen types` 재실행 필요").

**D5. `.ai.md` 작성**
- `supabase/.ai.md` — 목적, 구조(config/migrations/seed), 로컬 실행법.
- `apps/web/src/lib/supabase/.ai.md` — client.ts / server.ts 분리 원칙, RLS 의존 모델.

#### Phase E: 통합 테스트 (AC4, AC5, AC6)

**E1. Vitest integration 프로젝트 설정 확인**
- `apps/web/vitest.config.ts` 에 `integration` 프로젝트 있는지 확인.
- 없으면 추가: `test.projects = [{ name: 'unit', ... }, { name: 'integration', include: ['tests/integration/**/*.test.ts'], environment: 'node' }]`.

**E2. `apps/web/tests/integration/schema.test.ts` 작성**
- Test 1: **sessions INSERT → SELECT** (AC6)
  - service role client 로 teacher fixture INSERT
  - teacher jwt 로 sessions INSERT → SELECT 로 본인 세션 조회
- Test 2: **익명 사용자 권한** (AC4)
  - anon client 로 `sessions` SELECT — `status='draft'` 은 0행, `status='active'` 는 1행 반환
  - anon client 로 `responses` INSERT (active 세션) → 성공
  - anon client 로 `responses` INSERT (draft 세션) → RLS 거부 (error 기대)
  - anon client 로 `thumbs_feedback` INSERT (active) → 성공
- Test 3: **교사 간 격리** (AC5)
  - teacher A 의 세션을 teacher B jwt 로 SELECT → 0행
  - teacher B jwt 로 UPDATE → 0 rows affected

**E3. 스킵 가드**
- `beforeAll` 에서 `http://127.0.0.1:54321/health` 핑. 실패 시 `it.skip` 처리하고 "local Supabase not running" 경고 로그.
- 환경변수 `SKIP_SUPABASE_LOCAL=1` 이면 전체 스킵.

**E4. 실행 검증**
- `cd apps/web && npm run test -- tests/integration/schema.test.ts` — 로컬 스택 있으면 green, 없으면 skipped (실패 아님).

#### Phase F: 문서·불변식 마무리

**F1. `docs/ai-report/daily-log.md` 2026-04-08 섹션에 추가**
- 사용 도구: Claude Opus 4.6 (Claude Code), `/ri` `/plan` `/team 3`
- 주요 프롬프트: "Supabase 로컬 환경 + 7테이블 DDL + RLS 마이그레이션"
- AI 기여: SQL 마이그레이션 드래프트, TS 클라이언트 코드, 통합 테스트 코드
- 인간 주도: DDL 리뷰·Docker 설치·`supabase start` 실행·env 키 주입

**F2. `00_issue.md` 개발 체크리스트 [x] 업데이트**

**F3. 커밋 전 자가 검증**
- `cd apps/web && npm run lint`
- `cd apps/web && npm run test` (integration은 스킵되어도 OK, unit 은 전부 green)
- `node -e "require('fs').readFileSync('supabase/migrations/20260408000000_initial_schema.sql','utf8').length"` — 파일 존재·길이 확인

---

## 파일 생성/수정 목록

**신규 생성:**
- `supabase/config.toml` (supabase init 산물)
- `supabase/.gitignore` (supabase init 산물)
- `supabase/migrations/20260408000000_initial_schema.sql` ★ 핵심
- `supabase/seed.sql` (빈 파일 또는 placeholder)
- `supabase/.ai.md`
- `apps/web/.env.example`
- `apps/web/src/lib/supabase/client.ts`
- `apps/web/src/lib/supabase/server.ts`
- `apps/web/src/lib/supabase/.ai.md`
- `apps/web/src/types/database.ts`
- `apps/web/tests/integration/schema.test.ts`

**수정:**
- `.gitignore` (루트) — `.env*.local`, `supabase/.branches`, `supabase/.temp` 추가
- `apps/web/package.json` — `@supabase/supabase-js`, `@supabase/ssr` 추가
- `apps/web/package-lock.json` — npm install 산물
- `apps/web/vitest.config.ts` — integration 프로젝트 추가(이미 있으면 skip)
- `docs/ai-report/daily-log.md` — 2026-04-08 섹션 업데이트
- `docs/work/active/000023-supabase-schema/00_issue.md` — 체크리스트 [x]

---

## 검증 매트릭스 (AC ↔ 증거)

| AC | 검증 방법 | 증거 |
|---|---|---|
| AC1 `supabase start` | `supabase status` 출력 / 사용자 수동 확인 | 터미널 로그, Studio `:54323` 접속 |
| AC2 마이그레이션 커밋 | `git ls-files supabase/migrations/` | 파일 존재, 7 테이블 grep |
| AC3 `db reset` 재현 | `supabase db reset` 종료코드 0 | 스택 출력 |
| AC4 익명 권한 | `tests/integration/schema.test.ts` Test 2 | Vitest green |
| AC5 교사 격리 | `tests/integration/schema.test.ts` Test 3 | Vitest green |
| AC6 INSERT→SELECT | `tests/integration/schema.test.ts` Test 1 | Vitest green |

---

## Guardrails

### Must Have
- RLS 정책은 **dev-spec §3.2 와 완전 일치**. 임의로 정책 문구 변경 금지.
- 마이그레이션 파일명: `YYYYMMDDHHMMSS_description.sql` (Supabase 규칙). 2026-04-08 기준 `20260408000000_initial_schema.sql`.
- 통합 테스트는 **로컬 Supabase 부재 시 skip** 처리 (CI 실패 방지). 절대 mock 으로 대체 금지 (CLAUDE.md feedback: mock 대신 실제 DB).
- `SUPABASE_SERVICE_ROLE_KEY` 는 **서버 코드에서만** 사용. `NEXT_PUBLIC_` 접두사 금지.
- 커밋 전 `.env.local` 이 추적되지 않는지 `git status` 확인.
- 모든 신규 디렉토리에 `.ai.md` 작성 (레포 규칙 3번).

### Must NOT Have
- Drizzle/Prisma 등 **ORM 도입 금지**. Supabase JS SDK 직접 쿼리.
- 마이그레이션 파일을 **수정**하지 않는다. 변경이 필요하면 새 타임스탬프 파일 추가 (그러나 이 이슈에서는 initial 만).
- `.env.local` 값(anon key, service role key)을 **커밋/출력 금지**.
- RLS 를 `FORCE` 로 걸지 않는다 (Supabase 기본 동작 사용). `auth.users` 테이블 직접 수정 금지.
- 기존 구현(#22 스캐폴드) 파일을 **무단 리팩터링 금지** — 이 이슈 범위가 아님.
- CI 를 통과시키기 위해 테스트를 **임의로 스킵** 하지 않는다 (환경변수 가드는 OK).

---

## 리스크 & 차단 요소

| 리스크 | 발생 확률 | 완화책 |
|---|---|---|
| Docker Desktop/Supabase CLI 미설치 → `supabase start` 실패 | 높음 (사용자 로컬 의존) | README 안내 + 통합 테스트 skip 가드 + 사용자 수동 승인 포인트 |
| `supabase gen types --local` CLI 필요 | 중간 | CLI 없으면 수동 타입 스텁 + TODO |
| RLS 테스트에서 `anon` / `authenticated` jwt 발급 방식 혼란 | 중간 | `createClient` 에 anon key / service role key 로 분리, service role 로 teacher fixture 시드 |
| Next.js 15 `cookies()` async 변경으로 server client 작성 패턴 변경 | 중간 | `@supabase/ssr` ^0.5.x 공식 가이드 패턴 사용 |
| 마이그레이션 SQL 에서 `auth.users` FK 가 로컬 초기화 전 실행되면 실패 | 낮음 | `CREATE EXTENSION IF NOT EXISTS pgcrypto;` 선행, `auth` 스키마는 Supabase 가 사전 구축 |

## 롤백 플랜

- 마이그레이션 오류 시 `supabase db reset` 으로 재현. 잘못된 DDL 은 같은 파일을 수정 후 재적용 (커밋 전이므로 안전).
- 패키지 설치 이슈 시 `apps/web/package.json` 및 `package-lock.json` git restore.
- PR 머지 전이라면 `git reset --hard HEAD~N` 으로 롤백 가능.
