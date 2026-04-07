# AI 리포트 및 기획문서 작성 전략

> 작성일: 2026-04-07
> 담당: researcher-1
> 목적: KIT 바이브코딩 공모전 제출물 — AI 리포트 및 기획문서 작성 전략 수립

---

## 1. 공모전 제출물 요구사항 분석

### 1-1. 필수 제출물 (kit-vibe-contest-guide.md 기준)

| 제출물 | 형태 | 핵심 요건 |
|--------|------|-----------|
| GitHub 저장소 | Public URL | API Key 노출 금지, 04/13 이후 커밋 금지 |
| 배포 라이브 URL | 웹 주소 | 실제 동작하는 서비스 |
| **AI 리포트** | **PDF (첨부 양식)** | **AI 활용 과정 문서화** |
| 개인정보 동의서 + 참가 각서 | PDF | 서명 완료 |

### 1-2. 가점 요소 (심사 가점)

> 공모전 가이드라인 명시: "기획문서, 지침서 등을 프로젝트에 포함 권장"

- 기획문서 (PRD, 기능명세서)
- 지침서 (AI 활용 지침, 개발 가이드)
- 이 두 가지는 GitHub 저장소 내에 포함하거나 제출물에 첨부하는 방식으로 제공

### 1-3. 심사 기준 (4대 항목)

| 순위 | 심사 항목 | 해석 |
|------|----------|------|
| 1 | 기술적 완성도 | 실제 동작하는 서비스, 버그 없는 구현 |
| 2 | AI 활용 능력 및 효율성 | AI를 얼마나 전략적으로, 효율적으로 활용했는가 |
| 3 | 기획력 및 실무 접합성 | 현실 문제를 해결하는 논리적 기획, 실제 적용 가능성 |
| 4 | 창의성 | 차별화된 접근, 독창적 아이디어 |

---

## 2. AI 리포트 첨부 양식 분석 및 작성 가이드

### 2-1. AI 리포트의 목적

AI 리포트는 단순한 "어떤 AI 툴을 썼나" 기록이 아니라, **AI와 협업하는 능력**을 증명하는 문서다. 심사 기준 2번(AI 활용 능력 및 효율성)에 직결된다.

### 2-2. AI 리포트 권장 구성 (첨부 양식 기반 일반 원칙)

AI 활용 공모전의 일반적 리포트 양식과 유사 공모전 사례를 바탕으로 아래 구성을 권장한다:

```
[AI 리포트 구성]

1. AI 활용 개요
   - 사용한 AI 도구 목록 (모델명, 버전, 용도)
   - 전체 개발 과정에서 AI가 기여한 비율 및 역할

2. 기획 단계 AI 활용
   - 문제 정의 및 페인포인트 도출 시 AI 활용 내역
   - 솔루션 아이디어 발산·수렴 프로세스
   - 주요 프롬프트 예시 (핵심 3~5개)

3. 설계 단계 AI 활용
   - 아키텍처 설계 시 AI 조언 활용 내역
   - UI/UX 설계 및 사용자 시나리오 작성 시 AI 역할
   - 기술 스택 선정 의사결정 과정

4. 개발 단계 AI 활용
   - 코드 생성·리뷰·디버깅에 AI 활용 내역
   - 핵심 기능별 AI 기여도
   - 인간의 검토·수정이 이루어진 부분 명시

5. 테스트 및 개선 단계 AI 활용
   - 테스트 케이스 생성
   - 버그 수정 과정에서 AI 활용
   - 사용자 피드백 반영 시 AI 지원

6. AI 협업 성찰
   - 가장 효과적이었던 AI 활용 사례
   - AI 한계로 인해 인간이 직접 해결한 부분
   - 팀 내 AI 활용 역량 향상 사례
```

### 2-3. AI 리포트 작성 핵심 원칙

**원칙 1: 과정 중심으로 작성한다**

결과물만 나열하지 말고, AI와 어떻게 대화하고 협업해왔는지를 보여줘야 한다. 프롬프트 → AI 응답 → 인간 검토 → 수정 → 최종 반영의 흐름을 보여주는 것이 핵심이다.

