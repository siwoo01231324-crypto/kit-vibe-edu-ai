const MAX_SCORE = 1000;
const MIN_SCORE = 100;

/**
 * 퀴즈 응답에 대한 점수를 계산한다.
 *
 * @param isCorrect - 정답 여부
 * @param responseTimeMs - 응답 시간 (밀리초)
 * @returns 0 (오답) 또는 100~1000 사이의 점수 (정답)
 */
export function calculateScore(isCorrect: boolean, responseTimeMs: number): number {
  if (!isCorrect) return 0;
  return Math.max(MIN_SCORE, Math.round(MAX_SCORE - responseTimeMs / 10));
}
