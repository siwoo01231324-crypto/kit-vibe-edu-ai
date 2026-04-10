# [#39] chore: Playwright E2E 시나리오 3종 (교사/학생/AI 플로우) — 구현 계획

> 작성: 2026-04-10 (ralplan consensus: Planner → Architect → Critic 2회 반복 후 확정)

---

## 완료 기준

- [ ] `apps/web/tests/e2e/teacher-flow.spec.ts` (E2E-01): 로그인 → 세션 생성 → 문항 3개 → 활성화 → QR 표시
- [ ] `apps/web/tests/e2e/student-flow.spec.ts` (E2E-02): join_code → 닉네임 → 응답 → 정답 애니메이션 → 리더보드에 본인 닉네임
- [ ] `apps/web/tests/e2e/ai-flow.spec.ts` (E2E-03): 인사이트 생성 → weak_concepts 카드 렌더링 → 초안 생성 → 마크다운 표시
- [ ] 다중 학생 시나리오 TEST-IU1-E02 포함 (3개 컨텍스트 동시 응답)
- [ ] `npm run e2e` 전부 통과
- [ ] Claude API 는 MSW 또는 테스트 전용 mock handler 로 대체

---

## 구현 계획

### 확정된 사실 (코드베이스 실측)

| 항목 | 경로 | 비고 |
|------|------|------|
| 세션 생성 폼 | `src/app/teacher/sessions/new/page.tsx:62-80` | `id="title"`, `id="subject"`, `id="grade"`, 제출 후 `/edit` 리다이렉트 |
| 문항 추가 버튼 | `src/app/teacher/sessions/[id]/edit/QuestionEditor.tsx:249` | `+ 문항 추가` 텍스트 |
| 문항 저장 버튼 | `QuestionEditor.tsx:149` | `저장` 텍스트 |
| 세션 시작 버튼 | `src/app/teacher/sessions/[id]/live/LiveSessionClient.tsx:123` | `세션 시작` → `POST /api/sessions/${id}/activate` |
| QR 코드 | `src/components/shared/QRCodeDisplay.tsx:32` | `alt="QR 코드"` |
| 정답 애니메이션 | `src/app/(student)/quiz/[sessionId]/page.tsx:313` | `.animate-burst` class |
| 정답 텍스트 | `src/app/(student)/quiz/[sessionId]/page.tsx:337` | `✓ 정답!` |
| 인사이트 패널 heading | `src/components/dashboard/InsightPanel.tsx:12` | `취약 개념` (h2) |
| 인사이트 개념 텍스트 | `InsightPanel.tsx:20` | `item.concept` span |
| InsightSchema | `src/lib/prompts/insights.ts:14` | `top_weak_concepts[].concept/correct_rate/evidence` |
| callClaude | `src/lib/anthropic.ts:20` | mock 분기 없음 → 수정 필요 |
| Auth trigger | `supabase/migrations/20260408000001_auth_trigger.sql` | `createUser` 시 `teachers` 행 자동 생성 |
| Cookie 이름 | — | `sb-127-auth-token` (Supabase local 54321) |
| Cookie 값 포맷 | — | `base64-{base64url(JSON.stringify(session))}` |

---

### Guardrails

**Must Have**
- `MOCK_CLAUDE === '1'` 조건일 때만 mock 활성 (프로덕션 영향 zero)
- 각 테스트는 `crypto.randomUUID().slice(0,8)` 기반 고유 email/session 생성
- `afterAll` cleanup은 반드시 `try/catch`로 감싸기
- auth trigger가 teachers 행 자동 생성 → 별도 profile bootstrap 불필요
- `fullyParallel: true` 유지 (파일 단위 병렬)

**Must NOT Have**
- 실제 Anthropic API 호출 (테스트 중)
- `smoke.spec.ts` 수정
- `waitForTimeout(N)` hacking → `waitForURL`, `expect().toBeVisible({ timeout: N })` 사용
- 하드코딩 이메일 재사용
- `Date.now()` 단독 suffix (동시성 충돌 위험) → `randomUUID` 사용

---

### 변경/생성 파일 목록

#### 신규 생성 (7개)
```
apps/web/tests/e2e/helpers/supabase-admin.ts    # Admin API 헬퍼
apps/web/tests/e2e/teacher-flow.spec.ts          # E2E-01
apps/web/tests/e2e/student-flow.spec.ts          # E2E-02 + TEST-IU1-E02
apps/web/tests/e2e/ai-flow.spec.ts               # E2E-03
apps/web/tests/e2e/.ai.md                        # 디렉토리 문서
docs/ai-report/daily-log.md (갱신)              # 불변식 1
```

#### 수정 (2개)
```
apps/web/src/lib/anthropic.ts                    # MOCK_CLAUDE 분기 추가
apps/web/playwright.config.ts                    # webServer.env.MOCK_CLAUDE='1'
```

---

### T1. 인프라 구축

#### T1.1 `apps/web/src/lib/anthropic.ts` 수정

`callClaude()` 함수 시작부에 추가:

