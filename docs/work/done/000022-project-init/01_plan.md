# 구현 플랜 — #22 Next.js 15 프로젝트 초기화 + 도구체인 셋업

> 이 플랜은 `dev-spec.md §2, §6` 을 근거로 작성되었다.
> **핵심 제약**: 레포 루트에 `CLAUDE.md`, `AGENTS.md`, `README.md`, `.github/`, `.claude/`, `docs/`, `scripts/` 가 이미 존재 → `create-next-app` 의 충돌을 피하기 위해 **수동 초기화(manual bootstrap)** 로 진행한다.

---

## AC 체크리스트 (이슈 본문에서 자동 추출)

- [ ] `npm run dev` → http://localhost:3000 정상 렌더링
- [ ] `tsconfig.json` strict: true 설정
- [ ] Tailwind v3 적용 확인 (샘플 유틸 클래스 동작)
- [ ] `vitest.config.ts` 세팅 + 스모크 테스트 1개 통과 (`npm run test`)
- [ ] `playwright.config.ts` 세팅 + 스모크 E2E 1개 통과 (`npm run e2e`)
- [ ] ESLint + `next lint` 통과
- [ ] `package.json` scripts: `dev`, `build`, `start`, `lint`, `test`, `test:watch`, `e2e`

## 개발 체크리스트 (불변식)
- [ ] 해당 디렉토리 .ai.md 최신화 (`app/`, `tests/`)
- [ ] `docs/ai-report/daily-log.md` AI 활용 내역 기록 (불변식 1)
- [ ] AI 생성 내용 인간 검토 후 커밋 (불변식 2)
- [ ] 불변식 위반 없음 (`scripts/check_invariants.py`)

---

## Guardrails

### Must Have
- **Next.js 15.2.x + React 19.x + TypeScript 5.x** 로 고정 (dev-spec §2.2)
- **Tailwind v3.x** (v4 아님) — `@tailwindcss/typography` 포함
- **apps/web/ 모노레포 구조 채택**: Next.js 앱 전체가 `apps/web/` 하위에 위치. `src/` 는 `apps/web/src/` 내부에 위치 (`apps/web/src/app/`, `apps/web/src/components/`, `apps/web/src/lib/`, `apps/web/src/types/`, `apps/web/src/middleware.ts`). `tests/` 는 `apps/web/tests/` 에 위치.
- **Path alias**: `@/*` → `./src/*` (`apps/web/` 기준 상대경로). tsconfig `paths` 및 vitest alias 모두 `apps/web/` 내 `./src` 기준으로 설정
- **TypeScript strict + noUncheckedIndexedAccess** 활성화
- **Vitest** 환경: `node` 기본 + 컴포넌트 테스트는 파일별 `@vitest-environment jsdom` pragma
- **Playwright**: Chromium 전용, `webServer` 로 `npm run dev` 자동 기동
- 기존 `CLAUDE.md`, `AGENTS.md`, `README.md`, `.github/`, `.claude/`, `docs/`, `scripts/`, `setup.sh`, `.gitignore`, `.gitattributes`, `.ai.md` **보존**
- `apps/web/.gitignore` 또는 루트 `.gitignore` 에 `node_modules/`, `.next/`, `test-results/`, `playwright-report/`, `coverage/` 포함
- 개발자 워크플로: `cd apps/web && npm run dev` (모든 명령은 `apps/web/` 내에서 실행)

### Must NOT Have
- `create-next-app` 을 **그대로 실행 금지** (기존 파일 충돌 + README/docs 파손 위험)
- **루트 직계에 Next.js 설정 파일 두지 마라** (`package.json`, `next.config.ts`, `tsconfig.json` 등은 반드시 `apps/web/` 하위에 위치)
- Tailwind v4 alpha 설치 금지 (dev-spec 명시: v3)
- `apps/web/.env.local` 커밋 금지 (`.gitignore` 처리)
- `postcss.config.js` 의 `@tailwindcss/postcss` (v4 전용) 사용 금지 → v3 표준 `tailwindcss`, `autoprefixer` 사용
- 불필요한 shadcn/ui, Supabase, Anthropic SDK 사전 설치 금지 (이 이슈 범위 외, 후속 이슈에서 처리)

