# [#73] AI 리포트 양식 작성 — 구현 계획

> 작성일: 2026-04-11
> 유형: DOCUMENTATION (코드 변경 없음, 마크다운 콘텐츠 작성만)
> 마감: 04/13(월)
> 대상 파일: `docs/ai-report/AI-REPORT.md` (109줄, 6섹션, **16개 TODO**)
> 합의: ralplan 컨센서스 (Planner → Architect → Critic APPROVE)

---

## 완료 기준

- [ ] `docs/ai-report/AI-REPORT.md` 의 모든 TODO 섹션이 실제 내용으로 채워짐
- [ ] docx 양식 항목 전체 커버 (기획·AI 활용 내역·스크린샷 가이드·추가 내용)
- [ ] AI 기여 비율 정량화: 단계별 % 수치 포함 (기획 / 설계 / 개발 / 테스트)
- [ ] 핵심 프롬프트 원문 5개 이상 첨부 (daily-log 기반)
- [ ] 인간 주도 vs AI 기여 영역 명확히 구분하여 기술
- [ ] 사용 AI 도구 목록 완성 (Claude Code Opus 4.6, Sonnet 4.6, Haiku 4.5, oh-my-claudecode 멀티에이전트)
- [ ] 해당 디렉토리 `.ai.md` 최신화 (`docs/ai-report/.ai.md`)

---

## RALPLAN-DR 요약

### Principles (핵심 원칙)

1. **팩트 기반 작성**: daily-log.md의 실제 기록만 사용. 허구적 AI 활용 사례 작성 금지 (불변식 3)
2. **과정 중심 서술**: 프롬프트 원문 → AI 응답 → 인간 검토 → 수정 → 최종 반영 흐름으로 기술
3. **정량적 증거 포함**: AI 기여 비율 %, 테스트 케이스 수, 시간 절약 추정치 등 수치 근거
4. **인간-AI 구분 명확화**: 각 단계에서 인간이 주도한 영역과 AI가 기여한 영역을 명시적으로 분리

### Decision Drivers (의사결정 요인)

1. **마감 임박 (D-2)**: 04/13 마감, 오늘 04/11 — 1일 내 완료 필요
2. **소스 문서 풍부**: daily-log.md 1,047줄에 04/06~04/11 전체 기록 존재
3. **공모전 심사 기준 정렬**: "AI 활용 능력 및 효율성"이 심사 항목 2순위

### Decision: Option A (단일 executor 순차 작성)

- **선택 이유**: 109줄 문서의 톤 일관성이 병렬화 시간 절감보다 중요
- **기각된 대안**: Option B (3-agent 병렬) — 통합 비용이 절감 시간을 상쇄

---

## Guardrails

### Must Have
- daily-log.md에 기록된 실제 프롬프트 원문만 사용 (팩트 기반)
- AI 기여 비율은 **카운터블 근거 + "추정" 라벨** 방식으로 산출 (예: "이슈 20건 중 AI 초안 17건 = ~85%")
- 각 섹션에 구체적 이슈 번호, 날짜, 도구명 명시
- 프롬프트 원문 5개 이상 포함 (daily-log에서 가장 대표적인 것 선별)

### Must NOT Have
- 허구적/과장된 AI 활용 사례 (불변식 3 위반)
- 소스 문서에 없는 수치나 통계 날조
- AI-REPORT.md의 기존 스켈레톤 구조 변경 (섹션 순서/제목은 유지)
- 코드 파일(.ts, .tsx, .js 등) 수정

### ⚠️ Executor 주의사항 (Architect/Critic 반영)
1. **TODO 개수**: 실제 16개 (계획 초안의 10개가 아님) — 모두 채울 것
2. **AI 기여율 산출**: daily-log에는 정성적 기록만 있음. 비율 제시 시 반드시 산출 근거를 명시하고 "추정"임을 표기
3. **daily-log 비순차 구조**: 04/09가 두 번 등장(line 272 "목", line 861 "수"), 이슈 #33/#34/#38이 후방 삽입됨 → 날짜순이 아닌 **전체 파일 스캔** 필요
4. **04/12~04/13**: 빈 템플릿 상태 — 해당 날짜 데이터 없음을 인지하고, "본 리포트 작성 작업에 해당" 또는 생략 처리

---

## 구현 계획

### Step 1: §1 AI 활용 개요 작성
**소스**: daily-log.md 전체 (사용 도구 섹션들), dev-spec.md §1

**TODO 2개 채우기:**

1. **AI 도구 목록 테이블** 완성
   - Claude Code (Claude Opus 4.6, 1M context) — 기획, 설계, 오케스트레이션, 코드 리뷰, 디버깅, 문서 작성
   - Claude Sonnet 4.6 — 코드 생성, TDD 구현, executor 에이전트
   - Claude Haiku 4.5 — 코드베이스 탐색(explore), 브랜드 아이덴티티 초안(worker-3)
   - oh-my-claudecode — 멀티에이전트 오케스트레이션 (ralplan, team N, ralph, autopilot)
   - Docker Desktop + Supabase CLI — 로컬 DB 환경
   - Vitest + Playwright — TDD + E2E 테스트

