/**
 * 닉네임 유효성을 검사한다.
 *
 * 허용 문자: 한글(가-힣), 영문(a-zA-Z), 숫자(0-9), 밑줄(_)
 * 허용 길이: 2~12자
 *
 * @param nickname - 검사할 닉네임 문자열
 * @returns 유효하면 true, 아니면 false
 */
export function validateNickname(nickname: string): boolean {
  return /^[가-힣a-zA-Z0-9_]{2,12}$/.test(nickname);
}

export interface QuestionInput {
  content: string;
  options: string[];
  correct_answer: number;
}

/**
 * 퀴즈 문항 유효성을 검사한다.
 *
 * - content: 비어있지 않아야 함
 * - options: 2~5개 항목, 각 항목 비어있지 않아야 함
 * - correct_answer: 0 이상 options.length-1 이하의 정수
 *
 * @param q - 검사할 문항 객체
 * @returns 유효하면 true, 아니면 false
 */
/**
 * 따봉 피드백 타입 유효성을 검사한다.
 *
 * 허용 값: 'up' | 'down'
 *
 * @param type - 검사할 타입 문자열
 * @returns 유효하면 true, 아니면 false
 */
export function validateThumbsType(type: string): boolean {
  return type === 'up' || type === 'down';
}

export function validateQuestion(q: QuestionInput): boolean {
  if (!q.content || q.content.trim().length === 0) return false;
  if (!Array.isArray(q.options)) return false;
  if (q.options.length < 2 || q.options.length > 5) return false;
  if (q.options.some(o => !o || o.trim().length === 0)) return false;
  if (!Number.isInteger(q.correct_answer)) return false;
  if (q.correct_answer < 0 || q.correct_answer > q.options.length - 1) return false;
  return true;
}
