# chore: docs/specs/dev-spec 기술 개발 명세 및 MVP 구현 계획 작성

## 목적
기획서 확정 후, 일론 머스크 5단계 엔지니어링 원칙 기반으로 오버엔지니어링 없는 기능 위주 기술 개발 명세를 작성한다. TDD 방식, MVP-first 접근, 구현 단위별 명확한 스펙과 기술 스택을 정의한다.

## 배경
- #15 기획서(project-plan.md) 완성, #17 브랜딩 전략 완성으로 기획 단계 마무리
- 이제 실제 구현을 위한 기술 명세가 필요한 단계
- 일론 머스크 5단계 원칙으로 불필요한 복잡성을 사전 제거:
  1. **요구사항을 의심하라** — 모든 스펙이 정말 필요한지 검증
  2. **불필요한 것을 삭제하라** — 없어도 되는 기능/프로세스 제거
  3. **단순화/최적화하라** — 남은 것을 가장 단순하게
  4. **속도를 높여라** — 개발 사이클 단축
  5. **자동화하라** — 반복 작업 자동화 (CI/CD, 테스트)
- TDD(Test-Driven Development): 테스트 먼저 작성 → Red → Green → Refactor
- MVP를 먼저 구현한 뒤 점진적 고도화

## 완료 기준
- [x] `docs/specs/dev-spec.md`에 기술 개발 명세가 작성되어 있다 (기술 스택, 아키텍처, API 설계, DB 스키마 포함)
- [x] MVP 구현 계획이 구현 단위별 명확한 스펙(입력/출력/테스트 기준)과 함께 정의되어 있다
- [x] 일론 머스크 5단계 원칙이 각 구현 단위에 적용되어 불필요한 복잡성이 사전 제거되어 있다
- [x] TDD 테스트 전략(단위/통합/E2E)이 구현 단위별로 명시되어 있다
- [x] MVP → 고도화 로드맵(Phase 1: MVP, Phase 2+: 확장)이 정의되어 있다
- [x] `docs/specs/.ai.md`가 최신화되어 있다

## 참조 자료
- `docs/whitepaper/project-plan.md` — 기획서 (기능 정의, 아키텍처 초안)
- `docs/branding/branding-strategy.md` — 브랜딩 전략 (Aha Moment, 톤앤매너)
- `docs/background/08_solution-direction-critical-review.md` — 7개 기능 후보
- `docs/background/11_solution-rethink-proposal.md` — 60초 피드백 루프 MVP 방향

## 작업 내역

### 2026-04-08

**현황**: 6/6 완료 ✅
**완료된 항목**:
- `docs/specs/dev-spec.md` 기술 명세 작성 (1543줄)
- MVP 구현 단위별 스펙 정의 (IU-01 ~ IU-06, 각 입력/처리/출력/테스트 기준 포함)
- 일론 머스크 5단계 원칙 적용 (각 IU 및 기술 스택 "삭제한 것" 명시)
- TDD 테스트 전략 명시 (62개 테스트 케이스, Vitest/Playwright/MSW/Supabase 로컬)
- MVP→고도화 로드맵 정의 (Phase 1~4 + D1~D7 일별 일정)
- `docs/specs/.ai.md` 최신화 (dev-spec.md 참조 관계 반영)
**미완료 항목**: (없음)
**변경 파일**: 4개 (00_issue.md, 01_plan.md, docs/specs/dev-spec.md, docs/specs/.ai.md)
**작업 방식**: /ri → /plan (ralplan 컨센서스) → /team 3 (병렬 워커 3명: worker-1-infra, worker-2-units, worker-3-roadmap) → Lead 병합
**비고**: 모든 AC 달성. `/fi` 실행 준비 완료.

