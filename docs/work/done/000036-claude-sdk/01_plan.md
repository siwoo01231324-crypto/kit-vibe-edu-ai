# 01_plan — #36 Claude SDK

## AC 체크리스트
- [ ] `apps/web/src/lib/anthropic.ts` — `callClaude({system, user, maxTokens}): Promise<string>`
- [ ] `apps/web/src/lib/prompts/insights.ts` — `buildInsightsPrompt`, `parseInsightResponse` (zod)
- [ ] `apps/web/src/lib/prompts/class-draft.ts` — `buildDraftPrompt`
- [ ] 단위 테스트 4종 (TEST-IU2-U03·04·05, TEST-IU4-U01·02)

## 구현 명세

### anthropic.ts
```typescript
import Anthropic from '@anthropic-ai/sdk';
// model: 'claude-sonnet-4-6', server-side only (ANTHROPIC_API_KEY)
export async function callClaude(params: { system: string; user: string; maxTokens?: number }): Promise<string>
// 429/5xx → 1회 재시도, 실패 시 throw new Error('ApiError')
```

### prompts/insights.ts
```typescript
import { z } from 'zod';
export const InsightSchema = z.object({
  top_weak_concepts: z.array(z.object({ concept: z.string(), correct_rate: z.number(), evidence: z.string() })).max(3),
  strong_concepts: z.array(z.object({ concept: z.string(), correct_rate: z.number() })).max(3),
  next_class_focus: z.array(z.object({ focus: z.string(), reason: z.string(), suggested_activity: z.string() })).max(3)
})
export type InsightResult = z.infer<typeof InsightSchema>
export function buildInsightsPrompt(session: { subject: string; grade: string }, stats: AggregatedStat[]): { system: string; user: string }
export function parseInsightResponse(raw: string): InsightResult  // ZodError on invalid
```

### prompts/class-draft.ts
```typescript
export function buildDraftPrompt(insights: InsightResult, subject: string, grade: string): { system: string; user: string }
// 반환: 마크다운 텍스트 생성용 프롬프트
```

## 파일 경로
- `apps/web/src/lib/anthropic.ts`
- `apps/web/src/lib/prompts/insights.ts`
- `apps/web/src/lib/prompts/class-draft.ts`
- `apps/web/tests/unit/prompts.test.ts`
- `apps/web/src/lib/.ai.md`, `apps/web/src/lib/prompts/.ai.md` (신규)

## 호환성
- #37 AI 인사이트 API: `callClaude` + `buildInsightsPrompt` + `parseInsightResponse` import
- #38 수업 초안 API: `callClaude` + `buildDraftPrompt` import
- `AggregatedStat` 타입은 #27 `aggregateResponses` 반환 타입과 일치 필요
- `zod` 미설치 시 `npm i zod` (package.json에 추가)
