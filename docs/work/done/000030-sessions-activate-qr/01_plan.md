# 구현 계획 — #30 세션 활성화·종료 API + QR 코드 생성 (IU-05)

## AC 체크리스트
- [ ] `POST /api/sessions/[id]/activate` — status `draft → active`, `started_at = now()`, 소유권 체크
- [ ] `POST /api/sessions/[id]/end` — status `active → ended`, `ended_at = now()`
- [ ] QR 코드 생성 (`qrcode` 패키지) — `${BASE_URL}/join/${join_code}` 기준
- [ ] QR 이미지 다운로드 버튼 (PNG)
- [ ] `apps/web/src/app/teacher/sessions/[id]/live/page.tsx` — QR + join_code + 시작/종료 버튼
  - ⚠️ 이슈 원문의 `(teacher)` route group 경로는 실제 코드베이스에 존재하지 않으므로 `teacher/` 경로 사용
- [ ] 통합 테스트 TEST-IU5-I04: activate 호출 → status 변경
- [ ] 통합 테스트: end 호출 → `ended_at` 저장

## 변경/생성 파일 목록

### 신규 생성
| 파일 | 역할 |
|------|------|
| `apps/web/src/app/api/sessions/[id]/activate/route.ts` | POST 핸들러 — `draft→active` 전이, `started_at=now()`, 소유권 검증 |
| `apps/web/src/app/api/sessions/[id]/end/route.ts` | POST 핸들러 — `active→ended` 전이, `ended_at=now()`, 소유권 검증 |
| `apps/web/src/components/shared/QRCodeDisplay.tsx` | 클라이언트 컴포넌트 — `qrcode.toDataURL()` + 다운로드 버튼 (PNG) |
| `apps/web/src/components/shared/.ai.md` | 신규 디렉토리 — 목적·구조·역할 (레포 규칙 3) |
| `apps/web/src/app/teacher/sessions/[id]/live/page.tsx` | Server Component — 세션 조회 + LiveSessionClient 렌더 |
| `apps/web/src/app/teacher/sessions/[id]/live/LiveSessionClient.tsx` | Client Component — QR + 시작/종료 버튼 + 상태별 UI |
| `apps/web/tests/integration/api/session-lifecycle.test.ts` | 통합 테스트 (Vitest) — activate/end 상태 전이, 소유권, 무효 전이 |

### 수정
| 파일 | 변경 내용 |
|------|-----------|
| `apps/web/package.json` | `qrcode`, `@types/qrcode` 의존성 추가 |
| `apps/web/.env.local` | `NEXT_PUBLIC_BASE_URL=http://localhost:3000` 추가 |
| `apps/web/.env.example` (존재 시) | 동일 env 키 샘플 추가 |
| `apps/web/src/app/teacher/sessions/[id]/edit/page.tsx` | 상단에 "라이브 세션 열기" 링크 추가 (→ `/teacher/sessions/[id]/live`) |
| `apps/web/src/app/teacher/.ai.md` (존재 시) | `sessions/[id]/live` 경로 설명 추가 |
| `apps/web/src/app/api/sessions/.ai.md` (존재 시) | `[id]/activate`, `[id]/end` 엔드포인트 설명 추가 |

---

## 구현 단계

### 1단계 — 환경 세팅 & 의존성 설치
1. `apps/web` 워크스페이스에서 `npm i qrcode @types/qrcode` 실행
2. `apps/web/.env.local`에 `NEXT_PUBLIC_BASE_URL=http://localhost:3000` 추가
3. `apps/web/.env.example`이 있다면 동일 키 샘플 추가
4. 타입체크 사전 확인 (`npm run typecheck` 또는 워크스페이스 기준)

**완료 기준**: `qrcode` import가 TS 에러 없이 동작, `process.env.NEXT_PUBLIC_BASE_URL`이 런타임에 접근 가능.

---

### 2단계 — 통합 테스트 먼저 작성 (RED)
`apps/web/tests/integration/api/session-lifecycle.test.ts` 작성. 기존 `sessions-create.test.ts` 패턴 그대로 따름 (skipIf + admin/teacher 2명 + Supabase 클라이언트 직접 호출).