---

## 파일 생성/변경 매니페스트

### 새로 생성
| 경로 | 내용 | 담당 |
|------|------|------|
| `apps/web/package.json` | name, scripts, deps 고정 버전 | Agent A |
| `apps/web/tsconfig.json` | strict, paths `@/*`, next plugin | Agent A |
| `apps/web/next.config.ts` | 기본 설정 (React strict mode) | Agent A |
| `apps/web/next-env.d.ts` | Next.js 타입 선언 (npm run build 시 자동 갱신) | Agent A |
| `apps/web/tailwind.config.ts` | content paths, typography 플러그인 | Agent A |
| `apps/web/postcss.config.mjs` | tailwindcss + autoprefixer | Agent A |
| `apps/web/.eslintrc.json` | `next/core-web-vitals` + `next/typescript` extends | Agent A |
| `apps/web/.env.example` | 환경변수 템플릿 (Supabase/Anthropic placeholder) | Agent A |
| `apps/web/src/app/layout.tsx` | RootLayout + `<html lang="ko">` + globals.css import | Agent A |
| `apps/web/src/app/page.tsx` | 랜딩 skeleton (Tailwind 유틸 클래스 샘플 포함) | Agent A |
| `apps/web/src/app/globals.css` | `@tailwind base/components/utilities` | Agent A |
| `apps/web/src/app/.ai.md` | 디렉토리 목적·구조 | Agent C |
| `apps/web/vitest.config.ts` | `@/` alias → `./src`, setupFiles, coverage | Agent A |
| `apps/web/tests/setup.ts` | `@testing-library/jest-dom` + 전역 matchers | Agent A |
| `apps/web/tests/unit/smoke.test.ts` | `1+1===2` 수준 스모크 (vitest 기동 검증) | Agent A |
| `apps/web/tests/e2e/smoke.spec.ts` | `/` 페이지 title/text 존재 검증 | Agent A |
| `apps/web/tests/.ai.md` | 테스트 구조·실행 방법 | Agent C |
| `apps/web/playwright.config.ts` | testDir, Chromium, webServer | Agent A |
| `apps/web/src/components/.ai.md` | (빈 디렉토리 허용 규칙) 구조 기술 | Agent C |
| `apps/web/src/lib/.ai.md` | 구조 기술 | Agent C |
| `apps/web/src/types/.ai.md` | 구조 기술 | Agent C |

### 변경
| 경로 | 변경 내용 | 담당 |
|------|----------|------|
| `.gitignore` | `apps/web/.env.local`, `apps/web/next-env.d.ts`, `.playwright-mcp/` 등 보강 (필요 시) | Agent A |
| `docs/ai-report/daily-log.md` | 2026-04-08 섹션에 AI 활용 내역 추가 | Agent C |
| `docs/work/active/000022-project-init/00_issue.md` | AC/체크리스트 `[x]` 업데이트 | Agent C |
| `.ai.md` (루트) | Next.js 스택 반영 (`apps/web/src/app/`, `apps/web/src/components/`, `apps/web/src/lib/` 역할) | Agent C |
| `AGENTS.md` | 레포 구조 트리에 `apps/web/`, `apps/web/src/`, `apps/web/tests/`, `apps/web/package.json`, `apps/web/next.config.ts` 등 반영 | Agent C |

### 삭제
없음.

---

## 구현 계획 (병렬 3-에이전트 분할)

### Phase 0 — 사전 정렬 (직렬)
메인 에이전트가 수행:
1. `docs/work/active/000022-project-init/` 디렉토리 커밋 대상 제외 여부 확인 (추적 필요)
2. 이 플랜(`01_plan.md`) 작성 완료 후 team-exec 진입
3. 팀 분할 지시 및 공유 컨텍스트 전달

### Phase 1 — 병렬 구현 (team-exec)

#### Agent A — Next.js 15 + TypeScript + Tailwind v3 스캐폴드
**목표**: `npm run dev` 정상 동작, `next lint` 통과, Tailwind 유틸 렌더링 확인

