# 01_plan — #25 scoring/validation

## AC 체크리스트
- [ ] `apps/web/src/lib/scoring.ts` — `calculateScore(isCorrect, responseTimeMs): number`
- [ ] `apps/web/src/lib/validation.ts` — `validateNickname(nickname): boolean`
- [ ] 단위 테스트 7개 통과 (TEST-IU1-U01~U07)

## 구현 명세

### scoring.ts
```typescript
// 공식: isCorrect ? Math.max(100, Math.round(1000 - responseTimeMs / 10)) : 0
const MAX_SCORE = 1000;
const MIN_SCORE = 100;
const MAX_RESPONSE_MS = 9000;
export function calculateScore(isCorrect: boolean, responseTimeMs: number): number
```
테스트: 0ms→1000, 9000ms→100, 오답→0, 5000ms→500

### validation.ts
```typescript
// /^[가-힣a-zA-Z0-9_]{2,12}$/
export function validateNickname(nickname: string): boolean
```
테스트: '홍길동'→true, 'a'→false, 'verylongnickname!'→false

## 파일 경로
- `apps/web/src/lib/scoring.ts`
- `apps/web/src/lib/validation.ts`
- `apps/web/tests/unit/scoring.test.ts`
- `apps/web/src/lib/.ai.md` (최신화)

## 호환성
- #28 세션 생성, #32 학생 참여 화면에서 scoring/validation import 예정
- export 시그니처 변경 금지
