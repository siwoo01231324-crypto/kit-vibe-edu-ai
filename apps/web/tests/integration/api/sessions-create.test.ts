import { createClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SRK  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const skip = !URL || !ANON || !SRK || process.env.SKIP_SUPABASE_LOCAL === '1'

const opts = { auth: { autoRefreshToken: false, persistSession: false } } as const

describe.skipIf(skip)('POST /api/sessions', () => {
  const admin = createClient(URL, SRK, opts)
  const createdUserIds: string[] = []

  let teacherAId: string
  let teacherBId: string
  let teacherAToken: string
  let teacherBToken: string

  beforeAll(async () => {
    const health = await fetch(`${URL}/auth/v1/health`)
    if (!health.ok) throw new Error('Supabase not running')

    const emailA = `sessions-api-a-${Date.now()}@test.com`
    const { data: dataA } = await admin.auth.admin.createUser({
      email: emailA, password: 'password123', email_confirm: true,
      user_metadata: { full_name: 'Teacher API A' },
    })
    teacherAId = dataA!.user.id
    createdUserIds.push(teacherAId)

    const { data: signInA } = await createClient(URL, ANON, opts)
      .auth.signInWithPassword({ email: emailA, password: 'password123' })
    teacherAToken = signInA!.session!.access_token

    const emailB = `sessions-api-b-${Date.now()}@test.com`
    const { data: dataB } = await admin.auth.admin.createUser({
      email: emailB, password: 'password123', email_confirm: true,
      user_metadata: { full_name: 'Teacher API B' },
    })
    teacherBId = dataB!.user.id
    createdUserIds.push(teacherBId)

    const { data: signInB } = await createClient(URL, ANON, opts)
      .auth.signInWithPassword({ email: emailB, password: 'password123' })
    teacherBToken = signInB!.session!.access_token
  })

  afterAll(async () => {
    for (const id of createdUserIds) {
      await admin.auth.admin.deleteUser(id)
    }
  })

  // Helper: call POST /api/sessions via Supabase DB directly (unit-style for route logic)
  // Since we can't spin up Next.js in vitest, we test the DB/RLS layer directly
  // and test route logic via unit tests for the handler.

  it('인증된 교사가 유효한 body로 sessions INSERT → row 생성 + join_code 반환', async () => {
    const teacherAClient = createClient(URL, ANON, {
      ...opts,
      global: { headers: { Authorization: `Bearer ${teacherAToken}` } },
    })

    const joinCode = Math.random().toString(36).slice(2, 8).toUpperCase()
    const { data, error } = await teacherAClient
      .from('sessions')
      .insert({
        teacher_id: teacherAId,
        title: '수학 1단원',
        subject: '수학',
        grade: '고1',
        join_code: joinCode,
        status: 'draft',
      })
      .select('id, join_code')
      .single()

    expect(error).toBeNull()
    expect(data).toBeTruthy()
    expect(data!.join_code).toBe(joinCode)
    expect(typeof data!.id).toBe('string')
  })

  it('미인증(anon) 클라이언트는 sessions INSERT 불가 → 401 상당 (RLS 거부)', async () => {
    const anonClient = createClient(URL, ANON, opts)
    const { error } = await anonClient.from('sessions').insert({
      teacher_id: teacherAId,
      title: '미인증 테스트',
      subject: '영어',
      grade: '중1',
      join_code: 'NOAUTH',
      status: 'draft',
    })
    expect(error).toBeTruthy()
  })

  it('teacher B는 teacher A의 session을 SELECT 불가 (RLS 격리)', async () => {
    // teacher A로 세션 생성
    const teacherAClient = createClient(URL, ANON, {
      ...opts,
      global: { headers: { Authorization: `Bearer ${teacherAToken}` } },
    })
    const joinCode = Math.random().toString(36).slice(2, 8).toUpperCase()
    const { data: created } = await teacherAClient
      .from('sessions')
      .insert({
        teacher_id: teacherAId,
        title: 'RLS 격리 테스트',
        subject: '과학',
        grade: '고2',
        join_code: joinCode,
        status: 'draft',
      })
      .select('id')
      .single()

    // teacher B로 해당 세션 조회 → 결과 없어야 함
    const teacherBClient = createClient(URL, ANON, {
      ...opts,
      global: { headers: { Authorization: `Bearer ${teacherBToken}` } },
    })
    const { data: rows } = await teacherBClient
      .from('sessions')
      .select('id')
      .eq('id', created!.id)

    expect(rows).toHaveLength(0)
  })
})
