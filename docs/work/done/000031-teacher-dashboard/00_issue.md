# feat: 교사 대시보드 — 세션 목록 + 실시간 집계 차트 (IU-03)

## 사용자 관점 목표
교사가 로그인하면 본인 세션 목록을 보고, 세션 상세에 들어가면 학생 응답이 실시간으로 반영된 문항별 정답률 차트를 볼 수 있다.

## 배경
dev-spec §5 IU-03 — 교사 대시보드. `Promise.all` 병렬 fetch + Realtime `session:{id}:responses` 구독. 차트는 외부 라이브러리 없이 CSS flex 바.

## 완료 기준 (AC)
- [ ] `apps/web/src/app/(teacher)/dashboard/page.tsx` — 세션 목록 (사이드바, 단일 select 필터)
- [ ] `apps/web/src/app/(teacher)/sessions/[id]/page.tsx` — 세션 상세 (실시간 참여 인원 + 문항별 차트)
- [ ] `groupByQuestion` 재사용 (#27)
- [ ] CSS flex 바 차트 컴포넌트 (`apps/web/src/components/dashboard/ResponseChart.tsx`) — Recharts/Chart.js 금지
- [ ] Realtime 구독 훅 `useRealtimeResponses(sessionId)` — responses INSERT → 상태 업데이트
- [ ] 통합 테스트 TEST-IU3-I01~I03: 본인 세션만 조회 / Promise.all fetch / Realtime 콜백

## 구현 플랜
1. RED: `apps/web/tests/integration/dashboard-fetch.test.ts`
2. GREEN: 데이터 로드 함수 `loadDashboard(sessionId)` 구현
3. `useRealtimeResponses` 훅 (`supabase.channel().on('postgres_changes', ...)`)
4. 세션 목록 사이드바 + 상세 레이아웃
5. `ResponseChart` CSS bar + 옵션 분포 표시

## 환경 세팅
- 별도 세팅 없음

## 의존성
- 선행: #27 (aggregate), #28 (세션 존재)
- 병렬 가능: #32~#34 (학생측), #36 (AI)

## 참고
- dev-spec §5 IU-03 교사 대시보드
- dev-spec §4.3 Realtime 채널 매트릭스

## 개발 체크리스트
- [ ] 단위/통합 테스트 코드 작성 (Vitest)
- [ ] `apps/web/src/app/(teacher)/dashboard/.ai.md`, `apps/web/src/components/dashboard/.ai.md` 최신화
- [ ] `docs/ai-report/daily-log.md` 기록 (불변식 1)
- [ ] AI 생성 코드 인간 검토 후 커밋 (불변식 2)
- [ ] 불변식 위반 없음



## 작업 내역

### 구현 완료 (2026-04-09)

**신규 파일**
- `apps/web/src/lib/dashboard.ts` — `loadDashboardData` (Promise.all 병렬 fetch: 세션 목록 + 응답 집계)
- `apps/web/src/hooks/useRealtimeResponses.ts` — Supabase Realtime `postgres_changes` INSERT 구독 훅
- `apps/web/src/components/dashboard/ResponseChart.tsx` — CSS flex 바 차트 (Chart.js/Recharts 금지 준수)
- `apps/web/src/components/dashboard/SessionSidebar.tsx` — status 필터 + 세션 목록 사이드바
- `apps/web/src/components/dashboard/SessionDetailClient.tsx` — 실시간 집계 + ResponseChart 조합 클라이언트 컴포넌트
- `apps/web/src/app/teacher/sessions/[id]/page.tsx` — Server Component, 소유권 검증
- `apps/web/tests/integration/dashboard-fetch.test.ts` — TEST-IU3-I01~I03 통합 테스트
- `apps/web/tests/unit/ResponseChart.test.tsx` — ResponseChart 단위 테스트
- `apps/web/tests/unit/useRealtimeResponses.test.ts` — 훅 단위 테스트

**수정 파일**
- `apps/web/src/app/teacher/dashboard/page.tsx` — 세션 목록 UI + SessionSidebar 통합
- `apps/web/src/app/teacher/dashboard/.ai.md` — 구조 최신화
- `apps/web/src/app/teacher/sessions/.ai.md` — [id] 상세 라우트 추가
- `apps/web/src/components/dashboard/.ai.md` — 신규 컴포넌트 반영
- `apps/web/src/hooks/.ai.md` — useRealtimeResponses 추가
- `docs/ai-report/daily-log.md` — AI 활용 내역 기록
