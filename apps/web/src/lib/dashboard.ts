import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { Question, Response } from '@/lib/aggregate'

type SessionRow = Database['public']['Tables']['sessions']['Row']

export interface DashboardData {
  session: SessionRow
  questions: Question[]
  responses: Response[]
}

/**
 * sessions / questions / responses 를 Promise.all 로 병렬 fetch 한다.
 * RLS는 호출 측 클라이언트에 위임 (sessions RLS가 소유권을 막음).
 * DB의 selected_answer → aggregate.ts 의 answer 로 매핑.
 *
 * @returns DashboardData or null if session not found (RLS denied or invalid id)
 */
export async function loadDashboardData(
  supabase: SupabaseClient<Database>,
  sessionId: string
): Promise<DashboardData | null> {
  const [sessionResult, questionsResult, responsesResult] = await Promise.all([
    supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single(),
    supabase
      .from('questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true }),
    supabase
      .from('responses')
      .select('*')
      .eq('session_id', sessionId),
  ])

  if (sessionResult.error || !sessionResult.data) {
    return null
  }

  const questions: Question[] = (questionsResult.data ?? []).map((q) => ({
    id: q.id,
    content: q.content,
    options: (q.options as string[]) ?? [],
    correct_answer: q.correct_answer ?? undefined,
  }))

  // Map DB row's selected_answer → aggregate.ts Response.answer
  const responses = (responsesResult.data ?? []).map((r) => ({
    question_id: r.question_id,
    answer: r.selected_answer,
    is_correct: r.is_correct,
    response_time_ms: r.response_time_ms,
    nickname: r.nickname,
  }))

  return {
    session: sessionResult.data,
    questions,
    responses,
  }
}
