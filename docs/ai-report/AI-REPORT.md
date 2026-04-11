# AI 리포트 — KIT 바이브코딩 공모전

> 프로젝트: AI활용 차세대 교육 솔루션 — **Seeya! (시야)**
> 팀: MirAI
> 개발 기간: 2026-04-06 ~ 2026-04-13 (7일)

---

## 1. 기획

### 설정한 사용자는 누구이며, 해결하려는 구체적인 문제점/불편함은 무엇인가요?

**Primary 사용자: 교사 (김서현, 31세, 고등학교 수학 교사 5년차)**

한국 교육 현장은 **"피드백 루프의 단절"**이라는 구조적 위기에 놓여 있다.

| 지표 | 수치 | 출처 |
|------|------|------|
| 교사 행정업무 시간 | 주당 6시간 (OECD 평균 3시간의 **2배**) | OECD TALIS 2024 |
| 교직 만족도 | **22.7%** | 교사노동조합연맹 2024 |
| 교사 우울 증상 | **63.2%** (가벼운 24.9% + 심한 38.3%) | 교사노동조합연맹 2024 |
| K-MOOC 이수율 | **13.1%** (10명 중 9명 미완주) | KCI 학술논문 |

**구체적 문제점**:

1. **교사는 수업이 닿았는지 모른다**: 30명 학급에서 개별 학생의 이해도를 실시간으로 파악할 수 없다. 과제 피드백은 평균 2주 지연되며, 그 시점이면 이미 다음 단원으로 넘어간 상태다.
2. **학생은 막혀도 말할 채널이 없다**: 손 들어 질문하면 수업 흐름을 끊고, "모른다"고 하면 뒤처진 사람이 된다. 강제 설문은 귀찮고 재미없다.
3. **운영자는 숫자만 보고 맥락을 모른다**: 수료율 78%, 만족도 4.2점 — 사후 통계만 가능하고 선제 개입이 불가능하다.

이 세 문제는 독립된 문제가 아니라 **하나의 악순환**이다:

```
교사가 행정업무에 치여 → 학생에게 피드백할 시간이 없고
→ 피드백 없으니 학생은 "나를 봐주는 사람이 없다"고 느끼며 이탈하고
→ 이탈은 사후에야 통계로 잡히니 선제 개입이 불가능하고
→ 교사는 "내 가르침이 통했는지 알 수 없어" 보람을 잃고 번아웃된다
```

**Secondary 사용자: 학생 (이수진, 17세, 고2 자연계열)**

"수업 중 모르는 부분이 있어도 손들면 수업 흐름을 끊는다. 설문조사는 귀찮고 재미없다. 게임이라면 참여하겠다."

### 문제를 해결하기 위한 솔루션의 핵심 기능은 무엇인가요?

**Seeya!(시야)**는 "학생 피드백 수집 → AI 이해도 분석 → 교사 대시보드 → 다음 수업 초안 자동 생성"이라는 **end-to-end 피드백 루프를 AI로 복원**하는 교육 플랫폼이다.

| # | 핵심 기능 | 사용자 | 작동 방식 |
|---|----------|--------|----------|
| 1 | **학생 피드백 수집 (게이미피케이션 UX)** | 학생 | 수업 마지막 10분, 교사가 Kahoot 스타일 퀴즈 게임 실행 → QR 코드로 학생 접속 → 4색 답안 블록 + 리더보드 + 정답 confetti 애니메이션. 학생이 "재미있어서" 자발적으로 참여 — 핵심은 피드백 데이터 수집 |
| 2 | **AI 이해도 분석 + 교사 대시보드** | 교사 | 수집된 응답 데이터를 Claude API(claude-sonnet-4-6)가 분석 → 취약 개념·강점 개념·문항별 정답률을 실시간 대시보드로 시각화. "도함수 그래프 해석 정답률 33% — 학생 67%가 이 개념에서 어려움" |
| 3 | **다음 수업 초안 자동 생성** | 교사 | AI 이해도 분석 결과 기반으로 Claude가 다음 수업 보강 포인트·활동 초안을 마크다운으로 자동 생성 → 1클릭 복사. 수업 준비 30초 |
| 4 | **자연어 세션 생성** | 교사 | "중3 수학 이차방정식 단원 퀴즈 5문항" 자연어 입력 → AI가 세션 제목·문항·선택지·정답을 자동 생성 |

**핵심 차별점**: Kahoot은 퀴즈 게임 후 AI 분석이 없다. Magic School AI는 학생 피드백 데이터를 수집하지 않는다. Seeya!는 **"재미있는 참여 + AI 인사이트"를 결합한 유일한 end-to-end 솔루션**이다.

### 이 솔루션이 도입되었을 때 기대되는 개선점이 무엇인가요?

| 개선 영역 | 기대 효과 | 근거 |
|-----------|----------|------|
| **교사 수업 준비 시간** | AI 활용 시 **31% 시간 단축** | EEF 2024 RCT (259명 교사, 68개 학교) |
| **교사 주당 절약 시간** | AI 도구 주 1회+ 사용 교사 **주당 5.9시간 절약** (연간 약 6주) | Gallup-Walton 2025 (2,232명 교사) |
| **학생 참여율** | 강제 설문 → 게이미피케이션 전환 시 자발적 참여 극대화 | Kahoot 누적 90억 명 참가, 200개국 |
| **학생 이탈 예측** | LMS 클릭스트림 기반 이탈 예측 정확도 **92~96%** | Frontiers in Education 2024 |
| **수업 질 선순환** | 피드백 수집 → AI 분석 → 수업 개선 → 학생 참여 증가 → 더 풍부한 피드백 | 설계 원리 (ClassDojo 패턴) |

**교사 관점**: "오늘 수업에서 30명 중 누가 이해하고 누가 못했는지" 데이터 증거를 얻는다. 내일 수업 준비가 AI 초안으로 30초 만에 끝난다. **"내 수업이 통하고 있다"는 증거**를 매일 확인할 수 있다.

**학생 관점**: 게임이니까 부담 없이 참여한다. 틀린 것도 재미의 일부다. 다음 수업에서 선생님이 "지난 시간 퀴즈에서 많이 틀린 부분을 오늘 다시 다룹니다"라고 할 때, 자신의 참여가 수업에 반영되는 것을 느낀다.

---

## 2. AI 활용 전략

### 이 프로젝트에서 사용할 AI 도구와 모델은 무엇이며, 선택한 이유는 무엇인가요?

