import { createClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SRK  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const skip = !URL || !ANON || !SRK || process.env.SKIP_SUPABASE_LOCAL === '1'

const opts = { auth: { autoRefreshToken: false, persistSession: false } } as const

// NOTE: 이 테스트는 Next.js 서버 없이 Supabase DB/RLS 레이어를 직접 검증한다.
// 라우트 핸들러의 상태 전이 가드(.eq('status', 'draft'|'active'))는
// API 라우트에도 동일하게 구현되어 있으며, 여기서는 DB 레벨 동작을 검증한다.
// 라우트 핸들러 자체 HTTP 응답 검증은 수동 smoke test로 보완한다.

describe.skipIf(skip)('session lifecycle — activate / end (DB/RLS 레이어)', () => {
  const admin = createClient(URL, SRK, opts)
  const createdUserIds: string[] = []
  const createdSessionIds: string[] = []

  let teacherAId: string
  let teacherBId: string
  let teacherAToken: string
  let teacherBToken: string

  beforeAll(async () => {
    const health = await fetch(`${URL}/auth/v1/health`)
    if (!health.ok) throw new Error('Supabase not running')

    const emailA = `lifecycle-a-${Date.now()}@test.com`
    const { data: dataA } = await admin.auth.admin.createUser({
      email: emailA, password: 'password123', email_confirm: true,
      user_metadata: { full_name: 'Teacher Lifecycle A' },
    })
    teacherAId = dataA!.user.id
    createdUserIds.push(teacherAId)

    const { data: signInA } = await createClient(URL, ANON, opts)
      .auth.signInWithPassword({ email: emailA, password: 'password123' })
    teacherAToken = signInA!.session!.access_token

    const emailB = `lifecycle-b-${Date.now()}@test.com`
    const { data: dataB } = await admin.auth.admin.createUser({
      email: emailB, password: 'password123', email_confirm: true,
      user_metadata: { full_name: 'Teacher Lifecycle B' },
    })
    teacherBId = dataB!.user.id
    createdUserIds.push(teacherBId)

    const { data: signInB } = await createClient(URL, ANON, opts)
      .auth.signInWithPassword({ email: emailB, password: 'password123' })
    teacherBToken = signInB!.session!.access_token
  })

  afterAll(async () => {
    // admin으로 테스트 데이터 정리
    if (createdSessionIds.length > 0) {
      await admin.from('sessions').delete().in('id', createdSessionIds)
    }
    for (const id of createdUserIds) {
      await admin.auth.admin.deleteUser(id)
    }
  })

  function makeTeacherClient(token: string) {
    return createClient(URL, ANON, {
      ...opts,
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
  }

  async function createDraftSession(token: string, teacherId: string) {
    const client = makeTeacherClient(token)
    const joinCode = Math.random().toString(36).slice(2, 8).toUpperCase()
    const { data, error } = await client
      .from('sessions')
      .insert({
        teacher_id: teacherId,
        title: '테스트 세션',
        subject: '수학',
        grade: '고1',
        join_code: joinCode,
        status: 'draft',
      })
      .select('id, status')
      .single()
    if (error) throw error
    createdSessionIds.push(data!.id)
    return data!
  }

  it('TC1: draft 세션 → active 전이 성공, started_at 저장됨', async () => {
    const session = await createDraftSession(teacherAToken, teacherAId)
    const client = makeTeacherClient(teacherAToken)

    const { data, error } = await client
      .from('sessions')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', session.id)
      .eq('teacher_id', teacherAId)
      .eq('status', 'draft')
      .select('id, status, started_at')
      .single()

    expect(error).toBeNull()
    expect(data!.status).toBe('active')
    expect(data!.started_at).not.toBeNull()
  })

  it('TC2: active 세션 → ended 전이 성공, ended_at 저장됨', async () => {
    const session = await createDraftSession(teacherAToken, teacherAId)
    const client = makeTeacherClient(teacherAToken)

    // draft → active
    await client
      .from('sessions')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', session.id)
      .eq('teacher_id', teacherAId)
      .eq('status', 'draft')

    // active → ended
    const { data, error } = await client
      .from('sessions')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', session.id)
      .eq('teacher_id', teacherAId)
      .eq('status', 'active')
      .select('id, status, ended_at')
      .single()

    expect(error).toBeNull()
    expect(data!.status).toBe('ended')
    expect(data!.ended_at).not.toBeNull()
  })

  it('TC3: teacher B가 teacher A 세션 activate 시도 → RLS로 차단 (업데이트 행 수 0)', async () => {
    const session = await createDraftSession(teacherAToken, teacherAId)
    const clientB = makeTeacherClient(teacherBToken)

    const { data, error } = await clientB
      .from('sessions')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', session.id)
      .eq('teacher_id', teacherAId)  // teacher A의 세션
      .eq('status', 'draft')
      .select('id')

    // RLS로 차단: 에러 없이 빈 배열 반환되거나 에러 반환
    const updated = data ?? []
    expect(updated).toHaveLength(0)
  })

  it('TC4: 이미 active인 세션에 draft 가드로 activate 재시도 → 업데이트 행 수 0 (멱등성)', async () => {
    const session = await createDraftSession(teacherAToken, teacherAId)
    const client = makeTeacherClient(teacherAToken)

    // 첫 번째 activate
    await client
      .from('sessions')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', session.id)
      .eq('teacher_id', teacherAId)
      .eq('status', 'draft')

    // 두 번째 activate — draft 가드로 차단돼야 함
    const { data } = await client
      .from('sessions')
      .update({ status: 'active', started_at: new Date().toISOString() })
      .eq('id', session.id)
      .eq('teacher_id', teacherAId)
      .eq('status', 'draft')  // 이미 active이므로 매칭 안 됨
      .select('id')

    expect(data ?? []).toHaveLength(0)
  })

  it('TC5: draft 세션에 active 가드로 end 시도 → 업데이트 행 수 0', async () => {
    const session = await createDraftSession(teacherAToken, teacherAId)
    const client = makeTeacherClient(teacherAToken)

    const { data } = await client
      .from('sessions')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', session.id)
      .eq('teacher_id', teacherAId)
      .eq('status', 'active')  // draft이므로 매칭 안 됨
      .select('id')

    expect(data ?? []).toHaveLength(0)
  })
})
