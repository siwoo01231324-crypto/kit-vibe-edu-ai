# feat: 학생 퀴즈 응답 + 점수 저장 + Realtime 문항 동기화 (IU-01)

## 사용자 관점 목표
학생이 문제 화면에서 선택지를 고르면 즉시 정답/오답 피드백과 본인 점수를 본다.

## 배경
dev-spec §5 IU-01 — `responses` INSERT 는 Supabase Direct. `calculateScore` 재사용. 중복 응답은 클라이언트 가드(`alreadyAnswered` set)로 차단. 문항 공개는 교사가 순서대로 넘기는 방식 (Realtime questions 구독).

## 완료 기준 (AC)
- [ ] `apps/web/src/app/(student)/quiz/[sessionId]/page.tsx` — 현재 문제 + 4지선다 렌더링
- [ ] 선택지 클릭 → `responses` INSERT (`{question_id, session_id, nickname, selected_answer, is_correct, response_time_ms, score}`)
- [ ] 중복 응답 가드 (동일 question_id 두 번째 클릭 차단)
- [ ] 정답/오답 애니메이션 (단순 CSS transition)
- [ ] Realtime `questions` INSERT/UPDATE 구독으로 다음 문제 자동 로드
- [ ] 통합 테스트 TEST-IU1-I03·I04: INSERT 성공 / 중복 차단
- [ ] 통합 테스트 TEST-IU1-I05: Realtime 콜백 수신

## 구현 플랜
1. RED: `apps/web/tests/integration/student-quiz.test.ts`
2. GREEN: `useCurrentQuestion(sessionId)` 훅 + INSERT 로직
3. 정답/오답 UI 상태 관리 (useState)
4. `calculateScore` 적용 (#25 재사용)

## 환경 세팅
- 별도 세팅 없음

## 의존성
- 선행: #25, #32
- 병렬 가능: #31 (교사 대시보드), #36

## 참고
- dev-spec §5 IU-01 학생 응답 제출 플로우
- dev-spec §4.3 session:{id}:questions Realtime 채널

## 개발 체크리스트
- [ ] 통합 테스트 코드 작성 (Vitest)
- [ ] `apps/web/src/app/(student)/quiz/.ai.md` 작성
- [ ] `docs/ai-report/daily-log.md` 기록 (불변식 1)
- [ ] AI 생성 코드 인간 검토 후 커밋 (불변식 2)
- [ ] 불변식 위반 없음



## 작업 내역

### 구현 완료 (2026-04-09)

#### 신규 파일
- `apps/web/src/hooks/useStudentQuestions.ts` — Realtime `session:{id}:questions` 채널 구독 훅. INSERT/UPDATE 이벤트를 받아 현재 문항 상태를 갱신한다.
- `apps/web/src/app/(student)/quiz/[sessionId]/page.tsx` — 퀴즈 응답 화면. sessionStorage 닉네임 가드, 4지선다 렌더링, responses INSERT, 중복 응답 가드(answeredQuestionIds Set), 정답/오답 CSS 애니메이션, 세션 종료(ended) 감지.
- `apps/web/src/app/(student)/quiz/.ai.md` — 디렉토리 목적·구조 기술.
- `apps/web/tests/integration/student-quiz.test.ts` — 통합 테스트 TEST-IU1-I03·I04·I05 (INSERT 성공, 중복 차단, Realtime 콜백 수신).

#### 수정 파일
- `apps/web/src/app/globals.css` — 정답 하이라이트(`answer-correct`) 및 오답 흔들림(`answer-wrong` + `@keyframes shake`) 애니메이션 추가.
- `docs/ai-report/daily-log.md` — 불변식 1번 AI 활용 내역 기록.

#### 완료 기준 달성
- [x] `/quiz/[sessionId]/page.tsx` — 현재 문제 + 4지선다 렌더링
- [x] `responses` INSERT (`question_id, session_id, nickname, selected_answer, is_correct, response_time_ms, score`)
- [x] 중복 응답 가드 (동일 `question_id` 두 번째 클릭 차단)
- [x] 정답/오답 CSS 애니메이션
- [x] Realtime `questions` 구독으로 다음 문제 자동 로드
- [x] 통합 테스트 TEST-IU1-I03·I04·I05
