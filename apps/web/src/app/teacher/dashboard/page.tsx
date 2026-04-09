import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SessionSidebar } from '@/components/dashboard/SessionSidebar'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, title, subject, grade, status, created_at')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex gap-6 min-h-0">
      <SessionSidebar sessions={sessions ?? []} />

      {/* 세션 미선택 안내 */}
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium">세션을 선택하세요</p>
          <p className="text-sm mt-1">왼쪽 목록에서 세션을 클릭하면 실시간 응답 현황을 볼 수 있습니다.</p>
        </div>
      </div>
    </div>
  )
}
