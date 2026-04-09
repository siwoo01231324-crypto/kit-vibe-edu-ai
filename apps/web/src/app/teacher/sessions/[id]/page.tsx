import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loadDashboardData } from '@/lib/dashboard'
import { SessionDetailClient } from '@/components/dashboard/SessionDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 소유권 검증: RLS만 의존하지 않고 teacher_id 명시 확인
  const { data: session } = await supabase
    .from('sessions')
    .select('id, title, subject, grade, status')
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single()

  if (!session) notFound()

  // 초기 데이터 병렬 fetch (questions + responses)
  const data = await loadDashboardData(supabase, id)
  if (!data) notFound()

  return (
    <div className="max-w-4xl mx-auto">
      <SessionDetailClient
        session={data.session}
        questions={data.questions}
        initialResponses={data.responses}
      />
    </div>
  )
}
