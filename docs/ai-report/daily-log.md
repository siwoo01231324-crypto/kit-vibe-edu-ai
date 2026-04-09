# 일일 AI 활용 로그

> 목적: 개발 기간(04/06~04/13) 동안 AI 활용 내역을 매일 기록하여 AI 리포트 작성의 근거 자료로 활용한다.
> 작성 방법: 해당 일자 섹션의 항목을 채운다. 키워드 수준의 메모 + 프롬프트 복사 붙여넣기 위주로 운영한다.
> 작성 시간: **15분 이내** 권장 (개발 시간 보호)

---

## 04/06 (월) AI 활용 로그

> 개발 첫날 — 기억나는 범위에서 소급 작성

### 사용 도구
- Claude Code (Claude Opus 4.6) — 프로젝트 초기 설정, GitHub 워크플로우 구성, 커맨드 기반 워크트리 워크플로우 설계

### 주요 프롬프트 및 결과

**프롬프트 1**: 프로젝트 템플릿 초기화 및 GitHub Project Board 자동 생성
- AI 응답 요약: setup.sh 스크립트 생성, GitHub Actions 워크플로우 구성
- 채택 여부: 채택
- 수정 내용: GraphQL mutation에서 projectId 제거 등 버그 수정

**프롬프트 2**: 이슈 기반 워크트리 워크플로우 설계
- AI 응답 요약: git worktree를 활용한 이슈별 격리 개발 환경 + 슬래시 커맨드 체계 설계
- 채택 여부: 채택
- 수정 내용: 커맨드 이름 단축 별칭(si, ri, fi, ci, bi) 추가

### AI 기여 영역
- 프로젝트 초기 구조(setup.sh, .github/workflows): AI가 초안 생성 → 팀원이 실행 후 버그 수정
- .gitignore, CLAUDE.md, AGENTS.md 템플릿: AI가 생성
- 커맨드 기반 워크트리 워크플로우 전체 설계: AI가 설계 + 구현 (아래 상세)

### 인간 주도 영역
- 프로젝트 주제 선정 및 팀 구성: AI 제안 없이 직접 결정
- GitHub 저장소 생성 및 설정: 수동 처리
- 워크플로우 도입 결정: "이슈별 격리 환경이 필요하다"는 판단은 인간이 내림

### 스크린샷
- (해당 없음 — 소급 작성)

### 오늘의 인사이트
- 프로젝트 보일러플레이트를 AI로 빠르게 구성할 수 있었으나, GitHub API 관련 세부 사항은 직접 디버깅이 필요했다
- AI가 git worktree 기반의 이슈 관리 워크플로우를 설계하여, 이슈별 격리된 개발 환경을 자동으로 구성하는 체계를 만들었다

---

## 04/07 (화) AI 활용 로그

### 사용 도구
- Claude Code (Claude Opus 4.6) — 도메인 리서치, 워크플로우 개선, 문서 작성
- 커맨드 기반 워크트리 워크플로우 — `/si`, `/ri`, `/plan`, `/fi` 등으로 이슈 관리

### 주요 프롬프트 및 결과

