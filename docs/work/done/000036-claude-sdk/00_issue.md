# feat: Claude SDK 클라이언트 + 프롬프트 모듈 (insights/class-draft)

## 사용자 관점 목표
AI 인사이트와 수업 초안 기능을 위한 Claude API 호출 기반을 마련한다. 프롬프트와 파서는 IU-02/IU-04 에서 재사용된다.

## 배경
dev-spec §2.2 `@anthropic-ai/sdk` 0.39.x, 모델 `claude-sonnet-4-6`. dev-spec §5 IU-02 InsightSchema (zod), IU-04 DraftPrompt. 프롬프트는 `apps/web/src/lib/prompts/` 에 모듈화.

## 완료 기준 (AC)
- [ ] `apps/web/src/lib/anthropic.ts` — `callClaude({system, user, maxTokens}): Promise<string>` 래퍼
- [ ] `apps/web/src/lib/prompts/insights.ts` — `buildInsightsPrompt(session, stats)`, `parseInsightResponse(raw)` (zod `InsightSchema`)
- [ ] `apps/web/src/lib/prompts/class-draft.ts` — `buildDraftPrompt(insights, subject, grade)`
- [ ] 단위 테스트:
  - [ ] `buildInsightsPrompt` — subject/grade/question_stats 포함 (TEST-IU2-U03, UT-05)
  - [ ] `parseInsightResponse(validJson)` → 통과 (TEST-IU2-U04)
  - [ ] `parseInsightResponse(invalidJson)` → ZodError (TEST-IU2-U05)
  - [ ] `buildDraftPrompt` — subject/grade/next_class_focus 포함 (TEST-IU4-U01·02, UT-07)

## 환경 세팅 (수동)
- Anthropic Console에서 API 키 발급
- `apps/web/.env.local`에 `ANTHROPIC_API_KEY=sk-ant-...` 추가 (`NEXT_PUBLIC_` 금지)
- `npm i @anthropic-ai/sdk zod`

## 의존성
- 선행: #22
- 후행: #37 (AI 인사이트 API), #38 (수업 초안 API)

## 작업 내역

### 2026-04-09 구현 완료

- `apps/web/tests/unit/prompts.test.ts` — 7개 단위 테스트 작성 (RED)
- `apps/web/src/lib/anthropic.ts` — `callClaude({system, user, maxTokens})` 래퍼 구현 (GREEN)
- `apps/web/src/lib/prompts/insights.ts` — `InsightSchema` (zod), `buildInsightsPrompt`, `parseInsightResponse` 구현
- `apps/web/src/lib/prompts/class-draft.ts` — `buildDraftPrompt` 구현
- `apps/web/src/lib/.ai.md`, `apps/web/src/lib/prompts/.ai.md` 신규 작성
- 테스트 결과: 7/7 통과
