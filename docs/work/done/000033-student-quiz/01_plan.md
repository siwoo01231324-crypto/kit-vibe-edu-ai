# 구현 계획 — #33 학생 퀴즈 응답 + 점수 저장 + Realtime 문항 동기화 (IU-01)

> dev-spec §5 IU-01 기준. `responses` INSERT 는 Supabase Direct(anon key), 중복 응답은 클라이언트 `alreadyAnswered` Set 으로 차단. 문항 진행은 교사가 순서대로 공개하므로 `questions` 테이블 Realtime INSERT/UPDATE 이벤트를 구독한다.

## AC 체크리스트

- [ ] `apps/web/src/app/(student)/quiz/[sessionId]/page.tsx` — 현재 문제 + 4지선다 렌더링 (sessionStorage 가드 포함)
- [ ] 선택지 클릭 → `responses` INSERT (`{session_id, question_id, nickname, selected_answer, is_correct, response_time_ms, score}`)
- [ ] 중복 응답 가드 — 동일 `question_id` 에 대해 두 번째 클릭 차단 (클라이언트 로컬 state `answeredQuestionIds: Set<string>`)
- [ ] 정답/오답 애니메이션 — CSS transition 기반 (정답: 초록 하이라이트, 오답: 빨강 쉐이크)
- [ ] Realtime `questions` 구독 — INSERT/UPDATE 이벤트 수신 시 현재 문제 목록 갱신 및 다음 미답변 문항 자동 표시
- [ ] 세션 종료(`sessions.status='ended'`) 감지 시 결과/대기 화면으로 전환
- [ ] 통합 테스트 TEST-IU1-I03: anon 클라이언트가 `responses` INSERT 성공
- [ ] 통합 테스트 TEST-IU1-I04: 동일 `(session_id, question_id, nickname)` 중복 INSERT 차단 검증 (클라이언트 가드)
- [ ] 통합 테스트 TEST-IU1-I05: `questions` Realtime 채널 콜백 수신 (INSERT/UPDATE)
- [ ] `apps/web/src/app/(student)/quiz/.ai.md` 작성 (레포 규칙 3)
- [ ] `docs/ai-report/daily-log.md` 업데이트 (불변식 1)

## 변경/생성 파일 목록

### 신규 생성
| 경로 | 목적 |
|---|---|
| `apps/web/src/app/(student)/quiz/[sessionId]/page.tsx` | 학생 퀴즈 페이지 (클라이언트 컴포넌트). sessionStorage 가드, 현재 문제 렌더링, 응답 INSERT, Realtime 구독 |
| `apps/web/src/app/(student)/quiz/[sessionId]/QuizClient.tsx` *(선택)* | 페이지 로직을 컴포넌트로 분리 (params 래퍼만 page 에 두는 구조). 단일 파일로 유지해도 무방 — 규모 보고 결정 |
| `apps/web/src/app/(student)/quiz/.ai.md` | 디렉토리 목적·구조·역할 기술 (레포 규칙 3) |
| `apps/web/src/hooks/useStudentQuestions.ts` | 학생용 questions 구독 훅. 초기 fetch + Realtime INSERT/UPDATE 구독. 교사용 `useQuestions.ts` 와 구분 (mutation 없음) |
| `apps/web/src/hooks/useSubmitResponse.ts` *(선택)* | INSERT 로직 분리 훅. 페이지 내 inline 작성해도 무방 |
| `apps/web/tests/integration/student-quiz.test.ts` | TEST-IU1-I03/I04/I05 통합 테스트 |

### 수정
- 없음 (기존 `useSessionStatus`, `scoring`, `supabase/client` 재사용)

### 참고/재사용 (변경 없음)
- `apps/web/src/lib/scoring.ts` — `calculateScore(isCorrect, responseTimeMs)`
- `apps/web/src/lib/supabase/client.ts` — anon 클라이언트
- `apps/web/src/hooks/useSessionStatus.ts` — 세션 종료 감지에 재사용
- `apps/web/src/types/database.ts` — `responses.Insert`, `questions.Row` 타입

