/**
 * 단위 테스트 — copyToClipboard
 * TEST-IU4-U03: navigator.clipboard.writeText 모킹 → true 반환
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copyToClipboard } from '@/lib/clipboard';

describe('copyToClipboard', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn() },
      configurable: true,
      writable: true,
    });
  });

  it('TEST-IU4-U03: writeText 성공 시 true 반환', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    const result = await copyToClipboard('test text');

    expect(result).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
  });

  it('writeText 실패 시 false 반환', async () => {
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Permission denied'));

    const result = await copyToClipboard('test text');

    expect(result).toBe(false);
  });
});
