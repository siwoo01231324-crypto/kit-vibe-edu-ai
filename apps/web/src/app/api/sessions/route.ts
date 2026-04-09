import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateUniqueJoinCode } from '@/lib/join-code'

const CreateSessionSchema = z.object({
  title: z.string().min(1, '제목을 입력하세요'),
  subject: z.string().min(1, '과목을 입력하세요'),
  grade: z.string().min(1, '학년을 입력하세요'),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'VALIDATION_ERROR', details: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = CreateSessionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { title, subject, grade } = parsed.data

  const join_code = await generateUniqueJoinCode(supabase)

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      teacher_id: user.id,
      title,
      subject,
      grade,
      join_code,
      status: 'draft',
    })
    .select('id, join_code')
    .single()

  if (error) {
    return NextResponse.json({ error: 'DB_ERROR', details: error.message }, { status: 500 })
  }

  return NextResponse.json({ id: data.id, join_code: data.join_code }, { status: 201 })
}
