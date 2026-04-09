import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
}

export async function POST(_req: NextRequest, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('sessions')
    .update({ status: 'active', started_at: new Date().toISOString() })
    .eq('id', id)
    .eq('teacher_id', user.id)   // 소유권 가드 (RLS 이중 방어)
    .eq('status', 'draft')       // 상태 전이 가드 (race condition 방지)
    .select('id, status, started_at')
    .single()

  if (error || !data) {
    // single()이 에러를 던지거나 data가 null이면 전이 불가 상태
    return NextResponse.json({ error: 'INVALID_TRANSITION' }, { status: 409 })
  }

  return NextResponse.json({ id: data.id, status: data.status, started_at: data.started_at })
}
