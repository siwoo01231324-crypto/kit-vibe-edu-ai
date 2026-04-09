# 01_plan — #27 aggregate

## AC 체크리스트
- [ ] `apps/web/src/lib/aggregate.ts` — 3개 함수
- [ ] 단위 테스트 (TEST-IU2-U01·02·06, TEST-IU3-U01·02·03·04)

## 구현 명세

```typescript
// 타입 (인라인 정의 or 별도 types.ts 참조)
type Response = { question_id: string; is_correct: boolean; answer: number; response_time_ms: number }
type Question = { id: string; content: string; options: string[] }

export function calculateCorrectRate(responses: Response[]): number
// 빈 배열 → 0, 그 외 is_correct 비율 (0~1)

export function groupByQuestion(questions: Question[], responses: Response[])
// 반환: { question, total, correct_rate, option_distribution: number[] }[]
// option_distribution: [0,1,2,3].map(i => responses.filter(r => r.answer === i).length)

export function aggregateResponses(questions: Question[], responses: Response[])
// 반환: { question_id, content, correct_rate, avg_response_time, wrong_pattern: number|null }[]
// wrong_pattern: 오답 중 가장 많이 선택된 answer 인덱스
```

헬퍼 (내부): `mean(nums: number[]): number`, `mostFrequent(nums: number[]): number | null`

## 파일 경로
- `apps/web/src/lib/aggregate.ts`
- `apps/web/tests/unit/aggregate.test.ts`
- `apps/web/src/lib/.ai.md` (최신화)

## 호환성
- #31 교사 대시보드, #37 AI 인사이트 API에서 import
- `aggregateResponses` 반환 타입은 #36 `buildInsightsPrompt(session, stats)` 의 stats 입력과 일치해야 함
