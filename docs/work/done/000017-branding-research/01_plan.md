# 구현 계획: #17 docs/branding 실무 수준 브랜딩 전략 리서치 및 기획

> 생성일: 2026-04-07
> 모드: RALPLAN (consensus, short)
> 상태: Planner 수정안 v2 — Architect/Critic 피드백 5건 반영
> 수정 이력: v1 초안 → v2 피드백 반영 (참조 문서 fallback, 프레이밍 입장, 기존 리서치 관계, 검증 구체화, VI 유연성)

---

## RALPLAN-DR Summary

### Principles (핵심 원칙)

1. **팩트 기반 (Fact-Based)**: 모든 브랜딩 전략은 이슈 본문(00_issue.md), background 문서, 실무 레퍼런스에 근거하며 출처를 명시한다. 추측이나 허구 금지.
2. **교사-우선 포지셔닝 (Teacher-First)**: MirAI의 핵심 차별점은 "교사가 먼저 가치를 느끼는" 구조. 브랜딩도 교사를 1차 타겟으로 설계한다.
3. **감성과 기능의 이중 구조 (Dual Hook)**: "시간 절약/60초 피드백이 기능적 Hook, 관계 회복이 상위 Positioning" — 11_solution-rethink-proposal의 "프레이밍 ≠ 기능" 비판을 수용하여, 감성 포지셔닝은 유지하되 기능적 Hook을 시간 절약과 60초 피드백 루프로 구체화한다.
4. **공모전 심사 기준 정렬 (Contest-Aligned)**: 창의성 심사 항목(독창적 접근, 차별점, 혁신 UX, 문제 재정의)에 브랜딩이 직접 기여하도록 설계한다.
5. **실무 수준 품질 (Professional Grade)**: 해커톤 수준이 아닌 실무 브랜딩 기획자/디자이너가 바로 활용할 수 있는 깊이와 구체성을 갖춘다.

### Decision Drivers (의사결정 핵심 요인)

1. **경쟁사 부재 영역 선점**: 한국 EdTech 시장에서 "teacher-first, 60-second feedback loop, 관계 회복"을 브랜드 정체성으로 소유한 경쟁자가 없음 → 이 포지셔닝을 브랜딩으로 확고히 한다.
2. **Aha Moment 시각화**: "수업 종료 5분 후 교사가 3가지 인사이트 확인"이라는 Aha Moment가 브랜딩의 시각적/언어적 핵심 장면이 되어야 한다.
3. **문서 구조의 활용성**: 브랜딩 문서가 향후 UI 디자인, 발표 자료, 마케팅 카피에 직접 활용 가능해야 한다.

### Viable Options (실행 가능한 접근법)

#### Option A: 통합 단일 문서 방식
- 하나의 대형 브랜드 가이드 문서에 모든 요소를 포함
- 장점: 일관성 유지 용이, 단일 진실 공급원
- 단점: 길이가 과도해 활용성 저하, 특정 섹션만 참조하기 어려움

#### Option B: 모듈형 다중 문서 방식 (채택)
- 역할별로 분리된 문서 (아이덴티티, 후킹 전략, 톤앤매너 등)
- 장점: 역할별 참조 용이 (디자이너는 VI, 카피라이터는 톤앤매너), 병렬 작업 가능, 각 문서가 독립적으로 유용
- 단점: 문서 간 일관성 관리 필요 → .ai.md로 구조와 관계 명시하여 해소

#### Option A 기각 사유
통합 문서는 200줄 이상으로 비대해져 실무 활용성이 급격히 떨어진다. 브랜딩 실무에서는 디자이너, PM, 마케터가 각자 필요한 영역만 빠르게 참조하므로 모듈형이 표준 관행이다.

---

## Context

### 프로젝트 현황
- MirAI 프로젝트 기획 내용은 이슈 본문(00_issue.md)에 요약되어 있으며, `docs/background/`에 심층 리서치 존재
- **참고**: 이슈에서 참조한 `docs/whitepaper/project-plan.md`, `narrative-spine.md`, `research-supplement.md`는 레포에 미존재 (`docs/whitepaper/`에는 `.ai.md`와 `.gitkeep`만 있음)
- `docs/branding/` 디렉토리 자체가 미존재
- `docs/background/`에 경쟁사 분석(07), 솔루션 방향 검토(08, 11), 스타트업 리서치(09) 등 풍부한 리서치 자료 존재