2. **단계별 AI 기여 비율 테이블** 작성
   - daily-log의 각 날짜별 "AI 기여 영역" / "인간 주도 영역" 기록을 집계
   - **카운터블 근거 기반**: 이슈 수 대비 AI 초안 생성 비율 등으로 산출
   - 반드시 "daily-log 기록 기반 추정" 단서 표기

**완료 확인**: 도구 테이블 6행 이상, 기여 비율 4단계 % 수치 + 산출 근거 포함

---

### Step 2: §2 기획 단계 AI 활용 작성
**소스**: daily-log 04/06~04/07, project-plan.md ch0+ch1+ch2, background/ 문서들

**TODO 3개 채우기:**

1. **문제 정의 및 페인포인트 도출**
   - 04/07 이슈 #10: AI가 11개 배경 문서 작성 (공모전 가이드 분석, 교육 생태계, 경쟁사 분석 등)
   - project-plan.md ch0 "피드백 루프 단절" 도출 과정
   - 인간 판단: 솔루션 방향성 최종 결정

2. **솔루션 아이디어 발산-수렴**
   - 04/07 프롬프트: "AI 교육 솔루션 공모전 도메인 전체 리서치"
   - 08_solution-direction-critical-review.md → 11_solution-rethink-proposal.md 흐름
   - ralplan 컨센서스로 Planner-Architect-Critic 3단계 검증