| 도구 | 모델/버전 | 선택 이유 |
|------|-----------|----------|
| **Claude Code** | Claude Opus 4.6 (1M context) | 프로젝트 전체 오케스트레이션. 1M 컨텍스트로 기획서(1,737줄) + dev-spec(1,583줄) + daily-log(1,047줄)을 동시에 참조하며 일관된 설계 가능. 한국어 성능이 우수하여 교육 도메인 프롬프트 설계에 최적 |
| **Claude Code** | Claude Sonnet 4.6 | 코드 생성 executor. Opus 대비 응답 속도 빠르면서 코드 품질 충분. TDD RED→GREEN 사이클, API 라우트, 컴포넌트 구현에 투입 |
| **Claude Code** | Claude Haiku 4.5 | 코드베이스 탐색(explore), 빠른 검색, 저비용 병렬 읽기. 브랜딩 리서치 worker-3(아이덴티티 초안)에도 투입 |
| **oh-my-claudecode (OMC)** | 멀티에이전트 오케스트레이션 레이어 | Claude Code 위에서 동작하는 플러그인. ralplan(합의 기반 플래닝), `/team N`(N개 에이전트 병렬), ralph(자율 실행 루프), autopilot(디버깅 자동화) 등의 워크플로우 제공 |
| **Claude API** | claude-sonnet-4-6 | 프로덕션 앱 내 AI 기능(이해도 분석, 수업 초안 생성, 자연어 파싱). zod 스키마 기반 structured output + tool use 패턴 |

**선택하지 않은 도구와 이유**:
- Cursor/Copilot: Claude Code가 CLI 기반으로 멀티에이전트 오케스트레이션을 네이티브 지원. IDE 기반 도구는 단일 파일 편집에 최적화되어 있어, 20+개 이슈를 병렬 처리하는 본 프로젝트 워크플로우에 부적합
- GPT-4: 한국어 교육 도메인에서 Claude의 프롬프트 추종성과 structured output 품질이 더 우수했음 (프로젝트 초기 비교 테스트 기반)

### 각 AI 도구별 활용 전략을 작성해주세요.

#### 전략 1: 3-모델 계층 라우팅 (Opus / Sonnet / Haiku)

작업의 복잡도에 따라 모델을 자동 라우팅하여 **비용 대비 품질을 최적화**했다:

```
┌─────────────────────────────────────────────────────┐
│                   Claude Opus 4.6                    │
│          (오케스트레이터 / 설계 / 리뷰)                │
│   역할: 프로젝트 리드, ralplan 합의, 코드 리뷰         │
│   페르소나: "시니어 아키텍트"                           │
│   제약: 토큰 비용 높음 → 설계·판단에만 투입             │
├─────────────────────────────────────────────────────┤
│                  Claude Sonnet 4.6                    │
│             (구현 executor / 디버깅)                   │
│   역할: TDD 코드 생성, API 구현, 버그 수정             │
│   페르소나: "미드레벨 개발자"                           │
│   제약: 아키텍처 결정은 Opus에 위임                     │
├─────────────────────────────────────────────────────┤
│                  Claude Haiku 4.5                     │
│           (탐색 / 검색 / 빠른 분류)                    │
│   역할: 코드베이스 탐색, 파일 패턴 검색, 소스 읽기       │
│   페르소나: "주니어 리서처"                             │
│   제약: 복잡한 추론 불가 → 읽기·분류에만 투입            │
└─────────────────────────────────────────────────────┘
```

#### 전략 2: ralplan 컨센서스 플래닝 (Planner → Architect → Critic)

구현 시작 전에 **3개 AI 에이전트가 서로 다른 관점에서 설계를 검증**하는 합의 워크플로우:

```
Planner(Opus)  ──▶  초안 계획 + RALPLAN-DR 요약
       │                    (원칙, 의사결정 요인, 선택지 비교)
       ▼
Architect(Opus) ──▶  구조적 리뷰 + 최강 반론(steelman antithesis)
       │                    (아키텍처 건전성, 트레이드오프 긴장)
       ▼
Critic(Opus)   ──▶  품질 평가 + 판정 (APPROVE / ITERATE / REJECT)
       │                    (원칙-옵션 일관성, 검증 가능성, 완전성)
       ▼
  APPROVE → 구현 시작  /  ITERATE → 피드백 반영 후 재검토 (최대 5회)
```

**실제 성과**: 이 워크플로우로 Next.js 14/15 버전 불일치, seed.sql UNIQUE 충돌, 수업 초안 생명주기 분리 문제를 **코드 작성 전에** 사전 포착했다.

#### 전략 3: `/team N` 병렬 에이전트 실행

독립적인 작업을 N개 에이전트가 동시에 처리하는 병렬화 전략:

```
Lead(Opus) ──┬──▶ agent-a(Sonnet): 스캐폴드/인프라
             ├──▶ agent-b(Sonnet): 핵심 로직/명세
             ├──▶ agent-c(Haiku):  문서/이슈 업데이트
             └──▶ ... (최대 5 agents)
                        │
                        ▼
             Lead가 결과 통합 + 정합성 검증
```

**적용 사례**:
- `/team 3` 브랜딩 리서치: 글로벌(Sonnet) + 국내(Opus) + 아이덴티티(Haiku) → 73KB 동시 처리
- `/team 5` 프로젝트 구조 전환: 스캐폴드 + 문서 4개 + 보조 문서 + 이슈 19개 + 검증 동시 처리
- `/team 3` dev-spec 작성: 인프라 572줄 + IU 명세 621줄 + 로드맵 336줄 → 1,543줄 통합

#### 전략 4: 커맨드 기반 워크트리 워크플로우 (si/ri/fi/ci)

AI가 설계하고 구현한 **이슈 관리 자동화 체계**:

```
/si <이슈번호>   ──▶  git worktree 생성 + 브랜치 생성 + Project Board "In Progress"
        │
/ri              ──▶  AC 달성 현황 출력 + 플랜 검증 (미충족 시 /plan 자동 호출)
        │
/plan            ──▶  ralplan 합의 기반 구현 계획 작성
        │
구현 (TDD)       ──▶  executor(Sonnet)가 RED→GREEN→REFACTOR
        │
/fi              ──▶  변경사항 분석 → 커밋 메시지 자동 생성 → PR 생성 → Board "Review"
        │
/ci              ──▶  PR 머지 확인 → 워크트리·브랜치 정리 → Board "Done"
```

**핵심 이점**: 이슈별 격리된 워크트리로 **병렬 작업 시 코드 충돌 원천 차단**. `/ri`로 세션 재시작 시에도 컨텍스트 즉시 복원.