### Primary Sources (실존 확인 완료)
| 문서 | 역할 | 비고 |
|------|------|------|
| `docs/work/active/000017-branding-research/00_issue.md` | 이슈 본문 — 기획서 핵심 내용(가치제안, GTM, VI 초안) 포함 | **모든 Step의 1차 소스** |
| `docs/background/03_contest-strategy.md` | 공모전 전략, 심사 기준, 수상작 분석 | |
| `docs/background/07_competitive-landscape.md` | 국내 경쟁사 6개 심층 분석 (BI/포지셔닝 데이터 포함) | |
| `docs/background/08_solution-direction-critical-review.md` | 솔루션 방향 + 7개 기능 후보, 관계 회복 프레이밍 | |
| `docs/background/09_startup-product-research.md` | ClassDojo/Gradescope PLG 패턴 분석 | |
| `docs/background/11_solution-rethink-proposal.md` | 솔루션 재검토, "프레이밍 ≠ 기능" 비판, 60초 피드백 루프 최종 추천 | |

### Fallback 정책 (미존재 참조 자료)
이슈 본문(00_issue.md)의 "참조 자료" 섹션에서 언급된 아래 3개 파일은 레포에 존재하지 않는다:
- `docs/whitepaper/project-plan.md` → **fallback**: `00_issue.md` (기획서 핵심 내용 요약 포함) + `docs/background/08` (기능/가치제안)
- `docs/whitepaper/narrative-spine.md` → **fallback**: `00_issue.md`의 "Emotional Touch" 섹션 + `docs/background/11` 파트C (핵심 재정의: "60초 피드백 루프" 서사)
- `docs/whitepaper/research-supplement.md` → **fallback**: `docs/background/07` (경쟁사) + `docs/background/09` (스타트업 리서치)

---

## Work Objectives

1. `docs/branding/` 디렉토리를 생성하고, 실무 수준 브랜딩 전략 문서 5종을 작성한다
2. 모든 문서에 실무 레퍼런스 출처를 포함한다
3. `docs/branding/.ai.md`를 작성하여 디렉토리 구조와 역할을 명시한다

---

## Guardrails

### Must Have
- 모든 브랜딩 주장에 출처 명시 (조사 규칙 준수)
- 이슈 본문(00_issue.md) + 실존 background 문서와의 정합성
- EdTech 브랜딩 실무 레퍼런스 최소 5개 이상 (ClassDojo, Duolingo, Notion, Kahoot 등)
- 경쟁사 BI 비교 분석 포함
- 공모전 창의성 심사 기준과의 연결
- "관계 회복" 프레이밍에 대한 명시적 입장 정립 (원칙 3번 구체화)

### Must NOT Have
- 근거 없는 주장이나 허구적 데이터
- 코드 구현 (이 이슈는 리서치/문서 작업)
- 기존 리서치와 모순되는 내용
- 일반적인 브랜딩 이론 나열 (MirAI 맥락에 특화된 전략만)
- 미존재 파일(project-plan.md, narrative-spine.md, research-supplement.md)을 출처로 인용

---

## Task Flow (6 Steps)

### Step 0: 참조 문서 존재 확인 + Fallback 경로 확정

**목표**: 플랜에서 참조하는 모든 문서의 존재를 확인하고, 미존재 파일에 대한 fallback 소스를 확정한다.

**작업 내용**:
1. 이슈 본문(00_issue.md)의 "참조 자료" 목록에 나열된 파일들의 실존 여부 확인
2. `docs/whitepaper/` 디렉토리 내용 확인 → `.ai.md`와 `.gitkeep`만 존재함을 확인
3. 각 미존재 파일에 대해 위 "Fallback 정책" 표의 대체 소스 확정
4. 실존하는 Primary Sources 6개 문서를 모두 읽고, 브랜딩에 활용 가능한 핵심 데이터 식별

**수락 기준**:
- [ ] Primary Sources 6개 문서가 모두 실존하고 접근 가능함을 확인
- [ ] 미존재 파일 3개에 대한 fallback 소스가 확정되어 이후 Step에서 참조 가능
- [ ] 각 Primary Source에서 브랜딩 관련 핵심 데이터 포인트가 식별됨

