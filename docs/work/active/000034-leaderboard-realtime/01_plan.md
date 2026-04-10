# 이슈 #34 리더보드 실시간 표시 구현 플랜

**작업 기간:** 2026-04-09 ~ (예상 3-5일)  
**담당자:** [작업자명]  
**이슈 링크:** [GitHub #34 리더보드 실시간 표시]

---

## 개요

세션별 학생 응답을 수집한 후, 닉네임별 총점을 계산하여 리더보드를 구성하고, 실시간(Realtime INSERT 구독 + 3초 폴링 폴백)으로 순위를 업데이트하는 기능을 구현한다. 학생 퀴즈 종료 화면과 교사 라이브 페이지에 리더보드를 표시한다.

---

## 스코프

**생성 파일:**
- `apps/web/src/lib/leaderboard.ts` — 순수 함수 `buildLeaderboard()` (점수 합산, 동점 정렬)
- `apps/web/src/hooks/useLeaderboard.ts` — 훅 (responses fetch + Realtime INSERT 구독 + 폴링)
- `apps/web/src/components/quiz/Leaderboard.tsx` — 리더보드 UI 컴포넌트 (순위 표시, 본인 닉네임 하이라이트)
- `apps/web/tests/unit/leaderboard.test.ts` — 단위 테스트 (정렬, 동점 처리)

**수정 파일:**
- `apps/web/src/app/(student)/quiz/[sessionId]/page.tsx` — 종료 화면에 `<Leaderboard/>` 추가
- `apps/web/src/app/teacher/sessions/[id]/live/LiveSessionClient.tsx` — LiveSessionClient에 `<Leaderboard/>` 추가

**참고 파일 (읽기만):**
- `apps/web/src/hooks/useSessionStatus.ts` — 폴링 폴백 패턴
- `apps/web/src/hooks/useRealtimeResponses.ts` — Realtime INSERT 구독 패턴
- `apps/web/src/lib/aggregate.ts` — responses 데이터 구조 참고

---

## 수락 기준 (AC) 항목별 구현 전략

### AC-1: `buildLeaderboard(responses)` 순수 함수 구현

**목표:**  
responses 배열을 입력받아, nickname별 총점을 계산하고, 동점 시 created_at(earliest first, ASC) 기준으로 정렬한 리더보드를 반환한다.

**구현 위치:** `apps/web/src/lib/leaderboard.ts`

**함수 시그니처:**
```typescript
export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  total_score: number;
  correct_count: number;
  response_count: number;
  first_response_at: string; // created_at 중 최소값
}

export function buildLeaderboard(responses: Array<{
  nickname: string;
  score: number;
  is_correct: boolean;
  submitted_at: string; // ISO 8601
}>): LeaderboardEntry[]
```

**정렬 규칙:**
1. `total_score` DESC (점수 높은 순)
2. `first_response_at` ASC (동점 시 먼저 응답한 사람 우선)
3. `rank` 필드는 1부터 순차 할당 (동점 시에도 순위 간격 없음: 1, 2, 3, ...)

**동점 케이스:**
- A 학생: 100점 (첫 응답 13:00:00)
- B 학생: 100점 (첫 응답 13:00:05)
- 결과: A(rank=1), B(rank=2)

**수락 조건:**
- 함수는 순수 함수 (외부 상태 변경 없음)
- 빈 배열 입력 시 빈 배열 반환
- responses 배열 변경하지 않음 (원본 보존)

---

### AC-2: `useLeaderboard(sessionId)` 훅 구현

**목표:**  
responses 데이터를 fetch하고, Realtime INSERT 구독으로 실시간 업데이트하며, 3초 폴링 폴백을 제공한다.

**구현 위치:** `apps/web/src/hooks/useLeaderboard.ts`

**훅 시그니처:**
```typescript
export function useLeaderboard(sessionId: string): {
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
}
```

**패턴 (기존 `useSessionStatus.ts` + `useRealtimeResponses.ts` 결합):**

1. **초기 fetch:** `responses` 테이블에서 `session_id=eq.{sessionId}` 필터링으로 모든 응답 조회
2. **Realtime 구독:** 채널 `leaderboard-{sessionId}` 생성 → INSERT 이벤트만 구독
3. **상태 관리:**
   - 로컬 state: `responses: ResponseRow[]`
   - 파생 데이터: `buildLeaderboard()` 호출 시점은 render 단계(useMemo/직접 계산)
4. **폴링 폴백:** 3초마다 fetch (Realtime 무시 이벤트 보정)
5. **정리:** unmount 시 clearInterval + removeChannel

**응답 Row 구조 (database.ts 참고):**
```typescript
type ResponseRow = {
  id: string;
  session_id: string;
  question_id: string;
  nickname: string;
  selected_answer: number;
  is_correct: boolean;
  response_time_ms: number;
  score: number;
  submitted_at: string; // ISO 8601
}
```

**수락 조건:**
- 초기 로딩 중 `isLoading=true` → 로딩 완료 후 `false`
- Realtime INSERT 이벤트 감지 시 즉시 화면 업데이트
- 폴링 활성 (Realtime 미수신 이벤트 보정)
- 훅 재호출(sessionId 변경) 시 기존 channel/timer 정리

---

### AC-3: `Leaderboard.tsx` UI 컴포넌트

**목표:**  
리더보드 엔트리를 순위순으로 표시하고, 현재 학생의 닉네임을 하이라이트한다.

**구현 위치:** `apps/web/src/components/quiz/Leaderboard.tsx`

**컴포넌트 Props:**
```typescript
interface Props {
  leaderboard: LeaderboardEntry[];
  currentNickname?: string; // 현재 학생 닉네임 (하이라이트용)
  isLoading?: boolean;
}
```

**UI 레이아웃:**
- 헤더: "🏅 리더보드" (또는 "실시간 순위")
- 참여 학생 수: "총 N명 참여"
- 순위 리스트:
  - 각 행: 순위 | 닉네임 | 총점 | 정답 수 / 응답 수
  - 현재 학생 닉네임 행: 밝은 파란색 배경 강조
  - 상위 3명: 메달 아이콘 (🥇 / 🥈 / 🥉)
- 로딩 상태: 스피너 표시
- 빈 리더보드: "응답 데이터가 없습니다" 메시지

**예상 모습 (구체 사항은 디자인팀 협의):**
```
┌─────────────────────────────────┐
│  🏅 실시간 순위                  │
│  총 5명 참여                      │
├─────────────────────────────────┤
│ 🥇 1. 김철수  100점 (5/5)       │
│ 🥈 2. 이영희   95점 (4/5)       │
│ 🥉 3. 박민준   95점 (4/5)       │
│     4. 홍길동   90점 (4/5)       │
│  ⭐ 5. 본인     85점 (3/5)       │  ← 현재 학생 강조
└─────────────────────────────────┘
```

**수락 조건:**
- 순위를 정확히 표시 (동점 처리 포함)
- 현재 학생 닉네임 강조 (배경색/테두리 등으로 시각화)
- 모바일 반응형 (max-width 제약)
- 로딩 상태 처리

---

### AC-4: 학생 종료 화면 통합

**목표:**  
`apps/web/src/app/(student)/quiz/[sessionId]/page.tsx`의 `status === 'ended'` 분기에 리더보드를 추가 표시한다.

**수정 전 상태:**
- 현재: 개인 결과 요약(점수, 정답률)만 표시

**수정 후 상태:**
- 개인 결과 요약 표시
- 그 아래 `<Leaderboard currentNickname={nickname} />` 추가
- useLeaderboard 훅 호출: `const { leaderboard, isLoading } = useLeaderboard(sessionId)`

**레이아웃:**
```
┌──────────────────┐
│ 🏆 퀴즈 종료!    │ (개인 결과)
│ 점수: 85        │
│ 정답률: 60%     │
│ [처음으로 버튼]  │
└──────────────────┘
        ↓
┌──────────────────┐
│ 🏅 리더보드     │ (추가)
│ (실시간 업데이트) │
│ 1. ...          │
│ 2. ...          │
└──────────────────┘
```

**수락 조건:**
- 리더보드 로딩 중 표시 (스피너)
- 세션ID 변경 시 새로운 리더보드 fetch
- 구간 높이/스타일링 적절 (모바일 반응형)

---

### AC-5: 교사 라이브 페이지 통합

**목표:**  
`apps/web/src/app/teacher/sessions/[id]/live/LiveSessionClient.tsx`의 하단에 리더보드를 추가한다.

**수정 전 상태:**
- 현재: 세션 상태 버튼 + `<LiveStatsPanel/>`만 표시

**수정 후 상태:**
- `<LiveSessionClient/>` 컴포넌트 내에서 `useLeaderboard(session.id)` 호출
- `<Leaderboard leaderboard={leaderboard} isLoading={isLoading} />` 추가
- 표시 조건: `session.status === 'active' || session.status === 'ended'` (LiveStatsPanel과 동일)

**배치:**
```
[상태 버튼 & 참여 코드]
        ↓
[실시간 응답 현황 (LiveStatsPanel)]
        ↓
[실시간 순위 리더보드] ← 추가
```

**수락 조건:**
- 실시간 업데이트 동작 (Realtime + 폴링)
- 세션 상태별 조건부 렌더링 정확

---

### AC-6: 단위 테스트

**목표:**  
`buildLeaderboard()` 함수의 정렬, 동점 처리, 엣지 케이스를 검증한다.

**구현 위치:** `apps/web/tests/unit/leaderboard.test.ts`

**테스트 케이스:**

1. **기본 정렬 (점수 내림차순)**
   - 입력: A(150점), B(100점), C(150점)
   - 기대: [A, C, B] 또는 [C, A, B] (동점 처리 규칙 적용)

2. **동점 처리 (first_response_at ASC)**
   - 입력: A(100점, 13:00:00), B(100점, 13:00:05), C(90점, 13:00:10)
   - 기대: rank=[A(1), B(2), C(3)], C는 score 낮으므로 3위

3. **단일 응답**
   - 입력: A만 100점 1개 응답
   - 기대: LeaderboardEntry[] = [{rank:1, nickname:'A', total_score:100, correct_count:1, response_count:1, ...}]

4. **빈 입력**
   - 입력: []
   - 기대: []

5. **여러 응답 같은 학생**
   - 입력: A가 [100, 50, 75점] (3번 응답), B가 [100점] (1번 응답)
   - 기대: A(rank=1, total=225, correct=2, response=3), B(rank=2, total=100, correct=1, response=1)

6. **닉네임 스페이스 및 특수문자**
   - 입력: "김철수", "김 철수", "김철수 "
   - 기대: 정확한 nickname 보존 (트림 미적용, 정확히 매칭)

**테스트 프레임워크:** Vitest (기존 설정 활용)

**수락 조건:**
- 모든 테스트 케이스 통과
- 코드 커버리지 buildLeaderboard 100%

---

## Guardrails

### Must Have
1. ✅ Realtime INSERT 구독 + 3초 폴링 폴백 (useSessionStatus.ts 패턴)
2. ✅ 동점 시 submitted_at 오름차순 정렬 (created_at 아님)
3. ✅ 현재 학생 닉네임 시각적 강조 (색상/테두리)
4. ✅ 리더보드 컴포넌트 재사용 가능 (Props 기반, 페이지별 context 독립)
5. ✅ 단위 테스트: buildLeaderboard 정렬/동점 케이스

### Must NOT Have
1. ❌ 교사의 리더보드 조작 기능 (읽기 전용)
2. ❌ 숨겨진 학생 정보 노출 (참여 학생 닉네임만)
3. ❌ 과도한 API 호출 (3초 폴링으로 제한)
4. ❌ 리더보드 트리거 시 다른 기능 차단
5. ❌ buildLeaderboard 함수 내 DB 접근 (순수 함수)

---

## 작업 순서 및 실행 흐름

### Phase 1: 핵심 로직 구현 (1일)

**Step 1-1: `buildLeaderboard.ts` 구현 + 테스트**
- 파일 생성: `apps/web/src/lib/leaderboard.ts`
- 파일 생성: `apps/web/tests/unit/leaderboard.test.ts`
- 함수 구현 (정렬 로직)
- 테스트 실행: `npm run test -- leaderboard.test.ts`
- 수락 기준: 모든 테스트 통과

**Step 1-2: `useLeaderboard.ts` 훅 구현**
- 파일 생성: `apps/web/src/hooks/useLeaderboard.ts`
- useSessionStatus.ts + useRealtimeResponses.ts 패턴 결합
- Realtime INSERT 구독 + 폴링 폴백
- 테스트: 수동 확인 (브라우저 DevTools + Supabase 대시보드)
- 수락 기준: Realtime 업데이트 + 폴링 동작 확인

---

### Phase 2: UI 컴포넌트 구현 (1일)

**Step 2-1: `Leaderboard.tsx` 컴포넌트 구현**
- 파일 생성: `apps/web/src/components/quiz/Leaderboard.tsx`
- UI 구현: 순위 리스트, 메달 아이콘, 현재 학생 강조
- 로딩/빈 상태 처리
- 반응형 디자인 (Tailwind)
- 스타일 검증: 브라우저

---

### Phase 3: 페이지 통합 (1일)

**Step 3-1: 학생 종료 화면 통합**
- 파일 수정: `apps/web/src/app/(student)/quiz/[sessionId]/page.tsx`
- useLeaderboard 훅 추가
- Leaderboard 컴포넌트 임포트 및 렌더링
- 로직 확인: 쿼즈 완료 후 리더보드 표시 확인

**Step 3-2: 교사 라이브 페이지 통합**
- 파일 수정: `apps/web/src/app/teacher/sessions/[id]/live/LiveSessionClient.tsx`
- useLeaderboard 훅 추가
- Leaderboard 컴포넌트 임포트 및 조건부 렌더링
- 로직 확인: 세션 active 상태에서 리더보드 표시 확인

---

### Phase 4: 통합 테스트 & 검증 (1일)

**Step 4-1: E2E 수동 검증**
- 로컬 Supabase 실행: `npm run db:start` (또는 기존 방식)
- 학생 다중 참여 시뮬레이션 (브라우저 다중 탭)
- 리더보드 실시간 업데이트 확인
- 정렬 정확성 검증 (동점 케이스)
- 현재 학생 강조 동작 확인

**Step 4-2: 버그 수정 & 폴리싱**
- 발견된 이슈 수정
- 스타일 미세 조정
- 타입 체크: `npm run type-check`

---

## 변경 파일 정리

### 신규 생성

| 경로 | 용도 | 크기(예상) |
|------|------|----------|
| `apps/web/src/lib/leaderboard.ts` | buildLeaderboard 함수 | ~150 줄 |
| `apps/web/src/hooks/useLeaderboard.ts` | Realtime 훅 | ~120 줄 |
| `apps/web/src/components/quiz/Leaderboard.tsx` | UI 컴포넌트 | ~180 줄 |
| `apps/web/tests/unit/leaderboard.test.ts` | 단위 테스트 | ~200 줄 |

### 수정 대상

| 경로 | 변경 사항 |
|------|----------|
| `apps/web/src/app/(student)/quiz/[sessionId]/page.tsx` | useLeaderboard 호출 + Leaderboard 렌더링 (종료 화면) |
| `apps/web/src/app/teacher/sessions/[id]/live/LiveSessionClient.tsx` | useLeaderboard 호출 + Leaderboard 렌더링 (하단 추가) |

---

## 기술 스택 및 패턴

### 사용 기술
- **React Hooks:** `useState`, `useEffect`, `useMemo`
- **Supabase Realtime:** Postgres Changes 구독 (INSERT 이벤트)
- **TypeScript:** 엄격 타입 검사
- **Tailwind CSS:** UI 스타일링
- **Vitest:** 단위 테스트

### 참고 패턴
- `useSessionStatus.ts` — Realtime 구독 + 폴링 폴백 구조
- `useRealtimeResponses.ts` — responses 배열 관리
- `LiveStatsPanel.tsx` — Realtime 채널 생성 및 관리

---

## 성공 기준 (정량 검증)

1. **기능 완성도**
   - buildLeaderboard 함수: 정렬/동점 100% 구현
   - useLeaderboard 훅: Realtime + 폴링 동작 확인
   - Leaderboard UI: 모든 상태(로딩/빈/데이터)에서 정상 렌더링

2. **코드 품질**
   - TypeScript 타입 오류: 0개
   - Linting 오류: 0개 (eslint)
   - 단위 테스트 커버리지: leaderboard.ts 100%

3. **성능**
   - 초기 로딩 시간: < 2초
   - Realtime 업데이트 지연: < 1초
   - 폴링 CPU 오버헤드: 무시할 수준

4. **UX**
   - 현재 학생 닉네임 명확히 강조됨
   - 모바일 화면에서 리더보드 가독성 확보
   - 로딩 상태 시각적 피드백

---

## 의존성 및 선행 작업

- ✅ Supabase 로컬 환경 구성 (기존 진행)
- ✅ responses 테이블 스키마 확정 (AC 기준)
- ✅ useSessionStatus, useRealtimeResponses 패턴 학습 (코드 검토)

---

## 노트

- **닉네임 정규화:** 트림(trim) 미적용, 정확한 입력값 사용 (데이터베이스와 일치)
- **시간대:** submitted_at은 ISO 8601 문자열 (Date 파싱 필요시 new Date())
- **폴링 간격:** 3초 (useSessionStatus.ts와 일관성 유지)
- **Realtime 채널명:** `leaderboard-{sessionId}` (충돌 회피)

---

## 검토 및 승인

- [ ] 계획 검토 완료
- [ ] 구현 시작 (Phase 1)
- [ ] Phase별 진행 상황 기록
- [ ] 완료 후 PR 및 코드 리뷰