## 구현 단계

### 1단계: RED — 통합 테스트 작성 (`student-quiz.test.ts`)

**파일**: `apps/web/tests/integration/student-quiz.test.ts`

**구조**: `student-join.test.ts` 패턴 그대로 따른다. `admin`(service role) 으로 `sessions(status=active)` + `questions` 사전 삽입 → `anon` 클라이언트로 검증.

- `describe.skipIf(skip)` + `beforeAll`/`afterAll` 로 teacher/session/questions 생성 & 정리
- **TEST-IU1-I03 (INSERT 성공)**: anon 이 `responses.insert({session_id, question_id, nickname, selected_answer, is_correct, response_time_ms, score})` 호출 → error null, data 반환 확인
- **TEST-IU1-I04 (중복 차단)**: 동일 `(session_id, question_id, nickname)` 로 두 번째 INSERT 시도 — **DB 레벨 unique 제약이 없으므로** 클라이언트 가드 단위 테스트로 분리하거나, 두 번째 INSERT 도 성공하되 **"학생 페이지는 하나의 질문에 한 번만 INSERT 호출한다"** 라는 로직을 단위 테스트로 보강. 통합 테스트에서는 "두 번 INSERT 하면 row 2 개 생성됨" 을 확인한 뒤, 클라이언트 가드 단위 테스트(vitest + React Testing Library)로 UI 버튼 비활성화를 검증
- **TEST-IU1-I05 (Realtime 콜백)**: anon 클라이언트로 `session:{id}:questions` 채널 구독 → admin 이 `questions` INSERT → 콜백이 payload 수신하는지 `await new Promise` + timeout 으로 검증

**환경 변수**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 필요. 없으면 `skip`.

**DoD**: 테스트 실행 시 모두 FAIL (아직 앱 코드 없음) — RED 상태 확인.

### 2단계: `useStudentQuestions` 훅 구현

**파일**: `apps/web/src/hooks/useStudentQuestions.ts`

**책임**:
1. 마운트 시 `questions` 를 `session_id` 로 초기 fetch (`order('question_order', asc)`)
2. `session:{sessionId}:questions` 채널 구독 — `postgres_changes` INSERT/UPDATE 이벤트
3. INSERT 수신 → `setQuestions(prev => [...prev, payload.new])` 후 정렬 유지
4. UPDATE 수신 → 해당 row 교체
5. cleanup 시 `removeChannel`

**시그니처**:
```ts
export function useStudentQuestions(sessionId: string): {
  questions: QuestionRow[]
  isLoading: boolean
  error: string | null
}
```

**DoD**: 초기 fetch + Realtime 수신으로 `questions` state 업데이트. `useSessionStatus.ts` 패턴 답습.

### 3단계: 퀴즈 페이지 컴포넌트 작성

**파일**: `apps/web/src/app/(student)/quiz/[sessionId]/page.tsx`

**로직 순서**:

1. **sessionStorage 가드** (waiting 페이지와 동일 패턴)
   - `sessionStorage.getItem('studentSession')` 파싱
   - 없거나 `sessionId` 불일치 → `router.replace('/join')`
   - 있으면 `nickname` state 세팅
2. **훅 호출**
   - `useStudentQuestions(sessionId)` → `questions`
   - `useSessionStatus(sessionId)` → `status` (ended 감지용)
3. **현재 문항 결정**
   - `answeredQuestionIds: Set<string>` state (로컬)
   - `currentQuestion = questions.find(q => !answeredQuestionIds.has(q.id))` (question_order asc 정렬 전제)
   - `currentQuestion === undefined` 이면 "다음 문항 대기 중…" placeholder
4. **문항 시작 시각 기록**
   - `useEffect([currentQuestion?.id])` 로 `questionStartAt.current = Date.now()` 설정