테스트 케이스(최소):
1. `draft` 세션 생성 → 교사 A 토큰으로 UPDATE(`status='active', started_at=now()`) → 성공, `started_at` not null 확인
2. 1의 `active` 세션 → UPDATE(`status='ended', ended_at=now()`) → 성공, `ended_at` not null 확인
3. 교사 B 토큰으로 교사 A의 세션 activate 시도 → RLS로 차단 (업데이트 행 수 0)
4. 이미 `active`인 세션을 `draft` 가드로 다시 activate 시도 → 업데이트 행 수 0 (멱등성)
5. `draft`인 세션을 `active` 가드로 end 시도 → 업데이트 행 수 0

> 테스트 전략 주의: 기존 `sessions-create.test.ts`는 Next.js 라우트를 띄우지 않고 Supabase 클라이언트의 RLS/DB만 검증한다. 동일 전략을 유지하되 **상태 전이 가드(`.eq('status', 'draft'|'active')`)** 는 라우트 핸들러에도 동일하게 존재함을 주석으로 명시한다. 라우트 핸들러 자체의 HTTP 응답 검증은 5단계 수동 smoke test로 보완.

**완료 기준**: 모든 케이스가 RED 또는 DB 레벨에서 GREEN (라우트 핸들러 구현 후 3단계에서 다시 통과 확인).

---

### 3단계 — API 라우트 구현 (GREEN)

#### `apps/web/src/app/api/sessions/[id]/activate/route.ts`
- `createClient()` from `@/lib/supabase/server` 사용 (`sessions/route.ts` 패턴 준수)
- `supabase.auth.getUser()` → 미인증 시 401 `UNAUTHORIZED`
- `params`는 `Promise<{ id: string }>`으로 비구조화 (Next 15 규격, edit page.tsx 참조)
- UPDATE 쿼리:
  ```
  .from('sessions')
  .update({ status: 'active', started_at: new Date().toISOString() })
  .eq('id', id)
  .eq('teacher_id', user.id)   // 소유권 가드 (RLS 이중 방어)
  .eq('status', 'draft')       // 상태 전이 가드 (race 방지)
  .select('id, status, started_at')
  .single()
  ```
- `single()` 에러 또는 data null → 409 `INVALID_TRANSITION`
- 기타 DB 에러 → 500 `DB_ERROR`
- 성공 → 200 `{ id, status, started_at }`

#### `apps/web/src/app/api/sessions/[id]/end/route.ts`
- 동일 패턴
- UPDATE: `status: 'ended'`, `ended_at: new Date().toISOString()`
- 가드: `.eq('status', 'active')`
- 응답: 200 `{ id, status, ended_at }`

**응답 스펙 (공통)**:
- 200: `{ id, status, started_at|ended_at }`
- 401: `{ error: 'UNAUTHORIZED' }`
- 409: `{ error: 'INVALID_TRANSITION' }`
- 500: `{ error: 'DB_ERROR', details }`

**완료 기준**: 라우트 핸들러 2개 작동, 2단계 RED 테스트가 GREEN으로 전환.

---

### 4단계 — QRCodeDisplay 컴포넌트 + Live 페이지 UI

#### `apps/web/src/components/shared/QRCodeDisplay.tsx` (Client Component)
- `'use client'` 지시자 필수
- Props: `{ value: string; size?: number }` (기본 320px)
- `useEffect` 내에서 `QRCode.toDataURL(value, { width: size, margin: 2 })` 비동기 호출 → `useState`에 dataUrl 저장
- 다운로드 버튼: `<a download="session-qr.png" href={dataUrl}>` 패턴 또는 click 핸들러로 동적 앵커 생성
- dataUrl 준비 전에는 버튼 disabled

#### `apps/web/src/app/teacher/sessions/[id]/live/page.tsx` (Server Component)
- `edit/page.tsx` 패턴 복제
- `createClient()` → `auth.getUser()` → 미인증 시 `redirect('/login')`
- `sessions` 조회: `.eq('id', id).eq('teacher_id', user.id).single()` + `notFound()` on null
- 셀렉트 컬럼: `id, title, subject, grade, status, join_code, started_at, ended_at`
- `const base = process.env.NEXT_PUBLIC_BASE_URL ?? ''`
- `const joinUrl = `${base}/join/${session.join_code}``
- `<LiveSessionClient session={session} joinUrl={joinUrl} />` 렌더

