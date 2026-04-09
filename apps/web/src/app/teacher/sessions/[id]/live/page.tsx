import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LiveSessionClient } from './LiveSessionClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function LiveSessionPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('sessions')
    .select('id, title, subject, grade, status, join_code, started_at, ended_at')
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single()

  if (!session) notFound()

  const { data: questionsRaw } = await supabase
    .from('questions')
    .select('id, question_order, content, options, correct_answer')
    .eq('session_id', id)
    .order('question_order', { ascending: true })

  const questions = (questionsRaw ?? []).map((q) => ({
    ...q,
    options: Array.isArray(q.options) ? (q.options as string[]) : [],
  }))

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  const joinUrl = `${base}/join/${session.join_code}`

  return <LiveSessionClient session={session} joinUrl={joinUrl} questions={questions ?? []} />
}
