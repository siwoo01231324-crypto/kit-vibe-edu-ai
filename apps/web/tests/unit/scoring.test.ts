import { describe, it, expect } from 'vitest';
import { calculateScore } from '../../src/lib/scoring';
import { validateNickname } from '../../src/lib/validation';

describe('calculateScore', () => {
  it('isCorrect=true, responseTimeMs=0 → 1000', () => {
    expect(calculateScore(true, 0)).toBe(1000);
  });

  it('isCorrect=true, responseTimeMs=9000 → 100 (하한)', () => {
    expect(calculateScore(true, 9000)).toBe(100);
  });

  it('isCorrect=false, responseTimeMs=0 → 0', () => {
    expect(calculateScore(false, 0)).toBe(0);
  });

  it('isCorrect=true, responseTimeMs=5000 → 500', () => {
    expect(calculateScore(true, 5000)).toBe(500);
  });

  it('isCorrect=true, responseTimeMs=10000 → 100 (하한 적용)', () => {
    expect(calculateScore(true, 10000)).toBe(100);
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