**의존성**: 없음 (첫 단계)

---

### Step 1: 실무 브랜딩 레퍼런스 리서치 + 경쟁사 BI 분석

**목표**: EdTech 분야 브랜딩 성공 사례와 경쟁사 BI를 조사하여 브랜딩 전략의 근거 데이터를 확보한다.

**타겟 파일**: `docs/branding/00_branding-research.md`

**기존 리서치와의 관계**:
- `docs/background/07_competitive-landscape.md` → **[계승+보완]** 국내 경쟁사 6개 데이터를 브랜딩 관점으로 재분석 (로고/톤/포지셔닝/색상/태그라인 추출). 기존 07의 기능 비교 데이터는 그대로 참조하되, BI 요소를 새로 분석.
- `docs/background/09_startup-product-research.md` → **[계승]** ClassDojo/Gradescope PLG 패턴을 브랜딩 성공 요인 관점에서 재해석. 기존 분석 내용을 브랜딩 섹션에 인용.

**내용 구성**:
1. **[계승+보완] 국내 경쟁사 BI 재분석** (07 문서 기반)
   - 클래스팅, 아이스크림홈런, 클래스카드, 매쓰플랫 등: 컬러, 로고, 태그라인, 톤, 포지셔닝 분석
   - 07 문서의 경쟁사 데이터를 BI 비교표로 재구성
   - 각 경쟁사의 브랜드 포지셔닝 맵핑 (감성적-기능적 / 교사중심-학생중심 축)
2. **[신규] EdTech 브랜딩 성공 사례 분석** (5개 이상, 글로벌)
   - ClassDojo: "긍정 강화" 브랜딩, 귀여운 몬스터 캐릭터, 교사-학부모 연결 내러티브
   - Duolingo: 게이미피케이션 브랜딩, Duo 캐릭터, 앱 아이콘 전략
   - Notion: "올인원 워크스페이스" 미니멀 브랜딩, 커뮤니티 중심 성장
   - Kahoot: 보라+노란 컬러 브랜딩, "게임으로 배운다" 포지셔닝
   - Canva: "디자인 민주화" 브랜딩, 따뜻하면서 전문적인 톤
3. **[신규] 국제 경쟁사 BI 분석**
   - Khanmigo, Century Tech 등
4. **[신규] 브랜딩 갭 분석**: "어떤 포지셔닝이 비어있는가"
   - 국내외 경쟁사 포지셔닝 맵에서 MirAI가 선점 가능한 빈 영역 도출

**수락 기준**:
- [ ] EdTech 브랜딩 사례 최소 5개, 각 사례별 브랜드 요소(컬러, 타이포, 톤, 내러티브) 분석 완료
- [ ] 국내 경쟁사 3개 이상의 BI 비교표 포함 (07 문서 데이터 기반 + 브랜딩 관점 보완)
- [ ] 모든 사례에 출처 URL 명시
- [ ] 브랜딩 갭 분석에서 MirAI가 선점할 포지셔닝 영역 도출
- [ ] 기존 리서치(07, 09)와의 관계가 [계승/보완/신규] 태그로 명시

**의존성**: Step 0 완료 후

---

### Step 2: 브랜드 아이덴티티 체계 수립

**목표**: MirAI의 브랜드 미션/비전/퍼스널리티/키워드/스토리를 실무 수준으로 체계화하고, "관계 회복" 프레이밍에 대한 명시적 입장을 정립한다.

**타겟 파일**: `docs/branding/01_brand-identity.md`

**기존 리서치와의 관계**:
- `docs/work/active/000017-branding-research/00_issue.md` → **[계승]** 이슈 본문의 가치제안, Emotional Touch, GTM 방향을 Brand Core로 체계화
- `docs/background/08_solution-direction-critical-review.md` → **[계승]** 7개 기능 후보와 관계 회복 프레이밍을 브랜드 내러티브로 번역
- `docs/background/11_solution-rethink-proposal.md` → **[보완]** "프레이밍 ≠ 기능" 비판을 수용하여, 브랜딩에서의 관계 회복 위치를 재정의

