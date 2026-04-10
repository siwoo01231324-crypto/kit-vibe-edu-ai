# [#69] 자연어 입력으로 AI가 세션 제목·문항 생성 — 구현 계획

> 작성: 2026-04-11 (ralplan consensus — Planner + Architect + Critic)

---

## 완료 기준 (AC)

- [ ] 자연어 textarea에 입력 후 "AI로 채우기" 버튼 클릭 시, AI가 세션 제목·과목·학년·문항(선택)을 파싱해 폼 필드를 자동으로 채운다
- [ ] AI가 생성한 결과를 선생이 직접 수정할 수 있는 편집 가능한 폼으로 표시된다 (확인 후 세션 생성)
- [ ] AI가 입력을 충분히 파악하지 못한 필드(예: 학년 불분명)에 대해 "이 부분을 좀 더 구체적으로 설명해 주세요" fallback 메시지를 해당 필드 옆에 인라인으로 표시한다
- [ ] 기존 수동 입력 폼도 그대로 사용 가능하다 (하위 호환)

---

## 구현 계획

### RALPLAN-DR 요약

**Principles**
1. 기존 `callClaude()` 재사용 — MOCK_CLAUDE/재시도/에러핸들링 무료 확보
2. `insights.ts` 패턴 동일 적용 — 코드베이스 일관성 유지
3. questions[] 제외 — 세션 생성 시 title/subject/grade만, questions는 edit 페이지에서 관리
4. 하위 호환 — 기존 수동 폼 UI 흐름 그대로 유지
5. 경계 검증 — 클라이언트 + 서버 양쪽 입력 길이 제한

**Decision Drivers**
1. callClaude() 재사용 비용 최소화 (MOCK_CLAUDE 지원 자동)
2. 기존 POST /api/sessions는 title/subject/grade만 받으므로 questions[] 포함 불필요
3. 빠른 배포 — JSON-in-system-prompt 패턴이 검증된 방식

**선택된 옵션**: JSON 응답 + callClaude + Zod 검증 (insights.ts 패턴)
**기각된 대안**: tool_use 직접 호출 — callClaude 우회 필요, MOCK_CLAUDE 별도 구현 비용 증가

---

### 단계별 실행 순서

#### Step 1. 프롬프트 모듈 작성
**파일**: `apps/web/src/lib/prompts/session-parse.ts` (신규)

```typescript
// 구현 내용:
// 1. buildSessionParsePrompt(prompt: string): { system, user }
//    - system에 'session_parse' 키워드 포함 (MOCK_CLAUDE 감지용)
//    - JSON 출력 스키마 명시: { title, subject, grade, missing[] }
//    - missing: AI가 파악 못한 필드명 배열 (예: ["grade"])
// 2. SessionParseSchema (Zod)
//    - z.object({ title: z.string(), subject: z.string(), grade: z.string(), missing: z.array(z.string()) })
// 3. parseSessionParseResponse(raw: string): SessionParseResult
//    - markdown fence 제거 (insights.ts:88 패턴)
//    - JSON.parse → Zod 검증
//    - 실패 시 throw new Error('PARSE_ERROR')
```

**AC 커버리지**: AC #1 (파싱 로직), AC #3 (missing[] 필드)

#### Step 2. MOCK_CLAUDE 케이스 추가
**파일**: `apps/web/src/lib/anthropic.ts` (수정)

```typescript
// anthropic.ts:29 이후 추가:
if (system.includes('session_parse')) {
  return JSON.stringify({
    title: '피타고라스 정리',
    subject: '수학',
    grade: '고1',
    missing: [],
  });
}
```

**목적**: E2E 테스트(MOCK_CLAUDE=1)에서 parse-prompt API가 정상 동작하도록 보장

#### Step 3. API 엔드포인트 작성
**파일**: `apps/web/src/app/api/sessions/parse-prompt/route.ts` (신규)

```typescript
// 구현 내용:
// 1. Supabase 인증 체크 (sessions/route.ts:13-18 패턴)
// 2. Zod 입력 검증: z.object({ prompt: z.string().min(10).max(2000) })
// 3. callClaude(buildSessionParsePrompt(prompt)) 호출
// 4. parseSessionParseResponse(raw) — Zod 검증
// 5. 응답: { title, subject, grade, missing }
// 에러 코드:
//   - 400 PARSE_ERROR: AI 응답 파싱/검증 실패
//   - 500 API_ERROR: callClaude 실패
//   - 401: 미인증
```

**AC 커버리지**: AC #1 (API), AC #3 (missing 필드 반환)

#### Step 4. UI 수정
**파일**: `apps/web/src/app/teacher/sessions/new/page.tsx` (수정)

