# Seeya! — 교실 모두의 시야를 넓혀주는 AI 파트너

> KIT 바이브코딩 공모전 출품작 — **Seeya!**
> 학생 피드백 수집 → AI 이해도 분석 → 교사 대시보드 → 다음 수업 초안 자동 생성
> end-to-end 피드백 루프를 AI로 복원하는 교육 플랫폼

---

## 한 줄 소개

**Seeya!(시야)** 는 한국 교육 현장의 **"피드백 루프 단절"** 문제를 해결합니다.
교사는 30명 학급에서 누가 막혔는지 모르고, 학생은 손 들어 질문하지 못하고, 운영진은 사후 통계만 봅니다.
Seeya!는 게이미피케이션 UX로 학생 피드백을 자연스럽게 수집하고, AI가 분석하여 교사에게 인사이트와 다음 수업 초안을 돌려줍니다.

---

## 라이브 데모

> **URL**: `https://kit-vibe-edu-ai.vercel.app`

**3분 데모 플로우**:
1. 교사 로그인 (Google OAuth)
2. 자연어 한 줄로 세션 생성 ("중3 수학 이차방정식 객관식 5문항")
3. 라이브 세션 활성화 → QR 코드로 학생 참여
4. 학생들이 4색 답안 블록으로 게임처럼 응답 (실시간 리더보드)
5. 세션 종료 → AI 인사이트 생성 (취약 개념·강점·다음 수업 포커스)
6. 다음 수업 초안 자동 생성 → 마크다운 1클릭 복사 → 다음 세션으로 연결

- **데모 스크립트**: [`docs/demo/demo-script.md`](docs/demo/demo-script.md)
- **배포 가이드**: [`docs/demo/manual-deploy-guide.md`](docs/demo/manual-deploy-guide.md)

---

## 핵심 기능

| # | 기능 | 사용자 | 설명 |
|---|------|--------|------|
| 1 | **게이미피케이션 피드백 수집** | 학생 | QR 접속 → Kahoot 스타일 4색 답안 블록 + canvas-confetti 정답 애니메이션 + 실시간 리더보드 |
| 2 | **AI 이해도 분석 + 실시간 대시보드** | 교사 | Supabase Realtime으로 응답 실시간 갱신 → Claude API가 취약/강점 개념 분석 → 사이드바 SPA 대시보드 |
| 3 | **다음 수업 초안 자동 생성** | 교사 | AI가 분석 결과 기반으로 다음 수업 마크다운 초안 작성 → react-markdown 렌더링 → 1클릭 복사 |
| 4 | **자연어 세션 생성** | 교사 | "중3 수학 이차방정식 5문항" 한 줄 입력 → Claude tool use로 세션·문항·정답 자동 생성 |
| 5 | **수업 초안 → 다음 세션 연결** | 교사 | 초안에서 structured questions 추출 → Preview/Confirm 2-step으로 새 세션 즉시 생성 |

---

## 기술 스택

| 구성 | 기술 | 선택 근거 |
|------|------|----------|
| **Frontend** | Next.js **15.5** (App Router) + React 19 + TypeScript 5 | Server Components + API Routes 단일 프레임워크, 7일 MVP에 최적 |
| **Styling** | Tailwind CSS 3 + Pretendard / Space Grotesk | Vivid Orange `#F97316` 브랜드 컬러, 다크 게이밍 배경 `#0F172A` |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime) | DB · 인증 · 실시간 푸시 통합, RLS로 인가 자동화 |
| **AI** | Anthropic Claude `claude-sonnet-4-6` (`@anthropic-ai/sdk`) | 한국어 교육 도메인 정확도, zod + tool use 기반 structured output 안정성 |
| **검증** | Zod 3 | 모든 API 요청·응답 + AI 출력 스키마 검증 |
| **테스트** | Vitest 2 (단위/통합) + Playwright 1 (E2E) | TDD 67개 케이스, MOCK_CLAUDE 패턴으로 결정적 E2E |
| **CI** | GitHub Actions (lint + test + e2e 3-job 병렬) | 매 PR마다 자동 검증 |
| **배포** | Vercel | Next.js 네이티브 1분 배포 |
| **DB 마이그레이션** | Supabase CLI v2.88 + Docker Desktop | 로컬 14-컨테이너 스택, 7 테이블 + 13 RLS + 4 인덱스 |

---

## DB 스키마 (7 테이블)