**내용 구성**:
1. Brand Core
   - Mission: MirAI가 왜 존재하는가
   - Vision: MirAI가 그리는 교육의 미래
   - Brand Personality: 의인화 속성 (예: 따뜻한 동료 교사, 정확한 AI 비서)
   - Core Values: 3~5개 핵심 가치
2. **프레이밍 비판 대응: "관계 회복"의 브랜딩 위치 정립**
   - 11_solution-rethink-proposal의 핵심 비판 요약: "프레이밍(관계 회복) ≠ 기능(데이터 수집/집계)" (라인 52~58)
   - **MirAI 브랜딩의 명시적 입장**: 관계 회복은 브랜드의 **상위 포지셔닝**(Why)으로 유지한다. 단, 기능적 Hook은 "시간 절약"과 "60초 피드백 루프"로 구체화한다(What). 이는 원칙 3번 "감성과 기능의 이중 구조"를 실현하는 구조이다.
   - 논리적 연결: Why(관계 회복) → How(60초 피드백 루프) → What(시간 절약 + AI 인사이트)
   - 11 문서의 최종 추천(라인 180~185): "교사와 학생이 수업 직후 서로를 비추는 60초 피드백 루프"를 브랜드 스토리의 핵심 장면으로 채택
3. Brand Story (00_issue.md + 11 문서 파트C 기반 — narrative-spine.md 미존재 대체)
   - Origin Story: "교사-학생 사이의 끊어진 피드백 루프" 문제 발견
   - Hero's Journey: 교사가 MirAI를 만나 변화하는 여정
   - Emotional Arc: 공감 → 발견 → 변화 → 성취
   - **핵심 장면**: "수업 종료 60초 후, AI가 신호를 읽고 다음 수업을 바꾼다" (11 문서 라인 185)
4. Brand Keywords
   - 핵심 키워드 5~7개 (예: 거울, 연결, 회복, 60초, 인사이트)
   - 금지 키워드 (예: 감시, 대체, 자동화만)
5. Brand Positioning Statement
   - For/Who/That/Unlike 프레임워크
   - 경쟁사 대비 차별화 매트릭스
6. Brand Architecture
   - 네이밍 체계: MirAI (브랜드명) + 기능별 서브네이밍

**수락 기준**:
- [ ] Mission/Vision/Personality/Values가 각각 명확히 정의됨
- [ ] Brand Story가 Emotional Arc (공감→발견→변화→성취)를 포함
- [ ] Positioning Statement가 For/Who/That/Unlike 형식으로 완성
- [ ] "프레이밍 비판 대응" 섹션이 포함되어 관계 회복의 브랜딩 위치가 명시적으로 정립됨
- [ ] 이슈 본문(00_issue.md) + docs/background/08, 11 문서와 정합성 확인
- [ ] Brand Keywords의 핵심/금지 키워드가 명확히 정의됨 (Step 5 검증의 기준선)

**의존성**: Step 1의 브랜딩 갭 분석 결과

---

### Step 3: 후킹 포인트 & Aha Moment 전략

**목표**: "시간 절약이 Hook, 관계 회복이 Positioning"을 시각적/언어적으로 구체화하고, Aha Moment를 브랜딩 장면으로 설계한다.

**타겟 파일**: `docs/branding/02_hooking-and-aha-moment.md`

**기존 리서치와의 관계**:
- `docs/background/09_startup-product-research.md` → **[계승]** ClassDojo PLG 패턴 ("교사가 시간 절약으로 채택 → 관계 회복으로 충성")을 MirAI 후킹 전략에 적용
- `docs/background/11_solution-rethink-proposal.md` → **[계승]** "60초 피드백 루프" + "수업 직후 AI가 다음 수업을 바꾼다" 장면을 Aha Moment의 핵심으로 채택
- `docs/background/03_contest-strategy.md` → **[보완]** 공모전 발표에서의 Aha Moment 연출 방법

**내용 구성**:
1. Hooking Point 전략
   - Hook 1 (기능적): "60초 안에 수업 인사이트" — 시간 절약 수치 기반
   - Hook 2 (감성적): "수업의 거울" — 관계 회복 내러티브 기반
   - Hook 3 (사회적): "교사를 위한 파트너" — 교권 회복 맥락
   - 각 Hook별: 헤드라인 카피 3안, 서브카피, 비주얼 방향