5. **선택지 클릭 핸들러 `handleSelect(choiceIndex: number)`**
   - `if (!currentQuestion || answeredQuestionIds.has(currentQuestion.id)) return` — 중복 가드
   - 즉시 `setAnsweredQuestionIds(prev => new Set(prev).add(currentQuestion.id))` 로 버튼 비활성화 확정
   - `responseTimeMs = Date.now() - questionStartAt.current`
   - `isCorrect = choiceIndex === currentQuestion.correct_answer`
   - `score = calculateScore(isCorrect, responseTimeMs)`
   - Supabase `responses.insert({ session_id: sessionId, question_id: currentQuestion.id, nickname, selected_answer: choiceIndex, is_correct: isCorrect, response_time_ms: responseTimeMs, score })`
   - INSERT 실패 시 `setAnsweredQuestionIds` 롤백 & 에러 토스트 (optional — 최소 구현은 console.error)
   - `setFeedback({ choice: choiceIndex, isCorrect })` 로 애니메이션 트리거 후 1.5s 타이머로 피드백 해제(다음 문항 대기 상태 진입)
6. **세션 종료 처리**
   - `status === 'ended'` 시 "퀴즈가 종료되었습니다" 화면 + `/join` 복귀 버튼
7. **렌더링**
   - 닉네임 배지
   - 문항 번호 (`question_order` / `questions.length`)
   - `content` 텍스트
   - 4개 버튼 (`options` 배열) — grid-cols-2 gap-3
   - 각 버튼: 기본 / 선택됨+정답(초록 + scale 애니메이션) / 선택됨+오답(빨강 + shake) 3가지 상태
   - "문제 없음" / "다음 문제 대기" placeholder

**DoD**: 선택지 클릭 → `responses` 에 행 1건 INSERT. 중복 클릭 무시. 교사가 문항 추가하면 자동 반영.

### 4단계: 정답/오답 애니메이션 (CSS)

- Tailwind transition 활용:
  - 정답: `transition-colors duration-300 bg-green-500 scale-105`
  - 오답: `animate-[shake_0.4s_ease-in-out] bg-red-500`
- `globals.css` 에 `@keyframes shake` 추가 — 필요 시만 (tailwind 플러그인 없이 custom keyframe)
- 애니메이션 후 1.5s 유지 → 다음 대기 상태로 전환

**DoD**: 정답 시 초록 + scale, 오답 시 빨강 + shake 이 보이고 다른 버튼은 비활성화.

### 5단계: GREEN — 테스트 통과 & `.ai.md` 작성

1. `pnpm -C apps/web test` (또는 `vitest run tests/integration/student-quiz.test.ts`) 으로 3 테스트 통과 확인
2. `apps/web/src/app/(student)/quiz/.ai.md` 작성 — 페이지 목적, 데이터 흐름 (sessionStorage → useStudentQuestions → INSERT), Realtime 채널 스펙
3. `docs/ai-report/daily-log.md` 에 오늘 일자 섹션으로 AI 활용 내역 추가 (불변식 1)

**DoD**: 테스트 초록, `.ai.md` 존재, daily-log 업데이트 완료.

## Guardrails

### Must Have
- [ ] sessionStorage `studentSession` 가드 — waiting 페이지와 동일 패턴. 없거나 `sessionId` 불일치 시 `/join` 리다이렉트
- [ ] 중복 응답 클라이언트 가드 — `answeredQuestionIds: Set<string>` 로 버튼 비활성화. 클릭 시작 시점에 set 에 추가하고 INSERT 실패 시에만 롤백
- [ ] `calculateScore(isCorrect, responseTimeMs)` 재사용 (새 점수 로직 작성 금지)
- [ ] `useSessionStatus` 재사용 — `ended` 감지
- [ ] Realtime 채널명: `session:{sessionId}:questions` (dev-spec §4.3)
- [ ] anon 클라이언트로 `responses` SELECT 시도 금지 (RLS 차단) — INSERT 만 수행, 점수/정오답은 전부 로컬 계산
- [ ] `questions` 는 `question_order` 오름차순 정렬 고정
- [ ] cleanup — 페이지 unmount 시 Realtime 채널 `removeChannel`
- [ ] 테스트 파일 환경변수 없으면 `describe.skipIf(skip)` 로 스킵
- [ ] `.ai.md` 신규 디렉토리에 반드시 작성