#### 전략 5: 프로덕션 AI (Claude API in-app)

앱 내부에서 사용자 요청에 응답하는 AI 기능 설계:

```
학생 응답 데이터  ──▶  aggregateResponses()  ──▶  buildInsightsPrompt()
                                                        │
                                                        ▼
                                               Claude API (sonnet-4-6)
                                                        │
                                                        ▼
                                               parseInsightResponse()
                                                  (zod 스키마 검증)
                                                        │
                                                        ▼
                                               ai_insights 테이블 저장
                                                  (세션당 1회, 캐시)
```

- **InsightSchema (zod)**: `top_weak_concepts`, `strong_concepts`, `next_class_focus`, `question_analysis`, `overall_understanding_rate` — structured output으로 파싱 안정성 확보
- **MOCK_CLAUDE 패턴**: `MOCK_CLAUDE=1` 환경변수로 CI/테스트에서 실제 API 호출 우회 → 결정적(deterministic) 응답 보장
- **2-step API 패턴**: Preview(AI 호출 + 미리보기) → Confirm(DB만, 원자적 생성) — 파싱 실패가 UI까지 전파되지 않는 구조

### 토큰 낭비를 최소화하고 유지보수성 및 재현성을 높이기 위한 전략이 있다면 작성해주세요.

**1. 3-모델 계층 라우팅으로 토큰 비용 최적화**

| 작업 유형 | 모델 | 토큰 단가 비율 | 예시 |
|-----------|------|---------------|------|
| 설계·판단·리뷰 | Opus | 1x (기준) | ralplan 합의, 코드 리뷰, 아키텍처 결정 |
| 코드 생성·구현 | Sonnet | ~0.2x | TDD RED→GREEN, API 라우트, 컴포넌트 |
| 검색·읽기·분류 | Haiku | ~0.04x | 코드베이스 탐색, 파일 패턴 검색, 소스 병렬 읽기 |

