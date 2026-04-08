import { createClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SRK  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const skip = !URL || !ANON || !SRK || process.env.SKIP_SUPABASE_LOCAL === '1'

const opts = { auth: { autoRefreshToken: false, persistSession: false } } as const

describe.skipIf(skip)('auth trigger & teachers upsert', () => {
  const admin = createClient(URL, SRK, opts)
  const createdIds: string[] = []

  afterAll(async () => {
    for (const id of createdIds) {
      await admin.auth.admin.deleteUser(id)
    }
  })

  async function createUser(email: string, metadata: Record<string, unknown>) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: metadata,
    })
    if (error) throw error
    createdIds.push(data.user.id)
    return data.user
  }

  it('양성 케이스: full_name 있는 경우 teachers row가 자동 생성됨', async () => {
    const email = `trigger-pos-${Date.now()}@test.com`
    const user = await createUser(email, { full_name: 'Test Teacher' })

    // 트리거가 동기적으로 실행되므로 즉시 조회 가능
    const { data } = await admin.from('teachers').select().eq('id', user.id).single()
    expect(data).toBeTruthy()
    expect(data!.name).toBe('Test Teacher')
    expect(data!.email).toBe(email)
  })

  it('음성 케이스: user_metadata 없어도 트리거 실패 없이 fallback으로 row 생성됨', async () => {
    const email = `trigger-neg-${Date.now()}@test.com`
    const user = await createUser(email, {})

    const { data } = await admin.from('teachers').select().eq('id', user.id).single()
    expect(data).toBeTruthy()
    // fallback: email or 'Unknown Teacher'
    expect(data!.name).toBeTruthy()
  })

  it('멱등성 케이스: callback upsert 2회 실행해도 teachers row 1개', async () => {
    const email = `trigger-idem-${Date.now()}@test.com`
    const user = await createUser(email, { full_name: 'Idempotent Teacher' })

    // 트리거가 이미 row 생성 → upsert로 2번 덮어써도 1개
    const upsertData = {
      id: user.id,
      name: 'Idempotent Teacher',
      email,
    }
    await admin.from('teachers').upsert(upsertData, { onConflict: 'id' })
    await admin.from('teachers').upsert(upsertData, { onConflict: 'id' })

    const { data, count } = await admin
      .from('teachers')
      .select('*', { count: 'exact' })
      .eq('id', user.id)
    expect(count).toBe(1)
    expect(data![0].name).toBe('Idempotent Teacher')
  })
})
