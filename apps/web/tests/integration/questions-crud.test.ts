import { createClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SRK  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const skip = !URL || !ANON || !SRK || process.env.SKIP_SUPABASE_LOCAL === '1'

const opts = { auth: { autoRefreshToken: false, persistSession: false } } as const

describe.skipIf(skip)('questions RLS — INSERT/UPDATE/DELETE', () => {
  const admin = createClient(URL, SRK, opts)
  const createdUserIds: string[] = []

  let teacherAId: string
  let teacherBId: string
  let teacherAClient: ReturnType<typeof createClient>
  let teacherBClient: ReturnType<typeof createClient>
  let sessionAId: string

  beforeAll(async () => {
    const health = await fetch(`${URL}/auth/v1/health`)
    if (!health.ok) throw new Error('Supabase not running')

    const emailA = `questions-rls-a-${Date.now()}@test.com`
    const { data: dataA } = await admin.auth.admin.createUser({
      email: emailA, password: 'password123', email_confirm: true,
      user_metadata: { full_name: 'Teacher QA' },
    })
    teacherAId = dataA!.user.id
    createdUserIds.push(teacherAId)

    const { data: signInA } = await createClient(URL, ANON, opts)
      .auth.signInWithPassword({ email: emailA, password: 'password123' })
    teacherAClient = createClient(URL, ANON, {
      ...opts,
      global: { headers: { Authorization: `Bearer ${signInA!.session!.access_token}` } },
    })

    const emailB = `questions-rls-b-${Date.now()}@test.com`
    const { data: dataB } = await admin.auth.admin.createUser({
      email: emailB, password: 'password123', email_confirm: true,
      user_metadata: { full_name: 'Teacher QB' },
    })
    teacherBId = dataB!.user.id
    createdUserIds.push(teacherBId)

    const { data: signInB } = await createClient(URL, ANON, opts)
      .auth.signInWithPassword({ email: emailB, password: 'password123' })
    teacherBClient = createClient(URL, ANON, {
      ...opts,
      global: { headers: { Authorization: `Bearer ${signInB!.session!.access_token}` } },
    })

    // teacher A로 세션 생성
    const { data: session } = await teacherAClient
      .from('sessions')
      .insert({
        teacher_id: teacherAId,
        title: 'questions RLS 테스트',
        subject: '수학',
        grade: '고1',
        join_code: `Q${Date.now().toString(36).toUpperCase().slice(-5)}`,
        status: 'draft',
      })
      .select('id')
      .single()
    sessionAId = session!.id
  })

  afterAll(async () => {
    for (const id of createdUserIds) {
      await admin.auth.admin.deleteUser(id)
    }
  })

  const baseQuestion = (sessionId: string, order = 1) => ({
    session_id: sessionId,
    content: '1 + 1 = ?',
    options: ['1', '2', '3', '4'],
    correct_answer: 1,
    question_order: order,
  })

  it('teacher A는 자신의 세션에 question INSERT 가능', async () => {
    const { error } = await teacherAClient
      .from('questions')
      .insert(baseQuestion(sessionAId, 1))
    expect(error).toBeNull()
  })

  it('teacher B는 teacher A의 세션에 question INSERT 불가 (RLS 거부)', async () => {
    const { error } = await teacherBClient
      .from('questions')
      .insert(baseQuestion(sessionAId, 2))
    expect(error).toBeTruthy()
  })

  it('teacher A는 자신의 세션 문항 UPDATE 가능', async () => {
    const { data: q } = await teacherAClient
      .from('questions')
      .insert(baseQuestion(sessionAId, 3))
      .select('id')
      .single()

    const { error } = await teacherAClient
      .from('questions')
      .update({ content: '수정된 문항' })
      .eq('id', q!.id)
    expect(error).toBeNull()
  })

  it('teacher A는 자신의 세션 문항 DELETE 가능', async () => {
    const { data: q } = await teacherAClient
      .from('questions')
      .insert(baseQuestion(sessionAId, 4))
      .select('id')
      .single()

    const { error } = await teacherAClient
      .from('questions')
      .delete()
      .eq('id', q!.id)
    expect(error).toBeNull()
  })
})