2. Emotional Touch 전략
   - 감성 접점 맵: 교사의 하루 타임라인에서 MirAI가 터치하는 순간
   - Pain → Gain 전환점: "채점 6시간 → 교사 임팩트 리포트 5분"
   - Emotional Branding 프레임워크: 어떤 감정을 유발하고 어떤 감정을 해소하는가
3. Aha Moment 시각화 전략
   - 핵심 장면: "수업 종료 5분 후, 교사가 대시보드에서 '오늘의 3가지 인사이트' 확인"
   - Before/After 시각화 시나리오
   - Aha Moment까지의 사용자 여정 (첫 접속 → 수업 연동 → 리포트 확인)
   - 발표/데모 시나리오에서의 Aha Moment 연출 방법
4. ClassDojo Pattern 적용
   - "교사가 시간 절약으로 채택 → 관계 회복으로 충성" 패턴을 MirAI에 적용
   - 09_startup-product-research.md의 PLG/교사 온보딩 인사이트 반영

**수락 기준**:
- [ ] 기능적/감성적/사회적 후킹 포인트가 각각 헤드라인 카피와 함께 정의됨
- [ ] Aha Moment 시각화 시나리오가 Before/After 구조로 완성
- [ ] Emotional Touch 전략이 교사의 하루 타임라인과 매핑됨
- [ ] 09_startup-product-research.md의 PLG 패턴과 정합
- [ ] 이슈 본문(00_issue.md) + docs/background/03, 09, 11 문서와 정합성 확인

**의존성**: Step 2의 Brand Positioning

---

### Step 4: 톤앤매너 & 비주얼 아이덴티티 가이드

**목표**: 카피 톤, 컬러 팔레트, 타이포그래피, 아이콘 스타일을 실무 활용 가능한 수준으로 정의한다.

**타겟 파일**: `docs/branding/03_tone-and-visual-guide.md`

**기존 리서치와의 관계**:
- `docs/work/active/000017-branding-research/00_issue.md` → **[계승]** 이슈 본문의 VI 초안 방향 (네이비 블루, 라이트 퍼플, 코랄)을 출발점으로 활용
- `docs/background/07_competitive-landscape.md` → **[보완]** 경쟁사 컬러/톤 분석 결과를 차별화 근거로 활용

**VI 컬러 팔레트 유연성 정책**:
- 이슈 본문에서 제시한 "네이비 블루 + 라이트 퍼플 + 코랄"은 **초안 방향(Draft Direction)**이지 확정값이 아니다
- Step 1의 경쟁사 BI 분석 결과에 따라 변경 가능한 범위:
  - **고정**: Primary 컬러 계열은 블루 계열 유지 (신뢰/전문성 연상 — EdTech 표준)
  - **조정 가능**: 블루의 정확한 톤(네이비 vs 로얄 vs 인디고), Secondary/Accent 컬러의 색상과 채도
  - **변경 가능**: Accent 컬러(코랄)는 경쟁사 분석에서 차별화가 더 나은 대안이 발견되면 교체 가능
- Step 1 리서치에서 경쟁사와의 컬러 충돌이 발견되면, 대안 컬러를 함께 제시하고 비교 근거를 명시한다

**내용 구성**:
1. Tone of Voice
   - 톤 스펙트럼: [전문적 ←→ 캐주얼], [따뜻한 ←→ 차가운] 에서 MirAI의 위치
   - Do/Don't 카피 예시 (10쌍 이상)
   - 상황별 톤 변화: 온보딩, 리포트, 알림, 에러 메시지
   - 한글/영문 카피 원칙
2. 컬러 팔레트
   - Primary: 블루 계열(신뢰) + 퍼플 계열(AI 세련됨) — HEX/RGB 값, 초안 vs 확정 상태 명시
   - Secondary: Accent 컬러(관계 온기) — HEX/RGB 값
   - 시맨틱 컬러: Success, Warning, Error, Info
   - 컬러 사용 비율 가이드 (60-30-10 법칙)
   - 접근성: WCAG 2.1 AA 기준 대비율 확인
   - **경쟁사 컬러 차별화 근거** (Step 1 BI 분석 결과 기반)
3. 타이포그래피
   - Pretendard(한글) / Inter(영문) — weight 사용 가이드
   - Heading/Body/Caption 계층 구조
   - 줄간격/자간 기본값
