/**
 * 리더보드 순수 함수 — DB 접근 없음
 */

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  total_score: number;
  correct_count: number;
  response_count: number;
  first_response_at: string; // submitted_at 중 최솟값 (ISO 8601)
}

export interface ResponseInput {
  nickname: string;
  score: number;
  is_correct: boolean;
  submitted_at: string; // ISO 8601
}

/**
 * responses 배열을 입력받아 nickname별 총점을 계산하고 정렬된 리더보드를 반환한다.
 *
 * 정렬 기준:
 *   1. total_score DESC
 *   2. first_response_at ASC (동점 시 먼저 응답한 사람 우선)
 *
 * rank는 1부터 순차 할당 (동점이어도 간격 없이 1, 2, 3...)
 */
export function buildLeaderboard(responses: ResponseInput[]): LeaderboardEntry[] {
  if (responses.length === 0) return [];

  // nickname별 집계 Map
  const map = new Map<
    string,
    { total_score: number; correct_count: number; response_count: number; first_response_at: string }
  >();

  for (const r of responses) {
    const existing = map.get(r.nickname);
    if (!existing) {
      map.set(r.nickname, {
        total_score: r.score,
        correct_count: r.is_correct ? 1 : 0,
        response_count: 1,
        first_response_at: r.submitted_at,
      });
    } else {
      existing.total_score += r.score;
      existing.correct_count += r.is_correct ? 1 : 0;
      existing.response_count += 1;
      // first_response_at: 더 이른 시각 유지
      if (r.submitted_at < existing.first_response_at) {
        existing.first_response_at = r.submitted_at;
      }
    }
  }

  // 정렬: total_score DESC, first_response_at ASC
  const sorted = Array.from(map.entries()).sort(([, a], [, b]) => {
    if (b.total_score !== a.total_score) return b.total_score - a.total_score;
    // 동점 시 ISO 8601 문자열 비교 (사전 순 == 시간 순)
    if (a.first_response_at < b.first_response_at) return -1;
    if (a.first_response_at > b.first_response_at) return 1;
    return 0;
  });

  return sorted.map(([nickname, data], index) => ({
    rank: index + 1,
    nickname,
    ...data,
  }));
}
