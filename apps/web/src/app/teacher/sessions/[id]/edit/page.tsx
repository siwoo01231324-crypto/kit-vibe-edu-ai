import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QuestionEditor } from './QuestionEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditSessionPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session } = await supabase
    .from('sessions')
    .select('id, title, subject, grade, status')
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single()

  if (!session) notFound()

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('session_id', id)
    .order('question_order', { ascending: true })

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{session.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{session.subject} · {session.grade}</p>
      </div>
      <QuestionEditor sessionId={id} initialQuestions={questions ?? []} />
    </div>
  )
}
