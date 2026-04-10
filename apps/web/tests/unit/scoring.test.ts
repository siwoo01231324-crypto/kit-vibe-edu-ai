import { describe, it, expect } from 'vitest';
import { calculateScore } from '../../src/lib/scoring';
import { validateNickname } from '../../src/lib/validation';

// scoring.ts: calculateScore(isCorrect, _responseTimeMs, totalQuestions)
// 정답 시 Math.round(100 / totalQuestions), 오답 시 0
describe('calculateScore', () => {
  it('isCorrect=true, totalQuestions=1 → 100', () => {
    expect(calculateScore(true, 0, 1)).toBe(100);
  });

  it('isCorrect=true, totalQuestions=4 → 25', () => {
    expect(calculateScore(true, 9000, 4)).toBe(25);
  });

  it('isCorrect=false → 0 (응답 시간·문항 수 무관)', () => {
    expect(calculateScore(false, 0, 1)).toBe(0);
  });

  it('isCorrect=true, totalQuestions=3 → 33', () => {
    expect(calculateScore(true, 5000, 3)).toBe(33);
  });

  it('isCorrect=true, totalQuestions=10 → 10', () => {
    expect(calculateScore(true, 10000, 10)).toBe(10);
  });
});

describe('validateNickname', () => {
  it('한글 닉네임 → true', () => {
    expect(validateNickname('홍길동')).toBe(true);
  });

  it('1자 닉네임 → false', () => {
    expect(validateNickname('a')).toBe(false);
  });

  it('특수문자 포함 닉네임 → false', () => {
    expect(validateNickname('verylongnickname!')).toBe(false);
  });

  it('영문+숫자 2자 → true', () => {
    expect(validateNickname('ab')).toBe(true);
  });

  it('12자 닉네임 → true', () => {
    expect(validateNickname('abcdefghijkl')).toBe(true);
  });

  it('13자 닉네임 → false', () => {
    expect(validateNickname('abcdefghijklm')).toBe(false);
  });

  it('밑줄 포함 닉네임 → true', () => {
    expect(validateNickname('hong_gil')).toBe(true);
  });
});
