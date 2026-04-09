# 구현 계획 — #31 교사 대시보드 — 세션 목록 + 실시간 집계 차트 (IU-03)

> dev-spec §5 IU-03 / §4.3 Realtime 채널 매트릭스 기반 구현 계획.
> route group(`(teacher)`) 미사용 — 기존 `apps/web/src/app/teacher/` 경로를 그대로 사용한다.

## AC 체크리스트

- [ ] `apps/web/src/app/teacher/dashboard/page.tsx` — 세션 목록 사이드바 + 단일 select 필터 (status)
- [ ] `apps/web/src/app/teacher/sessions/[id]/page.tsx` — 세션 상세: 실시간 참여 인원 + 문항별 차트 + (옵션) InsightPanel 슬롯
- [ ] `groupByQuestion` 재사용 (`apps/web/src/lib/aggregate.ts`) — 신규 구현 금지, 기존 함수 호출
- [ ] `apps/web/src/components/dashboard/ResponseChart.tsx` — CSS flex 바 차트 (Recharts/Chart.js 금지)
- [ ] `apps/web/src/hooks/useRealtimeResponses.ts` — responses INSERT 구독 훅 (리더보드 #34에서도 재사용 가능한 형태)
- [ ] 통합 테스트 TEST-IU3-I01~I03
  - I01: 본인 세션만 목록에 조회 (RLS)
  - I02: `loadDashboardData(sessionId)` — Promise.all 병렬 fetch (sessions/questions/responses)
  - I03: `useRealtimeResponses` 콜백이 INSERT 이벤트를 상태에 반영
- [ ] `.ai.md` 갱신: `apps/web/src/app/teacher/dashboard/`, `apps/web/src/app/teacher/sessions/[id]/`, `apps/web/src/components/dashboard/`, `apps/web/src/hooks/`
- [ ] `docs/ai-report/daily-log.md` 기록 (불변식 1)

## 변경/생성 파일 목록

### 신규 생성

| 경로 | 역할 |
|---|---|
| `apps/web/src/hooks/useRealtimeResponses.ts` | Client 훅. 초기 fetch + `supabase.channel('session-responses-{id}').on('postgres_changes', INSERT, table=responses, filter=session_id=eq.{id})` |
| `apps/web/src/lib/dashboard.ts` | Server-side `loadDashboardData(sessionId, userId)` — sessions/questions/responses를 `Promise.all`로 병렬 fetch |
| `apps/web/src/components/dashboard/ResponseChart.tsx` | Client 컴포넌트. `GroupedQuestion[]`을 입력받아 문항별 정답률 + 4개 선택지 분포 CSS flex 바로 렌더 |
| `apps/web/src/components/dashboard/SessionSidebar.tsx` | Client 컴포넌트. 세션 목록 + status select 필터 (`all` / `draft` / `active` / `ended`) |
| `apps/web/src/components/dashboard/SessionDetailClient.tsx` | Client 컴포넌트. 초기 데이터 주입 후 `useRealtimeResponses`로 실시간 갱신 → `ResponseChart` 렌더 |
| `apps/web/src/app/teacher/sessions/[id]/page.tsx` | Server Component. 소유권 검증 + 초기 데이터 fetch 후 `SessionDetailClient` 주입 |
| `apps/web/tests/integration/dashboard-fetch.test.ts` | TEST-IU3-I01, I02 (RLS 격리 + Promise.all fetch) |
| `apps/web/tests/unit/useRealtimeResponses.test.ts` | TEST-IU3-I03 (Supabase 채널 mocking, INSERT 콜백 상태 반영) |
| `apps/web/tests/unit/ResponseChart.test.tsx` | `groupByQuestion` 출력 렌더 스냅샷/DOM 검증 |

### 수정

| 경로 | 수정 내용 |
|---|---|
| `apps/web/src/app/teacher/dashboard/page.tsx` | "준비 중" placeholder 제거 → Server Component로 본인 세션 목록 fetch → `SessionSidebar` + 빈 상세 영역 렌더 |
| `apps/web/src/app/teacher/layout.tsx` | 변경 없음 (이미 auth redirect 포함) — 건드리지 않음 |
| 각 디렉토리 `.ai.md` | 신규 파일 반영 |

## 구현 단계

### 1단계 — RED: 통합/유닛 테스트 선작성

1. `apps/web/tests/integration/dashboard-fetch.test.ts` 작성
   - 기존 `questions-crud.test.ts`의 RLS 셋업 패턴(admin + 2명의 teacher client) 재사용
   - I01: teacherA로 세션 생성 → teacherB의 `loadDashboardData`가 해당 세션을 못 읽는다 (RLS로 빈 배열)
   - I02: `loadDashboardData(sessionId, teacherAId)` 호출 → sessions/questions/responses 3개 쿼리가 **Promise.all 병렬**로 실행됨을 검증 (각 쿼리 시작 시점을 spy로 측정하거나, 결과 shape 기준으로 검증)
2. `apps/web/tests/unit/useRealtimeResponses.test.ts` 작성
   - `@/lib/supabase/client`의 `createClient`를 vi.mock으로 교체
   - I03: INSERT payload를 수동 트리거 → `renderHook` 결과의 responses 배열 길이가 +1 되는지 검증
3. `apps/web/tests/unit/ResponseChart.test.tsx` 작성
   - `groupByQuestion` 실제 호출 결과를 prop으로 주입 → 정답률 퍼센트 텍스트와 4개 막대 DOM 존재 확인

**Acceptance**: `pnpm --filter web test` 실행 시 세 테스트가 모두 RED(실패). 실패 메시지가 "모듈 없음" 이어야 한다 (가짜 통과 방지).

### 2단계 — GREEN: 데이터 로드 레이어

1. `apps/web/src/lib/dashboard.ts`
   ```ts
   export interface DashboardData {
     session: Session;
     questions: Question[];
     responses: ResponseRow[];
   }
   export async function loadDashboardData(
     supabase: SupabaseClient<Database>,
     sessionId: string
   ): Promise<DashboardData>
   ```
   - 내부에서 `Promise.all([sessions.select().eq('id',…).single(), questions.select().eq('session_id',…).order('question_order'), responses.select().eq('session_id',…)])` 호출
   - RLS는 호출 측 클라이언트에 위임 (소유권은 sessions RLS가 막음)
   - 반환 타입은 `apps/web/src/lib/aggregate.ts`의 `Question`/`Response` 형태로 정규화 (options: `string[]`, answer: `number`)
2. `apps/web/src/app/teacher/dashboard/page.tsx`
   - 기존 placeholder 제거
   - Server Component에서 `user.id` 기준으로 `sessions.select('id,title,subject,grade,status,created_at').eq('teacher_id', user.id).order('created_at', { ascending: false })` 실행
   - `<SessionSidebar sessions={...} />`와 초기 안내 패널을 flex 2컬럼 레이아웃으로 배치

**Acceptance**: 통합 테스트 I01/I02 GREEN.

### 3단계 — Realtime 훅 + 차트 컴포넌트

1. `apps/web/src/hooks/useRealtimeResponses.ts`
   - 시그니처: `useRealtimeResponses(sessionId: string, initial: ResponseRow[]): { responses: ResponseRow[]; participantCount: number }`
   - `useSessionStatus.ts` 패턴을 그대로 따라간다 (channel name `session-responses-${sessionId}`, `on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'responses', filter: 'session_id=eq.'+sessionId }, …)`)
   - 언마운트 시 `supabase.removeChannel(channel)`
   - `participantCount`는 응답 배열에서 unique `nickname` 개수로 파생 (useMemo)
2. `apps/web/src/components/dashboard/ResponseChart.tsx`
   - Props: `{ questions: Question[]; responses: Response[] }`
   - 내부에서 `groupByQuestion(questions, responses)` 호출 → 각 문항에 대해:
     - 정답률 큰 숫자 표시 (`Math.round(correct_rate * 100)%`)
     - 4개 선택지 flex row — `width: ${ratio * 100}%` 인라인 스타일 또는 Tailwind `w-[…]` 동적
     - 정답 선택지는 `bg-green-500`, 나머지는 `bg-gray-300`, 가장 많이 선택된 오답은 `bg-red-400`
   - **Chart.js/Recharts/동적 import 금지** — 순수 div flex

**Acceptance**: 유닛 테스트 I03 + ResponseChart 렌더 테스트 GREEN.

### 4단계 — 세션 상세 페이지 + 사이드바 와이어링

1. `apps/web/src/app/teacher/sessions/[id]/page.tsx`
   - Server Component. `apps/web/src/app/teacher/sessions/[id]/edit/page.tsx`의 auth/소유권 검증 패턴 재사용 (`getUser` → sessions `.eq('teacher_id', user.id).single()` → `notFound()`)
   - `loadDashboardData(supabase, id)` 호출 → `<SessionDetailClient initial={...} />` 렌더
   - 헤더에 `title`, `subject`, `grade`, `status` 뱃지 표시
2. `apps/web/src/components/dashboard/SessionDetailClient.tsx`
   - `'use client'`
   - Props: `{ session, questions, initialResponses }`
   - `useRealtimeResponses(session.id, initialResponses)` → `responses`, `participantCount`
   - 상단: 참여 인원 뱃지 (`👥 {participantCount}명 참여중`) + 총 응답 수
   - 본문: `<ResponseChart questions={questions} responses={responses} />`
   - 하단: (존재하면) `<InsightPanel>` 재사용 슬롯 — 이번 이슈에서는 placeholder 주석만 남긴다 (#37은 이미 구현되어 있으나 연결은 후속 작업)
3. `apps/web/src/components/dashboard/SessionSidebar.tsx`
   - `'use client'` — select 필터 상태 관리
   - 세션 리스트 → 각 항목 `next/link`로 `/teacher/sessions/{id}` 로 이동
   - select: `all | draft | active | ended`

**Acceptance**: 로컬에서 `/teacher/dashboard` → 세션 클릭 → 상세 페이지에서 차트 렌더, status 뱃지 표시, Supabase SQL Editor로 responses INSERT 시 차트가 수 초 내 갱신됨.

### 5단계 — 문서 및 마감

1. 변경된 각 디렉토리에 `.ai.md` 신규/갱신 (목적/구조/역할)
2. `docs/ai-report/daily-log.md`에 오늘 자 항목 추가 (사용 도구 / 주요 프롬프트 / AI 주도 영역 / 인간 주도 영역)
3. `scripts/check_invariants.py` 로컬 실행 (불변식 1/2/3 확인)
4. `pnpm --filter web lint && pnpm --filter web typecheck && pnpm --filter web test` 전부 PASS
5. `~/.claude/.last-task-summary`에 "#31 교사 대시보드 구현 완료" 기록

## Guardrails

### Must Have

- 기존 `groupByQuestion` (`apps/web/src/lib/aggregate.ts`)를 **재사용**한다. 문항 집계 로직을 새로 작성하지 않는다.
- Realtime 훅은 `apps/web/src/hooks/useSessionStatus.ts`의 패턴(채널 이름, cleanup, createClient)을 따른다.
- `sessions/[id]/page.tsx`는 Server Component로 auth + 소유권 검증 후 초기 데이터를 HTML에 embed하여 Client에 넘긴다 (FCP 보장).
- 모든 데이터 fetch는 `Promise.all`로 병렬 처리 (sessions, questions, responses).
- 통합 테스트는 기존 `questions-crud.test.ts`의 `describe.skipIf(skip)` + admin/teacherA/teacherB 패턴을 따른다.
- 옵션 분포 차트는 `option_distribution: number[4]` 구조를 전제로 4개 막대를 렌더한다.
- `.ai.md` 갱신 및 `daily-log.md` 기록은 불변식이므로 생략 불가.

### Must NOT Have

- Recharts, Chart.js, D3, Victory 등 차트 라이브러리 **추가 금지** (`package.json` 수정 금지).
- `apps/web/src/app/(teacher)/**` route group 생성 금지 — 기존 `apps/web/src/app/teacher/**` 경로 그대로 사용.
- `apps/web/src/app/teacher/sessions/[id]/edit/` 를 건드리지 않는다. `[id]/page.tsx`는 신규 파일이며 edit과 독립적이다.
- `sessions/[id]/page.tsx`에서 teacher 본인 확인 누락 금지 — RLS만 의존하지 말고 `.eq('teacher_id', user.id).single()` + `notFound()` 명시.
- InsightPanel 생성/수정 금지 — 이미 구현되어 있으며 이번 이슈 범위 밖이다 (슬롯만 남긴다).
- Realtime 구독에서 `postgres_changes` 외 Broadcast/Presence 채널 사용 금지 (dev-spec §4.3).
- `aggregateResponses`(AI용)를 대시보드 UI에 끌어다 쓰지 않는다. UI는 `groupByQuestion`만 사용.
- 레이아웃을 바꾸는 목적으로 `teacher/layout.tsx`를 수정하지 않는다.
- Server Component에 `'use client'`를 붙이거나, Client 컴포넌트에서 직접 `createClient` (server 버전)을 import하지 않는다.

## 호환성 주의사항

- **#28 (세션 생성)**: `sessions` 스키마가 확정되어 있다. `status` enum은 `draft | active | ended` 3개로만 필터한다.
- **#29 (문항 CRUD)**: `questions.options`는 `jsonb` → `string[]`로 파싱되고, `correct_answer`는 0-based int. 본 이슈에서는 읽기만 한다.
- **#30 (live 활성화)**: live 페이지에서 세션을 `active`로 바꾼 직후 `/teacher/sessions/[id]`로 이동했을 때 상세 페이지의 status 뱃지가 최신이어야 한다. 초기 데이터는 Server Component가 fetch하므로 자동 충족되나, status 변경 대응이 필요하면 추후 `useSessionStatus` 훅을 추가로 붙일 수 있도록 `SessionDetailClient`에 확장 지점을 남긴다.
- **#33 (학생 응답 INSERT)**: 학생이 `responses`를 INSERT하면 동일 채널(`session-responses-{id}`)을 통해 대시보드에 반영되어야 한다. 채널 이름을 문서화해 #33 구현 시 충돌을 방지한다.
- **#34 (리더보드)**: `useRealtimeResponses` 훅은 리더보드에서도 동일 채널을 구독할 수 있도록 `sessionId`만 입력받고 파생 데이터는 훅 외부에서 계산하는 얇은 설계로 유지한다. 훅에 리더보드 전용 로직(랭킹 계산)을 넣지 않는다.
- **#37 (AI 인사이트)**: `InsightPanel`은 이미 존재한다 (`apps/web/src/components/dashboard/InsightPanel.tsx`). 본 이슈에서는 import하지 않고 `SessionDetailClient`에 placeholder 주석만 남긴다. 실제 연결은 후속 작업(#37의 API 호출 및 placement)에서 수행한다.
- **RLS**: sessions는 `teacher_id = auth.uid()`로 보호되지만, responses는 학생이 무인증으로 INSERT할 수 있어야 하므로 SELECT 정책이 다를 수 있다. 통합 테스트에서 teacher B가 teacher A 세션의 responses를 조회할 수 없는지 확인한다. 만약 RLS가 허용하고 있다면 이 이슈 범위에서 **수정하지 않고** `docs/work/active/000031-teacher-dashboard/` 에 발견 사항을 남기고 별도 이슈로 분리한다.
- **Supabase Realtime publication**: `responses` 테이블이 Realtime publication에 포함되어 있지 않으면 훅이 조용히 실패한다. 2단계 GREEN 후 로컬에서 수동 검증하고, 누락 시 `supabase/migrations/`에 `alter publication supabase_realtime add table responses;` 마이그레이션을 추가한다 (존재 여부는 구현 시 확인).
- **타입 일관성**: `database.ts`의 `responses.Row`는 `selected_answer`/`is_correct`/`response_time_ms` 필드를 쓰지만 `aggregate.ts`의 `Response` 타입은 `answer`/`is_correct`/`response_time_ms`를 쓴다. `loadDashboardData`에서 DB row를 aggregate용 타입으로 **매핑**(`answer = selected_answer`)하는 헬퍼를 명시적으로 둔다.