### Must NOT Have
- [ ] `responses` 테이블 SELECT / 리더보드 UI — #34 범위
- [ ] 교사의 "현재 문항 인덱스" 동기화용 sessions 컬럼 추가 — 스키마 변경 금지. `questions` 테이블의 Realtime INSERT/UPDATE + 로컬 `answeredQuestionIds` 로 해결
- [ ] `responses` 테이블 `(session_id, question_id, nickname)` unique 제약 마이그레이션 — 현 이슈 범위 밖. DB 레벨 중복 방지는 후속 이슈로 분리
- [ ] 서버 액션 / Route Handler 경유 INSERT — dev-spec §5 IU-01 에 "Supabase Direct" 로 명시됨
- [ ] 교사 편집 화면 수정 — `useQuestions.ts` 건드리지 않는다
- [ ] 점수 집계·랭킹 계산 — #34/#37 범위
- [ ] `next/dynamic` / SSR 복잡화 — page.tsx 최상단 `'use client'`
- [ ] 새 전역 상태 라이브러리 도입 (zustand 등) 금지 — `useState` + `useRef` 만 사용

## 호환성 주의사항

1. **waiting → quiz 라우팅 경로 고정**
   - `waiting/[sessionId]/page.tsx` 가 `router.push(`/quiz/${sessionId}`)` 로 이동하므로, 페이지 경로는 반드시 `(student)/quiz/[sessionId]/page.tsx` 로 한다. 라우트 그룹 `(student)` 는 URL 에 노출되지 않음

2. **sessionStorage 키 통일**
   - 키명 `studentSession`, 스키마 `{sessionId, nickname}` — waiting 페이지와 동일하게 유지. 새 키 만들지 말 것

3. **responses RLS — INSERT 전용**
   - anon 은 SELECT 불가. 클라이언트는 INSERT 후 반환되는 row 에만 의존 (`.select().single()` 으로 본인 row 확인은 가능)
   - 정답/오답·점수는 **전부 로컬 계산** 후 INSERT 바디에 포함. 서버 검증 의존 금지

4. **questions RLS — active 세션에서만 SELECT 허용**
   - sessions.status 가 `ended` 로 전환되면 questions 조회가 차단될 수 있음 → 종료 감지 시 별도 UI 분기

5. **중복 응답 — 클라이언트 가드 한계**
   - 새로고침 시 `answeredQuestionIds` state 가 휘발됨. 본 이슈는 "동일 세션 내 클릭 연타 방지" 만 보장. 새로고침 후 중복 INSERT 방지는 sessionStorage 영속화 또는 DB unique 제약으로 후속 이슈화
   - AC "동일 question_id 두 번째 클릭 차단" 은 연타 차단 의미로 해석

6. **Realtime 채널 정리**
   - `useStudentQuestions` 와 `useSessionStatus` 가 각각 채널을 열어도 무방. 언마운트 시 양쪽 모두 `removeChannel` 필수 — 메모리 누수 방지

7. **questions 0건 상태**
   - 교사가 아직 문항을 만들지 않은 active 세션 — "곧 문제가 시작됩니다" placeholder 렌더 필요. Realtime INSERT 수신 시 자동 진입

8. **#34 리더보드 준비**
   - 본 이슈에서 `responses.score` 를 정확히 저장해야 #34 가 집계 가능. INSERT 바디에 `score` 반드시 포함 (0 점 오답 케이스 포함)

9. **타입 안정성**
   - `currentQuestion.options` 는 `Json` 타입 → `(options as string[])` 캐스팅 또는 런타임 가드. 교사 CRUD 훅이 `string[]` 으로 저장하므로 배열 가드만 체크

10. **테스트 격리**
    - `student-join.test.ts` 와 teacher id 충돌 가능 → 서로 다른 UUID 사용 또는 `upsert` 로 안전하게 보장
    - `createdSessionIds` 에 추가한 세션은 `afterAll` 에서 반드시 삭제 (cascade 로 questions/responses 도 정리)
