# chore: docs/branding 실무 수준 브랜딩 전략 리서치 및 기획

## 목적
기획서(project-plan.md)와 리서치 자료를 기반으로, 해커톤 수준을 넘어선 실무적 브랜딩 전략을 수립한다. MirAI의 핵심 가치인 "교사-학생 사이의 끊어진 피드백 루프를 AI로 복원"이라는 Emotional Touch를 브랜딩 전략 전반에 녹여, 후킹 포인트와 Aha Moment를 브랜딩 기획자/디자이너 관점에서 체계화한다.

## 배경
- #15 에서 MirAI 프로젝트 기획서(project-plan.md, 1,451줄)가 완성됨
- 기획서 ch11(GTM 전략)에 브랜딩 초안(네이밍, 태그라인, VI 방향)이 있으나 실무 수준에 미달
- 공모전 심사 기준 "창의성" 항목에서 브랜딩 품질이 직접적으로 영향
- 실무 브랜딩 기획자/디자이너 관점의 깊이 있는 전략이 필요

## 완료 기준
- [x] `docs/branding/` 디렉토리에 실무 수준 브랜딩 전략 문서가 작성되어 있다 (브랜드 아이덴티티, 후킹 포인트, Emotional Touch 전략, Aha Moment 시각화 전략, 톤앤매너 가이드 포함)
- [x] 모든 브랜딩 전략은 기획서(project-plan.md) + 리서치 자료(docs/background/, research-supplement.md)에 근거하며, 실무 브랜딩 레퍼런스(경쟁사 BI, EdTech 브랜딩 사례) 조사 결과가 출처와 함께 포함되어 있다
- [x] `docs/branding/.ai.md`가 최신화되어 있다

## 구현 플랜
1. 실무 브랜딩 레퍼런스 조사 — EdTech 브랜딩 성공 사례(ClassDojo, Notion, Duolingo 등), 경쟁사 BI 분석, 교육 분야 Emotional Branding 논문/자료 수집
2. MirAI 브랜드 아이덴티티 체계화 — 브랜드 미션/비전/퍼스널리티, 핵심 키워드, 브랜드 스토리(narrative-spine.md 기반)
3. 후킹 포인트 & Aha Moment 전략 — "시간 절약이 Hook, 관계 회복이 Positioning"을 시각적/언어적으로 구체화, 첫 5분 경험 설계
4. 톤앤매너 & 비주얼 가이드 — 컬러 팔레트, 타이포그래피, 아이콘 스타일, 카피 톤(따뜻하면서 전문적), UI 무드보드 방향
5. `docs/branding/.ai.md` 작성

## 참조 자료
- `docs/whitepaper/project-plan.md` — ch6(가치제안+Aha Moment), ch11(GTM 전략)
- `docs/whitepaper/narrative-spine.md` — 핵심 줄기 (Emotional Touch 근원)
- `docs/whitepaper/research-supplement.md` — 경쟁사/시장 데이터
- `docs/background/03_contest-strategy.md` — 창의성 심사 기준
- `docs/background/08_solution-direction-critical-review.md` — 7개 기능 후보의 관계 회복 프레이밍

## 개발 체크리스트
- [ ] 해당 디렉토리 .ai.md 최신화

## 작업 내역

### 2026-04-08

**현황**: 3/3 완료
**완료된 항목**:
- (없음)
**미완료 항목**:
- `docs/branding/` 브랜딩 전략 문서 작성
- 실무 레퍼런스 출처 포함
- `docs/branding/.ai.md` 최신화
**주요 진행사항**:
- ralplan 합의 기반 플랜 작성 완료 (Planner → Architect → Critic, 2회 반복)
- 핵심 결정: 모듈형 4문서 구조, 미존재 참조 파일(project-plan.md 등) fallback 정책 수립
- "관계 회복" 프레이밍 비판(11번 문서) 대응 입장 정립: Why(관계 회복)→How(60초 피드백)→What(시간 절약)
- backlog-issue.md에 프로젝트 보드 Backlog 자동 이동 기능 추가
