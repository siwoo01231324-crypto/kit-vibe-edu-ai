import { describe, it, expect } from 'vitest';
import { validateQuestion } from '@/lib/validation';

const base = {
  content: '1 + 1 = ?',
  options: ['1', '2', '3', '4'],
  correct_answer: 1,
};

describe('validateQuestion', () => {
  it('유효한 문항 → true', () => {
    expect(validateQuestion(base)).toBe(true);
  });

  it('content 빈 문자열 → false', () => {
    expect(validateQuestion({ ...base, content: '' })).toBe(false);
  });

  it('content 공백만 → false', () => {
    expect(validateQuestion({ ...base, content: '   ' })).toBe(false);
  });

  it('options 1개 → false (최소 2개)', () => {
    expect(validateQuestion({ ...base, options: ['1'], correct_answer: 0 })).toBe(false);
  });

  it('options 6개 → false (최대 5개)', () => {
    expect(validateQuestion({ ...base, options: ['1', '2', '3', '4', '5', '6'], correct_answer: 0 })).toBe(false);
  });

  it('options 2개 → true', () => {
    expect(validateQuestion({ ...base, options: ['O', 'X'], correct_answer: 0 })).toBe(true);
  });

  it('options 5개 → true', () => {
    expect(validateQuestion({ ...base, options: ['1', '2', '3', '4', '5'], correct_answer: 4 })).toBe(true);
  });

  it('options 항목 중 빈 문자열 → false', () => {
    expect(validateQuestion({ ...base, options: ['1', '', '3', '4'] })).toBe(false);
  });

  it('correct_answer 음수 → false', () => {
    expect(validateQuestion({ ...base, correct_answer: -1 })).toBe(false);
  });

  it('correct_answer가 options 범위 초과 → false', () => {
    expect(validateQuestion({ ...base, correct_answer: 4 })).toBe(false);
  });

  it('correct_answer가 소수 → false', () => {
    expect(validateQuestion({ ...base, correct_answer: 1.5 })).toBe(false);
  });

  it('correct_answer === options.length - 1 → true (경계값)', () => {
    expect(validateQuestion({ ...base, correct_answer: 3 })).toBe(true);
  });
});