3. **주요 프롬프트 예시** (3~5개)
   - daily-log 04/06 프롬프트 1: 프로젝트 템플릿 초기화
   - daily-log 04/07 프롬프트 1: 도메인 전체 리서치 (이슈 #10)
   - daily-log 04/07 프롬프트 3: AI 리포트 문서 구조 설계 (ralplan)

**완료 확인**: 페인포인트 도출 과정 서술, 발산-수렴 흐름, 프롬프트 원문 3개 이상

---

### Step 3: §3 설계 단계 + §4 개발 단계 AI 활용 작성
**소스**: daily-log 04/08~04/11, dev-spec.md, branding-strategy.md

**§3 TODO 3개 채우기:**

1. **아키텍처 설계 AI 조언**
   - 04/08 이슈 #22: src/ → apps/web/ 모노레포 전환 (ralplan 합의, 5-agent 병렬)
   - 04/08 이슈 #18: dev-spec.md 작성 (team 3, 1,543줄 통합)
   - Planner→Architect→Critic 합의에서 Next.js 14/15 불일치 사전 포착

2. **UI/UX 설계 AI 역할**
   - 04/08 이슈 #17: Team 3 agents 브랜딩 리서치 (73KB)
   - 04/10 이슈 #56: 게이미피케이션 UI (AI slop 방지, Kahoot 4색)
   - ui-ux-pro-max 스킬 + web-research-specialist 에이전트

3. **기술 스택 선정**
   - Next.js 15 + Supabase + Claude API + Vercel 선정 과정
   - dev-spec.md §2 기술 스택 결정 (ralplan 합의)

**§4 TODO 3개 채우기:**

1. **코드 생성/리뷰/디버깅**
   - 이슈별 TDD 사이클: RED(테스트 작성) → GREEN(구현) → REFACTOR
   - 04/09 이슈 #23: Supabase 로컬 환경 런타임 검증 → 4개 버그 발견+수정
   - 04/09 Realtime 디버깅: 근본 원인 3가지 분석 (autopilot 모드)

2. **핵심 기능별 AI 기여도** 테이블
   - IU-01 학생 참여: worker-2가 TDD 구현
   - IU-02 AI 인사이트: Claude SDK + zod 스키마 + 통합 테스트 4종
   - IU-03 교사 대시보드: TDD 전체 자동화 (RED→GREEN)
   - IU-04 수업 초안: ralplan 합의 → 2-step API 패턴
   - IU-05 세션 관리: 상태 전이 API + QR 코드
   - IU-06 리더보드: 순수 함수 + Realtime 훅

3. **인간 검토/수정 부분**
   - 모든 커밋 인간 승인 (불변식 2)
   - Google OAuth 키 발급, Supabase 원격 프로젝트 생성
   - RLS 우회 결정 (service role key 사용)
   - AI slop 방지 방향성 지시

**완료 확인**: 이슈 번호 10개 이상 언급, IU별 기여도 테이블, 인간 검토 사례 5개 이상

---

### Step 4: §5 테스트 + §6 AI 협업 성찰 작성
**소스**: daily-log 04/09~04/11, dev-spec.md §6

**§5 TODO 3개 채우기:**

1. **테스트 케이스 생성**
   - TDD 62개 케이스: 단위 ~30, 통합 ~15, E2E ~8, 기타
   - 04/10 이슈 #39: Playwright E2E 3종 (teacher-flow, student-flow, ai-flow)
   - MOCK_CLAUDE=1 패턴으로 CI에서 실제 API 호출 없이 검증

2. **버그 수정 AI 활용**
   - RLS 위반 디버깅 (adminClient.auth.signInWithPassword 사이드이펙트)
   - Realtime 미수신 근본 원인 3가지 (퍼블리케이션 미등록, REPLICA IDENTITY, anon SELECT)
   - @supabase/ssr 0.5.2 → 0.10.2 타입 cascade 해소

3. **사용자 피드백 반영**
   - 04/10 이슈 #56: SPA 패턴 전환 (사이드바 유지 요청)
   - 따봉 피드백 UI 제거 (#60)
   - 자연어 세션 생성 (이슈 #69)

**§6 TODO 2개 채우기:**

1. **가장 효과적인 AI 활용 사례**
   - Team N agents 병렬화: 73KB 브랜딩 리서치 동시 처리, 5-agent 모노레포 전환
   - ralplan 컨센서스: Next.js 14/15 불일치 사전 포착, UNIQUE 충돌 방지
   - TDD 자동화: executor가 RED 테스트 먼저 작성 → 구현 착수

2. **AI 한계 + 인간 해결**
   - GitHub API 세부 버그 (GraphQL mutation projectId)
   - AI가 spec 컬럼명을 정확히 지키지 않음 (responses.content 가상 컬럼)
   - Supabase CLI 신키 vs legacy키 호환성 이슈
   - AI slop (Tailwind 기본값 #4F46E5, Claymorphism 클리셰)

3. **AI 활용 역량 향상**
   - 워크트리 커맨드 워크플로우 (si/ri/fi/ci) 체계화
   - ralplan 합의 → 구현 전 이슈 사전 포착 패턴 학습
   - TDD-first + AI executor 조합 숙련

**완료 확인**: 테스트 수치 명시 (62개, 3 E2E), 구체적 버그 사례 3개, 성찰 3개 항목

---

### Step 5: 마무리 — 크로스체크 + .ai.md 업데이트
**소스**: 전체 문서 크로스체크

1. **TODO 마커 전수 검사**: `grep "TODO" docs/ai-report/AI-REPORT.md` = 0
2. **AI 기여 비율 정합성**: §1 비율 테이블과 §2~§5 본문 내용 일치 확인
3. **프롬프트 원문 5개 최종 확인**:
   - 기획: 도메인 전체 리서치 (04/07)
   - 설계: ralplan 합의 기반 구현 계획 (04/08)
   - 개발: /team 3 dev-spec.md 작성 (04/08)
   - 테스트: Playwright E2E 구현 (04/10)
   - UI/UX: "AI slop 검색해보고 클로드 특유 냄새 안나게" (04/10)
4. **docs/ai-report/.ai.md 업데이트**: AI-REPORT.md 작성 완료 상태 반영

**완료 확인**: TODO 마커 0개, .ai.md 최신화, 프롬프트 5개 이상 확인

---

## 소스 문서 ↔ 섹션 매핑 요약

| AI-REPORT 섹션 | 주요 소스 문서 | daily-log 날짜 |
|----------------|---------------|----------------|
| §1 AI 활용 개요 | daily-log 전체, dev-spec §1 | 04/06~04/11 |
| §2 기획 단계 | project-plan.md ch0~ch2, background/ 11개 | 04/06~04/07 |
| §3 설계 단계 | branding-strategy.md, dev-spec §2~§4 | 04/08 |
| §4 개발 단계 | daily-log 이슈별 기록, dev-spec §5 | 04/08~04/11 |
| §5 테스트 단계 | dev-spec §6, daily-log E2E/TDD 기록 | 04/09~04/11 |
| §6 AI 협업 성찰 | daily-log "인사이트" 섹션들 | 04/06~04/11 |

---

## 실행 의존성

```
Step 1 (§1 개요) ─┐
Step 2 (§2 기획) ──┤── 순차 실행 (문맥 일관성)
Step 3 (§3+§4)  ──┤
Step 4 (§5+§6)  ──┘
Step 5 (마무리) ──── Step 1~4 완료 후 실행
```

모든 Step은 단일 executor가 순차적으로 수행. Step 5는 크로스체크 단계이므로 반드시 마지막.

---

## Success Criteria (완료 판정)

1. `grep -c "TODO" docs/ai-report/AI-REPORT.md` = 0
2. AI 도구 목록 테이블 6행 이상
3. 단계별 AI 기여 비율 4개 % 수치 + 산출 근거 존재
4. 프롬프트 원문 5개 이상 (daily-log 출처 명시)
5. 인간 주도 vs AI 기여 구분이 §2~§5 각 섹션에 존재
6. `docs/ai-report/.ai.md` 최신화 완료
7. docx 양식 항목 매핑: 기획(§2) + AI 활용 내역(§1,§3,§4) + 스크린샷 가이드(§5 내 안내) + 추가 내용(§6)
