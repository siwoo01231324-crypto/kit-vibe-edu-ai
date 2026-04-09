# feat: 학생 참여 화면 — join_code + 닉네임 + 대기 화면 (IU-01)

## 사용자 관점 목표
학생이 QR/URL 로 접속해 `join_code` 와 닉네임만 입력하면 즉시 퀴즈 대기 화면으로 진입한다.

## 배경
dev-spec §5 IU-01 — 학생은 익명, sessionStorage 에 상태 보관. 세션 status UPDATE 를 구독해 교사가 "세션 시작" 누르면 자동으로 문제 화면으로 전환.

## 완료 기준 (AC)
- [ ] `apps/web/src/app/(student)/join/page.tsx` — join_code + 닉네임 입력 폼
- [ ] `apps/web/src/app/(student)/join/[code]/page.tsx` — URL 파라미터 경로 (QR 스캔용)
- [ ] `validateNickname` 적용 (#25 재사용)
- [ ] `sessions` 익명 SELECT (`status='active'`) 확인
- [ ] 비활성 세션 code → "세션을 찾을 수 없습니다" 에러
- [ ] sessionStorage 에 `{sessionId, nickname}` 저장
- [ ] 대기 화면 + `session:{id}:status` 구독 (draft→active 시 문제 화면 이동)
- [ ] 통합 테스트 TEST-IU1-I01·I02: 유효/비활성 code 처리

## 구현 플랜
1. RED: `apps/web/tests/integration/student-join.test.ts`
2. GREEN: 폼 + Supabase Direct SELECT
3. 대기 화면 + Realtime 구독 훅 `useSessionStatus(sessionId)`
4. status === 'active' → `router.push(/quiz/${sessionId})`

## 환경 세팅
- 별도 세팅 없음

## 의존성
- 선행: #23 (RLS), #25 (validateNickname)
- 병렬 가능: **#28~#31** (교사측), **#36** (AI)

## 참고
- dev-spec §5 IU-01 학생 참여 플로우
- dev-spec §4.3 session:{id}:status Realtime 채널

## 개발 체크리스트
- [ ] 통합 테스트 코드 작성 (Vitest)
- [ ] `apps/web/src/app/(student)/.ai.md` 작성
- [ ] `docs/ai-report/daily-log.md` 기록 (불변식 1)
- [ ] AI 생성 코드 인간 검토 후 커밋 (불변식 2)
- [ ] 불변식 위반 없음



## 작업 내역

