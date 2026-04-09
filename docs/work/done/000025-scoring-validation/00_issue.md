# feat: 점수 계산 + 닉네임 검증 유틸 (lib/scoring, lib/validation)

## 사용자 관점 목표
학생이 빠르게 응답할수록 높은 점수를 받고, 부적절한 닉네임은 입장 단계에서 걸러진다.

## 배경
dev-spec §5 IU-01 — 점수 공식 `max(100, 1000 - responseTimeMs/10)` 및 닉네임 검증(2~12자, 한글/영숫자/`_`). TDD 사이클의 첫 번째 순수 함수 단위. Red → Green → Refactor 로 진행.

## 완료 기준 (AC)
- [ ] `apps/web/src/lib/scoring.ts` — `calculateScore(isCorrect, responseTimeMs): number` 구현
- [ ] `apps/web/src/lib/validation.ts` — `validateNickname(nickname): boolean` 구현
- [ ] 단위 테스트 7개 통과 (dev-spec TEST-IU1-U01~U07):
  - [ ] 즉시 정답 (0ms) → 1000
  - [ ] 9000ms → 100 (하한)
  - [ ] 오답 → 0
  - [ ] `'홍길동'` → true
  - [ ] `'a'` → false (1자)
  - [ ] `'verylongnickname!'` → false (특수문자 + 길이)
  - [ ] 5000ms → 500 (중간값)
- [ ] JSDoc 주석 추가

## 의존성
- 선행: #22
- 병렬 가능: #26, #27

## 작업 내역

### 2026-04-09 구현 완료

- `apps/web/tests/unit/scoring.test.ts` — 7개 단위 테스트 작성 (RED)
- `apps/web/src/lib/scoring.ts` — `calculateScore(isCorrect, responseTimeMs)` 구현 (GREEN)
- `apps/web/src/lib/validation.ts` — `validateNickname(nickname)` 구현 (GREEN)
- JSDoc 주석 추가 (REFACTOR)
- `apps/web/src/lib/.ai.md` — scoring.ts, validation.ts 항목 추가