4. 아이콘 & 일러스트레이션
   - 거울 모티프 + 대화 버블 — 아이콘 스타일 방향
   - 라인/필 스타일, 라운드니스, 스트로크 두께
   - 일러스트레이션 무드: 따뜻하되 프로페셔널
5. UI 무드보드 방향
   - 참조 서비스 3~5개 (컬러/레이아웃/톤 유사 서비스)
   - MirAI UI의 시각적 방향성 키워드

**수락 기준**:
- [ ] 컬러 팔레트가 HEX 값과 함께 정의되고 사용 비율 가이드 포함
- [ ] 컬러의 확정/초안 상태가 명시되고, 경쟁사 차별화 근거가 포함됨
- [ ] 톤 Do/Don't 예시가 10쌍 이상 작성
- [ ] 타이포그래피 계층 구조(Heading/Body/Caption)가 정의됨
- [ ] 이슈 본문(00_issue.md)의 VI 방향과 정합성 확인 (변경 시 근거 명시)

**의존성**: Step 2의 Brand Personality

---

### Step 5: .ai.md 작성 + 문서 정합성 검증

**목표**: `docs/branding/.ai.md`를 작성하고, 전체 브랜딩 문서의 상호 정합성을 검증한다.

**타겟 파일**: `docs/branding/.ai.md`

**기존 리서치와의 관계**:
- 전체 background 문서 → **[검증]** 최종 정합성 확인

**내용 구성**:
1. 디렉토리 목적 설명
2. 파일 구조 및 각 문서의 역할
3. 참조 관계 (어떤 문서가 어떤 문서를 참조하는지)
4. 규칙 (출처 필수, 팩트 기반 등)

**정합성 검증 체크리스트** (구체화):

#### A. 용어 일관성 검증
- [ ] Brand Keywords(Step 2): 핵심 키워드 5~7개가 4개 브랜딩 문서(00~03) 전체에서 일관되게 사용되는가
- [ ] Brand Keywords(Step 2): 금지 키워드가 4개 문서 어디에도 등장하지 않는가
- [ ] "관계 회복"이 모든 문서에서 "상위 포지셔닝(Why)"으로만 사용되고, "기능 설명(What)"으로 혼동 사용되지 않는가

#### B. 비주얼 일관성 검증
- [ ] 컬러 명칭과 HEX 값이 03 문서에서 정의한 것과 다른 문서에서 언급 시 동일하게 표기되는가
- [ ] 톤앤매너(03 문서)의 Do/Don't 기준이 02 문서의 카피 예시와 일치하는가

#### C. 전략 일관성 검증
- [ ] Positioning Statement(01 문서)의 For/Who/That/Unlike가 02 문서의 Hook과 논리적으로 정합하는가
- [ ] Aha Moment(02 문서)의 핵심 장면이 03 문서의 비주얼 방향과 일관되는가
- [ ] 공모전 심사 기준(03_contest-strategy.md)과의 연결이 문서 전체에서 유지되는가

#### D. 출처 정합성 검증
- [ ] 미존재 파일(project-plan.md, narrative-spine.md, research-supplement.md)이 출처로 인용되지 않았는가
- [ ] 모든 외부 레퍼런스에 URL 또는 문서 경로가 명시되어 있는가

**추가 작업**:
- `docs/ai-report/daily-log.md`에 AI 활용 내역 기록 (불변식 1번)

**수락 기준**:
- [ ] `.ai.md`에 디렉토리 구조, 각 문서 역할, 참조 관계가 명시됨
- [ ] 기존 `.ai.md` 포맷(목적/구조/규칙)과 일관된 형식
- [ ] 위 정합성 검증 체크리스트 A~D 항목 모두 통과
- [ ] `docs/ai-report/daily-log.md` 업데이트 완료

**의존성**: Step 1~4 모두 완료 후

---

## 최종 파일 구조

```
docs/branding/
  .ai.md                          ← 디렉토리 메타 (Step 5)
  00_branding-research.md         ← 레퍼런스 리서치 + 경쟁사 BI (Step 1)
  01_brand-identity.md            ← 브랜드 아이덴티티 체계 (Step 2)
  02_hooking-and-aha-moment.md    ← 후킹 포인트 + Aha Moment (Step 3)
  03_tone-and-visual-guide.md     ← 톤앤매너 + VI 가이드 (Step 4)
```

