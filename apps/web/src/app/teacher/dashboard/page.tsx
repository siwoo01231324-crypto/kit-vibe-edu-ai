import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: teacher } = await supabase
    .from('teachers')
    .select('name')
    .single()

  return (
    <div>
      <h1 className="text-2xl font-bold">
        {teacher?.name ?? '선생님'}, 환영합니다!
      </h1>
      <p className="mt-2 text-gray-600">대시보드 — 준비 중</p>
    </div>
  )
}
