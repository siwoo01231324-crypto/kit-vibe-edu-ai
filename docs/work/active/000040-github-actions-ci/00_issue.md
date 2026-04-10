# chore: GitHub Actions CI 파이프라인 (lint + vitest + playwright + invariants)

## 목적
PR/푸시마다 lint + 단위/통합 테스트 + E2E 를 자동 실행해 회귀를 머지 전에 차단한다.

## 배경
dev-spec §6.5 — GitHub Actions 파이프라인. Supabase 서비스 컨테이너로 통합 테스트 DB 제공. MSW 로 Claude API mock. Vercel Preview URL 또는 `localhost` 로 E2E 실행.

## 완료 기준 (AC)
- [x] `.github/workflows/ci.yml` 작성
- [x] Job 1: lint (ESLint + `tsc --noEmit`)
- [x] Job 2: unit/integration (Vitest) — Supabase 서비스 컨테이너 또는 `supabase start`
- [x] Job 3: e2e (Playwright) — Chromium, `npm run build && npm start` 또는 `npm run dev`
- [ ] PR 에 status check 3개 모두 표시 + 실패 시 머지 차단
- [x] `scripts/check_invariants.py` 호출 단계 포함 (불변식 1번 검증)
- [x] `scripts/check_forbidden_files.py` 호출 단계 포함 (*.pdf, *.csv, *.pkl, *.parquet 차단)

## 구현 플랜
1. Supabase CLI 서비스 컨테이너 세팅 (`setup-supabase-cli` 또는 docker compose)
2. 환경변수 시크릿 등록 방법 문서화 (Actions → Secrets)
3. 3개 Job 병렬 실행 구성
4. Branch protection rule: `master` 브랜치 필수 체크 3개

## 환경 세팅 (사용자 수동 작업 포함)
- **GitHub Repo Settings → Secrets and variables → Actions** 에 다음 등록:
  - `ANTHROPIC_API_KEY` (테스트용 — 필요 시)
  - `SUPABASE_SERVICE_ROLE_KEY` (CI 로컬 Supabase 인스턴스에서 유효한 값)
- **Branch protection rule** 설정:
  - Settings → Branches → Add rule for `master`
  - Require status checks: lint, test, e2e
  - Require pull request before merging

## 의존성
- 선행: #22 (프로젝트), #23 (Supabase), #39 (E2E 테스트 존재)
- 병렬 가능: **#39** (동시 작성 가능)

## 참고
- dev-spec §6.5 CI/CD 자동화
- 현재 `.github/workflows/project-automation.yml` 존재 → 참고 후 ci.yml 분리

## 개발 체크리스트
- [x] `.github/workflows/.ai.md` 최신화
- [x] `docs/ai-report/daily-log.md` 기록 (불변식 1)
- [ ] AI 생성 YAML 인간 검토 후 커밋 (불변식 2)
- [x] 불변식 위반 없음


---

## 작업 내역

### 2026-04-10

**현황**: 6/7 완료 (PR status check 설정은 GitHub 수동 작업)
**완료된 항목**:
- `.github/workflows/ci.yml` 작성
- Job 1: lint (ESLint + tsc --noEmit + check_invariants.py + check_forbidden_files.py)
- Job 2: test (Vitest + supabase start)
- Job 3: e2e (Playwright Chromium + supabase start + npm run dev)
- `scripts/check_invariants.py` 호출 단계 포함
- `scripts/check_forbidden_files.py` 호출 단계 포함 (CI 모드 추가)
**미완료 항목**:
- PR status check 3개 표시 + 머지 차단 (GitHub Branch protection rule 수동 설정 필요)
**변경 파일**: 5개 (`ci.yml`, `check_forbidden_files.py`, `.github/workflows/.ai.md`, `01_plan.md`, `daily-log.md`)

