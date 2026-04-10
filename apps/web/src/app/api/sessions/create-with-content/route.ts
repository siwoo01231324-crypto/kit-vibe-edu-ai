import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { generateUniqueJoinCode } from '@/lib/join-code'

const QuestionSchema = z.object({
  content: z.string().min(1),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correct_answer: z.number().int().min(0).max(3),
})

const BodySchema = z.object({
  title: z.string().min(1, '제목을 입력하세요'),
  subject: z.string().min(1, '과목을 입력하세요'),
  grade: z.string().min(1, '학년을 입력하세요'),
  questions: z.array(QuestionSchema).min(1).max(5),
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

  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { title, subject, grade, questions } = parsed.data

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any
  const join_code = await generateUniqueJoinCode(sb)

  const { data: session, error: sessionError } = await sb
    .from('sessions')
    .insert({ teacher_id: user.id, title, subject, grade, join_code, status: 'draft' })
    .select('id')
    .single() as { data: { id: string } | null; error: { message: string } | null }

  if (sessionError || !session) {
    return NextResponse.json({ error: 'DB_ERROR', details: sessionError?.message }, { status: 500 })
  }

  const questionRows = questions.map((q, i) => ({
    session_id: session.id,
    content: q.content,
    options: q.options,
    correct_answer: q.correct_answer,
    question_order: i,
  }))

  const { error: questionsError } = await sb.from('questions').insert(questionRows)

  if (questionsError) {
    try {
      await sb.from('sessions').delete().eq('id', session.id)
    } catch {
      // rollback best-effort; session will be orphaned but questions insert already failed
    }
    return NextResponse.json({ error: 'DB_ERROR', details: questionsError.message }, { status: 500 })
  }

  return NextResponse.json({ id: session.id }, { status: 201 })
}
