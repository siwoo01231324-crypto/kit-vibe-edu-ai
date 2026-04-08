import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('vitest runner boots', () => {
    expect(1 + 1).toBe(2);
  });
});