1. **apps/web/package.json 초기화**
   ```json
   {
     "name": "kit-vibe-edu-ai-web",
     "private": true,
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint",
       "test": "vitest run",
       "test:watch": "vitest",
       "e2e": "playwright test"
     }
   }
   ```

2. **의존성 설치** (2 배치로 분리)
   - Runtime: `next@15.2.3 react@19.0.0 react-dom@19.0.0`
   - Dev: `typescript@5.7.3 @types/node @types/react@19 @types/react-dom@19 tailwindcss@3.4.17 @tailwindcss/typography@0.5.16 postcss@8 autoprefixer@10 eslint@9 eslint-config-next@15.2.3`
   - ※ 설치는 `npm install --save-exact` 또는 package.json 에 고정 후 `npm install` 로 lockfile 생성
   - ※ 설치는 **background** 로 실행 (`npm_install_runtime`, `npm_install_dev`)

3. **apps/web/tsconfig.json** — strict + `@/*` → `./src/*`
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "lib": ["dom", "dom.iterable", "esnext"],
       "allowJs": false,
       "skipLibCheck": true,
       "strict": true,
       "noUncheckedIndexedAccess": true,
       "noEmit": true,
       "esModuleInterop": true,
       "module": "esnext",
       "moduleResolution": "bundler",
       "resolveJsonModule": true,
       "isolatedModules": true,
       "jsx": "preserve",
       "incremental": true,
       "plugins": [{ "name": "next" }],
       "baseUrl": ".",
       "paths": { "@/*": ["./src/*"] }
     },
     "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
     "exclude": ["node_modules", "playwright-report", "test-results"]
   }
   ```

4. **apps/web/next.config.ts** — React strict 모드
5. **Tailwind 셋업** (`apps/web/` 내)
   - `apps/web/tailwind.config.ts`: `content: ['./src/app/**/*.{ts,tsx}', './src/components/**/*.{ts,tsx}']`, typography 플러그인 등록
   - `apps/web/postcss.config.mjs`: `{ plugins: { tailwindcss: {}, autoprefixer: {} } }`
   - `apps/web/src/app/globals.css`: `@tailwind base; @tailwind components; @tailwind utilities;`

6. **ESLint 셋업** — `apps/web/.eslintrc.json`
   ```json
   { "extends": ["next/core-web-vitals", "next/typescript"] }
   ```

7. **src/app/ 스캐폴드** (`apps/web/src/app/` 내)
   - `apps/web/src/app/layout.tsx`: RootLayout (html/body, globals.css 임포트, `lang="ko"`, metadata)
   - `apps/web/src/app/page.tsx`: Tailwind 유틸 클래스 샘플 포함한 랜딩 skeleton
     ```tsx
     export default function Home() {
       return (
         <main className="flex min-h-screen items-center justify-center bg-slate-50">
           <h1 className="text-3xl font-bold text-slate-900">kit-vibe-edu-ai</h1>
         </main>
       );
     }
     ```

8. **검증**: `cd apps/web && npx next dev` → `http://localhost:3000` 200 응답, Tailwind 유틸 적용 확인
9. **검증**: `cd apps/web && npm run lint` 통과, `cd apps/web && npm run build` 통과

**완료 기준**: AC 1, 2, 3, 6, 7 중 dev/lint/build 영역

---

#### Agent B — Vitest + Playwright 도구체인 + 스모크 테스트
**목표**: `npm run test` · `npm run e2e` 정상 통과 (스모크 레벨)

**선행 대기**: Agent A 의 `apps/web/package.json`, `apps/web/tsconfig.json` 생성 완료까지 대기 (SendMessage 로 동기화)

1. **테스트 도구 설치** (`cd apps/web` 후)
   - `vitest@2.1.9 @vitest/coverage-v8@2.1.9 @vitest/ui@2.1.9 jsdom@25 @testing-library/react@16 @testing-library/jest-dom@6 @testing-library/user-event@14 @playwright/test@1.49.1`

