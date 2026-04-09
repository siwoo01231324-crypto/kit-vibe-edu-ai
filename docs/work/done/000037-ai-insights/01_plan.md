# 구현 계획 — #37 feat: AI 인사이트 생성 API + InsightPanel

> ⚠️ 이 파일은 AC 체크리스트 초안입니다. 구현 전 `/plan` 커맨드로 구체적 계획을 작성하세요.

## API 흐름 다이어그램

```
POST /api/insights/generate
  │
  ├─ 1. Auth check (supabase.auth.getUser)
  │       └── 미인증 → 401
  │
  ├─ 2. Zod body validation { session_id: uuid }
  │       └── 실패 → 400
  │
  ├─ 3. 소유권 체크 (sessions.teacher_id === user.id)
  │       └── 없음/불일치 → 403
  │
  ├─ 4. 캐시 체크 (ai_insights WHERE session_id)
  │       └── 존재 → 200 cached insights (Claude 미호출)
  │
  ├─ 5. aggregateResponses(questions, responses)
  │
  ├─ 6. buildInsightsPrompt + callClaude(maxTokens: 2048)
  │       └── Claude 에러 → 500 CLAUDE_ERROR
  │
  ├─ 7. parseInsightResponse (ZodError/SyntaxError)
  │       └── 실패 → 500 PARSE_ERROR
  │
  └─ 8. ai_insights INSERT + 200 insights
```

## 캐싱 전략

- DB 캐시 (ai_insights 테이블): session_id 기준 1개 row
- 동일 session_id로 재요청 시 Claude 미호출, DB에서 직접 반환
- 캐시 무효화 없음 (세션 종료 후 생성하므로 불변)

## MSW Mock 설정

```typescript
// Anthropic API mock (https://api.anthropic.com/v1/messages)
mswServer.use(
  http.post('https://api.anthropic.com/v1/messages', () => {
    return HttpResponse.json({
      content: [{ type: 'text', text: JSON.stringify(mockInsightResult) }]
    })
  })
)
```

## AC 체크리스트

- [x] `apps/web/src/app/api/insights/generate/route.ts` 구현
- [x] zod body 검증 (`{session_id}`)
- [x] 소유권 체크 실패 → 403, 미인증 → 401
- [x] 이미 있는 insights → 캐시 반환 (Claude 미호출)
- [x] `aggregateResponses` (#27) + `buildInsightsPrompt` (#36) 재사용
- [x] zod 파싱 실패 → 500 + 에러 메시지
- [x] `apps/web/src/components/dashboard/InsightPanel.tsx` — 카드 3종 (weak/strong/next_focus)
- [x] 통합 테스트 TEST-IU2-I01~I04 (성공/캐시/403/파싱 실패) — MSW Claude mock 사용
- [x] `apps/web/tests/setup.ts` 에 MSW 서버 설정 추가

## 개발 체크리스트

- [x] 통합 테스트 코드 작성 (Vitest + MSW)
- [x] `apps/web/src/app/api/insights/.ai.md`, `apps/web/src/components/dashboard/.ai.md` 최신화
- [x] `docs/ai-report/daily-log.md` 기록 (불변식 1)
- [ ] AI 생성 코드 인간 검토 후 커밋 (불변식 2)
- [x] 불변식 위반 없음