#### `apps/web/src/app/teacher/sessions/[id]/live/LiveSessionClient.tsx` (Client Component)
- `'use client'`, `useRouter` from `next/navigation`
- 상태별 UI:
  - `draft`: "세션 시작" 버튼 활성 → `fetch('/api/sessions/{id}/activate', { method: 'POST' })` → 성공 시 `router.refresh()`
  - `active`: "세션 종료" 버튼 활성 → `fetch('/api/sessions/{id}/end', { method: 'POST' })` → 성공 시 `router.refresh()`
  - `ended`: 버튼 숨김, "종료된 세션" 배지 표시
- `join_code`를 큰 글씨(예: text-4xl)로 표시 + `joinUrl` 아래에 작게 표시
- `<QRCodeDisplay value={joinUrl} size={320} />` 렌더
- 요청 중 `isPending` state로 버튼 중복 클릭 방지
- 실패 응답 시 간단한 에러 토스트/알림 (기존 공통 토스트 없으면 `alert` 또는 inline 에러 메시지)

**완료 기준**: `/teacher/sessions/{id}/live` 접근 시 QR 렌더, 시작/종료 버튼이 상태에 맞게 동작, PNG 다운로드 작동.

---

### 5단계 — edit → live 링크 + 문서 업데이트 + Smoke Test
1. `apps/web/src/app/teacher/sessions/[id]/edit/page.tsx` 헤더 영역에 `<Link href={`/teacher/sessions/${id}/live`}>라이브 세션 열기</Link>` 추가 (Server Component이므로 `next/link` 사용)
2. `apps/web/src/components/shared/.ai.md` 신규 작성 (공유 컴포넌트 디렉토리 목적·구조·역할)
3. 관련 기존 `.ai.md` 최신화 (teacher/, api/sessions/ — 존재할 경우)
4. `docs/ai-report/daily-log.md`에 AI 활용 내역 추가 (사용 도구, 주요 프롬프트, AI/인간 기여 구분) — 불변식 1
5. 수동 smoke test:
   - 로컬 Supabase 기동 → 교사 로그인 → 세션 생성
   - edit → "라이브 세션 열기" → QR 렌더 확인
   - 별도 탭에서 학생 참여 화면 (`/join/{code}` → 대기)
   - "세션 시작" 클릭 → 학생 대기화면이 Realtime으로 상태 전파 받아 `/quiz/[sessionId]`로 리다이렉트 (이슈 #31, #33 의존 동작 검증)
   - "세션 종료" 클릭 → 상태 `ended` 전이 확인, `ended_at` 저장 확인

**완료 기준**: 통합 테스트 GREEN, lint/typecheck 통과, `.ai.md` + `daily-log.md` 업데이트, smoke test 성공.

---

## Guardrails

### Must Have
- `createClient()` from `@/lib/supabase/server` 사용 (`sessions/route.ts` 패턴 준수)
- 모든 라우트에서 `supabase.auth.getUser()`로 인증 확인
- 상태 전이 가드: `.eq('status', ...)`를 UPDATE 쿼리에 포함 (race condition 방지)
- 소유권 가드: `.eq('teacher_id', user.id)`를 UPDATE에 포함 (RLS 이중 방어)
- `NEXT_PUBLIC_BASE_URL`은 env에서만 읽기 (하드코딩 금지)
- QR 다운로드 파일명 고정 포맷 (`session-qr.png`)
- 통합 테스트는 기존 `skipIf` + 관리자 유저 cleanup 패턴 유지
- `.ai.md` 최신화 (레포 규칙 5)
- `docs/ai-report/daily-log.md` 기록 (불변식 1)
- TDD: 테스트 먼저 작성 (Red → Green → Refactor)
- Next 15 `params` 비구조화 시 `await params` 사용 (edit page.tsx 참조)
- `QRCodeDisplay`는 `'use client'` 컴포넌트로만 구현

### Must NOT Have
- 실제 Next.js 서버를 띄우는 테스트 런너 도입 금지 (기존 전략 존중: DB/RLS 직접 호출)
- `POST /api/sessions/[id]/activate`가 `draft` 이외 상태에서 성공 응답 반환 금지
- `POST /api/sessions/[id]/end`가 `active` 이외 상태에서 성공 응답 반환 금지
- `useSessionStatus` 훅 수정 금지 (이미 존재, 학생 측 Realtime 구독에 사용 중)
- Server Component에서 `qrcode` import 금지 (Client Component에서만)
- 신규 `app/(teacher)` route group 생성 금지 — 기존 `app/teacher/` 구조 유지
- 활성화/종료 라우트에서 중복 UPDATE 금지 (Realtime 레이스 방지)
- 새로운 RLS 정책 추가 금지 (기존 정책 재사용)
- 계획 범위 외 파일/디렉토리 신규 생성 금지
- `git commit`/`git push` 자동 실행 금지 (CLAUDE.md 행동 규칙)
- `*.pdf|*.csv|*.pkl|*.parquet` 커밋 금지 (레포 규칙 2)

---

## 호환성 주의사항

1. **#28 (세션 생성)과의 연계**
   - `POST /api/sessions`는 `status='draft'`로 생성. activate는 `draft→active` 전이 가드를 반드시 체크 (반영 완료).

2. **#31/#33 (학생 대기/퀴즈 화면)과의 연계**
   - `useSessionStatus` 훅이 Realtime `postgres_changes`의 `UPDATE` 이벤트를 구독 (`apps/web/src/hooks/useSessionStatus.ts` 확인).
   - activate가 sessions 행을 UPDATE하면 자동 전파 → 학생이 `/quiz/[sessionId]`로 리다이렉트.
   - activate 라우트는 **UPDATE 쿼리를 1번만** 실행해야 함 (중복 UPDATE → 중복 이벤트 → 클라이언트 레이스).
   - `sessions` 테이블이 Realtime publication에 포함되어야 함. 누락 시 별도 마이그레이션 이슈로 에스컬레이션 (본 이슈 범위 외).

3. **Route group 불일치**
   - 이슈 원문: `app/(teacher)/sessions/[id]/live/page.tsx`
   - 실제 코드베이스: `app/teacher/` (route group 없음, layout.tsx 존재)
   - **결정**: 실제 구조에 맞춰 `app/teacher/sessions/[id]/live/page.tsx`로 생성. 이슈 본문은 수정하지 않고 본 01_plan.md에 차이를 명시하여 갈음.

4. **`sessions` 테이블 RLS 정책**
   - 교사는 자기 세션 전체 권한. activate/end UPDATE가 통과하려면 RLS UPDATE 정책이 `teacher_id = auth.uid()` 기준으로 허용되어야 함 (이미 반영 전제).
   - 누락 시 마이그레이션 이슈로 분리. 본 이슈에서 새 RLS 정책 추가 금지.

5. **`qrcode` 패키지 & Next.js 15 호환성**
   - Client Component에서만 사용 (`'use client'` 필수)
   - Server Component에서 import 시 번들/Edge 런타임 리스크 → 사용 금지
   - `useEffect` 내에서 비동기 `toDataURL` 호출하여 hydration mismatch 방지

6. **`NEXT_PUBLIC_BASE_URL` 기본값**
   - 로컬: `http://localhost:3000`
   - 프로덕션: Vercel 등에서 `https://<domain>`으로 덮어쓸 것
   - `.env.example`이 존재하면 반드시 갱신 (온보딩 마찰 최소화)

7. **중복 클릭/이중 제출 방어**
   - `LiveSessionClient`에서 fetch 중 `isPending` state로 버튼 disabled
   - 라우트 핸들러의 상태 가드(`.eq('status', ...)`)가 DB 레벨 방어선 — 두 번째 요청은 409 응답

8. **edit 페이지 링크 추가 시**
   - 기존 `edit/page.tsx`는 Server Component → `next/link`의 `<Link>` 사용 (클라이언트 핸들러 불필요)
   - 레이아웃 최소 수정 (h1 옆 또는 헤더 우측, 기존 디자인 유지)

9. **join_code 포맷**
   - `@/lib/join-code`의 `generateUniqueJoinCode`에서 생성된 포맷 그대로 사용
   - live 페이지는 `join_code`를 가공 없이 그대로 표시 (대소문자/하이픈 변형 금지)
