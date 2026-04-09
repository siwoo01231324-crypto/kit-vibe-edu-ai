import { describe, it, expect, vi } from 'vitest';
import { generateJoinCode, generateUniqueJoinCode } from '@/lib/join-code';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('generateJoinCode', () => {
  it('returns a string of length 6', () => {
    const code = generateJoinCode();
    expect(code).toHaveLength(6);
  });

  it('matches /^[A-Z0-9]{6}$/ across 100 samples', () => {
    for (let i = 0; i < 100; i++) {
      expect(generateJoinCode()).toMatch(/^[A-Z0-9]{6}$/);
    }
  });
});

describe('generateUniqueJoinCode', () => {
  function makeMockSupabase(maybeSingleFn: () => Promise<{ data: unknown }>) {
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: maybeSingleFn,
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient;
  }

  it('returns a code when DB has no collision (maybeSingle → null)', async () => {
    const mock = makeMockSupabase(vi.fn().mockResolvedValue({ data: null }));
    const code = await generateUniqueJoinCode(mock);
    expect(code).toMatch(/^[A-Z0-9]{6}$/);
  });

  it('retries on first collision and returns a different code on second attempt', async () => {
    const maybeSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: { id: 'existing-session' } })
      .mockResolvedValueOnce({ data: null });

    const mock = makeMockSupabase(maybeSingle);
    const code = await generateUniqueJoinCode(mock);
    expect(code).toMatch(/^[A-Z0-9]{6}$/);
    expect(maybeSingle).toHaveBeenCalledTimes(2);
  });

  it('throws Error after 5 consecutive collisions', async () => {
    const maybeSingle = vi
      .fn()
      .mockResolvedValue({ data: { id: 'existing-session' } });

    const mock = makeMockSupabase(maybeSingle);
    await expect(generateUniqueJoinCode(mock)).rejects.toThrow('join_code 생성 실패');
    expect(maybeSingle).toHaveBeenCalledTimes(5);
  });
});
