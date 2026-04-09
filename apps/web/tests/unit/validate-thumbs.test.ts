import { describe, it, expect } from 'vitest';
import { validateThumbsType } from '@/lib/validation';

describe('validateThumbsType', () => {
  it("'up' → true", () => {
    expect(validateThumbsType('up')).toBe(true);
  });

  it("'down' → true", () => {
    expect(validateThumbsType('down')).toBe(true);
  });

  it("'invalid' → false", () => {
    expect(validateThumbsType('invalid')).toBe(false);
  });

  it("'' → false", () => {
    expect(validateThumbsType('')).toBe(false);
  });
});
