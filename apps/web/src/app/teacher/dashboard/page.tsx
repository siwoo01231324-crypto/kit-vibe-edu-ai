import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadDashboardData, type DashboardData } from '@/lib/dashboard'
import { SessionSidebar } from '@/components/dashboard/SessionSidebar'
import { SessionDetailClient } from '@/components/dashboard/SessionDetailClient'
import { QuestionEditor } from '@/app/teacher/sessions/[id]/edit/QuestionEditor'
import { LiveSessionClient } from '@/app/teacher/sessions/[id]/live/LiveSessionClient'
import { InsightsContent } from '@/app/teacher/sessions/[id]/insights/InsightsContent'
import type { Database } from '@/types/database'

type QuestionRow = Database['public']['Tables']['questions']['Row']

interface LiveSession {
  id: string
  title: string
  subject: string
  grade: string
  status: string
  join_code: string
  started_at: string | null
  ended_at: string | null
}

interface Props {
  searchParams: Promise<{ session?: string; view?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { session: selectedId, view } = await searchParams

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, title, subject, grade, status, created_at')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  // 선택된 세션의 상세 데이터 + 학생 피드백
  let sessionData: DashboardData | null = null
  let thumbsFeedbacks: { nickname: string; comment: string | null }[] = []
  if (selectedId) {
    const [data, thumbsResult] = await Promise.all([
      loadDashboardData(supabase, selectedId),
      supabase
        .from('thumbs_feedback')
        .select('nickname, comment')
        .eq('session_id', selectedId)
        .order('created_at', { ascending: false }),
    ])
    sessionData = data
    thumbsFeedbacks = (thumbsResult.data ?? []) as { nickname: string; comment: string | null }[]
  }

  // edit 뷰용 questions
  let editQuestions: QuestionRow[] | null = null
  if (selectedId && view === 'edit') {
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('session_id', selectedId)
      .order('question_order', { ascending: true })
    editQuestions = data ?? []
  }

  // live 뷰용 데이터
  let liveSession: LiveSession | null = null
  let liveQuestions: Array<{id: string; question_order: number; content: string; options: string[]; correct_answer: number}> = []
  if (selectedId && view === 'live') {
    const { data: s } = await supabase
      .from('sessions')
      .select('id, title, subject, grade, status, join_code, started_at, ended_at')
      .eq('id', selectedId)
      .eq('teacher_id', user.id)
      .single()
    liveSession = s as LiveSession | null

    const { data: q } = await supabase
      .from('questions')
      .select('id, question_order, content, options, correct_answer')
      .eq('session_id', selectedId)
      .order('question_order', { ascending: true })
    liveQuestions = (q ?? []).map((item) => ({
      ...item,
      options: Array.isArray(item.options) ? (item.options as string[]) : [],
    }))
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  const joinUrl = liveSession ? `${base}/join/${liveSession.join_code}` : ''

  function renderContent() {
    if (!selectedId || !sessionData) {
      return (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <div className="text-center">
            <p className="text-lg font-medium text-slate-500">세션을 선택하세요</p>
            <p className="text-sm mt-1 text-slate-400">왼쪽 목록에서 세션을 클릭하면 응답 현황을 볼 수 있습니다.</p>
          </div>
        </div>
      )
    }

    if (view === 'edit' && editQuestions !== null) {
      return (
        <div className="max-w-2xl">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{sessionData.session.title}</h1>
              <p className="text-sm text-slate-500 mt-1">{sessionData.session.subject} · {sessionData.session.grade}</p>
            </div>
            <a
              href={`/teacher/dashboard?session=${selectedId}&view=live`}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all duration-100 hover:bg-orange-600 cursor-pointer"
            >
              라이브 세션 열기
            </a>
          </div>
          <QuestionEditor sessionId={selectedId} initialQuestions={editQuestions} />
        </div>
      )
    }

    if (view === 'live' && liveSession) {
      return (
        <LiveSessionClient
          session={liveSession}
          joinUrl={joinUrl}
          questions={liveQuestions}
        />
      )
    }

    if (view === 'insights') {
      return <InsightsContent sessionId={selectedId} />
    }

    // default: detail view
    return (
      <SessionDetailClient
        session={sessionData.session}
        questions={sessionData.questions}
        initialResponses={sessionData.responses}
        thumbsFeedbacks={thumbsFeedbacks}
      />
    )
  }

  return (
    <div className="flex gap-6 min-h-0">
      <SessionSidebar sessions={sessions ?? []} selectedId={selectedId} />
      <div className="flex-1 min-w-0">
        {renderContent()}
      </div>
    </div>
  )
}
