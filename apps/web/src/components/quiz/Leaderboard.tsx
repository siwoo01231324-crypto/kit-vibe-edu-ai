'use client';

import type { LeaderboardEntry } from '@/lib/leaderboard';

interface Props {
  leaderboard: LeaderboardEntry[];
  currentNickname?: string;
  isLoading?: boolean;
}

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };
const MAX_ENTRIES = 10;

export function Leaderboard({ leaderboard, currentNickname, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-md text-center">
        <p className="text-sm font-semibold text-gray-500 mb-4">🏅 실시간 순위</p>
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        </div>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-md text-center">
        <p className="text-sm font-semibold text-gray-500 mb-2">🏅 실시간 순위</p>
        <p className="text-gray-400 text-sm">응답 데이터가 없습니다</p>
      </div>
    );
  }

  const entries = leaderboard.slice(0, MAX_ENTRIES);
  const uniqueParticipants = leaderboard.length;

  return (
    <div className="rounded-2xl bg-white shadow-md overflow-hidden">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h2 className="text-white font-bold text-lg">🏅 실시간 순위</h2>
        <p className="text-blue-100 text-sm mt-0.5">총 {uniqueParticipants}명 참여</p>
      </div>

      {/* 순위 리스트 */}
      <ul className="divide-y divide-gray-100">
        {entries.map((entry) => {
          const isCurrentUser = currentNickname !== undefined && entry.nickname === currentNickname;
          const medal = MEDAL[entry.rank];

          return (
            <li
              key={entry.nickname}
              className={[
                'flex items-center gap-3 px-4 py-3 transition-colors',
                isCurrentUser
                  ? 'bg-blue-50 border-l-4 border-blue-500'
                  : 'hover:bg-gray-50',
              ].join(' ')}
            >
              {/* 순위 / 메달 */}
              <span className="w-8 text-center text-lg font-bold flex-shrink-0">
                {medal ?? (
                  <span className="text-sm text-gray-500">{entry.rank}</span>
                )}
              </span>

              {/* 닉네임 */}
              <span className="flex-1 font-medium text-gray-800 truncate">
                {isCurrentUser && (
                  <span className="mr-1 text-blue-500 text-xs font-bold">⭐</span>
                )}
                {entry.nickname}
              </span>

              {/* 점수 & 정답 수 */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900 text-sm">
                  {entry.total_score.toLocaleString()}점
                </p>
                <p className="text-xs text-gray-400">
                  {entry.correct_count}/{entry.response_count}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {leaderboard.length > MAX_ENTRIES && (
        <p className="text-center text-xs text-gray-400 py-2">
          상위 {MAX_ENTRIES}위까지 표시
        </p>
      )}
    </div>
  );
}