실제 적용: AI 리포트(이슈 #73) 작성 시 소스 문서 5개(총 5,000줄)를 **Haiku 5개 에이전트가 병렬 읽기** → Opus가 최종 작성. 읽기 비용을 Opus 대비 **~96% 절감**.

**2. 슬래시 커맨드로 프롬프트 재현성 확보**

모든 워크플로우가 `/si`, `/ri`, `/plan`, `/fi`, `/ci` 등 **표준화된 커맨드**로 실행되므로:
- 같은 커맨드를 실행하면 같은 워크플로우가 재현된다
- 프롬프트가 `.claude/commands/` 디렉토리에 마크다운 파일로 버전 관리된다
- 새로운 팀원이 동일한 워크플로우를 즉시 사용할 수 있다

**3. TDD-first로 AI 출력 품질 보장**

AI가 생성한 코드의 정확성을 **테스트로 자동 검증**:
- executor가 구현 코드보다 테스트를 먼저 작성(RED)
- 테스트가 통과해야만 구현 완료로 판정(GREEN)
- 62개 TDD 케이스 + E2E 3종이 CI에서 자동 실행 → AI 코드 품질의 재현 가능한 검증

**4. 컨텍스트 효율화**

- **ralplan RALPLAN-DR 요약**: 전체 플랜 대신 원칙(3~5개) + 의사결정 요인(3개) + 선택지 비교를 압축 요약 → 리뷰 에이전트의 컨텍스트 소비 최소화
- **`.ai.md` 디렉토리 문서**: 모든 디렉토리에 목적·구조·역할을 기술한 `.ai.md` 파일 배치 → AI가 코드베이스를 이해하는 데 필요한 토큰 절감
- **dev-spec.md 우선순위 규칙**: "project-plan.md와 상충 시 본 문서가 우선" → AI가 두 문서를 모두 읽지 않고 dev-spec만으로 구현 가능

**5. 캐시 전략**

- **AI 인사이트**: 세션당 1회 생성 후 `ai_insights` 테이블에 저장. 동일 세션 재조회 시 Claude API 미호출
- **수업 초안**: `class_drafts` 테이블에 UNIQUE(session_id)로 저장. 캐시 히트 시 API 비용 0
- **MOCK_CLAUDE**: CI/E2E에서 실제 API 호출 없이 결정적 응답 반환 → 테스트 시 API 토큰 소비 0

---

## 3. AI 활용 상세 — 개요

### 사용한 AI 도구 목록

| 도구 | 모델/버전 | 용도 |
|------|-----------|------|
| Claude Code | Claude Opus 4.6 (1M context) | 프로젝트 오케스트레이션, 기획, 설계, 코드 리뷰, 디버깅, 문서 작성, 멀티에이전트 리드 |
| Claude Code | Claude Sonnet 4.6 | 코드 생성(executor), TDD 구현, API 라우트 작성, 컴포넌트 구현 |
| Claude Code | Claude Haiku 4.5 | 코드베이스 탐색(explore), 브랜드 아이덴티티 초안(worker-3), 빠른 검색 |
| oh-my-claudecode (OMC) | 멀티에이전트 오케스트레이션 레이어 | ralplan(합의 기반 플래닝), team N(병렬 에이전트), ralph(자율 실행 루프), autopilot(디버깅 자동화) |
| Docker Desktop + Supabase CLI v2.88 | — | 로컬 PostgreSQL + Auth + Realtime 14-컨테이너 스택 |
| Vitest 2.1.9 + Playwright 1.x | — | TDD 단위/통합 테스트 62개 + E2E 시나리오 3종 (7 테스트) |
| GitHub Actions | CI 파이프라인 | lint + vitest + playwright 3-job 병렬 자동 검증 |
| Git Worktree + 슬래시 커맨드 | Claude Code 커스텀 커맨드 | 이슈별 격리 개발 환경 자동 생성·관리 (`/si`, `/ri`, `/fi`, `/ci`) |

### 전체 개발 과정에서 AI 기여 비율 및 역할

> 아래 비율은 daily-log.md(04/06~04/11)의 이슈별 "AI 기여 영역"/"인간 주도 영역" 기록을 기반으로 산출한 **추정치**입니다.

| 단계 | AI 기여 (추정) | 인간 주도 (추정) | 산출 근거 |
|------|---------------|-----------------|-----------|
| 기획 | ~75% | ~25% | 이슈 #10 도메인 리서치 11개 문서 AI 작성, project-plan.md 1,737줄 AI 초안 → 인간이 솔루션 방향성·주제 최종 결정 |
| 설계 | ~70% | ~30% | dev-spec.md 1,583줄 /team 3 병렬 작성, branding-strategy.md 556줄 Team 3 agents 리서치 → 인간이 아키텍처 결정(src/ → apps/web/ 전환), 브랜드명 확정 |
| 개발 | ~80% | ~20% | 처리한 이슈 20건 중 AI가 초안 코드를 생성한 이슈 18건(90%), TDD RED→GREEN 자동화 → 인간이 모든 커밋 검토·승인(불변식 2), OAuth 키 발급, 환경변수 주입 |
| 테스트 | ~75% | ~25% | 62개 TDD 케이스 + E2E 3종 AI 생성, MOCK_CLAUDE 패턴 설계 → 인간이 런타임 검증 실행, Realtime 동작 수동 확인, CI secrets 등록 |

**개발 워크플로우 — 커맨드 기반 워크트리 자동화**

본 프로젝트의 가장 큰 특징은 **AI 에이전트가 설계하고 운영하는 이슈 기반 워크트리 워크플로우**다. 모든 이슈는 아래 사이클로 처리되었다:

```
/si <이슈번호>  →  격리된 git worktree + 브랜치 자동 생성
       ↓
/ri              →  AC 달성 현황 파악 + 플랜 검증
       ↓
/plan            →  ralplan 합의(Planner→Architect→Critic) 기반 구현 계획
       ↓
구현 (TDD: RED → GREEN → REFACTOR)
       ↓
/fi              →  변경사항 분석 → 커밋 메시지 자동 생성 → PR 생성
       ↓
/ci              →  PR 머지 확인 → 워크트리·브랜치 자동 정리
```

이 워크플로우는 04/06에 AI가 설계하고, 04/07에 이슈 #11로 구현되었다. 이후 모든 이슈(#10, #13, #17, #18, #22~#41, #56, #60, #62, #67, #69)가 이 워크플로우로 처리되어 **이슈 간 코드 충돌 없이 병렬 작업**이 가능했다.

**GitHub Project Board 자동 연동**: `/si`로 이슈를 In Progress로 이동, `/fi`로 PR 생성 시 Review로 이동, `/ci`로 머지 확인 후 Done으로 이동 — 프로젝트 보드 상태가 개발 흐름과 자동 동기화되었다.

---

## 4. 기획 단계 AI 활용

### 문제 정의 및 페인포인트 도출

**04/07 — 이슈 #10: AI 교육 솔루션 공모전 도메인 전체 리서치**

AI에게 "교육 현장의 실질적 문제를 AI로 해결하는 솔루션"이라는 공모전 주제를 제시하고, 도메인 전체를 리서치하도록 요청했다. Claude Opus 4.6이 웹 검색과 분석을 수행하여 **11개 배경 조사 문서**를 생성했다:

| 문서 | 내용 | 줄 수 |
|------|------|-------|
| `01_education-pain-points.md` | 교사·학생·운영자 3자 페인포인트 심층 분석 | 318 |
| `02_ai-edu-market-trends.md` | AI 교육 시장 트렌드 | 287 |
| `03_contest-strategy.md` | 공모전 전략 (TAM/SAM/SOM, 포지셔닝) | 372 |
| `07_competitive-landscape.md` | 경쟁사 분석 (ClassDojo, Kahoot, Magic School AI 등) | 418 |
| `10_academic-evidence-research.md` | 학술 근거 (EEF RCT 31% 시간 절약, Gallup 5.9h/주) | 266 |
| 외 6개 | 기술 스택, 생태계, 솔루션 방향 비판 등 | 1,835 |

이 리서치에서 핵심 인사이트가 도출되었다:
- **OECD 데이터**: 한국 교사 행정 업무 부담 OECD 평균 2배, 직무 만족도 22.7%
- **K-MOOC 이수율 13.1%**: 일방향 콘텐츠의 구조적 한계
- **교사 우울 지표 24.9%**: 감정노동 + 피드백 부재의 복합 문제

AI가 도출한 핵심 프레이밍: **"피드백 루프의 단절"** — 교사는 학생이 이해했는지 모르고, 학생은 안전하게 질문할 수 없고, 운영자는 숫자만 본다.

**인간 주도 영역**: 리서치 결과를 검토한 뒤 솔루션 방향성을 최종 결정했다. AI는 다양한 방향을 제시했지만, "학생 피드백 수집 → AI 이해도 분석 → 교사 대시보드 → 다음 수업 초안 자동 생성"이라는 end-to-end 루프를 선택한 것은 인간의 판단이었다. 또한 `08_solution-direction-critical-review.md`(AI 자체 비판)와 `11_solution-rethink-proposal.md`(재검토 제안)를 추가 작성하게 하여, AI 자신의 제안을 AI가 비판적으로 재검토하는 다층 검증 구조를 활용했다.

### 솔루션 아이디어 발산·수렴 프로세스

**발산 단계 (04/07)**:
1. AI가 11개 배경 문서로 도메인을 폭넓게 탐색 (교육 페인포인트, 시장 트렌드, 경쟁사, 학술 근거)
2. `03_contest-strategy.md`에서 시장 규모 분석 (한국 교원 50.6만명, 글로벌 AI EdTech $5.88B → $32.3B CAGR 31.2%)
3. 경쟁사 6곳 분석 후 "감성적 + 교사 중심" 포지셔닝 공백 발견

**수렴 단계 (04/07~04/08)**:
1. `08_solution-direction-critical-review.md` — AI가 자신의 제안을 비판적으로 검토
2. `11_solution-rethink-proposal.md` — 비판 결과를 반영한 솔루션 재제안
3. **ralplan 컨센서스 플래닝** (이슈 #13) — Planner가 초안 → Architect가 구조적 문제 지적(master 브랜치 전략 문서 미접근) → Critic이 검증 → 합의 도달
4. `project-plan.md` 1,737줄 기획서 최종 작성 — ch0~ch9 (Executive Summary, 페인포인트, 타겟, 경쟁, 시장, 가치제안, MVP 설계, PRD, SWOT)

**인간 주도 영역**: PRD를 별도 이슈로 분리하는 scope 관리 결정, 최종 MVP 4대 기능 확정(피드백 수집 + AI 분석 + 대시보드 + 수업 초안), 프로젝트 주제와 팀 구성은 AI 제안 없이 직접 결정.

### 주요 프롬프트 예시

**프롬프트 1 — 프로젝트 초기화 (04/06)**:
```
프로젝트 템플릿 초기화 및 GitHub Project Board 자동 생성
- setup.sh 스크립트로 저장소 초기 구조 자동 생성
- GitHub GraphQL API로 프로젝트 보드 생성 + 칼럼(Backlog/Ready/In Progress/Review/Done) 자동 구성
- .gitignore, CLAUDE.md, AGENTS.md 템플릿 포함
```
→ AI가 `setup.sh` 생성. 그러나 GitHub GraphQL mutation에서 `projectId` 파라미터 버그 발생 — **인간이 직접 디버깅하여 수정**.

**프롬프트 2 — 도메인 전체 리서치 (04/07, 이슈 #10)**:
```
AI 교육 솔루션 공모전 도메인 전체 리서치
- 교육 현장 페인포인트 조사 (교사/학생/운영자 3자)
- AI 교육 시장 트렌드 분석
- 경쟁사 분석 (국내외 EdTech)
- 공모전 심사 기준 분석 및 전략 수립
- 학술 근거 리서치 (EEF, OECD, Gallup 등)
- 기술 스택 + 배포 옵션 분석
```
→ AI가 11개 문서(총 3,496줄) 작성. 팀원이 결과를 검토하고 솔루션 방향성 재검토 문서 추가 작성 지시.

**프롬프트 3 — AI 리포트 구조 설계 (04/07, 이슈 #13)**:
```
/plan → ralplan 컨센서스 플래닝(Planner → Architect → Critic)을 통해
docs/ai-report/ 폴더 구조 및 문서 골격 계획 수립
- AI-REPORT.md 6섹션 스켈레톤
- daily-log.md 일일 기록 템플릿
- prompts/ 디렉토리 구조
```
→ Architect가 "master 브랜치의 전략 문서에 접근하지 못하는 문제" 사전 발견 → master merge 후 진행하도록 플랜 수정. **ralplan 합의 워크플로우가 실행 전 구조적 문제를 포착한 첫 번째 사례**.

---

## 5. 설계 단계 AI 활용

### 아키텍처 설계 시 AI 조언 활용 내역

**04/08 — 이슈 #22: 프로젝트 구조 전환 (2단계)**

프로젝트 초기에 `src/` 디렉토리 패턴으로 시작했으나, MIRAI 프로젝트의 모노레포 패턴(`apps/web/`)으로 전환하는 대규모 리팩토링을 AI 에이전트 팀이 수행했다.

**1차 전환 (src/ 패턴)**: `/team 3` — 3-agent 병렬 실행
- agent-a: 스캐폴드 (package.json, tsconfig, next.config, Tailwind, ESLint, `src/app/`)
- agent-b: 도구체인 (vitest.config.ts, playwright.config.ts, tests/ 스모크 테스트)
- agent-c: 문서 스윕 (.ai.md 6개 생성, AGENTS.md 갱신, 백로그 이슈 #23~#38 body 일괄 업데이트)

**2차 전환 (apps/web/ 모노레포)**: `/team 5` — 5-agent 병렬 실행
- agent-a: 스캐폴드 일괄 이동 (19개 항목 → `apps/web/` 하위)
- agent-b: 핵심 문서 4개 재작성 (dev-spec.md, whitepaper, plan)
- agent-c: 보조 문서 5개 + .ai.md 7개 경로 보정
- agent-d: GitHub 백로그 이슈 19개 body 일괄 업데이트 (`src/app/` → `apps/web/src/app/`)
- agent-e: AGENTS.md, daily-log 갱신 + 최종 검증

**04/08 — 이슈 #18: 기술 개발 명세(dev-spec.md) 작성**

ralplan 합의 기반으로 1,583줄 기술 명세를 작성했다:
- **ralplan 합의 과정**: Planner 초안 → Architect가 ITERATE 판정(5개 보강사항) → 피드백 반영
  - Architect가 발견한 핵심 이슈: **project-plan.md 내부의 Next.js 14/15 버전 불일치** — 구현 시작 후 발견했다면 수정 비용이 커졌을 문제를 **설계 단계에서 사전 포착**
- **`/team 3`으로 병렬 작성**: worker-1(§1~§4: 인프라+DB+API, 572줄) + worker-2(§5: IU-01~IU-06 + 62개 테스트 케이스, 621줄) + worker-3(§6~§7: TDD 전략+로드맵, 336줄) → Lead가 1,543줄 단일 문서로 통합

**인간 주도 영역**: `src/` → `apps/web/` 전환 결정(MIRAI 구조 참고, 옵션 4 채택), Next.js 15 확정, 플랜 승인 및 팀 실행 지시, TDD 기반·일론 5원칙 적용 명시적 요구.

### UI/UX 설계 및 사용자 시나리오 작성 시 AI 역할

**04/08 — 이슈 #17: Team 3 agents 브랜딩 리서치**

`/team 3` 명령으로 3개 AI 에이전트가 **동시에 서로 다른 리서치 영역**을 병렬 수행했다:

| 에이전트 | 모델 | 역할 | 산출물 크기 |
|----------|------|------|------------|
| worker-1 | Claude Sonnet 4.6 | 글로벌 EdTech 5개 사례 브랜딩 분석 (ClassDojo, Duolingo, Notion, Kahoot, Canva) | 30KB |
| worker-2 | Claude Opus 4.6 | 국내 경쟁사 6개 BI 재분석 (브랜딩 관점 전환) | 18KB |
| worker-3 | Claude Haiku 4.5 | 브랜드 아이덴티티 초안 (Mission/Vision/Personality/Values) | 25KB |

→ Lead(Opus 4.6)가 73KB 리서치를 단일 `branding-strategy.md`(556줄)로 통합

핵심 발견: **한국 EdTech 시장에 "감성적 + 교사 중심" 포지셔닝 공백** 존재 (모든 경쟁사가 성적/효율 중심)

**04/10 — 이슈 #56: 게이미피케이션 UI 디자인**

AI slop(AI 특유의 클리셰 디자인) 방지를 위해 web-research-specialist 에이전트로 리서치 후 디자인했다:
- AI가 처음 추천한 `#4F46E5`(indigo) = Tailwind 기본값 → 과잉 학습 결과로 판단, 전면 교체
- Claymorphism = 2023 피크의 클리셰 → Kahoot/Duolingo처럼 **기능적 색상 코딩**으로 전환
- 최종: Vivid Orange `#F97316` + Kahoot 4색 답안 블록 + 다크 배경 `#0F172A` + canvas-confetti 정답 애니메이션

**인간 주도 영역**: "AI slop 검색해보고 클로드 특유 냄새 안나게 색상 선정 고려해"라는 크리에이티브 디렉션 제시, 브랜드명 최종 확정(Seeya! 선택), SPA 패턴 방향성 지시("사이드바 있는 섹션에서 계속 움직이게").

### 기술 스택 선정 의사결정 과정

ralplan 합의(Planner→Architect→Critic)를 통해 기술 스택을 확정했다:

| 기술 | 선정 이유 | AI 역할 |
|------|----------|---------|
| Next.js 15 (App Router) | Server Components + API Routes 단일 프레임워크, 7일 MVP에 최적 | ralplan 합의에서 14/15 불일치 사전 포착 후 15로 확정 |
| Supabase (PostgreSQL + Auth + Realtime) | DB + 인증 + 실시간 푸시를 하나의 서비스로 통합, RLS로 인가 자동화 | dev-spec.md에서 일론 5단계 "삭제" 원칙 적용 — Redux, 별도 WebSocket, ORM 등 6개 기술 제거 |
| Claude API (claude-sonnet-4-6) | 이해도 분석 + 수업 초안 생성에 structured output(tool use) 활용 | 프롬프트 템플릿 + zod 스키마 설계 |
| Vercel | Next.js 네이티브 배포, 환경변수 5개만으로 즉시 배포 | 배포 가이드 문서 자동 작성 |

**일론 5단계 "삭제한 기술" 목록** (AI가 dev-spec.md §2.4에서 분석):
- Redux/Zustand → `useState` + Supabase Realtime (30명 규모 MVP에 전역 상태 관리 불필요)
- 별도 WebSocket 서버 → Supabase Realtime 내장
- ORM (Prisma/Drizzle) → Supabase JS SDK 직접 쿼리 (7개 테이블 규모)
- Redis → AI 인사이트는 세션당 1회 생성 후 DB 저장, 캐시 불필요

---

## 6. 개발 단계 AI 활용

### 코드 생성·리뷰·디버깅에 AI 활용 내역

모든 이슈는 **TDD 사이클(RED → GREEN → REFACTOR)**로 구현되었다. AI executor(Claude Sonnet 4.6)가 테스트를 먼저 작성(RED)하고, 구현(GREEN)한 뒤, 리팩토링(REFACTOR)하는 전체 사이클을 자동으로 수행했다.

**멀티에이전트 병렬 개발 사례**:

| 이슈 | 에이전트 구성 | 작업 내용 | 결과 |
|------|-------------|----------|------|
| #22 구조 전환 | `/team 5` (5-agent 병렬) | 스캐폴드 이동 + 문서 재작성 + 이슈 body 19개 업데이트 | 순차 대비 ~3x 시간 단축 |
| #18 dev-spec | `/team 3` (3-agent 병렬) | §1~§4 인프라 + §5 IU 명세 + §6~§7 로드맵 | 1,543줄 통합 문서 |
| #17 브랜딩 | `/team 3` (3-agent 병렬) | 글로벌 리서치 + 국내 분석 + 아이덴티티 | 73KB → 556줄 통합 |
| #23 Supabase | `/team 3` (3-agent 병렬) | 스캐폴드 + SDK 클라이언트 + 통합 테스트 | 7테이블 + 13 RLS + 4 인덱스 |

**디버깅 사례 — 04/09 Supabase Realtime 미수신 문제**:

교사가 세션을 종료해도 학생 화면에 이벤트가 전달되지 않는 문제가 발생했다. Claude Sonnet 4.6이 autopilot 모드로 근본 원인 3가지를 분석했다:

1. `supabase_realtime` 퍼블리케이션에 테이블이 0개 등록 — 마이그레이션 `20260409000002` 추가
2. sessions 테이블 REPLICA IDENTITY = DEFAULT → FULL로 변경 필요 — 마이그레이션 `20260409000003` 추가
3. anon이 `ended` 상태 세션을 SELECT 불가 → RLS 정책 확장 (active → active OR ended)

→ 3개 마이그레이션 파일 + `useSessionStatus.ts`에 3초 폴링 폴백 추가로 해결

**디버깅 사례 — 04/09 RLS 위반 (`adminClient.auth.signInWithPassword` 사이드이펙트)**:

통합 테스트에서 service_role 클라이언트로 `signInWithPassword`를 호출하면 해당 세션이 user JWT로 덮어써져서 service_role 권한이 상실되는 문제 발견. SDK 문서에 명시되지 않은 동작이었다. AI가 별도 throwaway 클라이언트 패턴으로 해결.

### 핵심 기능별 AI 기여도

| 구현 단위 | 기능 | AI 기여 내용 | 테스트 |
|-----------|------|-------------|--------|
| IU-01 학생 참여 | 퀴즈 참여 + 점수 저장 + Realtime 동기화 | worker-2가 TDD로 퀴즈 페이지·훅·애니메이션 구현, sessionStorage 기반 익명 상태 관리 | 통합 3종 + E2E 2종 |
| IU-02 AI 인사이트 | Claude API 호출 → 취약/강점 개념 분석 | Claude SDK 래퍼(`callClaude`) + zod 스키마(`InsightSchema`) + 프롬프트 빌더 설계 | 통합 4종 (200 성공, 캐시, 403, 500) |
| IU-03 교사 대시보드 | 세션 목록 + 실시간 집계 차트 | `loadDashboardData`(Promise.all 3-way 병렬), `useRealtimeResponses` 훅, CSS flex 바 차트 (Chart.js 0개 추가) | 통합 3종 |
| IU-04 수업 초안 | AI 기반 다음 수업 마크다운 생성 | ralplan 합의 → 2-step API 패턴(Preview→Confirm) 확정, `draft-questions.ts` tool use 스키마 | 통합 4종 |
| IU-05 세션 관리 | 생성·활성화·종료 + QR 코드 | 상태 전이 API (draft→active→ended), `QRCodeDisplay` 컴포넌트 | 통합 5종 (전이 가드 + 멱등성) |
| IU-06 리더보드 | 실시간 순위 표시 | `buildLeaderboard` 순수 함수 + Realtime INSERT 구독 + 3초 폴링 폴백 | 단위 7종 |
| 추가: 자연어 세션 생성 (#69) | 자연어 → AI가 제목·문항 자동 생성 | `session-parse.ts` Zod 스키마 + `parse-prompt` API + `create-with-content` 원자적 생성 | 단위 10종 |

### 인간의 검토·수정이 이루어진 부분

| 영역 | 인간이 직접 수행한 내용 | 이유 |
|------|----------------------|------|
| **모든 커밋 승인** | git commit/push 전 반드시 인간이 diff 검토 후 승인 | 불변식 2: "AI가 생성/수정한 코드는 반드시 인간 검토 후 커밋" |
| **Google OAuth 설정** | Google Cloud Console에서 OAuth 앱 생성, Client ID/Secret 발급 | 외부 서비스 인증 정보는 인간만 접근 가능 |
| **Supabase 원격 프로젝트** | Supabase 대시보드에서 프로젝트 생성, `supabase db push` 실행 | 프로덕션 DB 접근 권한 |
| **환경변수 주입** | `.env.local`에 ANON_KEY, SERVICE_ROLE_KEY, ANTHROPIC_API_KEY 입력 | 시크릿 관리 |
| **RLS 우회 결정** | 학생 피드백 전송 시 service role key 사용 승인 | 보안 정책 의사결정 |
| **AI slop 방지 방향** | "클로드 특유 냄새 안나게" 크리에이티브 디렉션 | 디자인 품질 기준은 인간이 설정 |
| **SPA 패턴 전환** | "왼쪽 세션 누르면 오른쪽 영역에 내용 나오게" 요구 | UX 의사결정 |
| **브랜드명 확정** | Seeya!(시야) 최종 선택 (AI 제안 8개 후보 중) | 브랜딩 최종 결정권 |
| **기능 뱃지 제거** | 랜딩 페이지 기능 뱃지 섹션 삭제 지시 | UI 간결화 판단 |
| **Playwright 수동 실행** | `npx playwright install chromium` + `npm run e2e` 실행 | 브라우저 설치 + 런타임 검증 |

---

## 7. 테스트 및 개선 단계 AI 활용

### 테스트 케이스 생성

AI executor(Claude Sonnet 4.6)가 TDD-first 원칙에 따라 **구현 코드보다 테스트를 먼저 작성**했다. dev-spec.md §6의 62개 테스트 케이스 명세를 기반으로 실제 테스트 코드를 생성했다.

**테스트 현황 요약**:

| 레벨 | 도구 | 테스트 수 | 주요 대상 |
|------|------|----------|-----------|
| 단위 | Vitest | ~45개 | scoring, validation, join-code, aggregate, leaderboard, prompts, session-parse |
| 통합 | Vitest + Supabase 로컬 | ~15개 | RLS 정책 3종, API 라우트(sessions, insights, class-draft), auth trigger |
| E2E | Playwright | 7개 (3 시나리오) | teacher-flow, student-flow, ai-flow |
| **합계** | | **~67개** | 전체 122/122 통과 (04/11 기준) |

**E2E 시나리오 3종 (이슈 #39, 04/10)**:

ralplan 컨센서스(Planner→Architect→Critic 2회 반복)로 E2E 전략을 수립한 뒤 구현했다:

1. **E2E-01 teacher-flow**: 세션 생성 → 문항 3개 추가 → 활성화 → QR 코드 표시
2. **E2E-02 student-flow**: 학생 3명 동시 참여 (3 browser context) → 퀴즈 응답 → 리더보드
3. **E2E-03 ai-flow**: 인사이트 생성 → 취약 개념 확인 → 수업 초안 생성 → 마크다운 렌더링

**MOCK_CLAUDE 패턴**: CI 환경에서 실제 Claude API를 호출하지 않도록 `MOCK_CLAUDE=1` 환경변수로 분기하는 패턴을 AI가 설계. `playwright.config.ts`의 `webServer.env`에 자동 주입되어 E2E에서 결정적(deterministic) 응답을 보장한다.

최종 결과: **7/7 테스트 통과 (15.7초)** — smoke, E2E-01, E2E-02 x2, E2E-03 x2, TEST-IU1-E02

### 버그 수정 과정에서 AI 활용

**사례 1 — Realtime 미수신 근본 원인 분석 (04/09)**:

위 §4에서 기술한 3가지 근본 원인을 AI가 autopilot 모드로 체계적으로 분석. 마이그레이션 3개 + 폴링 폴백 1개로 해결.

**사례 2 — `@supabase/ssr` 0.5.2 → 0.10.2 타입 cascade (04/10, 이슈 #40)**:

CI 파이프라인 구축 중 `@supabase/ssr@0.5.2`가 `supabase-js@2.103.0`에 없는 경로(`dist/module/lib/types`)를 import하여 **전체 DB 타입이 `never`로 붕괴**하는 문제 발견. AI가 근본 원인을 `@supabase/ssr@0.10.2`로의 업그레이드로 해소하고, `database.ts`의 Views/Functions/Enums/CompositeTypes를 `Record<string, never>` 변환 + Relationships 배열 추가로 타입 정합성을 복원.

**사례 3 — E2E `animate-burst` DOM 타이밍 (04/10)**:

Playwright에서 정답 애니메이션(`animate-burst`) 검증 시 React 배치 렌더 후 `currentQuestion`이 전진하여 DOM에서 사라지는 타이밍 이슈. AI가 `animate-float-up`(scoreFloat, 1100ms)으로 검증 대상을 변경하여 해결.

### 사용자 피드백 반영 시 AI 지원

**SPA 패턴 전환 (04/10, 이슈 #56 2차)**:
- 팀원 요청: "왼쪽 세션 누르면 오른쪽 영역에 내용 나오게, 문항 편집·라이브·인사이트도 대시보드 섹션에서 작동"
- AI 응답: `?session=<id>&view=<view>` 쿼리 파라미터 기반 SPA 패턴으로 변환. `SessionSidebar` 링크 + `renderContent()` 분기 구현
- 결과: 사이드바가 항상 보이는 레이아웃으로, 페이지 이동 없이 세션 간 전환 가능

**자연어 세션 생성 (04/11, 이슈 #69)**:
- 팀원 요청: "선생님이 자연어로 입력하면 AI가 세션 제목과 문항을 자동 생성"
- AI 응답: ralplan 합의 후 `session-parse.ts`(Zod 스키마) + `parse-prompt` API + `create-with-content` 원자적 생성 엔드포인트 구현
- 핵심 이슈: AI 파싱 응답 `maxTokens` 512 → 2048 증가 필요 (JSON 중간 잘림 방지)

**따봉 피드백 제거 (04/10, 이슈 #60)**:
- 팀원 결정: 대시보드에서 따봉(👍/👎) 집계 UI 불필요 판단
- AI가 `SessionDetailClient.tsx`에서 `thumbsStats` state, fetch useEffect, UI span 일괄 제거

---

## 8. AI 협업 성찰

### 가장 효과적이었던 AI 활용 사례

**1. Team N agents 병렬 리서치/구현**

`/team 3` 또는 `/team 5` 명령으로 여러 AI 에이전트가 **동시에 서로 다른 영역을 병렬 처리**한 것이 가장 효과적이었다.

- 브랜딩 리서치(이슈 #17): 3개 에이전트가 글로벌·국내·아이덴티티를 동시 조사 → 73KB 리서치를 1회 세션에서 완료
- 프로젝트 구조 전환(이슈 #22): 5개 에이전트가 스캐폴드·문서·이슈를 동시 처리 → 순차 대비 약 3배 시간 단축
- dev-spec 작성(이슈 #18): 3개 에이전트가 인프라·IU 명세·로드맵을 동시 작성 → 1,543줄 문서를 단일 세션에서 완성

**2. ralplan 컨센서스 — 실행 전 문제 사전 포착**

Planner→Architect→Critic 합의 워크플로우가 구현 시작 전에 구조적 문제를 발견한 사례들:

- **Next.js 14/15 불일치** (이슈 #18): Architect가 project-plan.md 내부 버전 불일치를 지적 → 구현 전 15로 확정
- **UNIQUE 충돌 방지** (이슈 #41): seed.sql에서 `ON CONFLICT DO NOTHING` 패턴 사전 적용
- **master 브랜치 접근 문제** (이슈 #13): Architect가 워크트리에서 전략 문서 미접근 문제 발견 → merge 선행 결정
- **수업 초안 생명주기 분리** (이슈 #62): Architect가 "마크다운과 문항 스키마는 생명주기가 다르다" 지적 → Preview→Confirm 2-step 패턴으로 분리

**3. 커맨드 기반 워크트리 워크플로우 (si/ri/fi/ci)**

AI가 설계하고 구현한 슬래시 커맨드 체계가 개발 효율을 크게 높였다:
- `/si`로 이슈별 격리된 워크트리 자동 생성 → 이슈 간 코드 충돌 원천 차단
- `/ri`로 세션 재시작 시 AC 달성 현황 즉시 복원 → 컨텍스트 손실 최소화
- `/fi`로 변경사항 자동 분석 → 커밋 메시지 생성 → PR 생성 → 프로젝트 보드 자동 이동
- `/ci`로 머지 확인 → 워크트리·브랜치 자동 정리

### AI 한계로 인해 인간이 직접 해결한 부분

| 한계 유형 | 구체적 사례 | 인간의 해결 방법 |
|-----------|-----------|-----------------|
| **외부 API 세부 버그** | GitHub GraphQL mutation에서 `projectId` 파라미터 오류 (04/06) | 인간이 GraphQL Playground에서 직접 디버깅 |
| **Spec 컬럼명 불일치** | AI가 `responses.content` 같은 가상 컬럼을 사용 — dev-spec DDL과 불일치 (04/09) | 런타임 검증(supabase start + 테스트 실행)에서야 발견. 이후 DDL grep 자가 검증 강제 |
| **Supabase CLI 키 호환** | `sb_publishable_*`(신키)는 PostgREST role claim 미지원 → RLS 미작동 (04/09) | 인간이 legacy JWT 키(`role=anon`/`role=service_role` claim 포함)로 교체 |
| **AI slop 디자인** | Tailwind 기본값 `#4F46E5` 추천, Claymorphism 클리셰 (04/10) | "AI slop 검색해보고 클로드 특유 냄새 안나게" 방향 지시 후 전면 교체 |
| **SDK 미문서화 동작** | `adminClient.auth.signInWithPassword`가 service_role 세션을 덮어씀 (04/09) | AI가 원인은 분석했으나, 이 동작이 문서에 없다는 사실은 인간이 확인 |
| **물리적 환경 설정** | Docker Desktop 설치, `supabase start`, Vercel 배포, OAuth 키 발급 | AI는 명령어를 제시하지만, 실행과 인증은 인간이 직접 수행 |

### 팀 내 AI 활용 역량 향상 사례

**1. "지시자"에서 "오케스트레이터"로**

프로젝트 초반(04/06)에는 단일 AI에게 단일 작업을 요청하는 패턴이었다. 04/08부터는 **멀티에이전트 오케스트레이션**을 적극 활용:
- `/team N`으로 N개 에이전트 병렬 실행
- `ralplan`으로 Planner·Architect·Critic 합의 기반 설계
- `ralph`로 자율 실행 루프 + 검증

**2. 프롬프트 전략의 정교화**

- 초반: "구현해줘" → AI가 방향 없이 작업
- 후반: "TDD-first로, dev-spec §5 IU-02 명세 기반, zod 스키마 사용, 통합 테스트 4종 포함" → AI가 정확한 범위와 품질 기준으로 작업
- 핵심 학습: **AI에게 "무엇을"이 아닌 "어떻게"를 지시할수록 품질이 올라간다**

**3. ralplan 합의 → 실행 전 이슈 사전 포착 패턴**

ralplan 워크플로우를 반복 사용하면서, **구현 전에 설계를 다각도로 검증하는 습관**이 형성되었다:
- Architect가 "이 설계에서 가장 큰 위험은?" 관점으로 검토
- Critic이 "테스트 가능한 수용 기준인가?" 관점으로 검증
- 이 과정에서 Next.js 버전 불일치, seed.sql UNIQUE 충돌, 수업 초안 생명주기 분리 등의 이슈를 **코드 작성 전에** 발견

**4. 커맨드 워크플로우 표준화**

AI가 설계한 `si → ri → plan → 구현 → fi → ci` 워크플로우가 이슈 처리의 표준 패턴이 되면서:
- 이슈별 격리된 워크트리로 병렬 작업 가능
- `/ri`로 세션 재시작 시에도 AC 달성 현황 즉시 복원
- Git Project Board와 이슈 상태가 자동 동기화

---

> **작성 원칙** (05_report-doc-strategy.md 2-3절 기반)
> 1. 과정 중심 작성: 프롬프트 → AI 응답 → 인간 검토 → 수정 → 최종 반영 흐름
> 2. 구체적 프롬프트 첨부: "ChatGPT로 기획했습니다"가 아닌 실제 프롬프트 원문
> 3. AI 기여도와 인간 기여도 명확 구분
> 4. 정량적 수치 포함: 시간 절약, 반복 횟수, 품질 개선율 등

> **스크린샷 안내**: 본 프로젝트는 CLI(Claude Code) 기반으로 개발되어 GUI 스크린샷이 제한적입니다.
> 주요 증거는 **git log, PR 기록, daily-log.md 프롬프트 원문**으로 대체합니다.
> 라이브 데모 URL과 GitHub 저장소에서 실제 동작을 확인할 수 있습니다.
