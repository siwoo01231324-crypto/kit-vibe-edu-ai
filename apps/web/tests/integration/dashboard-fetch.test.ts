import { createClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { loadDashboardData } from '@/lib/dashboard'

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SRK  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const skip = !URL || !ANON || !SRK || process.env.SKIP_SUPABASE_LOCAL === '1'

const opts = { auth: { autoRefreshToken: false, persistSession: false } } as const

describe.skipIf(skip)('dashboard RLS + loadDashboardData', () => {
  const admin = createClient(URL, SRK, opts)
  const createdUserIds: string[] = []

  let teacherAClient: ReturnType<typeof createClient>
  let teacherBClient: ReturnType<typeof createClient>
  let sessionAId: string

  beforeAll(async () => {
    const health = await fetch(`${URL}/auth/v1/health`)
    if (!health.ok) throw new Error('Supabase not running')

    const emailA = `dashboard-rls-a-${Date.now()}@test.com`
    const { data: dataA } = await admin.auth.admin.createUser({
      email: emailA, password: 'password123', email_confirm: true,
      user_metadata: { full_name: 'Dashboard Teacher A' },
    })
    const teacherAId = dataA!.user.id
    createdUserIds.push(teacherAId)

    const { data: signInA } = await createClient(URL, ANON, opts)
      .auth.signInWithPassword({ email: emailA, password: 'password123' })
    teacherAClient = createClient(URL, ANON, {
      ...opts,
      global: { headers: { Authorization: `Bearer ${signInA!.session!.access_token}` } },
    })

    const emailB = `dashboard-rls-b-${Date.now()}@test.com`
    const { data: dataB } = await admin.auth.admin.createUser({
      email: emailB, password: 'password123', email_confirm: true,
      user_metadata: { full_name: 'Dashboard Teacher B' },
    })
    createdUserIds.push(dataB!.user.id)

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
        title: 'dashboard RLS 테스트',
        subject: '수학',
        grade: '고1',
        join_code: `D${Date.now().toString(36).toUpperCase().slice(-5)}`,
        status: 'draft',
      })
      .select('id')
      .single()
    sessionAId = session!.id

    // teacher A 세션에 문항 추가
    await teacherAClient.from('questions').insert({
      session_id: sessionAId,
      content: '1 + 1 = ?',
      options: ['1', '2', '3', '4'],
      correct_answer: 1,
      question_order: 1,
    })
  })

  afterAll(async () => {
    for (const id of createdUserIds) {
      await admin.auth.admin.deleteUser(id)
    }
  })

  // TEST-IU3-I01: 본인 세션만 목록에 조회 (RLS)
  it('I01: teacher B는 teacher A 세션의 loadDashboardData 호출 시 에러 또는 빈 session', async () => {
    const result = await loadDashboardData(teacherBClient, sessionAId)
    // RLS가 sessions에 적용되어 있으므로 session이 null이어야 함
    expect(result).toBeNull()
  })

  // TEST-IU3-I02: loadDashboardData — Promise.all 병렬 fetch (sessions/questions/responses)
  it('I02: teacher A가 loadDashboardData 호출 시 session/questions/responses를 모두 반환', async () => {
    const result = await loadDashboardData(teacherAClient, sessionAId)
    expect(result).not.toBeNull()
    expect(result!.session.id).toBe(sessionAId)
    expect(result!.questions.length).toBeGreaterThan(0)
    expect(Array.isArray(result!.responses)).toBe(true)
  })
})
