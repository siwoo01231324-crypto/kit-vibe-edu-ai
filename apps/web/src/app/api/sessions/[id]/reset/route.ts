import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { data, error } = await supabase
    .from('sessions')
    .update({ status: 'draft', started_at: null, ended_at: null })
    .eq('id', id)
    .eq('teacher_id', user.id)
    .eq('status', 'ended')
    .select('id, status')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'INVALID_TRANSITION' }, { status: 409 })
  }

  return NextResponse.json({ id: data.id, status: data.status })
}