```
teachers          ─ Supabase Auth 연동, 교사 프로필
sessions          ─ 수업/퀴즈 세션 (draft → active → ended 상태 머신)
questions         ─ 문항 + 4지선다 + 정답 인덱스
responses         ─ 학생 응답 + 점수 + 응답 시간
ai_insights       ─ AI 분석 결과 캐시 (session_id UNIQUE)
class_drafts      ─ 수업 초안 마크다운 캐시 (session_id UNIQUE)
thumbs_feedback   ─ 따봉 업/다운 피드백 (학생 익명 INSERT)
```

13개 RLS 정책으로 인가 자동화: 교사는 자기 세션만, 학생(anon)은 active 세션만 SELECT/INSERT.

---

## 로컬 실행

### 사전 준비
- Node.js 20+
- Docker Desktop (Supabase 로컬 스택용)
- Supabase CLI v2.88+

### 단계

```bash
# 1. 의존성 설치
cd apps/web
npm install

# 2. 환경변수 설정
cp .env.example .env.local
# .env.local 에 Supabase 키 + ANTHROPIC_API_KEY 입력

# 3. Supabase 로컬 시작 (14 컨테이너 가동, 첫 실행 시 이미지 다운로드)
supabase start

# 4. DB 마이그레이션 + 시드 적용
supabase db reset

# 5. 개발 서버 실행
npm run dev
# → http://localhost:3000
```

### 테스트

```bash
# 단위 + 통합 테스트 (Vitest)
npm test

# E2E 테스트 (Playwright, MOCK_CLAUDE 자동 적용)
npm run e2e
```

자세한 배포 가이드: [`docs/demo/manual-deploy-guide.md`](docs/demo/manual-deploy-guide.md)

---

## 프로젝트 구조

```
kit-vibe-edu-ai/
├── apps/web/                          ← Next.js 15 앱 (모노레포 스타일)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (student)/             ← 학생 퀴즈 게임 페이지
│   │   │   │   ├── join/              ← join 코드 입력 + QR 진입
│   │   │   │   ├── waiting/           ← 대기 화면 + Realtime
│   │   │   │   └── quiz/              ← 4색 답안 블록 + 리더보드
│   │   │   ├── teacher/               ← 교사 대시보드 (인증 보호)
│   │   │   │   ├── dashboard/         ← 사이드바 SPA
│   │   │   │   └── sessions/          ← 세션 CRUD + 라이브 + 인사이트
│   │   │   ├── api/                   ← API Routes
│   │   │   │   ├── sessions/          ← 세션 CRUD + 활성화 + 종료
│   │   │   │   ├── insights/generate/ ← AI 이해도 분석
│   │   │   │   ├── class-draft/       ← 다음 수업 초안 생성
│   │   │   │   └── thumbs/            ← 따봉 피드백 (RLS 우회)
│   │   │   └── login/                 ← Google OAuth
│   │   ├── components/
│   │   │   ├── dashboard/             ← SessionSidebar, ResponseChart, InsightPanel, ClassDraftPanel
│   │   │   └── quiz/                  ← Leaderboard
│   │   ├── hooks/                     ← useRealtimeResponses, useLeaderboard, useSessionStatus
│   │   ├── lib/
│   │   │   ├── supabase/              ← client / server / middleware
│   │   │   ├── prompts/               ← insights / class-draft / draft-questions / session-parse
│   │   │   ├── anthropic.ts           ← Claude API 래퍼 + MOCK_CLAUDE 분기
│   │   │   ├── aggregate.ts           ← 응답 집계 (정답률, 평균 응답시간)
│   │   │   ├── leaderboard.ts         ← 순수 함수 리더보드 빌더
│   │   │   ├── scoring.ts             ← 점수 계산
│   │   │   └── join-code.ts           ← 6자리 join 코드 생성기
│   │   └── types/database.ts          ← Supabase 수동 타입
│   └── tests/
│       ├── unit/                      ← Vitest 단위 ~45개
│       ├── integration/               ← Vitest + Supabase 로컬 ~15개
│       └── e2e/                       ← Playwright 3 시나리오 (7 테스트)
├── supabase/
│   ├── migrations/                    ← 7 테이블 + 13 RLS + 인증 트리거 + Realtime 퍼블리케이션
│   ├── config.toml                    ← 로컬 Supabase 설정
│   └── seed.sql                       ← 데모 시드 데이터
├── docs/
│   ├── ai-report/                     ← AI 리포트 + 일일 로그 (KIT 공모전 제출용)
│   ├── whitepaper/                    ← project-plan.md (1,737줄 기획서)
│   ├── specs/                         ← dev-spec.md (1,583줄 기술 명세)
│   ├── branding/                      ← branding-strategy.md (Team 3 agents 리서치)
│   ├── background/                    ← 11개 도메인 리서치 문서
│   ├── demo/                          ← 데모 스크립트 + 배포 가이드
│   └── work/                          ← 이슈별 작업 폴더 (00_issue.md + 01_plan.md)
├── .github/workflows/                 ← CI 파이프라인 (lint + test + e2e)
└── .claude/commands/                  ← 슬래시 커맨드 워크플로우 (si/ri/plan/fi/ci)
```

