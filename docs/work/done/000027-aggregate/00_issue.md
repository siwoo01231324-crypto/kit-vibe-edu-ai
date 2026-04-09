# feat: 응답 집계 유틸 (lib/aggregate — correct_rate/option_distribution/wrong_pattern)

## 사용자 관점 목표
교사 대시보드와 AI 인사이트 모두 동일한 집계 로직을 사용해 "문항별 정답률/응답시간/오답 패턴"을 일관되게 본다.

## 배경
dev-spec §5 IU-02/IU-03 — `aggregateResponses`, `groupByQuestion`, `calculateCorrectRate` 는 교사 대시보드(IU-03)와 AI 인사이트 프롬프트(IU-02) 양쪽에서 재사용된다. 순수 함수라 TDD 선행.

## 완료 기준 (AC)
- [ ] `apps/web/src/lib/aggregate.ts` — 3개 함수 구현:
  - `calculateCorrectRate(responses): number` (빈 배열 → 0)
  - `groupByQuestion(questions, responses)` — `{ question, total, correct_rate, option_distribution: number[] }[]`
  - `aggregateResponses(questions, responses)` — 위 + `avg_response_time`, `wrong_pattern`(가장 많이 선택된 오답 인덱스)
- [ ] 단위 테스트 (dev-spec TEST-IU2-U01·02·06, TEST-IU3-U01·02·03·04):
  - [ ] 빈 응답 → `correct_rate: 0`
  - [ ] 정답/오답 섞인 응답 → 정확한 비율
  - [ ] `option_distribution` 4개 요소 배열
  - [ ] `wrong_pattern` 최빈값 반환 검증
  - [ ] `avg_response_time` 평균값 정확성

## 의존성
- 선행: #22
- 병렬 가능: #25, #26

## 작업 내역

### 2026-04-09 구현 완료

- `apps/web/tests/unit/aggregate.test.ts` — 14개 단위 테스트 작성 (RED)
- `apps/web/src/lib/aggregate.ts` — `calculateCorrectRate`, `groupByQuestion`, `aggregateResponses` 구현 (GREEN)
- 내부 헬퍼 `mean`, `mostFrequent` 추출 (REFACTOR)
- 타입 export: `Response`, `Question`, `GroupedQuestion`, `AggregatedStat`
- `apps/web/src/lib/.ai.md` — aggregate.ts 항목 추가
- 테스트 결과: 14/14 통과