출처: [2025 생성형 AI 공모전 — 스마트건설안전AI엑스포 가이드라인](https://smartconexpo.com/2025-generative-ai-contest/)

**원칙 2: 구체적 프롬프트를 첨부한다**

"ChatGPT로 기획했습니다"가 아니라, 실제 사용한 핵심 프롬프트와 그 결과물, 수정 과정을 보여준다. AI 기술이 전체 또는 주요 부분에 적용되었음을 증빙자료(프롬프트, 제작 과정 캡처 등)로 뒷받침해야 한다.

출처: [2024 AI 활용 아이디어 공모전 요강 — 콘테스트코리아](https://www.contestkorea.com/sub/view.php?int_gbn=1&Txt_bcode=030510001&str_no=202410210054)

**원칙 3: AI 기여도와 인간 기여도를 명확히 구분한다**

100% AI로 만든 것이 아님을 보여줘야 한다. AI 출력을 그대로 쓴 부분, 인간이 검토·수정·판단한 부분을 구분하면 심사위원에게 신뢰를 준다.

출처: [Using AI to write a PRD — ChatPRD](https://www.chatprd.ai/learn/using-ai-to-write-prd)

**원칙 4: 정량적 수치를 포함한다**

- "AI 덕분에 개발 속도 X배 향상"
- "AI 자동 생성 후 인간 검토로 Y% 품질 개선"
- "총 N개의 프롬프트 사이클을 통해 기능 구현"

---

## 3. AI 활용 과정 문서화 방법론

### 3-1. 실시간 기록 원칙

개발 기간(04/06~04/13) 동안 AI 활용 내역을 **매일 로그로 기록**한다. 사후에 재구성하면 디테일이 빠진다.

권장 도구:
- `.omc/notepad.md` 또는 `docs/work/active/` 폴더에 일일 AI 활용 로그 작성
- 주요 프롬프트는 `docs/ai-prompts/` 폴더에 별도 보관
- 스크린샷/캡처는 `docs/ai-screenshots/` 에 저장

### 3-2. 문서화 템플릿 (일일 AI 활용 로그)

```markdown
## [날짜] AI 활용 로그

### 사용 도구
- Claude Sonnet 4.6 (기획, 코드 리뷰)
- GitHub Copilot (코드 자동완성)
- [기타]

### 주요 프롬프트 및 결과

**프롬프트 1**: [프롬프트 내용]
- AI 응답 요약: [요약]
- 채택 여부: [채택/수정/기각]
- 수정 내용: [수정 사항]

### AI 기여 영역
- [기능명]: AI가 초안 생성 → 팀원이 [수정 내용] 적용

### 인간 주도 영역
- [내용]: AI 제안을 사용하지 않고 직접 결정한 이유
```

### 3-3. 핵심 캡처 시점

| 단계 | 캡처 대상 |
|------|----------|
| 기획 | 페인포인트 도출 프롬프트 + 응답 |
| 설계 | 아키텍처 다이어그램 생성 과정 |
| 개발 | 핵심 기능 코드 생성 프롬프트 |
| 테스트 | AI 버그 분석 + 수정 제안 |
| 최종 | AI 리포트 작성 시 활용한 프롬프트 |

---

## 4. 기획문서 구성 요소 및 모범 사례

### 4-1. 권장 기획문서 목차 (PRD 기반)

공모전 심사위원이 체크하는 핵심 5대 항목은 주제이해와 연관성, 창의성, 논리성, 실현성 및 기대효과, 완성도다. 기획문서는 이 5개 항목을 모두 커버해야 한다.

출처: [씽굿 — 기획공모전 당선으로 가는 노하우](https://www.thinkcontest.com/thinkgood/user/lab/strategy-statistics.do?mode=view&articleNo=1376)

```
[기획문서 권장 목차]

# [프로젝트명] 기획문서 v1.0

## 1. 프로젝트 개요
   - 한 줄 소개
   - 핵심 가치 제안 (Value Proposition)
   - 타겟 사용자

## 2. 문제 정의 (Why)
   - 교육 현장 페인포인트 (데이터·근거 포함)
   - 현재 해결책의 한계
   - 우리가 해결할 핵심 문제

## 3. 솔루션 (What)
   - 핵심 기능 3~5가지
   - 사용자 여정 (User Journey)
   - 화면 흐름 (User Flow)
   - 차별점 (기존 솔루션 대비)

## 4. AI 활용 전략 (How)
   - 어떤 AI 모델/기술을 어떻게 활용했는가
   - AI가 핵심 문제를 해결하는 방식
   - AI 윤리 및 개인정보 보호 고려사항

## 5. 기술 아키텍처
   - 시스템 구성도
   - 기술 스택 및 선정 이유
   - 데이터 흐름

## 6. 기능 명세 (Feature Spec)
   - 기능별 상세 요구사항
   - 우선순위 (P0/P1/P2)
   - 완성 기준 (Acceptance Criteria)

## 7. 성과 지표 (Success Metrics)
   - 핵심 KPI
   - 측정 방법
   - 목표치

## 8. 1주 개발 계획
   - 일별 마일스톤
   - 역할 분담

## 9. 기대 효과 및 확장 가능성
   - 단기 효과 (1주 MVP)
   - 중장기 확장 시나리오
   - 사회적 가치
```

### 4-2. 지침서 (AI 활용 지침) 구성

지침서는 별도 문서로 작성하여 GitHub 저장소의 `docs/` 폴더에 포함한다.

```
[AI 활용 지침서 권장 목차]

# AI 활용 지침서

## 1. 팀 내 AI 사용 원칙
   - 사용 승인된 AI 도구 목록
   - 금지 사항 (API Key 노출 등)
   - 코드 AI 생성 시 검토 프로세스

## 2. 프롬프트 엔지니어링 가이드
   - 효과적인 프롬프트 작성법
   - 역할 부여(Role Prompting) 활용
   - 체인 오브 쏫(Chain-of-Thought) 활용

## 3. AI 생성 코드 품질 관리
   - 코드 리뷰 체크리스트
   - 보안 취약점 검토 항목
   - 테스트 커버리지 기준

## 4. AI 협업 사례집
   - 기능별 AI 활용 성공 사례
   - 실패/기각 사례 및 교훈
```

---

## 5. 우리 프로젝트에 적용할 문서화 전략

### 5-1. 파일 구조 권장안

```
[GitHub 저장소 권장 구조]

/
├── README.md                    # 프로젝트 소개 + 라이브 URL
├── docs/
│   ├── planning/
│   │   ├── PRD.md              # 기획문서 (심사 가점)
│   │   └── user-flow.md        # 사용자 흐름도
│   ├── ai-usage/
│   │   ├── AI-REPORT.md        # AI 리포트 원본 (PDF 첨부 전 초안)
│   │   ├── ai-guidelines.md    # AI 활용 지침서 (심사 가점)
│   │   └── prompt-log.md       # 핵심 프롬프트 기록
│   └── architecture/
│       └── system-design.md    # 시스템 아키텍처
├── src/                        # 소스코드
└── .env.example                # API Key 샘플 (실제 Key 제외)
```

### 5-2. 심사 기준별 문서 대응 전략

| 심사 기준 | 대응 문서 | 핵심 메시지 |
|----------|----------|------------|
| 기술적 완성도 | README (동작 확인), GitHub 커밋 이력 | 실제 배포·동작하는 서비스 |
| AI 활용 능력 및 효율성 | AI 리포트 PDF, ai-guidelines.md, prompt-log.md | 전략적·체계적 AI 협업 |
| 기획력 및 실무 접합성 | PRD.md, education-pain-points.md 인용 | 데이터 기반 문제 정의 + 현실적 해결책 |
| 창의성 | PRD.md (차별점 섹션), README | 기존 솔루션과의 차별화 포인트 |

### 5-3. AI 리포트 PDF 작성 타임라인

| 날짜 | 작업 |
|------|------|
| 04/06~04/10 | 개발 과정 매일 AI 활용 로그 기록 |
| 04/11 | AI 리포트 초안 작성 (첨부 양식 기입) |
| 04/12 | 팀 내 검토 및 프롬프트 캡처 추가 |
| 04/13 오전 | 최종 PDF 변환 및 제출 준비 완료 |

---

## 6. 심사에서 가점을 받기 위한 추가 전략

### 6-1. 기획문서 차별화 포인트

1. **데이터 기반 문제 정의**: 단순 "교육이 힘들다"가 아니라, OECD TALIS 2024(행정업무 OECD 평균 2배), K-MOOC 완강률 13.1% 등 공신력 있는 통계를 인용한다.

2. **페르소나 3개 작성**: 교강사(박교수, 10년 경력), 수강생(김학생, 대학교 2학년), 운영자(이매니저, 교육기관 담당자)처럼 구체적인 페르소나를 만들어 각 페인포인트와 연결한다.

3. **Before/After 시나리오**: 우리 솔루션 도입 전/후 사용자 경험을 구체적 수치로 보여준다.

### 6-2. 기획공모전 수상작 패턴 분석

2023 공공분야 초거대 AI 활용사례 공모전 최우수상 수상작(챗봇을 활용한 전입직원 교육 효율화)의 공통 패턴:

- **명확한 문제 정의** → 현재 과정의 비효율을 수치로 제시
- **AI 기술 적용 지점 명확화** → AI가 어느 단계에서 무엇을 해결하는지 구체적
- **실현 가능성 강조** → 실제 동작하는 프로토타입 또는 데모
- **확장 가능성 제시** → 현재 MVP에서 미래 확장 시나리오까지

출처: [2023 공공분야 초거대 AI 활용사례·아이디어 공모전 수상작 — 소통24](https://sotong.go.kr/front/epilogue/epilogueRsltViewPage.do?bbs_id=60caf1aeb54b45748c80d1652e706438)

### 6-3. 심사위원 관점에서 피해야 할 것

심사위원들은 수많은 제안서를 보기 때문에 다음을 가장 싫어한다:

- **막연한 주장**: "AI로 교육을 혁신합니다" → 구체적으로 무엇을, 어떻게?
- **기술 나열**: "우리는 GPT-4, LangChain, RAG, 벡터DB를 썼습니다" → 왜 이 조합인가?
- **완성되지 않은 데모**: 실제로 작동하지 않는 서비스
- **출처 없는 통계**: "교사의 80%가 힘들어합니다" → 어느 조사인가?

출처: [씽굿 — 심사위원들이 심사할 때 꼭 체크하는 것](https://thinkcontest.com/thinkgood/user/lab/strategy-statistics.do?mode=view&articleNo=1611)

---

## 7. 다른 해커톤/공모전 우수 사례

### 사례 1: 강남구 AI 행정 혁신 공모전 최우수상

노코드 플랫폼과 생성형 AI를 활용한 현수막 관리 시스템 구축. 개발 지식이 없는 직원들이 ChatGPT를 통해 학습하며 직접 시스템을 만든 과정을 상세히 문서화하여 "AI 협업 과정"을 심사위원에게 설득력 있게 보여줬다.

핵심 교훈: AI 결과물보다 **AI와 협업한 과정**을 문서화하는 것이 더 중요하다.

출처: [강남구 공무원이 직접 나선 AI 행정 혁신…공모전 성과 공개](https://www.gangnam.go.kr/board/B_000031/1074453/view.do?mid=ID01_0313)

### 사례 2: 글로벌 AI 해커톤 우승 프로젝트 공통 패턴

25개 이상의 AI 해커톤 우승 프로젝트를 분석한 결과:

- **혁신 + 실제 영향 + 확장성**의 세 가지를 모두 갖춘 프로젝트가 우승
- 문서 품질이 코드 품질만큼 중요: 명확한 코딩 규칙, 잘 문서화된 아키텍처, 구조화된 가이드라인이 있는 팀이 더 좋은 AI 협업 코드를 생산
- 데모 영상/발표자료의 품질이 심사위원의 첫인상을 결정

출처: [25+ AI Hackathon Winning Projects 2025 — The New Views](https://thenewviews.com/ai-hackathon-winning-projects/), [From Judge to Judged — Medium](https://medium.com/@silverlong326/2-weeks-2-ai-hackathons-100-developers-c7d9933ba092)

---

## 8. 실행 체크리스트

### AI 리포트 체크리스트

- [ ] 사용한 AI 도구 전체 목록 작성
- [ ] 기획~배포 전 과정의 AI 활용 내역 기록
- [ ] 핵심 프롬프트 5개 이상 포함 (원문 또는 요약)
- [ ] AI 기여 vs 인간 기여 구분 명시
- [ ] 정량적 효율성 지표 포함 (시간 절약, 반복 횟수 등)
- [ ] 첨부 양식에 맞게 작성 후 PDF 변환

### 기획문서 체크리스트

- [ ] 데이터 기반 문제 정의 (출처 있는 통계 인용)
- [ ] 3개 이상의 핵심 기능 명세 (Acceptance Criteria 포함)
- [ ] 사용자 페르소나 + 사용자 시나리오
- [ ] AI 활용 지점 명확화
- [ ] Before/After 비교 또는 기대 효과 수치화
- [ ] GitHub `docs/` 폴더에 포함 확인

### 지침서 체크리스트

- [ ] AI 도구 사용 원칙 정의
- [ ] 프롬프트 엔지니어링 가이드 포함
- [ ] 코드 품질 관리 기준 명시
- [ ] GitHub `docs/` 폴더에 포함 확인

---

## 출처

- [KIT 바이브코딩 공모전 안내 — 공모전 운영 담당자 메일 (2026-04-07)](D:/project/kit-vibe-edu-ai/.worktree/000010-research-edu-ai-domain/docs/background/kit-vibe-contest-guide.md)
- [씽굿 — 기획공모전 당선으로 가는 노하우 완전정복](https://www.thinkcontest.com/thinkgood/user/lab/strategy-statistics.do?mode=view&articleNo=1376)
- [씽굿 — 심사위원들이 심사할 때 꼭 체크하는 것](https://thinkcontest.com/thinkgood/user/lab/strategy-statistics.do?mode=view&articleNo=1611)
- [씽굿 — 아하! 공모전 심사의 모든 것](https://thinkcontest.com/thinkgood/user/lab/strategy-statistics.do?mode=view&articleNo=2420)
- [초보자들을 위한 공모전 기획서 작성법 A to Z — 링커리어 커뮤니티](https://community.linkareer.com/strategy/666146)
- [공모전 아이디어 예시 — 실제 수상작과 실패없는 기획 방법 — 링커리어 커뮤니티](https://community.linkareer.com/employment_data/4186958)
- [2023 공공분야 초거대 AI 활용사례·아이디어 공모전 수상작 — 소통24](https://sotong.go.kr/front/epilogue/epilogueRsltViewPage.do?bbs_id=60caf1aeb54b45748c80d1652e706438)
- [강남구 공무원 AI 행정 혁신 공모전 성과 공개](https://www.gangnam.go.kr/board/B_000031/1074453/view.do?mid=ID01_0313)
- [25+ AI Hackathon Winning Projects 2025 — The New Views](https://thenewviews.com/ai-hackathon-winning-projects/)
- [From Judge to Judged: 2 AI Hackathons Dual Perspective — Medium](https://medium.com/@silverlong326/2-weeks-2-ai-hackathons-100-developers-c7d9933ba092)
- [Using AI to write a PRD — ChatPRD](https://www.chatprd.ai/learn/using-ai-to-write-prd)
- [A Proven AI PRD Template by Miqdad Jaffer (OpenAI) — Product Compass](https://www.productcompass.pm/p/ai-prd-template)
- [2024 AI 활용 아이디어 공모전 요강 — 콘테스트코리아](https://www.contestkorea.com/sub/view.php?int_gbn=1&Txt_bcode=030510001&str_no=202410210054)
- [2025 생성형 AI 공모전 — 스마트건설안전AI엑스포](https://smartconexpo.com/2025-generative-ai-contest/)
- [Hackathon Guide — hackathon.guide](https://hackathon.guide/)
