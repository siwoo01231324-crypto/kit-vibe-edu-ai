# chore: Supabase 로컬 환경 + DB 스키마 마이그레이션 (7테이블 + RLS)

## 목적
Supabase 로컬 개발 환경을 구축하고 dev-spec §3의 DDL 7개 테이블 + RLS 정책을 마이그레이션으로 정의한다. `supabase db reset`으로 재현 가능한 상태 보장.

## 배경
dev-spec §3 DB 스키마: teachers, sessions, questions, responses, ai_insights, class_drafts, thumbs_feedback. 각 테이블에 RLS 정책이 적용되어 API 수준 권한 체크를 대체한다. 일론 5단계 원칙에 따라 ORM 없이 Supabase JS SDK 직접 쿼리.

## 완료 기준 (AC)
- [x] `supabase start` 로 로컬 Postgres + Realtime 구동 성공
- [x] `supabase/migrations/` 에 DDL 파일(들) 커밋 (7개 테이블 + 인덱스 + RLS 정책)
- [x] `supabase db reset` 실행 시 전체 스키마 재생성 성공
- [x] 익명 사용자: `sessions` SELECT(active만), `responses`/`thumbs_feedback` INSERT(active 세션만) 가능 검증
- [x] 교사 외 접근: 다른 교사 세션 SELECT/UPDATE 차단 검증
- [x] 통합 테스트 1개: Supabase 로컬에 연결해 sessions INSERT → SELECT 성공

## 구현 플랜
1. `npx supabase init` 실행 + `.gitignore` 정리
2. `supabase/migrations/20260408000000_initial_schema.sql` 작성 (dev-spec §3.2 DDL 전체)
3. `supabase start` → 로컬 스택 구동 확인
4. `supabase db push` → 마이그레이션 적용
5. `apps/web/src/lib/supabase/client.ts`, `apps/web/src/lib/supabase/server.ts` 작성 (`@supabase/supabase-js`, `@supabase/ssr`)
6. `apps/web/src/types/database.ts` 생성 (`supabase gen types typescript --local`)
7. 통합 테스트 `apps/web/tests/integration/schema.test.ts` 작성

## 환경 세팅 (사용자 수동 작업 포함)
- **Docker Desktop 설치 + 실행 필수** (Supabase 로컬 스택이 Docker 사용)
- Supabase CLI 설치: `npm i -g supabase` 또는 `scoop install supabase`
- `apps/web/.env.local` 템플릿 작성:
  ```
  NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase start 출력값>
  SUPABASE_SERVICE_ROLE_KEY=<supabase start 출력값>
  ```
- `apps/web/.env.local` 은 `.gitignore` 처리 확인
- 원격 Supabase 프로젝트는 Phase 5 (#41) 에서 생성

## 의존성
- 선행: #22
- 병렬 가능: 없음 (다른 DB 이슈의 선행)

## 참고
- dev-spec §3 DB 스키마 (Supabase PostgreSQL DDL)
- dev-spec §2.3 환경변수 템플릿

## 개발 체크리스트
- [x] 통합 테스트 코드 작성 (schema 스모크)
- [x] `supabase/.ai.md`, `apps/web/src/lib/supabase/.ai.md` 작성
- [x] `docs/ai-report/daily-log.md` 기록 (불변식 1)
- [ ] AI 생성 DDL 인간 검토 후 커밋 (불변식 2) — 사용자 최종 검토 대기
- [x] 불변식 위반 없음 (lint clean, tsc exit 0, vitest 4/4 green)

---

## 작업 내역

- 2026-04-08: `/si 23` 워크트리 생성, 브랜치 `refactor/000023-supabase-schema`, 이슈 assign 완료.

### 2026-04-08 (/ri 스냅샷)

**현황**: 0/6 완료
**완료된 항목**: 없음
**미완료 항목**:
- supabase start 로컬 스택 구동
- supabase/migrations/ DDL + RLS 커밋
- supabase db reset 재현 검증
- 익명 사용자 RLS 권한 검증
- 교사 간 데이터 격리 RLS 검증
- 통합 테스트 1개 (sessions INSERT→SELECT)

**변경 파일**: 0개 (`docs/work/active/000023-supabase-schema/` 추적 미포함)
**다음 단계**: `/plan` → `01_plan.md` 구현 계획 구체화 → `/team 3` 구현

### 2026-04-09 (런타임 검증 완료)

**현황**: 6/6 AC 통과 (코드 + 런타임 모두 green)

**구현 파이프라인**: `/ri` → `/plan` (01_plan.md 구체화) → `/team 3` 3 worker 파이프라인 (worker-1 인프라/SQL, worker-2 SDK 클라이언트, worker-3 통합 테스트+문서) → 사용자 요청에 따른 직접 런타임 검증

**런타임 검증 (2026-04-09)**:
- `npx supabase start`: 14 컨테이너 가동 성공 (Studio :54323, API :54321, DB :54322 ...)
- `npx supabase db reset`: `20260408000000_initial_schema.sql` 적용 클린 (재현성 확인)
- 7 테이블 / 13 RLS 정책 / 4 인덱스 DB 반영 확인 (`pg_tables`, `pg_policies`)
- `npm run test`: **4 passed** (1 unit + 3 integration). Vitest config 에 `loadEnv` 추가, 테스트 컬럼 정합성 수정 (`responses`/`thumbs_feedback`/`sessions` NOT NULL), 별도 sign-in 클라이언트로 service_role 세션 보존 패치
- `npx tsc --noEmit`: exit 0
- `npm run lint`: clean

**`.env.local` 키 결정**: Supabase CLI v2.88 의 신키(`sb_publishable_*`/`sb_secret_*`) 는 PostgREST role claim 을 설정하지 못해 RLS 검증 불가 → legacy JWT 키 (`role=anon`/`role=service_role`) 채택. `.env.example` 가이드 별도 갱신 권장.

**변경 파일**: 13개 (config + migration + clients + types + tests + docs + .env.example/.gitignore)
**다음 단계**: 사용자 인간 검토 후 `/fi 23` 으로 커밋·PR