```ts
// MOCK_CLAUDE=1 환경에서 실제 API 호출 없이 고정 응답 반환
if (process.env.MOCK_CLAUDE === '1') {
  const isInsight = system.includes('top_weak_concepts') || system.includes('인사이트');
  if (isInsight) {
    return JSON.stringify({
      top_weak_concepts: [
        { concept: '분수 연산', correct_rate: 0.35, evidence: '3문항 중 2문항 오답률 65%' },
        { concept: '방정식 풀기', correct_rate: 0.40, evidence: '오답 패턴 집중' },
      ],
      strong_concepts: [
        { concept: '기본 덧셈', correct_rate: 0.90 },
      ],
      next_class_focus: [
        { focus: '분수 연산 집중', reason: '취약 개념 우선', suggested_activity: '분수 카드 게임' },
      ],
    });
  }
  // class-draft 또는 기타
  return '# 수업 초안\n\n## 도입 (5분)\n분수 복습\n\n## 전개 (30분)\n연산 연습\n\n## 정리 (10분)\n형성평가';
}
```

**검증**: `MOCK_CLAUDE=1` 시 `parseInsightResponse` 통과 확인 (InsightSchema 준수).

#### T1.2 `apps/web/playwright.config.ts` 수정

```ts
webServer: {
  command: 'npm run dev',
  url: process.env.BASE_URL ?? 'http://localhost:3000',
  reuseExistingServer: true,
  timeout: 120_000,
  ignoreHTTPSErrors: true,
  env: {
    MOCK_CLAUDE: '1',
  },
},
```

**주의**: `reuseExistingServer: true`이면 기존 서버에 env 주입 안 됨 → 로컬 재실행 시 dev 서버를 재시작해야 함 (README 또는 .ai.md에 명시).

#### T1.3 `apps/web/tests/e2e/helpers/supabase-admin.ts` 신규

```ts
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// 함수 목록:
// createUser(email, password): { id, email }
// deleteUser(userId): void
// signIn(email, password): session (access_token, refresh_token, ...)
// buildAuthCookieValue(session): 'base64-{base64url(JSON)}'
// dbInsert(table, payload): T[]
// dbUpdate(table, eq, payload): void
// dbDelete(table, eq): void
```

- `createUser` 시 auth trigger가 자동으로 `teachers` 행 생성 → 별도 처리 불필요
- Cookie 이름: `sb-127-auth-token`, domain: `localhost`, path: `/`

**injectSession 헬퍼** (각 스펙 파일에서 사용):
```ts
async function injectSession(context: BrowserContext, session: object) {
  await context.addCookies([{
    name: 'sb-127-auth-token',
    value: buildAuthCookieValue(session),
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    secure: false,
  }]);
}
```

---

### T2. `teacher-flow.spec.ts` (E2E-01)

**AC**: 로그인 → 세션 생성 → 문항 3개 → 활성화 → QR 표시

**구현 단계**:
1. `beforeAll`: `createUser(email, password)` → `signIn()` → `injectSession(context, session)` → userId 저장
2. `page.goto('/teacher/sessions/new')`
3. `page.locator('#title').fill('E2E 수학 세션')`
4. `page.locator('#subject').fill('수학')`, `page.locator('#grade').fill('중1')`
5. `page.getByRole('button', { name: '세션 만들기' }).click()`
6. `page.waitForURL(/\/teacher\/sessions\/.*\/edit/)` → URL에서 sessionId 추출
7. 문항 추가 3회 반복:
   - `page.getByRole('button', { name: '+ 문항 추가' }).click()`
   - QuestionForm 채우기 (content, options, correct_answer)
   - `page.getByRole('button', { name: '저장' }).click()`
8. `page.goto('/teacher/sessions/${sessionId}/live')`
9. `page.getByRole('button', { name: '세션 시작' }).click()`
10. **검증**: `await expect(page.getByAltText('QR 코드')).toBeVisible({ timeout: 10_000 })`
11. `afterAll`: `dbDelete('sessions', ...)` + `deleteUser(userId)` (try/catch 감싸기)

**QuestionForm 입력 전략**: QuestionEditor의 폼 필드 selector를 `nth()` 또는 `within` 패턴으로 처리. 첫 번째 실행 시 실제 selector 확인 필요.

---

### T3. `student-flow.spec.ts` (E2E-02 + TEST-IU1-E02)

**AC**: join_code → 닉네임 → 응답 → 정답 애니메이션 → 리더보드 본인 닉네임

**Fixture** (`beforeAll`): admin으로 활성 세션 + 문항 3개 seed
```ts
// 1. createUser(teacherEmail, password) → teacherId
// 2. dbInsert('sessions', { teacher_id: teacherId, status: 'active', join_code: 'E2E' + uuid.slice(0,4) })
// 3. dbInsert('questions', 3개: correct_answer 0, 1, 2)
```