---

## 개발 워크플로우 — Claude Code + 슬래시 커맨드

본 프로젝트는 **Claude Code(Opus/Sonnet/Haiku) + oh-my-claudecode 플러그인** 기반으로 개발되었습니다.
모든 이슈는 아래의 자동화된 사이클로 처리됩니다.

```
/si <이슈번호>   →  git worktree + 브랜치 + 작업 폴더 자동 생성, GitHub Project Board "In Progress"
       ↓
/ri              →  AC 달성 현황 출력 + 플랜 검증 (미충족 시 /plan 자동 호출)
       ↓
/plan            →  ralplan 합의 (Planner → Architect → Critic) 기반 구현 계획
       ↓
구현 (TDD)       →  executor(Sonnet)가 RED → GREEN → REFACTOR
       ↓
/fi              →  변경사항 분석 → 커밋 메시지 자동 생성 → PR 생성 → "Review"
       ↓
/ci              →  PR 머지 확인 → 워크트리·브랜치 정리 → "Done"
```

### 멀티에이전트 오케스트레이션

| 패턴 | 사용 사례 |
|------|----------|
| **ralplan** | Planner → Architect → Critic 컨센서스로 구현 전 설계 검증 |
| **/team N** | N개 에이전트 병렬 실행 (브랜딩 리서치 3-agent, 프로젝트 구조 전환 5-agent) |
| **ralph** | 자율 실행 루프 (UI 디자인 고도화 등) |
| **autopilot** | 디버깅 자동화 (Realtime 미수신 근본 원인 분석) |

### 모델 라우팅 (3계층)

| 모델 | 역할 | 페르소나 |
|------|------|---------|
| **Claude Opus 4.6** (1M context) | 프로젝트 리드, ralplan 합의, 코드 리뷰 | 시니어 아키텍트 |
| **Claude Sonnet 4.6** | TDD 코드 생성, API 구현, 디버깅 | 미드레벨 개발자 |
| **Claude Haiku 4.5** | 코드베이스 탐색, 소스 문서 병렬 읽기 | 주니어 리서처 |

자세한 AI 활용 전략: [`docs/ai-report/AI-REPORT.md`](docs/ai-report/AI-REPORT.md)

---

## AI 리포트 (공모전 제출용)

KIT 바이브코딩 공모전 심사 항목 중 **"AI 활용 능력 및 효율성"** 에 대한 상세 리포트를 작성했습니다.

- **본문**: [`docs/ai-report/AI-REPORT.md`](docs/ai-report/AI-REPORT.md)
- **일일 로그**: [`docs/ai-report/daily-log.md`](docs/ai-report/daily-log.md) — 04/06~04/11 매일의 프롬프트·도구·결과 기록 (1,000줄+)
- **기획서**: [`docs/whitepaper/project-plan.md`](docs/whitepaper/project-plan.md) — 1,737줄 PRD
- **기술 명세**: [`docs/specs/dev-spec.md`](docs/specs/dev-spec.md) — 1,583줄 dev-spec
- **브랜딩 전략**: [`docs/branding/branding-strategy.md`](docs/branding/branding-strategy.md) — Team 3 agents 리서치 결과

---

## 주요 통계

- **개발 기간**: 5일 (2026-04-06 ~ 2026-04-11)
- **처리 이슈**: 30+ 건
- **테스트**: 67개 (단위 ~45 + 통합 ~15 + E2E 7) — 전체 통과
- **DB**: 7 테이블 + 13 RLS 정책 + 4 인덱스
- **AI 기여 비율** (daily-log 기반 추정): 기획 75% / 설계 70% / 개발 80% / 테스트 75%
- **소스 문서 규모**: project-plan 1,737줄 + dev-spec 1,583줄 + daily-log 1,000줄+ + branding 556줄 + background 11개 (3,496줄)

---

## 라이선스 / 출품 정보

- **공모전**: KIT 바이브코딩 공모전 (AI 활용 차세대 교육 솔루션)
- **팀**: Seeya!
- **개발 기간**: 2026-04-06 ~ 2026-04-11
- **마감**: 2026-04-13(월)
