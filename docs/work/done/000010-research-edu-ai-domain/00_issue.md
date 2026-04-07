# chore: 리서치 — AI 교육 솔루션 공모전 도메인 전체 조사

## 목적
공모전(AI활용 차세대 교육 솔루션) 기획에 필요한 전 도메인을 체계적으로 리서치하여 솔루션 설계의 근거 자료를 확보한다.

## 배경
- 공모전 핵심 방향: 교육 현장 구성원(교강사, 수강생, 운영자)의 실질적 문제를 AI로 해결
- 단순 LMS 구축이 아닌 날카로운 문제 해결 지향
- 심사 기준: 기술적 완성도, AI 활용 능력, 기획력 및 실무 접합성, 창의성
- 개발 기간 1주(04/06~04/13), 라이브 배포 URL 필수

## 완료 기준

### 1. 교육 현장 페인 포인트 조사
- [x] 교강사 관점 페인 포인트 최소 5개 정리 (출처 포함)
- [x] 수강생 관점 페인 포인트 최소 5개 정리 (출처 포함)
- [x] 운영자 관점 페인 포인트 최소 5개 정리 (출처 포함)
- [x] 각 페인 포인트별 AI 해결 가능 여부 평가
- [x] → `docs/background/01_education-pain-points.md`

### 2. AI 교육 솔루션 시장 현황 및 트렌드
- [x] 국내외 주요 AI 교육 솔루션 최소 10개 조사 (기능, 대상, 특징)
- [x] 솔루션 유형별 분류 (개인 튜터링, 콘텐츠 생성, 학습 분석, 운영 자동화 등)
- [x] 각 솔루션의 한계점·미충족 니즈 정리
- [x] 2024~2026 AI 교육 트렌드 키워드 정리
- [x] 차별화 가능 영역 도출
- [x] → `docs/background/02_ai-edu-market-trends.md`

### 3. 공모전 심사 기준별 수상 전략 및 유사 수상작 분석
- [x] 심사 기준 4개 항목별 예상 평가 포인트 분석
- [x] 유사 AI/에듀테크 공모전 수상작 최소 5개 사례 분석
- [x] 수상작 공통 성공 요인 도출
- [x] 심사 기준별 우리 프로젝트 대응 전략 초안
- [x] → `docs/background/03_contest-strategy.md`

### 4. 1주 MVP 기술 스택 및 무료 배포 인프라 선정
- [x] 프론트엔드 프레임워크 후보 비교 (최소 3개)
- [x] 백엔드/서버리스 후보 비교 (최소 3개)
- [x] AI API 연동 방식 비교 (OpenAI, Claude 등)
- [x] 무료 배포 플랫폼 비교 (Vercel, Netlify, Railway 등)
- [x] API Key 보안 처리 방안 정리
- [x] 최종 추천 스택 조합 및 근거
- [x] → `docs/background/04_tech-stack-deploy.md`

### 5. AI 리포트 및 기획문서 작성 전략
- [x] AI 리포트 첨부 양식 분석 및 작성 가이드 정리
- [x] AI 활용 과정 문서화 방법론 조사
- [x] 기획문서 구성 요소 및 모범 사례 조사
- [x] 우리 프로젝트에 적용할 문서화 전략 초안
- [x] → `docs/background/05_report-doc-strategy.md`

## 구현 플랜
1. 5개 도메인별 웹 리서치 (학술자료, 보고서, 뉴스, 블로그, GitHub)
2. 각 도메인별 `docs/background/` 하위 마크다운 파일 작성
3. 모든 문서 하단에 출처 명시
4. 리서치 결과를 종합하여 솔루션 방향성 제안

## 개발 체크리스트
- [x] `docs/background/.ai.md` 최신화


## 작업 내역

### 2026-04-07

**현황**: 28/28 완료
**완료된 항목**:
- 교육 현장 페인 포인트 조사 (5/5) → `01_education-pain-points.md`
- AI 교육 솔루션 시장 현황 및 트렌드 (6/6) → `02_ai-edu-market-trends.md`
- 공모전 심사 기준별 수상 전략 (5/5) → `03_contest-strategy.md`
- 1주 MVP 기술 스택 및 배포 인프라 (7/7) → `04_tech-stack-deploy.md`
- AI 리포트 및 기획문서 작성 전략 (5/5) → `05_report-doc-strategy.md`
- 추가 리서치: `06_education-ecosystem-expansion.md`, `07_competitive-landscape.md`, `08_solution-direction-critical-review.md`
- `docs/background/.ai.md` 최신화
- 솔루션 방향 재검토 (팀 리서치 3명 병렬):
  - `09_startup-product-research.md` — 성공/실패 에듀테크 PMF 분석
  - `10_academic-evidence-research.md` — 학술 증거 (Passive LA, 이탈 예측 96.3%)
  - `11_solution-rethink-proposal.md` — 현재 제안 결함 분석 + 대안 4가지 + 최종 추천
**미완료 항목**:
- 없음
**변경 파일**: 14개
