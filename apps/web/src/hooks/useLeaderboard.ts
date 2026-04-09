'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { buildLeaderboard } from '@/lib/leaderboard';
import type { LeaderboardEntry, ResponseInput } from '@/lib/leaderboard';
import type { Database } from '@/types/database';

type ResponseRow = Database['public']['Tables']['responses']['Row'];

const POLL_INTERVAL_MS = 3000;

export function useLeaderboard(sessionId: string): {
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
} {
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const supabase = createClient();

    async function fetchResponses() {
      const { data } = await supabase
        .from('responses')
        .select('*')
        .eq('session_id', sessionId);
      if (data) setResponses(data as ResponseRow[]);
    }

    // Initial fetch
    fetchResponses().finally(() => setIsLoading(false));

    // Realtime INSERT subscription
    const channel = supabase
      .channel(`leaderboard-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'responses',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setResponses((prev) => [...prev, payload.new as ResponseRow]);
        }
      )
      .subscribe();

    // 3초 폴링 폴백 (Realtime 미수신 이벤트 보정)
    const timer = setInterval(fetchResponses, POLL_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const leaderboard = buildLeaderboard(
    responses.map(
      (r): ResponseInput => ({
        nickname: r.nickname,
        score: r.score,
        is_correct: r.is_correct,
        submitted_at: r.submitted_at,
      })
    )
  );

  return { leaderboard, isLoading };
}