**테스트 1 — 단일 학생 풀 플로우 (E2E-02)**:
1. `page.goto('/join')`
2. `page.locator('#joinCode').fill(joinCode)`
3. `page.locator('#nickname').fill('alice_' + uuid.slice(0,4))`
4. `page.getByRole('button', { name: '입장하기' }).click()`
5. `page.waitForURL(/\/waiting\//, { timeout: 10_000 })`
6. waiting → quiz 자동 이동 대기: `page.waitForURL(/\/quiz\//, { timeout: 10_000 })`
7. 각 문항 정답 선택 → **검증**: `await expect(page.locator('.animate-burst')).toBeVisible({ timeout: 8_000 })`
8. 다음 문항으로 자동 이동 대기 (`waitForURL` 또는 새 문항 DOM 등장)
9. 3문항 완료 → 교사 측 세션 종료: `dbUpdate('sessions', { id: sessionId }, { status: 'ended' })`
10. **검증**: `await expect(page.getByText(nickname)).toBeVisible({ timeout: 10_000 })` (리더보드)

**테스트 2 — 다중 학생 TEST-IU1-E02** (3개 context 동시):
```ts
test('3명 동시 응답 (TEST-IU1-E02)', async ({ browser }) => {
  const nicknames = ['alice', 'bob', 'carol'].map(n => n + '_' + crypto.randomUUID().slice(0,4));
  const contexts = await Promise.all([0,1,2].map(() => browser.newContext()));
  const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));

  // 동시 참여
  await Promise.all(pages.map((p, i) => joinAsStudent(p, joinCode, nicknames[i])));

  // 동시 응답 (1문항 × 3명)
  await Promise.all(pages.map((p, i) => selectAnswer(p, i % 4)));

  // DB 확인 (service role)
  await expect.poll(async () => {
    const rows = await dbSelect('responses', { session_id: sessionId });
    return rows.length;
  }, { timeout: 5_000 }).toBe(3);

  await Promise.all(contexts.map(ctx => ctx.close()));
});
```

**afterAll**: `dbDelete('sessions', ...)` + `deleteUser(teacherId)` (try/catch)

---

### T4. `ai-flow.spec.ts` (E2E-03)

**AC**: 인사이트 생성 → 취약 개념 카드 렌더링 → 초안 생성 → 마크다운 표시

**전제**: `playwright.config.ts`의 `webServer.env.MOCK_CLAUDE='1'`

**Fixture** (`beforeAll`):
- `createUser + signIn + injectSession`
- `dbInsert('sessions', { status: 'ended', ... })`
- `dbInsert('questions', [1개])`
- `dbInsert('responses', [오답 2개: is_correct=false])` → weak concept 필요

**시나리오**:
1. `page.goto('/teacher/sessions/${sessionId}/insights')`
2. `page.getByRole('button', { name: /인사이트 생성/i }).click()`
3. `await page.waitForResponse(res => res.url().includes('/api/insights/generate') && res.status() === 200, { timeout: 15_000 })`
4. **검증**: `await expect(page.getByRole('heading', { name: '취약 개념' })).toBeVisible({ timeout: 8_000 })`
5. **검증**: `await expect(page.getByText('분수 연산')).toBeVisible()` (mock fixture 고정값)
6. `page.getByRole('button', { name: /수업 초안 생성/i }).click()`
7. `await page.waitForResponse(res => res.url().includes('/api/class-draft') && res.status() === 200, { timeout: 15_000 })`
8. **검증**: `await expect(page.getByText(/수업 초안/i)).toBeVisible({ timeout: 8_000 })`

**afterAll**: cleanup (try/catch)

---

### T5. 통합 검증 + 문서화

1. `npm run e2e` 실행 → 4종(smoke + 3종) 전부 green 확인
2. `apps/web/tests/e2e/.ai.md` 작성 (E2E 테스트 구조 기술)
3. `docs/ai-report/daily-log.md` 오늘자 섹션에 AI 활용 내역 추가 (불변식 1)

---

### 실행 순서 (의존성 고려)

```
T1.3 (supabase-admin 헬퍼)
  └─ T1.1 (anthropic mock)
  └─ T1.2 (playwright config)
       └─ T2 (teacher-flow)
       └─ T3 (student-flow)
       └─ T4 (ai-flow)
            └─ T5 (통합 + 문서)
```

T1 완료 후 T2/T3/T4를 병렬 작업 가능.

---

### 주의사항

1. **`reuseExistingServer`**: 로컬에서 `npm run dev` 실행 중이면 `MOCK_CLAUDE=1`이 주입 안 됨 → 테스트 전 dev 서버 재시작 필요
2. **QuestionForm selector**: QuestionEditor 내 입력 필드 selector는 실제 렌더 후 확인 필요 (`placeholder` 또는 `label` 기반)
3. **Realtime 타이밍**: quiz 페이지의 waiting→quiz 전환, 리더보드 갱신 모두 Realtime 기반 → `{ timeout: 10_000 }` 여유 설정
4. **다중 context join_code 충돌**: `crypto.randomUUID().slice(0,4)` 기반 고유 코드 사용 (Date.now() 단독 금지)
5. **mock fixture 스키마**: InsightSchema (`top_weak_concepts[].concept/correct_rate/evidence`) 준수 필수
6. **cleanup 실패 내성**: `afterAll`의 delete/deleteUser는 모두 `try/catch`로 감싸 한 테스트 실패가 전파되지 않게 함
