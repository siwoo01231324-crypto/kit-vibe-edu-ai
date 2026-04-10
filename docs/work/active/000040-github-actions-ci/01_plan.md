# [#40] chore: GitHub Actions CI 파이프라인 (lint + vitest + playwright + invariants) — 구현 계획

> 작성: 2026-04-10

---

## 완료 기준

- [ ] `.github/workflows/ci.yml` 작성
- [ ] Job 1: lint (ESLint + `tsc --noEmit`)
- [ ] Job 2: unit/integration (Vitest) — Supabase 서비스 컨테이너 또는 `supabase start`
- [ ] Job 3: e2e (Playwright) — Chromium, `npm run build && npm start` 또는 `npm run dev`
- [ ] PR 에 status check 3개 모두 표시 + 실패 시 머지 차단
- [ ] `scripts/check_invariants.py` 호출 단계 포함 (불변식 1번 검증)
- [ ] `scripts/check_forbidden_files.py` 호출 단계 포함 (*.pdf, *.csv, *.pkl, *.parquet 차단)

---

## 구현 계획

### 전제 조건 파악

| 항목 | 값 |
|------|-----|
| 앱 위치 | `apps/web/` (Next.js 15, Node 20) |
| 테스트 스크립트 | `npm test` (Vitest), `npm run e2e` (Playwright) |
| Supabase 구성 | `supabase/config.toml` + migrations 존재 → `supabase start` 사용 가능 |
| Playwright | `baseURL: http://localhost:3000`, webServer: `npm run dev`, Chromium만 |
| 스크립트 | `scripts/check_invariants.py`, `scripts/check_forbidden_files.py` (repo root) |

---

### 변경/생성 대상 파일

| 파일 | 작업 |
|------|------|
| `.github/workflows/ci.yml` | **신규 생성** — 핵심 결과물 |
| `scripts/check_forbidden_files.py` | **수정** — CI 모드 추가 (`git ls-files` 방식) |
| `.github/workflows/.ai.md` | **신규 생성** |
| `docs/ai-report/daily-log.md` | **업데이트** — 불변식 1번 기록 |
| `docs/work/active/000040-github-actions-ci/00_issue.md` | **업데이트** — AC 체크 |

---

### 단계별 실행 순서

**Step 1: `check_forbidden_files.py` CI 모드 추가**
- `CI` 환경변수(GitHub Actions 자동 설정)가 있으면 `git diff --cached` 대신 `git ls-files` 로 전체 트래킹 파일 검사
- 이유: CI에서는 staged 파일이 없어 기존 방식이 항상 통과함

**Step 2: `.github/workflows/ci.yml` 작성**

3개 Job 병렬 실행:

- **Job 1 `lint`** (apps/web 기준)
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` (Node 20, npm cache)
  3. `npm ci`
  4. `npm run lint` (ESLint)
  5. `npx tsc --noEmit` (타입 체크)
  6. `python scripts/check_invariants.py` (repo root)
  7. `python scripts/check_forbidden_files.py` (repo root, CI 모드)

- **Job 2 `test`** (apps/web 기준)
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4`
  3. `npm ci`
  4. `supabase/setup-cli@v1`
  5. `supabase start` (repo root)
  6. Supabase 연결정보 → `$GITHUB_ENV` 매핑 (API_URL→NEXT_PUBLIC_SUPABASE_URL 등)
  7. `npm test` (env vars 주입)

- **Job 3 `e2e`** (apps/web 기준)
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4`
  3. `npm ci`
  4. `supabase/setup-cli@v1`
  5. `supabase start` (repo root)
  6. Supabase 연결정보 → `$GITHUB_ENV`
  7. `npx playwright install --with-deps chromium`
  8. `npm run e2e` (CI=true → webServer: `npm run dev` 자동 기동)

**Step 3: `.github/workflows/.ai.md` 작성**

**Step 4: `docs/ai-report/daily-log.md` 업데이트** (불변식 1번)

**Step 5: `00_issue.md` AC 체크 업데이트**

---

### Guardrails

**Must Have**
- 3개 Job이 독립 병렬 실행 (`needs` 없음)
- `on: push: branches: [master]` + `on: pull_request: branches: [master]`
- job 이름이 `lint`, `test`, `e2e` 로 정확히 매핑 (Branch protection rule용)
- `defaults.run.working-directory: apps/web` 로 모든 npm 명령 실행
- supabase 명령은 repo root(`$GITHUB_WORKSPACE`)에서 실행

**Must NOT Have**
- API 키 하드코딩 금지 — `${{ secrets.* }}` 참조만 허용
- `project-automation.yml` 수정 금지
- E2E job에서 `npm run build` 강제 실행 금지 (playwright webServer가 `npm run dev` 사용)

**주의사항**
- `check_forbidden_files.py`: CI 환경에서 `git diff --cached` → 항상 빈 결과 → 수정 필수
- Supabase 연결정보: `supabase status -o env` 출력 키(`API_URL`, `ANON_KEY`, `SERVICE_ROLE_KEY`) ≠ vitest 기대 키 → 매핑 필요
- ANTHROPIC_API_KEY는 선택적 시크릿 (테스트가 실제로 필요한 경우만)
