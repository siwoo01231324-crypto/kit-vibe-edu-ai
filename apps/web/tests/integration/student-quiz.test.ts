import { createClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Database } from '@/types/database'

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
const SRK  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const skip = !URL || !ANON || !SRK || process.env.SKIP_SUPABASE_LOCAL === '1'

const opts = { auth: { autoRefreshToken: false, persistSession: false } } as const

/**
 * 학생 퀴즈 응답 통합 테스트
 *
 * TEST-IU1-I03: anon 클라이언트가 responses INSERT 성공
 * TEST-IU1-I04: 동일 (session_id, question_id, nickname) 두 번째 INSERT → DB 레벨에서는 row 2개 생성 (클라이언트 가드로 차단)
 * TEST-IU1-I05: questions Realtime 채널 콜백 수신 (INSERT/UPDATE)
 */
describe.skipIf(skip)('student quiz — responses INSERT + Realtime', () => {
  const admin = skip ? null! : createClient<Database>(URL, SRK, opts)
  const anon  = skip ? null! : createClient<Database>(URL, ANON, opts)

  // teachers.id → auth.users(id) FK: beforeAll에서 동적 생성 (student-join과 이메일 다름)
  let teacherId: string
  const createdSessionIds: string[] = []

  let sessionId: string
  let questionId: string

  async function insertSession() {
    const { data, error } = await admin
      .from('sessions')
      .insert({
        teacher_id: teacherId,
        title: 'Quiz Test Session',
        subject: 'math',
        grade: '3',
        join_code: `QT${Date.now().toString().slice(-4)}`,
        status: 'active',
      })
      .select()
      .single()
    if (error) throw error
    createdSessionIds.push(data.id)
    return data
  }

  async function insertQuestion(sid: string, order = 1) {
    const { data, error } = await admin
      .from('questions')
      .insert({
        session_id: sid,
        content: '1 + 1 = ?',
        options: ['1', '2', '3', '4'],
        correct_answer: 1,
        question_order: order,
      })
      .select()
      .single()
    if (error) throw error
    return data
  }

  beforeAll(async () => {
    // teachers.id → auth.users(id) FK: auth user 먼저 생성 후 반환된 ID로 teacher 행 삽입
    const { data: userData, error: userErr } = await admin.auth.admin.createUser({
      email: 'test-student-quiz@test.invalid',
      password: 'test-password-quiz',
      email_confirm: true,
    })
    if (userErr) throw new Error(`auth user 생성 실패: ${userErr.message}`)
    teacherId = userData.user.id
    await admin
      .from('teachers')
      .upsert({ id: teacherId, name: 'Quiz Test Teacher', email: 'test-student-quiz@test.invalid' }, { onConflict: 'id' })

    const session = await insertSession()
    sessionId = session.id
    const question = await insertQuestion(sessionId)
    questionId = question.id
  })

  afterAll(async () => {
    if (createdSessionIds.length) {
      // cascade로 questions/responses도 정리
      await admin.from('sessions').delete().in('id', createdSessionIds)
    }
    await admin.from('teachers').delete().eq('id', teacherId).catch(() => {})
    await admin.auth.admin.deleteUser(teacherId).catch(() => {})
  })

  // TEST-IU1-I03
  it('TEST-IU1-I03: anon 클라이언트가 responses INSERT 성공', async () => {
    const { data, error } = await anon
      .from('responses')
      .insert({
        session_id: sessionId,
        question_id: questionId,
        nickname: 'TestStudent',
        selected_answer: 1,
        is_correct: true,
        response_time_ms: 2000,
        score: 800,
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(data).toBeTruthy()
    expect(data!.session_id).toBe(sessionId)
    expect(data!.question_id).toBe(questionId)
    expect(data!.nickname).toBe('TestStudent')
    expect(data!.is_correct).toBe(true)
    expect(data!.score).toBe(800)
  })

  // TEST-IU1-I04: DB 레벨 unique 제약 없음 → 두 번 INSERT 시 row 2개 생성됨 확인
  // 클라이언트 가드(answeredQuestionIds Set)가 실제 중복 방지를 담당
  it('TEST-IU1-I04: 동일 (session_id, question_id, nickname) 두 번 INSERT → row 2개 (DB 레벨 제약 없음)', async () => {
    const payload = {
      session_id: sessionId,
      question_id: questionId,
      nickname: 'DuplicateStudent',
      selected_answer: 2,
      is_correct: false,
      response_time_ms: 3000,
      score: 0,
    }

    const { error: err1 } = await anon.from('responses').insert(payload)
    expect(err1).toBeNull()

    const { error: err2 } = await anon.from('responses').insert(payload)
    expect(err2).toBeNull()

    // DB 레벨에서는 두 row 모두 허용됨 (클라이언트 가드로 막아야 함)
    // admin으로 count 확인 (anon SELECT 불가)
    const { count } = await admin
      .from('responses')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId)
      .eq('question_id', questionId)
      .eq('nickname', 'DuplicateStudent')

    expect(count).toBeGreaterThanOrEqual(2)
  })

  // TEST-IU1-I05: questions Realtime 채널 콜백 수신
  it('TEST-IU1-I05: questions Realtime 채널 콜백 수신 (INSERT)', async () => {
    const receivedPayloads: unknown[] = []

    const channel = anon
      .channel(`session:${sessionId}:questions`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'questions',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          receivedPayloads.push(payload)
        }
      )
      .subscribe()

    // 채널 구독 안정화 대기
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // admin이 새 question INSERT
    await insertQuestion(sessionId, 2)

    // 콜백 수신 대기 (최대 5초)
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Realtime callback timeout')), 5000)
      const interval = setInterval(() => {
        if (receivedPayloads.length > 0) {
          clearTimeout(timeout)
          clearInterval(interval)
          resolve()
        }
      }, 100)
    })

    expect(receivedPayloads.length).toBeGreaterThan(0)

    await anon.removeChannel(channel)
  }, 10000)
})
