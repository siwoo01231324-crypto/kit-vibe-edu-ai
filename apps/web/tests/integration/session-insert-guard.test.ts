import { createClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SRK  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const skip = !URL || !ANON || !SRK || process.env.SKIP_SUPABASE_LOCAL === '1'

const opts = { auth: { autoRefreshToken: false, persistSession: false } } as const

describe.skipIf(skip)('sessions RLS — 인증된 교사만 INSERT 가능', () => {
  const admin = createClient(URL, SRK, opts)
  const anonClient = createClient(URL, ANON, opts)
  const createdUserIds: string[] = []

  let teacherAId: string
  let teacherBId: string
  let teacherAClient: ReturnType<typeof createClient>

  beforeAll(async () => {
    // health check
    const health = await fetch(`${URL}/auth/v1/health`)
    if (!health.ok) throw new Error('Supabase not running')

    // teacher A 생성
    const emailA = `sessions-rls-a-${Date.now()}@test.com`
    const { data: dataA } = await admin.auth.admin.createUser({
      email: emailA, password: 'password123', email_confirm: true,
      user_metadata: { full_name: 'Teacher A' },
    })
    teacherAId = dataA!.user.id
    createdUserIds.push(teacherAId)

    // teacher B 생성
    const emailB = `sessions-rls-b-${Date.now()}@test.com`
    const { data: dataB } = await admin.auth.admin.createUser({
      email: emailB, password: 'password123', email_confirm: true,
      user_metadata: { full_name: 'Teacher B' },
    })
    teacherBId = dataB!.user.id
    createdUserIds.push(teacherBId)

    // teacher A 세션 획득
    const { data: signIn } = await createClient(URL, ANON, opts)
      .auth.signInWithPassword({ email: emailA, password: 'password123' })
    teacherAClient = createClient(URL, ANON, {
      ...opts,
      global: { headers: { Authorization: `Bearer ${signIn!.session!.access_token}` } },
    })
  })

  afterAll(async () => {
    for (const id of createdUserIds) {
      await admin.auth.admin.deleteUser(id)
    }
  })

  const baseSession = () => ({
    title: `테스트 수업 ${Date.now()}`,
    subject: '수학',
    grade: '고1',
    join_code: Math.random().toString(36).slice(2, 8).toUpperCase(),
    status: 'draft' as const,
  })

  it('anon 클라이언트는 sessions INSERT 불가 (RLS 거부)', async () => {
    const { error } = await anonClient.from('sessions').insert({
      ...baseSession(),
      teacher_id: teacherAId,
    })
    expect(error).toBeTruthy()
  })

  it('인증된 teacher A는 자기 teacher_id로 sessions INSERT 가능', async () => {
    const { error } = await teacherAClient.from('sessions').insert({
      ...baseSession(),
      teacher_id: teacherAId,
    })
    expect(error).toBeNull()
  })

  it('teacher A가 teacher B의 id로 sessions INSERT 시도 → RLS 거부', async () => {
    const { error } = await teacherAClient.from('sessions').insert({
      ...baseSession(),
      teacher_id: teacherBId,
    })
    expect(error).toBeTruthy()
  })
})
