/**
 * 퀴즈 응답에 대한 점수를 계산한다.
 * 총점 100점 기준으로 문항 수만큼 균등 배점, 소수점 반올림.
 * 오답이면 0점.
 *
 * @param isCorrect - 정답 여부
 * @param _responseTimeMs - 응답 시간 (미사용, 호환성 유지)
 * @param totalQuestions - 전체 문항 수
 */
export function calculateScore(
  isCorrect: boolean,
  _responseTimeMs: number,
  totalQuestions: number
): number {
  if (!isCorrect) return 0;
  return Math.round(100 / totalQuestions);
}