2. **apps/web/vitest.config.ts**
   ```typescript
   import { defineConfig } from 'vitest/config';
   import path from 'node:path';

   export default defineConfig({
     test: {
       environment: 'node',
       globals: true,
       setupFiles: ['./tests/setup.ts'],
       include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/integration/**/*.test.{ts,tsx}'],
       exclude: ['tests/e2e/**', 'node_modules', '.next'],
       coverage: {
         provider: 'v8',
         reporter: ['text', 'lcov'],
         include: ['src/**/*.{ts,tsx}'],
         exclude: ['**/*.test.*', 'src/types/**'],
       },
     },
     resolve: {
       alias: { '@': path.resolve(__dirname, './src') },
     },
   });
   ```

3. **apps/web/tests/setup.ts**
   ```typescript
   import '@testing-library/jest-dom/vitest';
   ```

4. **apps/web/tests/unit/smoke.test.ts**
   ```typescript
   import { describe, it, expect } from 'vitest';

   describe('smoke', () => {
     it('vitest runner boots', () => {
       expect(1 + 1).toBe(2);
     });
   });
   ```

5. **apps/web/playwright.config.ts**
   ```typescript
   import { defineConfig, devices } from '@playwright/test';

   export default defineConfig({
     testDir: './tests/e2e',
     fullyParallel: true,
     forbidOnly: !!process.env.CI,
     retries: process.env.CI ? 2 : 0,
     reporter: [['list'], ['html', { open: 'never' }]],
     use: {
       baseURL: 'http://localhost:3000',
       trace: 'on-first-retry',
     },
     projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
     webServer: {
       command: 'npm run dev',
       url: 'http://localhost:3000',
       reuseExistingServer: !process.env.CI,
       timeout: 120_000,
     },
   });
   ```

6. **apps/web/tests/e2e/smoke.spec.ts**
   ```typescript
   import { test, expect } from '@playwright/test';

   test('landing page renders heading', async ({ page }) => {
     await page.goto('/');
     await expect(page.getByRole('heading', { name: /kit-vibe-edu-ai/i })).toBeVisible();
   });
   ```

7. **검증**:
   - `cd apps/web && npm run test` → 1 passed
   - `cd apps/web && npx playwright install chromium` (1회) → `cd apps/web && npm run e2e` → 1 passed
   - ※ `playwright install` 은 수동 단계로 로그 기록

**완료 기준**: AC 4, 5

---

#### Agent C — 문서/.ai.md/불변식 유지
**목표**: 불변식 1/2 충족 + `.ai.md` 최신화 + 이슈 체크리스트 업데이트

**선행 대기**: Agent A, B 의 파일 생성이 끝난 뒤 실행 (verify 단계와 병합 가능)

1. **디렉토리 .ai.md 생성**
   - `apps/web/src/.ai.md`: src/ 의 역할 (모든 애플리케이션 코드 루트), Next.js App Router 패턴
   - `apps/web/src/app/.ai.md`: 목적 (Next.js App Router 루트), 서브 디렉토리 계획 (`(student)/`, `(teacher)/`, `api/`), 규칙
   - `apps/web/tests/.ai.md`: `unit/`, `integration/`, `e2e/` 구조, Vitest/Playwright 명령어
   - `apps/web/src/components/.ai.md`: `ui/`, `quiz/`, `dashboard/`, `shared/` 예정 구조 (스켈레톤)
   - `apps/web/src/lib/.ai.md`: `supabase/`, `scoring.ts`, `prompts/` 예정 구조
   - `apps/web/src/types/.ai.md`: `database.ts`, `api.ts`, `domain.ts` 예정 구조

2. **루트 문서 갱신**
   - `.ai.md` (루트): 프로젝트가 apps/web/ 모노레포 구조로 전환되었음을 반영, `apps/web/src/` 기반 구조
   - `AGENTS.md`: 레포 구조 트리에 `apps/web/`, `apps/web/src/`, `apps/web/tests/`, `apps/web/package.json`, `apps/web/next.config.ts`, `apps/web/tsconfig.json`, `apps/web/tailwind.config.ts`, `apps/web/postcss.config.mjs`, `apps/web/vitest.config.ts`, `apps/web/playwright.config.ts` 추가