```typescript
// 추가할 상태:
// - naturalPrompt: string (textarea 값)
// - aiLoading: boolean (로딩 스피너)
// - missingFields: string[] (missing 필드 목록)
// - aiError: string | null (AI 파싱 에러)

// 추가할 UI 요소 (기존 폼 위):
// - textarea (maxLength=2000, placeholder="예: 고1 수학, 피타고라스 정리 퀴즈 5문제")
// - "AI로 채우기" 버튼 (aiLoading 중 disabled + 스피너)
// - 에러 메시지 (aiError)

// handleAiFill():
// 1. POST /api/sessions/parse-prompt 호출
// 2. 응답으로 form.title/subject/grade setForm
// 3. missingFields 업데이트
// 4. PARSE_ERROR 시 aiError 표시

// 기존 각 필드 아래 fallback 표시:
// missingFields.includes('grade') && <p>이 부분을 좀 더 구체적으로 설명해 주세요</p>
```

**AC 커버리지**: AC #1 (버튼+채움), AC #2 (편집 가능 폼 그대로), AC #3 (fallback 인라인), AC #4 (기존 폼 유지)

#### Step 5. 테스트 작성
**파일**: `apps/web/src/__tests__/lib/prompts/session-parse.test.ts` (신규)

**단위 테스트 케이스 (parseSessionParseResponse)**:
- (a) 유효한 JSON (모든 필드) → 정상 파싱
- (b) markdown fence로 감싼 JSON → fence 제거 후 정상 파싱
- (c) grade 누락 → missing: ['grade'] 포함
- (d) 완전히 유효하지 않은 JSON → throw PARSE_ERROR
- (e) Zod 스키마 불일치 (missing 필드가 string[]이 아님) → throw

**통합 테스트 (API route)**:
- 인증 없이 POST → 401
- prompt 길이 9자 → 400 (min 미충족)
- prompt 길이 2001자 → 400 (max 초과)
- MOCK_CLAUDE=1, 유효한 prompt → 200, { title, subject, grade, missing }

---

### 변경/생성 파일 목록

| 구분 | 파일 경로 | 작업 |
|------|-----------|------|
| 신규 | `apps/web/src/lib/prompts/session-parse.ts` | 프롬프트 빌더 + Zod 스키마 + 파서 |
| 수정 | `apps/web/src/lib/anthropic.ts` | MOCK_CLAUDE session_parse 케이스 추가 |
| 신규 | `apps/web/src/app/api/sessions/parse-prompt/route.ts` | POST 엔드포인트 |
| 수정 | `apps/web/src/app/teacher/sessions/new/page.tsx` | 자연어 textarea + AI 채우기 UI |
| 신규 | `apps/web/src/__tests__/lib/prompts/session-parse.test.ts` | 단위 + 통합 테스트 |

---

### Guardrails

**Must Have**
- [ ] 기존 수동 폼 흐름(validate + POST /api/sessions) 그대로 동작
- [ ] MOCK_CLAUDE=1 환경에서 parse-prompt API 정상 동작 (E2E CI 통과)
- [ ] Zod 검증: 클라이언트(maxLength=2000) + 서버(z.string().min(10).max(2000)) 양쪽
- [ ] PARSE_ERROR와 API_ERROR 에러 코드 구분 (UI에서 다른 메시지 표시)
- [ ] Supabase 인증 체크 (기존 route 패턴 동일)

**Must NOT Have**
- [ ] 사용자 입력을 Claude에 직접 전달 전 Zod 검증 없이 호출 금지
- [ ] 기존 수동 폼 UI 흐름 변경 금지 (하위 호환)
- [ ] 페이지 로드 시 parse-prompt API 자동 호출 금지
- [ ] 자연어 입력 원문을 DB에 저장 금지
- [ ] questions[] 를 현재 parse 응답 스키마에 포함 금지 (edit 페이지에서 관리)

---

### 리스크 완화

| 리스크 | 완화 방안 |
|--------|-----------|
| Claude가 유효하지 않은 JSON 반환 | Zod 검증 실패 시 PARSE_ERROR → "직접 입력해 주세요" 메시지 표시 |
| 빠른 연속 클릭으로 중복 API 호출 | `aiLoading` 중 버튼 disabled 처리 |
| 모든 필드가 missing인 전체 실패 | aiError 상태로 구분 표시 ("AI가 파악하지 못했습니다. 직접 입력해 주세요") |
| Claude API 응답 지연 (타임아웃) | 로딩 스피너 + 버튼 비활성화로 UX 처리; callClaude 기본 재시도 1회 내장 |
| maxTokens 부족 | session-parse용 maxTokens: 512 (title/subject/grade/missing만 필요) |

---

## 개발 체크리스트

- [ ] 테스트 코드 포함 (단위 5케이스 + 통합 4케이스)
- [ ] 해당 디렉토리 .ai.md 최신화
- [ ] 불변식 위반 없음
- [ ] docs/ai-report/daily-log.md AI 활용 내역 기록

---

## 작업 내역
