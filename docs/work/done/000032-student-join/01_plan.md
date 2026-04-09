# 구현 계획 — #32 feat: 학생 참여 화면 — join_code + 닉네임 + 대기 화면

## Component Tree

```
app/(student)/
├── layout.tsx              — 인증 불필요, anonymous 사용자용
├── join/
│   ├── page.tsx            — join_code + 닉네임 입력 폼 (직접 접속)
│   └── [code]/
│       └── page.tsx        — QR 스캔 진입 (code pre-filled)
└── waiting/
    └── [sessionId]/
        └── page.tsx        — 대기 화면 + Realtime 구독

src/hooks/
└── useSessionStatus.ts     — Supabase Realtime 구독 훅
```

## State Management

- 학생 정보(`sessionId`, `nickname`)는 **sessionStorage** 에 저장 (Supabase auth 사용 안 함)
- join 폼: `useState`로 로컬 폼 상태 관리
- 대기 화면: `useSessionStatus` 훅으로 Realtime 상태 구독
- 에러 표시: 컴포넌트 내부 `useState`

## Realtime Subscription Strategy

```typescript
// useSessionStatus 훅이 postgres_changes 이벤트 구독
supabase
  .channel(`session-status-${sessionId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'sessions',
    filter: `id=eq.${sessionId}`
  }, (payload) => { setStatus(payload.new.status) })
  .subscribe()
// unmount 시 supabase.removeChannel(channel) 클린업
```

- `status === 'active'` → `/quiz/${sessionId}` 로 이동
- `status === 'ended'` → "세션이 종료되었습니다" 표시

## TDD 체크리스트

- [x] TEST-IU1-I01: 유효 join_code + active 세션 → 성공, 세션 데이터 반환
- [x] TEST-IU1-I02: 존재하지 않는 join_code → 에러 반환
- [x] TEST-IU1-I03: inactive 세션(status!='active') join_code → 에러 반환

## AC 체크리스트

- [x] `apps/web/src/app/(student)/join/page.tsx` — join_code + 닉네임 입력 폼
- [x] `apps/web/src/app/(student)/join/[code]/page.tsx` — URL 파라미터 경로 (QR 스캔용)
- [x] `validateNickname` 적용 (#25 재사용)
- [x] `sessions` 익명 SELECT (`status='active'`) 확인
- [x] 비활성 세션 code → "세션을 찾을 수 없습니다" 에러
- [x] sessionStorage에 `{sessionId, nickname}` 저장
- [x] 대기 화면 + Realtime 구독 (draft→active 시 문제 화면 이동)
- [x] 통합 테스트 TEST-IU1-I01·I02·I03

## 개발 체크리스트

- [x] 통합 테스트 코드 작성 (Vitest)
- [x] `apps/web/src/app/(student)/.ai.md` 작성
- [x] `apps/web/src/hooks/.ai.md` 작성
- [x] `docs/ai-report/daily-log.md` 기록 (불변식 1)
- [x] 불변식 위반 없음
