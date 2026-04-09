import { describe, it, expect } from 'vitest';
import { buildLeaderboard } from '@/lib/leaderboard';
import type { ResponseInput } from '@/lib/leaderboard';

function r(nickname: string, score: number, is_correct: boolean, submitted_at: string): ResponseInput {
  return { nickname, score, is_correct, submitted_at };
}

describe('buildLeaderboard', () => {
  it('빈 배열 입력 시 빈 배열 반환', () => {
    expect(buildLeaderboard([])).toEqual([]);
  });

  it('단일 응답 — rank 1, 모든 필드 정확', () => {
    const result = buildLeaderboard([r('A', 100, true, '2024-01-01T13:00:00.000Z')]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      rank: 1,
      nickname: 'A',
      total_score: 100,
      correct_count: 1,
      response_count: 1,
      first_response_at: '2024-01-01T13:00:00.000Z',
    });
  });

  it('기본 정렬 — 점수 높은 순 (DESC)', () => {
    const responses = [
      r('B', 100, true, '2024-01-01T13:00:00.000Z'),
      r('A', 150, true, '2024-01-01T13:00:01.000Z'),
      r('C', 50, false, '2024-01-01T13:00:02.000Z'),
    ];
    const result = buildLeaderboard(responses);
    expect(result.map((e) => e.nickname)).toEqual(['A', 'B', 'C']);
    expect(result.map((e) => e.rank)).toEqual([1, 2, 3]);
  });

  it('동점 처리 — first_response_at ASC (먼저 응답한 사람 우선)', () => {
    const responses = [
      r('B', 100, true, '2024-01-01T13:00:05.000Z'),
      r('A', 100, true, '2024-01-01T13:00:00.000Z'),
      r('C', 90, false, '2024-01-01T13:00:10.000Z'),
    ];
    const result = buildLeaderboard(responses);
    expect(result[0].nickname).toBe('A');
    expect(result[0].rank).toBe(1);
    expect(result[1].nickname).toBe('B');
    expect(result[1].rank).toBe(2);
    expect(result[2].nickname).toBe('C');
    expect(result[2].rank).toBe(3);
  });

  it('여러 응답 같은 학생 — 점수 합산, correct_count/response_count 정확', () => {
    const responses = [
      r('A', 100, true, '2024-01-01T13:00:00.000Z'),
      r('A', 50, false, '2024-01-01T13:00:10.000Z'),
      r('A', 75, true, '2024-01-01T13:00:05.000Z'),
      r('B', 100, true, '2024-01-01T13:01:00.000Z'),
    ];
    const result = buildLeaderboard(responses);
    expect(result[0].nickname).toBe('A');
    expect(result[0].total_score).toBe(225);
    expect(result[0].correct_count).toBe(2);
    expect(result[0].response_count).toBe(3);
    // first_response_at은 세 응답 중 가장 이른 것
    expect(result[0].first_response_at).toBe('2024-01-01T13:00:00.000Z');
    expect(result[1].nickname).toBe('B');
    expect(result[1].total_score).toBe(100);
    expect(result[1].correct_count).toBe(1);
    expect(result[1].response_count).toBe(1);
  });

  it('닉네임 스페이스 및 특수문자 — 정확히 매칭 (트림 미적용)', () => {
    const responses = [
      r('김철수', 100, true, '2024-01-01T13:00:00.000Z'),
      r('김 철수', 90, true, '2024-01-01T13:00:01.000Z'),
      r('김철수 ', 80, true, '2024-01-01T13:00:02.000Z'),
    ];
    const result = buildLeaderboard(responses);
    expect(result).toHaveLength(3);
    const nicknames = result.map((e) => e.nickname);
    expect(nicknames).toContain('김철수');
    expect(nicknames).toContain('김 철수');
    expect(nicknames).toContain('김철수 ');
  });

  it('원본 배열을 변경하지 않는다', () => {
    const responses = [
      r('B', 100, true, '2024-01-01T13:00:05.000Z'),
      r('A', 150, true, '2024-01-01T13:00:00.000Z'),
    ];
    const copy = [...responses];
    buildLeaderboard(responses);
    expect(responses).toEqual(copy);
  });
});