**프롬프트 1**: AI 교육 솔루션 공모전 도메인 전체 리서치 (이슈 #10)
- AI 응답 요약: 공모전 가이드 분석, 교육 생태계 확장 리서치, 경쟁사 분석, 기술 스택/배포 전략, AI 리포트 작성 전략, 학술 근거 리서치 등 11개 배경 문서 작성
- 채택 여부: 채택
- 수정 내용: 팀원이 리서치 결과를 검토하고 솔루션 방향성 재검토 문서 추가 작성
- 워크플로우: `/si 10` → 워크트리 생성 → 리서치 → `/fi` → PR #14 생성·머지 → `/ci` → 정리

**프롬프트 2**: MIRAI 스킬 4종 + skill-activation-prompt 훅 이식 (이슈 #11)
- AI 응답 요약: Claude Code 워크플로우 커맨드(start-issue, remind-issue, finish-issue, cleanup-issue 등) 구성
- 채택 여부: 채택
- 수정 내용: drop-issue 프로젝트 보드 이동 대상을 Done → Drop으로 수정
- 워크플로우: `/si 11` → 워크트리 생성 → 구현 → `/fi` → PR #12 생성·머지 → `/ci` → 정리

**프롬프트 3**: AI 리포트 문서 구조 설계 및 구현 계획 작성 (이슈 #13)
- AI 응답 요약: ralplan 컨센서스 플래닝(Planner → Architect → Critic)을 통해 docs/ai-report/ 폴더 구조 및 문서 골격 계획 수립
- 채택 여부: 채택
- 수정 내용: Architect/Critic 피드백 반영 — master merge, PRD scope 분리 결정, 디렉토리명 ADR 기록
- 워크플로우: `/si 13` → 워크트리 생성 → `/ri` → `/plan` (ralplan 컨센서스) → 구현 중

### AI 기여 영역
- 도메인 리서치 11개 문서: AI가 웹 검색 + 분석 후 초안 생성 → 팀원이 검토
- 워크플로우 커맨드(si, ri, fi, ci 등): AI가 설계 + 구현
- AI 리포트 구현 계획: AI 에이전트 3종(Planner, Architect, Critic) 컨센서스
- **커맨드 기반 워크트리 워크플로우 운영**: 이슈마다 `/si`로 격리된 워크트리를 생성하고, `/ri`로 진행 현황 파악, `/plan`으로 구현 계획 수립, `/fi`로 커밋+PR 생성, `/ci`로 정리까지 AI가 전체 흐름을 자동화

### 인간 주도 영역
- 솔루션 방향성 최종 결정: AI 리서치 결과를 바탕으로 팀원이 판단
- PRD를 별도 이슈로 분리하는 결정: 팀 scope 관리 차원
- 커밋·푸시 승인: AI가 제안하지만 실행은 인간이 확인 후 승인

### 스크린샷
- (해당 사항 추가 예정)

### 오늘의 인사이트
- ralplan 컨센서스 플래닝으로 다각도 검토가 가능했다. 특히 Architect가 master 브랜치의 전략 문서 미접근 문제를 발견한 것이 유용했다
- 도메인 리서치를 AI에 위임하면 폭넓은 자료 수집이 가능하지만, 출처 검증은 인간이 반드시 해야 한다
- **커맨드 기반 워크트리 워크플로우**가 개발 효율을 크게 높였다. 이슈별로 격리된 브랜치+디렉토리가 자동 생성되어 작업 간 충돌이 없고, `/ri`로 세션 재시작 시에도 컨텍스트를 즉시 복원할 수 있었다

---

## 04/08 (수) AI 활용 로그

### 사용 도구
- Claude Code (Claude Opus 4.6, 1M context) — Team 3 agents 오케스트레이션, ralplan 합의 기반 플래닝, 최종 문서 통합
- Claude Sonnet 4.6 (worker-1: 글로벌 리서치 + 네이밍)
- Claude Opus 4.6 (worker-2: 국내 경쟁사 분석)
- Claude Haiku 4.5 (worker-3: 브랜드 아이덴티티 초안)
- oh-my-claudecode team (3 executor agents: agent-a, agent-b, agent-c) — Issue #22 병렬 실행

### 주요 프롬프트 및 결과

**프롬프트 1**: /plan → ralplan 합의 기반 구현 계획 작성
- AI 응답 요약: Planner→Architect→Critic 2회 반복으로 합의 도달. 모듈형 4문서 구조, 미존재 참조 파일 fallback 정책, "관계 회복" 프레이밍 비판 대응 입장 정립
- 채택 여부: 채택 (Architect+Critic 모두 APPROVE)
- 수정 내용: 사용자 요청으로 최종 1개 문서 통합 + 네이밍 전략 추가

**프롬프트 2**: /team 3 브랜딩 리서치 + 문서 작성
- AI 응답 요약: 3명 워커 병렬 실행 (글로벌 리서치 30KB + 국내 경쟁사 18KB + 아이덴티티 25KB) → Lead가 73KB 리서치를 단일 branding-strategy.md로 통합
- 채택 여부: 채택
- 수정 내용: Lead가 3개 리서치 결과를 재구성·편집하여 통합

### AI 기여 영역
- 글로벌 EdTech 5개 사례 웹 리서치 (ClassDojo, Duolingo, Notion, Kahoot, Canva) — 출처 URL 포함
- 국내 경쟁사 6개 BI 재분석 (07번 문서 기반 브랜딩 관점 전환)
- 네이밍 후보 8개 제안 + 6기준 평가 매트릭스
- 브랜드 아이덴티티 (Mission/Vision/Personality/Values/Story/Keywords/Positioning)
- 후킹 포인트 9개 카피안, Emotional Touch 맵, Aha Moment 시나리오
- 톤앤매너 Do/Don't 12쌍, 컬러 팔레트 HEX값, 타이포그래피 계층
- 프레이밍 비판 대응 (Why→How→What + 3층 메시지 구조)

### 인간 주도 영역
- 네이밍 전략 추가 요청 (기존 MirAI 재검토 지시)
- "감성적이고 톡톡 튀는 방향" 크리에이티브 디렉션
- 최종 1개 문서 통합 결정 (모듈형 4문서 → 단일 문서)
- backlog-issue.md에 프로젝트 보드 Backlog 자동이동 기능 추가 검토

### 스크린샷
<!-- 해당 없음 — CLI 기반 작업 -->

### 오늘의 인사이트
- Team 3 agents로 리서치를 병렬화하면 73KB 분량의 조사를 동시에 처리 가능. 단, 웹 리서치가 포함된 태스크(worker-1)는 다른 워커보다 2배 이상 시간 소요
- ralplan 합의 워크플로우(Planner→Architect→Critic)가 미존재 참조 파일, 내부 비판 문서와의 정합성 등 실행 전에 발견해야 할 이슈를 사전에 포착

### 이슈 #22 — Next.js 15 프로젝트 초기화 + src/ 디렉토리 패턴 전환

**사용 도구**:
- Claude Code (Opus 4.6, 1M context) + oh-my-claudecode team (3 agents: agent-a, agent-b, agent-c 병렬)
- Claude Sonnet 4.6 (agent-a: 스캐폴드, agent-b: 도구체인, agent-c: 문서/이슈)

**주요 프롬프트 및 결과**:

**프롬프트 1**: `/ri` → `/plan` → ralplan 합의 기반 구현 계획 수립
- AI 응답 요약: src/ 디렉토리 채택(옵션 2) 결정 후 3-agent 병렬 실행 플랜 작성
- 채택 여부: 채택
- 수정 내용: 루트 클러터 정리 후 src/ 전환으로 재계획

**프롬프트 2**: `/team 3` — 3-agent 병렬 실행
- agent-a: package.json, tsconfig.json(`@/*`→`./src/*`), next.config.ts, Tailwind v3, ESLint, src/app/ 스캐폴드, `npm run dev`/`lint`/`build` 검증
- agent-b: vitest.config.ts(`@/`→`./src`), playwright.config.ts, tests/ 스모크 테스트, `npm run test`/`e2e` 검증
- agent-c: 문서 스윕(dev-spec §2/§6, 01_plan.md 가드레일 반전), .ai.md 6개 생성, AGENTS.md/루트 .ai.md 갱신, 백로그 이슈 #23-#38 body src/ 기준 일괄 업데이트, daily-log 갱신
- 채택 여부: 채택

**AI 기여 영역**:
- src/ 디렉토리 스캐폴드 생성 (package.json, tsconfig, next.config, tailwind, postcss, eslint, src/app/)
- vitest.config.ts + playwright.config.ts + tests/ 스모크 테스트 작성
- .ai.md 파일 6개 신규 생성 (src/, src/app/, src/components/, src/lib/, src/types/, tests/)
- AGENTS.md, 루트 .ai.md src/ 기반 구조로 전면 갱신
- docs/specs/dev-spec.md §2.1 디렉토리 트리 + §6.3 alias 수정
- 01_plan.md 가드레일 "src/ 금지" → "src/ 필수" 반전 + 매니페스트 경로 보정
- 백로그 이슈 #23-#38 body 일괄 업데이트 (app/ → src/app/ 등 경로 치환)

**인간 주도 영역**:
- src/ 채택 결정 (옵션 2 승인)
- 플랜 승인 및 팀 실행 지시
- `npx playwright install chromium` 수동 실행
- 커밋 최종 승인

**오늘의 인사이트 (Issue #22)**:
- 루트 클러터 문제를 src/ 채택으로 해결 — create-next-app 없이 수동 bootstrap으로 기존 파일 보존
- 3-agent 병렬 실행(스캐폴드/도구체인/문서)이 순차 실행 대비 작업 시간을 ~3x 단축
- 백로그 이슈 16개 body를 일괄 업데이트하여 후속 이슈 작업 시 경로 혼선 사전 차단

---

### 이슈 #22 — apps/web/ 모노레포 스타일 전환 (2차)

**사용 도구**:
- Claude Code (Opus 4.6, 1M context) + oh-my-claudecode team (5 executor agents: agent-a~e 병렬)
- Claude Sonnet 4.6 (agent-a: 스캐폴드 이동+빌드, agent-b: 핵심 문서, agent-c: 보조 문서+.ai.md, agent-d: 백로그 이슈, agent-e: 인프라+검증)

**주요 결정**:
- 옵션 4 (apps/web/ 모노레포) 채택 — MIRAI 프로젝트 services/ 패턴 참고
- 루트에 package.json 두지 않음 (MIRAI 스타일)
- 개발자 워크플로: `cd apps/web && npm run dev`

**AI 기여 영역**:
- 스캐폴드 일괄 이동: src/, tests/, 설정 파일 등 19개 항목을 apps/web/ 하위로 이동 (agent-a)
- 핵심 문서 4개 재작성: dev-spec.md, whitepaper, 01_plan.md, 00_issue.md (agent-b)
- 보조 문서 5개 + .ai.md 7개 apps/web/ 경로 기준으로 보정 (agent-c)
- GitHub 백로그 이슈 19개 (#23~#41) body 일괄 업데이트 — src/app/ → apps/web/src/app/ 등 (agent-d)
- AGENTS.md, 루트 .ai.md, daily-log 갱신 + 최종 검증 (agent-e)

**인간 주도 영역**:
- src/ → apps/web/ 전환 결정 (MIRAI 구조 참고, 옵션 4 채택 판단)
- 커밋 승인

**오늘의 인사이트 (apps/web/ 전환)**:
- 5-agent 병렬 실행으로 스캐폴드 이동, 문서 재작성, 이슈 업데이트를 동시 처리
- apps/web/ 모노레포 패턴으로 루트 디렉토리 클러터 완전 해소

### 이슈 #23 — Supabase 로컬 환경 + DB 스키마

**사용 도구**:
- Claude Code (Opus 4.6, 1M context) + `/ri` `/plan` `/team 3`
- Claude Sonnet 4.6 (worker-1: supabase/ 스캐폴드, worker-2: SDK 클라이언트, worker-3: 통합 테스트)

**주요 작업**: Issue #23 Supabase 로컬 환경 + DB 스키마 (7 테이블 + 13 RLS + 4 인덱스) 구현

**프롬프트 1**: `/team 3` — 3-agent 병렬 실행
- AI 응답 요약: 3명 워커 병렬 실행 — worker-1(supabase/ 스캐폴드 + `20260408000000_initial_schema.sql`) + worker-2(`@supabase/ssr` client/server + database.ts) + worker-3(Vitest 통합 테스트 + 문서)
- 채택 여부: 채택

**AI 기여 영역**:
- Task #1 (worker-1): `supabase/config.toml`, `supabase/migrations/20260408000000_initial_schema.sql` (dev-spec §3.2 DDL — 7테이블 + 13 RLS 정책 + 4 인덱스), `supabase/.ai.md`, `apps/web/.env.example`, 루트 `.gitignore` 업데이트
- Task #2 (worker-2): `apps/web/src/lib/supabase/client.ts` (`@supabase/ssr` createBrowserClient), `server.ts` (RSC용 async cookies + createAdminClient), `apps/web/src/types/database.ts` (수동 Database 타입), `apps/web/src/lib/supabase/.ai.md`
- Task #3 (worker-3): `apps/web/tests/integration/schema.test.ts` (Vitest — RLS 3종: AC4 익명 사용자, AC5 교사 간 격리, AC6 본인 세션 CRUD), 문서 업데이트 (daily-log, 00_issue.md)

**인간 주도 영역**:
- DDL 최종 검토 (불변식 2)
- Docker Desktop 설치 및 `supabase start` 실행
- `.env.local` 환경 변수 키 주입
- 커밋 최종 승인

**오늘의 인사이트 (Issue #23)**:
- Supabase 로컬 스택은 Docker 의존성 때문에 CI에서 자동 검증이 어렵다 — 스킵 가드(`SKIP_SUPABASE_LOCAL=1` 또는 헬스체크 실패)로 로컬 미기동 환경에서도 테스트가 안전하게 skip 되도록 설계
- `@supabase/ssr`의 `createBrowserClient` / RSC 쿠키 기반 서버 클라이언트 분리 패턴이 Next.js 15 App Router와 자연스럽게 맞물림

---

### 이슈 #18 — 기술 개발 명세(dev-spec.md) 작성 추가 작업

**사용 도구**:
- Claude Code (Opus 4.6, 1M context) — Lead 오케스트레이션, ralplan 컨센서스, 3개 파트 병합
- Claude Opus 4.6 (Planner, Architect) — 합의 기반 플랜 검증
- Claude Sonnet 4.6 (worker-1-infra, worker-2-units, worker-3-roadmap) — 병렬 명세 작성

**주요 프롬프트 및 결과**:

**프롬프트 1**: /ri → /plan → ralplan 합의 기반 구현 계획 작성
- AI 응답 요약: 기존 01_plan.md가 AC 체크리스트만 있는 초안이어서 ralplan 호출. Planner가 RALPLAN-DR 요약 포함 초안 작성 → Architect가 ITERATE(5개 보강사항) 판정 → 피드백 반영한 최종 플랜 직접 작성
- 채택 여부: 채택 (Architect 피드백 5건 모두 반영: Next.js 14/15 불일치 해소, "project-plan에 없는 것만 작성" 원칙, 학생 엔티티 부재 명시, Realtime 채널 설계 포함, F-01/F-02 통합)
- 수정 내용: 01_plan.md를 전면 재작성 — 사전 결정 사항 4건, 5-step 가이드라인, Guardrails, Step별 완료 확인 체크리스트 추가

**프롬프트 2**: /team 3 dev-spec.md 작성 (TDD 모드 활성)
- AI 응답 요약: 3명 워커 병렬 실행 — worker-1(§1~§4: 인프라+DB+API, 572줄) + worker-2(§5: IU-01~IU-06 상세 + 62개 테스트 케이스, 621줄) + worker-3(§6~§7: TDD 전략+로드맵+.ai.md, 336줄) → Lead가 1543줄 단일 dev-spec.md로 통합
- 채택 여부: 채택
- 수정 내용: Lead가 공통 헤더/TOC 작성 + 각 파트 중복 헤더 제거 후 순차 병합, 중간 파일 3개 삭제

**AI 기여 영역**:
- DB 스키마 DDL 7개 테이블 (teachers, sessions, questions, responses, ai_insights, class_drafts, thumbs_feedback) + RLS 정책
- API 엔드포인트 5개 + Supabase Direct 경계 + Realtime 채널 3개 매트릭스
- 구현 단위 IU-01~IU-06 각 입력/처리/출력/일론5단계/TDD 테스트 명세
- AI 프롬프트 템플릿 (IU-02 이해도 분석, IU-04 수업 초안)
- 62개 TDD 테스트 케이스 (단위 ~30 + 통합 ~15 + E2E ~8 + 기타)
- Phase 1~4 로드맵 + D1~D7 일별 구현 일정 + 공모전 제출 체크리스트

**인간 주도 영역**:
- /ri 후 "다시 해" 지시 2회 (에이전트 루프 중단 → 직접 작성 전환 판단)
- /plan /team 3 조합 지시 (단일 executor가 아닌 병렬 팀으로 진행)
- TDD 기반, 일론 5원칙, 기획서·브랜딩 참조 명시적 요구

**오늘의 인사이트 (dev-spec 작업)**:
- Ralplan 컨센서스가 Architect 단계에서 "project-plan.md 내부 불일치(Next.js 14 vs 15)"를 사전에 포착 — 구현 시작 후 발견했다면 수정 비용이 커졌을 이슈
- /team 3 병렬 워커 분해 시, 문서의 섹션이 명확히 독립적일 때만 효과적 (본 작업에서 §1~§4, §5, §6~§7은 자연스러운 분할선)
- TDD 모드가 활성화되어 worker-2가 구현보다 먼저 62개 테스트 케이스를 정의 — Red-Green-Refactor 사이클의 "Red" 단계에 바로 진입 가능한 상태

---

## 04/09 (목) AI 활용 로그

### 사용 도구
- Claude Code (Claude Opus 4.6 — 1M context) — 이슈 #23 Supabase 로컬 환경 + DB 스키마 런타임 검증
- Docker Desktop + Supabase CLI v2.88.1 — 로컬 Postgres + 14 컨테이너 스택 가동
- Vitest 2.1.9 — 통합 테스트 (RLS 정책 3종 검증)

### 주요 프롬프트 및 결과

**프롬프트 1**: 이슈 #23 코드 구현 후 직접 런타임 검증 요청 — `supabase start` → `db reset` → integration test → `/fi`
- AI 응답 요약:
  1. Docker + npx supabase 가용 확인 → `supabase start` (이미지 ~10개 다운로드 후 14 컨테이너 가동)
  2. `apps/web/.env.local` 에 anon/service_role JWT 키 주입 (legacy JWT 키 사용 — 신키는 PostgREST role claim 미지원)
  3. `supabase db reset` → `20260408000000_initial_schema.sql` 적용 클린 (재현성 확인)
  4. 통합 테스트 첫 실행 → 3개 이슈 발견:
     - Vitest 가 `.env.local` 자동 로드 X → `vitest.config.ts` 에 `loadEnv` 추가
     - 테스트 컬럼 정합성 오류 (`responses.content` → 실제는 `question_id`+`nickname`+`selected_answer`+`is_correct`+`response_time_ms`, `thumbs_feedback.value` → `nickname`+`type`)
     - `sessions` NOT NULL 누락 (`subject`/`grade`/`join_code`)
     - `adminClient.auth.signInWithPassword` 호출이 admin 세션을 teacher_a JWT 로 덮어써서 service_role 권한 상실 → 별도 sign-in 클라이언트 분리
  5. 수정 후 재실행 → **3/3 통합 테스트 + 1/1 unit = 4 passed, tsc exit 0, lint clean**
- 채택 여부: 채택 (모든 AC 6/6 자동 검증 완료)
- 수정 내용: 위 4개 패치 (`vitest.config.ts`, `tests/integration/schema.test.ts`, `.env.local` 키 형식)

### AI 기여 영역
- Supabase CLI 가동 자동화 (다운로드 진행률 폴링, 스택 상태 확인)
- 테스트 실패 디버깅: RLS 위반 원인을 admin client 세션 mutation 으로 정확히 분리
- legacy vs new key format 차이 분석 + .env.local 키 결정
- daily-log + 00_issue.md 작업 내역 자동 갱신

### 인간 주도 영역
- "지금 다 구현된 거 맞아?" 검증 요청 — AI 가 단순히 코드 작성으로 끝내는 것 방지
- "마저 해 / 다시 해봐" — 디버깅 루프 진행 결정
- 최종 인간 검토 후 커밋·PR 승인 (불변식 2)

### 스크린샷
- (해당 없음 — CLI 작업 위주)

### 오늘의 인사이트
- **AI 가 작성한 통합 테스트는 spec 컬럼명을 정확히 지키지 않을 수 있다.** worker-3 가 `responses.content` 같은 가상의 컬럼을 사용했고, 런타임 검증 단계에서야 발견됨. → **로컬 DB 가 없으면 끝까지 잡히지 않는 결함**. 다음 이슈부터는 코드 작성 단계에서 dev-spec DDL grep 으로 컬럼 정합성 자가 검증을 강제할 것.
- **`adminClient.auth.signInWithPassword` 사이드이펙트** — service_role 클라이언트로 sign-in 호출하면 그 세션이 user JWT 로 바뀐다는 것은 SDK 문서에 명시되지 않은 위험. 별도 throwaway 클라이언트 패턴이 안전.
- **Supabase CLI v2.88 신키(`sb_publishable_*`/`sb_secret_*`)** 는 PostgREST 의 PG role claim 을 자동 매핑하지 않아 RLS 가 동작하지 않음. legacy JWT 키 (`role=anon`/`role=service_role` claim 포함) 를 명시적으로 사용해야 함. SDK 문서 업데이트 필요.

---

### 이슈 #24 — Supabase Auth (Google OAuth) + 미들웨어 + teachers 자동 생성

**사용 도구**:
- Claude Code (Claude Sonnet 4.6) — executor 단일 에이전트, 직접 구현

**주요 작업**: Google OAuth 인증 흐름 전체 구현 (미들웨어, 로그인 페이지, auth/callback, teacher 라우트 그룹, DB 트리거)

**AI 기여 영역**:
- `supabase/migrations/20260408000001_auth_trigger.sql` — `handle_new_user` 트리거 (auth.users INSERT 시 teachers row 자동 생성, SECURITY DEFINER, ON CONFLICT DO NOTHING)
- `supabase/config.toml` 수정 — `additional_redirect_urls` 보강, `[auth.external.google]` 섹션 추가
- `apps/web/src/lib/supabase/middleware.ts` — `updateSession` 헬퍼 (`@supabase/ssr` createServerClient + cookies 바인딩, `getUser()` 사용)
- `apps/web/src/middleware.ts` — `/teacher/*` 보호 + `/login` 로그인 상태 리다이렉트
- `apps/web/src/app/login/page.tsx` — 서버 컴포넌트, searchParams(next/error) 처리
- `apps/web/src/app/login/GoogleSignInButton.tsx` — 클라이언트 컴포넌트, `signInWithOAuth`
- `apps/web/src/app/auth/callback/route.ts` — OAuth 코드 교환 + teachers upsert (open redirect 방어 포함)
- `apps/web/src/app/(teacher)/layout.tsx` — 서버 컴포넌트, `getUser()` 2차 가드
- `apps/web/src/app/(teacher)/SignOutButton.tsx` — 클라이언트 컴포넌트, `signOut()`
- `apps/web/src/app/(teacher)/dashboard/page.tsx` — teachers 테이블 조회 후 환영 메시지
- `.ai.md` 3개 (`login/`, `(teacher)/`, `(teacher)/dashboard/`)
- `apps/web/tests/integration/auth-trigger.test.ts` — 트리거 양성/음성/멱등성 3케이스
- `apps/web/tests/integration/session-insert-guard.test.ts` — sessions RLS 3케이스 (anon 거부, teacher 자기 INSERT 허용, 타인 id INSERT 거부)
- `apps/web/.env.local.example` 신규 작성

**인간 주도 영역**:
- Google Cloud Console OAuth 앱 생성 및 Client ID/Secret 발급
- `.env.local` 실제 키 주입
- `supabase db reset` 실행 (트리거 마이그레이션 적용)
- 커밋 최종 승인

---

### 이슈 #26 — join_code 생성기 + 충돌 재시도 (lib/join-code)

**사용 도구**:
- Claude Code (Claude Sonnet 4.6) — executor 에이전트, TDD 사이클 구현

**주요 작업**: 6자리 대문자 영숫자 join_code 생성 + 활성 세션 중복 검사 + 5회 재시도 로직

**AI 기여 영역**:
- `apps/web/src/lib/join-code.ts` — `generateJoinCode()` (순수 함수, Math.random + CHARS 매핑), `generateUniqueJoinCode(supabase)` (active 세션 중복 검사 루프, MAX_RETRY=5)
- `apps/web/tests/unit/join-code.test.ts` — 단위 5개 (길이/형식/샘플링), 통합 3개 (빈DB 성공, 충돌1회 재시도, 5회 충돌 에러)
- `apps/web/src/lib/.ai.md` — join-code.ts 항목 추가

**인간 주도 영역**:
- export 이름 고정 요건 확인 (#28 세션 생성 API 호환)
- 최종 검토 후 커밋 승인 (불변식 2)

**테스트 결과**: 5/5 통과

---

### 이슈 #27 — 응답 집계 유틸 (lib/aggregate)

**사용 도구**:
- Claude Code (Claude Sonnet 4.6) — executor 에이전트 + 직접 구현, TDD 사이클

**주요 작업**: 교사 대시보드(IU-03) + AI 인사이트(IU-02) 공용 집계 함수 3종 구현

**AI 기여 영역**:
- `apps/web/src/lib/aggregate.ts` — `calculateCorrectRate`, `groupByQuestion`, `aggregateResponses` + 내부 헬퍼 `mean`, `mostFrequent`
- `apps/web/tests/unit/aggregate.test.ts` — 14개 단위 테스트
- 타입 정의: `Response`, `Question`, `GroupedQuestion`, `AggregatedStat` (export)

**테스트 결과**: 14/14 통과

---

### 이슈 #36 — Claude SDK 클라이언트 + 프롬프트 모듈 (insights/class-draft)

**사용 도구**:
- Claude Code (Claude Sonnet 4.6) — executor 에이전트, TDD 사이클 구현

**주요 작업**: `@anthropic-ai/sdk` 래퍼 + zod 스키마 기반 InsightSchema + 프롬프트 빌더 2종 구현

**AI 기여 영역**:
- `apps/web/src/lib/anthropic.ts` — `callClaude({system, user, maxTokens})` 래퍼 (모델 `claude-sonnet-4-6`, 429/5xx 1회 재시도)
- `apps/web/src/lib/prompts/insights.ts` — `InsightSchema` (zod), `buildInsightsPrompt`, `parseInsightResponse`
- `apps/web/src/lib/prompts/class-draft.ts` — `buildDraftPrompt(insights, subject, grade)`
- `apps/web/tests/unit/prompts.test.ts` — 7개 단위 테스트

**인간 주도 영역**:
- `ANTHROPIC_API_KEY` 환경변수 발급 및 `.env.local` 주입 (수동)
- 최종 검토 후 커밋 승인 (불변식 2)

**테스트 결과**: 7/7 통과

---

### 이슈 #37 — AI 인사이트 생성 API + InsightPanel (IU-02)

**사용 도구**:
- Claude Code (Claude Sonnet 4.6) — worker-3 에이전트, TDD 사이클 구현

**주요 작업**: POST /api/insights/generate 라우트 + InsightPanel 컴포넌트 + 통합 테스트 4종

**AI 기여 영역**:
- `apps/web/src/app/api/insights/generate/route.ts` — 인증/소유권/캐시/집계/Claude 호출/파싱/저장 전체 흐름
- `apps/web/src/components/dashboard/InsightPanel.tsx` — 취약 개념·강점 개념·다음 수업 포커스 카드 3종 (Tailwind)
- `apps/web/tests/integration/api/insights-generate.test.ts` — TEST-IU2-I01~I04 (Vitest + vi.mock, vi.hoisted 패턴)
- `apps/web/src/app/api/insights/.ai.md`, `apps/web/src/components/dashboard/.ai.md` 신규 작성

**인간 주도 영역**:
- 최종 코드 검토 후 커밋 승인 (불변식 2)

**테스트 결과**: 4/4 통과 (TEST-IU2-I01 200 성공, I02 캐시 반환, I03 403 권한 거부, I04 500 파싱 실패)

---

## 04/10 (금) AI 활용 로그

### 이슈 #25 — 점수 계산 + 닉네임 검증 유틸 (TDD)

### 사용 도구
- Claude Code (Claude Sonnet 4.6) — executor 단일 에이전트, TDD 사이클 직접 구현

### 주요 프롬프트 및 결과

**프롬프트 1**: 이슈 #25 — `calculateScore`, `validateNickname` TDD 구현 (Red → Green → Refactor)
- AI 응답 요약: 테스트 7개 먼저 작성(RED) → scoring.ts, validation.ts 구현(GREEN) → JSDoc 주석 추가(REFACTOR) → .ai.md 업데이트
- 채택 여부: 채택
- 수정 내용: 신규 파일 3개 생성 (test, scoring.ts, validation.ts)

### AI 기여 영역
- `apps/web/tests/unit/scoring.test.ts` — 7개 단위 테스트 (calculateScore 5개, validateNickname 7개)
- `apps/web/src/lib/scoring.ts` — `calculateScore(isCorrect, responseTimeMs)`: 오답 0, 정답 max(100, round(1000 - ms/10))
- `apps/web/src/lib/validation.ts` — `validateNickname(nickname)`: `/^[가-힣a-zA-Z0-9_]{2,12}$/` 정규식
- `apps/web/src/lib/.ai.md` — scoring.ts, validation.ts 항목 추가

### 인간 주도 영역
- TDD 순서 (Red → Green → Refactor) 지시
- export 이름/시그니처 고정 요건 확인
- 최종 검토 후 커밋 승인 (불변식 2)

### 스크린샷
- (해당 없음 — 순수 함수 단위 구현)

### 오늘의 인사이트
- 순수 함수 유틸은 의존성이 없어 TDD 사이클이 가장 빠름 — 테스트→구현→JSDoc 전 과정이 단일 executor로 완결
- `Math.max(MIN_SCORE, Math.round(...))` 패턴으로 하한 보장을 한 줄로 표현 가능

---

## 04/11 (토) AI 활용 로그

### 사용 도구
<!-- TODO: 사용한 AI 도구 기입 -->

### 주요 프롬프트 및 결과

**프롬프트 1**: <!-- TODO -->
- AI 응답 요약:
- 채택 여부:
- 수정 내용:

### AI 기여 영역
<!-- TODO -->

### 인간 주도 영역
<!-- TODO -->

### 스크린샷
<!-- TODO -->

### 오늘의 인사이트
<!-- TODO -->

---

## 04/12 (일) AI 활용 로그

### 사용 도구
<!-- TODO: 사용한 AI 도구 기입 -->

### 주요 프롬프트 및 결과

**프롬프트 1**: <!-- TODO -->
- AI 응답 요약:
- 채택 여부:
- 수정 내용:

### AI 기여 영역
<!-- TODO -->

### 인간 주도 영역
<!-- TODO -->

### 스크린샷
<!-- TODO -->

### 오늘의 인사이트
<!-- TODO -->

---

## 04/13 (월) AI 활용 로그

### 사용 도구
<!-- TODO: 사용한 AI 도구 기입 -->

### 주요 프롬프트 및 결과

**프롬프트 1**: <!-- TODO -->
- AI 응답 요약:
- 채택 여부:
- 수정 내용:

### AI 기여 영역
<!-- TODO -->

### 인간 주도 영역
<!-- TODO -->

### 스크린샷
<!-- TODO -->

### 오늘의 인사이트
<!-- TODO -->
