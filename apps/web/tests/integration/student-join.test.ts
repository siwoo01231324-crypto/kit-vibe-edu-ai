import { createClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Database } from '@/types/database'

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SRK  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const skip = !URL || !ANON || !SRK || process.env.SKIP_SUPABASE_LOCAL === '1'

const opts = { auth: { autoRefreshToken: false, persistSession: false } } as const

/**
 * 학생 참여 통합 테스트
 *
 * TEST-IU1-I01: 유효 join_code + active 세션 → 성공, 세션 데이터 반환
 * TEST-IU1-I02: 존재하지 않는 join_code → 에러 반환
 * TEST-IU1-I03: inactive(draft/ended) 세션 join_code → 에러 반환
 */
describe.skipIf(skip)('student join — sessions 익명 조회', () => {
  const admin = skip ? null! : createClient<Database>(URL, SRK, opts)
  const anon  = skip ? null! : createClient<Database>(URL, ANON, opts)

  // 테스트용 teacher id (UUID 고정)
  const teacherId = '00000000-0000-0000-0000-000000000001'
  const createdSessionIds: string[] = []

  async function insertSession(overrides: Partial<Database['public']['Tables']['sessions']['Insert']>) {
    const base: Database['public']['Tables']['sessions']['Insert'] = {
      teacher_id: teacherId,
      title: 'Test Session',
      subject: 'math',
      grade: '3',
      join_code: `TST${Date.now().toString().slice(-3)}`,
      status: 'active',
    }
    const { data, error } = await admin
      .from('sessions')
      .insert({ ...base, ...overrides })
      .select()
      .single()
    if (error) throw error
    createdSessionIds.push(data.id)
    return data
  }

  beforeAll(async () => {
    // teacher 행이 없으면 삽입 (FK 제약 충족)
    await admin
      .from('teachers')
      .upsert({ id: teacherId, name: 'Test Teacher', email: 'testteacher@test.invalid' }, { onConflict: 'id' })
  })

  afterAll(async () => {
    if (createdSessionIds.length) {
      await admin.from('sessions').delete().in('id', createdSessionIds)
    }
  })

  // TEST-IU1-I01
  it('TEST-IU1-I01: 유효 join_code + active 세션 → 성공, 세션 데이터 반환', async () => {
    const session = await insertSession({ status: 'active' })

    const { data, error } = await anon
      .from('sessions')
      .select('id, title, subject, grade')
      .eq('join_code', session.join_code)
      .eq('status', 'active')
      .single()

    expect(error).toBeNull()
    expect(data).toBeTruthy()
    expect(data!.id).toBe(session.id)
    expect(data!.title).toBe(session.title)
    expect(data!.subject).toBe(session.subject)
    expect(data!.grade).toBe(session.grade)
  })

  // TEST-IU1-I02
  it('TEST-IU1-I02: 존재하지 않는 join_code → 에러 반환 (no rows)', async () => {
    const { data, error } = await anon
      .from('sessions')
      .select('id, title, subject, grade')
      .eq('join_code', 'XXXXXX')
      .eq('status', 'active')
      .single()

    // PGRST116: 0 rows — 세션 없음
    expect(data).toBeNull()
    expect(error).toBeTruthy()
    expect(error!.code).toBe('PGRST116')
  })

  // TEST-IU1-I03
  it('TEST-IU1-I03: inactive 세션 join_code → 에러 반환 (status 불일치)', async () => {
    const session = await insertSession({ status: 'draft' })

    const { data, error } = await anon
      .from('sessions')
      .select('id, title, subject, grade')
      .eq('join_code', session.join_code)
      .eq('status', 'active')
      .single()

    // status='active' 조건으로 조회 → 0 rows
    expect(data).toBeNull()
    expect(error).toBeTruthy()
    expect(error!.code).toBe('PGRST116')
  })
})
