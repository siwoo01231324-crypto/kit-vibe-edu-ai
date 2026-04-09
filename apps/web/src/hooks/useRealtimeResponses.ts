'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Response } from '@/lib/aggregate';

// Extended internal type that carries nickname for participant counting
type ResponseWithNickname = Response & { nickname?: string };

/**
 * Supabase Realtime로 responses 테이블 INSERT 이벤트를 구독한다.
 * 채널명: session-responses-{sessionId}
 *
 * #34 리더보드에서도 재사용 가능하도록 얇게 유지한다.
 * 파생 데이터(랭킹 계산 등)는 훅 외부에서 처리한다.
 */
export function useRealtimeResponses(
  sessionId: string,
  initial: ResponseWithNickname[]
): { responses: ResponseWithNickname[]; participantCount: number } {
  const [responses, setResponses] = useState<ResponseWithNickname[]>(initial);

  useEffect(() => {
    if (!sessionId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`session-responses-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'responses',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            session_id: string;
            question_id: string;
            nickname: string;
            selected_answer: number;
            is_correct: boolean;
            response_time_ms: number;
            score: number;
            submitted_at: string;
          };
          const mapped: ResponseWithNickname = {
            question_id: row.question_id,
            answer: row.selected_answer,
            is_correct: row.is_correct,
            response_time_ms: row.response_time_ms,
            nickname: row.nickname,
          };
          setResponses((prev) => [...prev, mapped]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const participantCount = useMemo(() => {
    const nicknames = new Set<string>();
    for (const r of responses) {
      if (r.nickname) nicknames.add(r.nickname);
    }
    return nicknames.size;
  }, [responses]);

  return { responses, participantCount };
}
