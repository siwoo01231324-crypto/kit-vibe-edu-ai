# chore: Next.js 15 프로젝트 초기화 + 도구체인 셋업 (TS/Tailwind/Vitest/Playwright)

## 목적
Next.js 15 App Router 기반 프로젝트를 초기화하고 TypeScript strict / Tailwind / Vitest / Playwright 도구체인을 셋업한다. 이후 모든 기능 이슈의 선행 조건.

## 배경
dev-spec §2 기술 스택 확정: Next.js 15.2.x, React 19, TypeScript 5, Tailwind 3, Vitest 2, Playwright 1. 7일 MVP 데드라인에서 초기 셋업 병목을 제거한다.

## 완료 기준 (AC)
- [x] `npm run dev` → http://localhost:3000 정상 렌더링
- [x] `tsconfig.json` strict: true 설정
- [x] Tailwind v3 적용 확인 (샘플 유틸 클래스 동작)
- [x] `vitest.config.ts` 세팅 + 스모크 테스트 1개 통과 (`npm run test`)
- [x] `playwright.config.ts` 세팅 + 스모크 E2E 1개 통과 (`npm run e2e`)
- [x] ESLint + `next lint` 통과
- [x] `package.json` scripts: `dev`, `build`, `start`, `lint`, `test`, `test:watch`, `e2e`

## 구현 플랜
1. apps/web/ 모노레포 구조 채택: `apps/web/src/app/`, `apps/web/src/components/`, `apps/web/src/lib/`, `apps/web/src/types/`, `apps/web/src/middleware.ts` — `tests/` 는 `apps/web/tests/` 에 위치
2. `@/` 경로 alias: `apps/web/tsconfig.json` `paths` `@/*` → `./src/*`, `apps/web/vitest.config.ts` alias `./src`
3. `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom` 설치 (`cd apps/web && npm install`)
4. `apps/web/vitest.config.ts` 작성 (dev-spec §6.3 참조), `apps/web/tests/setup.ts` 생성
5. `@playwright/test` 설치 + `cd apps/web && npx playwright install chromium` + `apps/web/playwright.config.ts` 작성
6. `apps/web/tests/unit/smoke.test.ts`, `apps/web/tests/e2e/smoke.spec.ts` 각 1개 작성
7. `apps/web/src/app/page.tsx` 랜딩 skeleton 생성

## 환경 세팅 (사용자 수동 작업 포함)
- Node.js 20 LTS 이상 설치 확인 (`node -v`)
- `npm install` 실행 후 `npx playwright install chromium` 1회 실행
- IDE TypeScript 버전: workspace 버전(5.x) 사용 권장

## 의존성
- 선행: 없음
- 병렬 가능: 없음 (다른 모든 이슈의 선행)

## 참고
- dev-spec `docs/specs/dev-spec.md` §2 프로젝트 구조 + 기술 스택
- dev-spec §6.3 도구별 설정 명세

## 개발 체크리스트
- [x] 해당 디렉토리 .ai.md 최신화 (`apps/web/src/app/`, `apps/web/src/components/`, `apps/web/src/lib/`, `apps/web/src/types/`, `apps/web/tests/`, `apps/web/src/`)
- [x] `docs/ai-report/daily-log.md` AI 활용 내역 기록 (불변식 1)
- [ ] AI 생성 내용 인간 검토 후 커밋 (불변식 2)
- [x] 불변식 위반 없음 (`scripts/check_invariants.py` exit 0)

---

## 작업 내역

### 2026-04-08 (src/ 초기화 라운드)

**완료 AC**: 7/7 항목 완료 (agent-a: AC 1,2,3,6,7 / agent-b: AC 4,5)

**주요 결정 사항**:
- src/ 디렉토리 채택 (옵션 2): `src/app/`, `src/components/`, `src/lib/`, `src/types/`, `src/middleware.ts` / `tests/` 루트 유지
- `@/*` alias: `./src/*` (tsconfig + vitest 일치)
- 루트 클러터 방지를 위해 create-next-app 미사용, 수동 bootstrap

**변경 파일 수**: 
- 신규: package.json, tsconfig.json, next.config.ts, tailwind.config.ts, postcss.config.mjs, .eslintrc.json, .env.example, vitest.config.ts, playwright.config.ts, src/app/layout.tsx, src/app/page.tsx, src/app/globals.css, tests/setup.ts, tests/unit/smoke.test.ts, tests/e2e/smoke.spec.ts, src/.ai.md, src/app/.ai.md, src/components/.ai.md, src/lib/.ai.md, src/types/.ai.md, tests/.ai.md
- 수정: .ai.md(루트), AGENTS.md, docs/specs/dev-spec.md, docs/work/active/000022-project-init/01_plan.md, docs/ai-report/daily-log.md
- 백로그 이슈 업데이트: #23-#38 (16개, app/→src/app/ 등 경로 치환)

---

### 2026-04-08 (apps/web/ 전환 라운드)

**변경 사항**: src/ 평면 구조 → apps/web/ 모노레포 스타일 전면 재이동
**사유**: 루트 클러터 정리 (사용자 결정), MIRAI 프로젝트 services/ 패턴 참고
**수행 에이전트**: agent-a~e (5 agents)
**AC 진행**: 7/7 완료

**변경 파일**:
- agent-a: apps/web/ 하위로 스캐폴드 전체 이동 (package.json, tsconfig.json, next.config.ts, tailwind.config.ts, postcss.config.mjs, .eslintrc.json, .env.example, vitest.config.ts, playwright.config.ts, apps/web/src/, apps/web/tests/ 등 19개 항목)
- agent-b: docs/specs/dev-spec.md, docs/whitepaper/, docs/work/active/000022-project-init/01_plan.md, 00_issue.md 경로 기준 재작성
- agent-c: 보조 문서 5개 + .ai.md 7개 (apps/web/ 경로 기준 보정), AGENTS.md, 루트 .ai.md 갱신
- agent-d: GitHub 백로그 이슈 #23~#41 (19개) body 일괄 업데이트 (src/app/ → apps/web/src/app/ 등)
- agent-e: CLAUDE.md 인프라 점검, .gitignore 재확인, check_invariants.py 실행, daily-log 기록, 최종 검증

**GitHub 이슈 업데이트**: #23~#41 (19개) — apps/web/ prefix 경로 치환
