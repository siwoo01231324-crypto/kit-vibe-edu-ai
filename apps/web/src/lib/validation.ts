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
