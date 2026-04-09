import Link from 'next/link'
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
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{session.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{session.subject} · {session.grade}</p>
        </div>
        <Link
          href={`/teacher/sessions/${id}/live`}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
        >
          라이브 세션 열기
        </Link>
      </div>
      <QuestionEditor sessionId={id} initialQuestions={questions ?? []} />
    </div>
  )
}