3. **daily-log.md 갱신**
   - `docs/ai-report/daily-log.md` 의 2026-04-08 섹션에 다음 내역 추가:
     - 도구: Claude Code (Opus 4.6) + oh-my-claudecode team (3 agents)
     - 작업: Next.js 15 프로젝트 초기화, TypeScript strict, Tailwind v3, Vitest, Playwright 도구체인 셋업
     - AI 기여 영역: 설정 파일 생성, 스모크 테스트 작성, .ai.md 구조 기술
     - 인간 주도 영역: 버전 고정 결정, 플랜 승인, `npx playwright install chromium` 수동 실행

4. **00_issue.md 업데이트** — 완료된 AC 항목 `[x]` 전환 및 `## 작업 내역` 섹션에 스냅샷 기록

5. **불변식 검증**: `python scripts/check_invariants.py` 실행 후 통과 확인

**완료 기준**: 개발 체크리스트 (불변식) 4개 항목 전부

---

### Phase 2 — team-verify (verifier 단일)
1. `cd apps/web && npm run lint` — exit 0
2. `cd apps/web && npm run build` — exit 0
3. `cd apps/web && npm run test` — 1 passed
4. `cd apps/web && npm run dev` (백그라운드) + curl `http://localhost:3000` 200 응답 + Tailwind 클래스 렌더링 확인 → kill
5. `cd apps/web && npm run e2e` — 1 passed (webServer 자동 기동)
6. `python scripts/check_invariants.py` — exit 0
7. Evidence 요약: 7개 AC 항목 증거 수집 및 보고

### Phase 3 — team-fix (필요 시)
- verifier 실패 시 해당 Agent 로 회송
- 최대 2회 재시도 후 인간 에스컬레이션

---

## 예상 커밋 단위

1. `chore(#22): bootstrap Next.js 15 + TypeScript strict + Tailwind v3` (Agent A 결과)
2. `chore(#22): add Vitest + Playwright toolchain with smoke tests` (Agent B 결과)
3. `docs(#22): update .ai.md tree + daily-log for Next.js init` (Agent C 결과)

> 커밋 전 사용자 승인 필수 (CLAUDE.md 행동 규칙)

---

## 리스크 & 롤백 전략

| 리스크 | 완화 |
|--------|------|
| `npm install` 중 네트워크/패키지 버전 충돌 | 버전 고정, 실패 시 캐시 클린 후 재시도, 최종 실패 시 버전 relaxation 논의 |
| `create-next-app` 미사용으로 누락된 설정 | dev-spec §6.3 + Next.js 15 공식 문서와 대조, `next lint` + `next build` 로 검증 |
| Tailwind v4 default 설치 실수 | package.json 에 `tailwindcss@3.4.x` 고정, 설치 후 `npm ls tailwindcss` 확인 |
| `@/*` alias 가 루트 대신 `src/` 로 오설정 | tsconfig + vitest 양쪽 모두 `./` 로 설정, 스모크 테스트로 import 검증 |
| Playwright 브라우저 미설치 | 이슈 본문 환경 세팅 섹션에 사용자 수동 단계 명시, verifier 가 `playwright install` 확인 |
| 기존 루트 파일(`README.md` 등) 파손 | 수동 초기화 방식 채택, `git status` 로 각 단계 후 변경 범위 감시 |
| Next.js 15 + React 19 호환 이슈 | dev-spec §2.2 에 고정된 버전 조합 사용 (이미 RC 단계 탈출) |

**롤백**: 각 커밋은 원자적이므로 `git reset --hard HEAD~N` 으로 단위 복구 가능 (사용자 승인 후).

---

## TDD 관점

- Unit smoke (`tests/unit/smoke.test.ts`): Vitest 러너 부트 검증 — 후속 TDD 사이클의 기반
- E2E smoke (`tests/e2e/smoke.spec.ts`): Playwright + webServer 파이프라인 부트 검증 — 후속 데모 시나리오의 기반
- 이 이슈에서는 **Red-Green-Refactor** 사이클 대신 **도구체인 부트스트랩** 에 집중 (후속 이슈부터 본격 TDD)

---

## 다음 이슈 진입 조건
- [ ] 7개 AC 전부 `[x]`
- [ ] `docs/ai-report/daily-log.md` 갱신
- [ ] 루트 `.ai.md` + 신규 디렉토리 `.ai.md` 완비
- [ ] 커밋 3개 생성 및 PR 작성 준비
