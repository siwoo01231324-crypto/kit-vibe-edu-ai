'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type QuestionRow = Database['public']['Tables']['questions']['Row'];

export function useStudentQuestions(sessionId: string): {
  questions: QuestionRow[];
  isLoading: boolean;
  error: string | null;
} {
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const supabase = createClient();

    // Initial fetch — question_order asc
    supabase
      .from('questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true })
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setQuestions(data ?? []);
        }
        setIsLoading(false);
      });

    // Realtime subscription — dev-spec §4.3 채널명
    const channel = supabase
      .channel(`session:${sessionId}:questions`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'questions',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newQuestion = payload.new as QuestionRow;
          setQuestions((prev) => {
            const updated = [...prev, newQuestion];
            return updated.sort((a, b) => a.question_order - b.question_order);
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'questions',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const updated = payload.new as QuestionRow;
          setQuestions((prev) =>
            prev
              .map((q) => (q.id === updated.id ? updated : q))
              .sort((a, b) => a.question_order - b.question_order)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return { questions, isLoading, error };
}
