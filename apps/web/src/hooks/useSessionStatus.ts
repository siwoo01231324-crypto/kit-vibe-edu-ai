'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type SessionStatus = 'draft' | 'active' | 'ended' | null;

export function useSessionStatus(sessionId: string) {
  const [status, setStatus] = useState<SessionStatus>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const supabase = createClient();

    // Initial fetch
    supabase
      .from('sessions')
      .select('status')
      .eq('id', sessionId)
      .single()
      .then(({ data }) => {
        if (data) setStatus(data.status as SessionStatus);
        setIsLoading(false);
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
          setStatus(newStatus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { status, isLoading };
}