---

## 실행 순서 및 의존성

```
Step 0 (참조 확인) → Step 1 (리서치) → Step 2 (아이덴티티) → Step 3 (후킹/Aha)
                                                            ↘
                                                             Step 4 (톤/VI)
                                                              ↓
                                                            Step 5 (.ai.md + 검증)
```

- Step 0은 최선행: 참조 문서 존재 확인 및 fallback 확정
- Step 1은 Step 0 이후 독립적으로 진행
- Step 2는 Step 1의 갭 분석 결과 필요
- Step 3, 4는 Step 2 완료 후 병렬 가능
- Step 5는 전체 완료 후

---

## 리서치 방법론

### 조사 대상
1. **EdTech 브랜딩 사례**: ClassDojo, Duolingo, Notion, Kahoot, Canva — 공식 사이트, 브랜드 가이드라인, 프레스킷
2. **경쟁사 BI**: 클래스팅, 아이스크림홈런, 클래스카드, Khanmigo — 공식 사이트, 앱 스토어, 프레스 자료
3. **교육 분야 Emotional Branding**: 학술 논문 및 사례 연구
4. **UI/브랜딩 레퍼런스**: Dribbble, Behance에서 EdTech 카테고리

### 출처 기준
- 공식 사이트 > 프레스 기사 > 블로그/커뮤니티 순으로 우선
- 작성일이 2023년 이후인 자료 우선
- 모든 주장에 URL 또는 문서 참조 필수

---

## Success Criteria

1. `docs/branding/` 아래 4개 전략 문서 + 1개 .ai.md가 작성됨
2. 각 문서가 해당 Step의 수락 기준을 모두 충족
3. 실무 브랜딩 레퍼런스 5개 이상의 출처가 문서에 포함
4. 경쟁사 BI 비교 분석 포함 (국내 3개 이상)
5. 이슈 본문(00_issue.md) 및 실존 background 문서와 모순 없음
6. "관계 회복" 프레이밍에 대한 명시적 입장이 01_brand-identity.md에 정립됨
7. Step 5 정합성 검증 체크리스트 A~D 모두 통과
8. `daily-log.md` AI 활용 내역 기록 완료

---

## ADR (Architecture Decision Record)

### Decision
모듈형 다중 문서 방식으로 `docs/branding/` 아래 4개 전략 문서를 작성한다. 참조 자료는 실존 문서(00_issue.md + background 6개)만 사용하고, 미존재 파일에는 명시적 fallback을 적용한다.

### Drivers
1. 실무 활용성: 디자이너/PM/마케터가 각자 필요한 문서만 참조
2. 병렬 작업: Step 3, 4를 동시에 진행 가능
3. 유지보수: 개별 문서 단위로 업데이트 가능
4. 출처 신뢰성: 미존재 파일 참조를 방지하여 팩트 기반 원칙 준수

### Alternatives Considered
- **통합 단일 문서**: 200줄 이상 비대, 실무 참조 어려움 → 기각
- **기획서에 직접 추가**: project-plan.md가 레포에 미존재하며, 이슈 본문에 추가하는 것은 이슈 관리 원칙에 부적합 → 기각

### Why Chosen
EdTech 브랜딩 실무에서 모듈형 브랜드 가이드가 표준이며, 각 문서가 독립적으로 유용하면서도 .ai.md를 통해 전체 구조를 파악할 수 있다. 실존 문서만 참조함으로써 팩트 기반 원칙을 엄격히 준수한다.

### Consequences
- 문서 간 일관성 관리에 주의 필요 (Step 5에서 구체적 체크리스트로 검증)
- .ai.md가 구조와 참조 관계의 핵심 허브 역할
- 향후 project-plan.md가 레포에 추가되면 참조 관계 업데이트 필요

### Follow-ups
- UI 구현 시 03_tone-and-visual-guide.md를 디자인 시스템으로 발전
- 발표 자료 제작 시 02_hooking-and-aha-moment.md를 스토리보드로 활용
- docs/whitepaper/ 문서가 추가되면 브랜딩 문서의 참조 관계 업데이트
