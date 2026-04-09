'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type SessionStatus = 'draft' | 'active' | 'ended' | null;

const POLL_INTERVAL_MS = 3000;

export function useSessionStatus(sessionId: string) {
  const [status, setStatus] = useState<SessionStatus>(null);
  const [isLoading, setIsLoading] = useState(true);
  const statusRef = useRef<SessionStatus>(null);

  useEffect(() => {
    if (!sessionId) return;

    const supabase = createClient();

    async function fetchStatus() {
      const { data } = await supabase
        .from('sessions')
        .select('status')
        .eq('id', sessionId)
        .single();
      if (data && data.status !== statusRef.current) {
        statusRef.current = data.status as SessionStatus;
        setStatus(data.status as SessionStatus);
      }
      return data?.status as SessionStatus | undefined;
    }

    // Initial fetch
    fetchStatus().then((s) => {
      if (s !== undefined) setIsLoading(false);
      else setIsLoading(false);
    });

    // Realtime subscription
    const channel = supabase
      .channel(`session-status-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const newStatus = (payload.new as { status: SessionStatus }).status;
          statusRef.current = newStatus;
          setStatus(newStatus);
        }
      )
      .subscribe();

    // Polling fallback — catches events if Realtime misses them
    const pollTimer = setInterval(fetchStatus, POLL_INTERVAL_MS);

    return () => {
      clearInterval(pollTimer);
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { status, isLoading };
}
