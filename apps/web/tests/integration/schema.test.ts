import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const shouldSkip = async (): Promise<boolean> => {
  if (process.env.SKIP_SUPABASE_LOCAL === '1') return true;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return true;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`);
    return !res.ok;
  } catch {
    return true;
  }
};

const skipFlag = await shouldSkip();

describe.skipIf(skipFlag)('schema integration', () => {
  let adminClient: SupabaseClient;
  let anonClient: SupabaseClient;
  let teacherAClient: SupabaseClient;
  let teacherBClient: SupabaseClient;

  let teacherAId: string;
  let teacherBId: string;
  let activeSessionId: string;
  let draftSessionId: string;
  let activeQuestionId: string;

  // Generate unique join_code per test run (UNIQUE constraint on sessions.join_code)
  const randCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

  beforeAll(async () => {
    adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Create teacher_a
    const { data: userA, error: errA } = await adminClient.auth.admin.createUser({
      email: 'teacher_a_test@example.com',
      password: 'test-password-a',
      email_confirm: true,
    });
    if (errA) throw new Error(`Failed to create teacher_a: ${errA.message}`);
    teacherAId = userA.user.id;

    // Create teacher_b
    const { data: userB, error: errB } = await adminClient.auth.admin.createUser({
      email: 'teacher_b_test@example.com',
      password: 'test-password-b',
      email_confirm: true,
    });
    if (errB) throw new Error(`Failed to create teacher_b: ${errB.message}`);
    teacherBId = userB.user.id;

    // Seed teachers rows
    await adminClient.from('teachers').insert([
      { id: teacherAId, email: 'teacher_a_test@example.com', name: 'Teacher A' },
      { id: teacherBId, email: 'teacher_b_test@example.com', name: 'Teacher B' },
    ]);

    // IMPORTANT: signInWithPassword mutates the calling client's auth state.
    // We use a throwaway anon client for sign-in so adminClient keeps its
    // service_role authority for the rest of the suite.
    const signInClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Sign in as teacher_a to get JWT
    const { data: sessionA, error: signInErrA } = await signInClient.auth.signInWithPassword({
      email: 'teacher_a_test@example.com',
      password: 'test-password-a',
    });
    if (signInErrA) throw new Error(`Failed to sign in teacher_a: ${signInErrA.message}`);
    teacherAClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${sessionA.session!.access_token}` } },
    });

    // Sign out before next sign-in to avoid state bleed
    await signInClient.auth.signOut();

    // Sign in as teacher_b to get JWT
    const { data: sessionB, error: signInErrB } = await signInClient.auth.signInWithPassword({
      email: 'teacher_b_test@example.com',
      password: 'test-password-b',
    });
    if (signInErrB) throw new Error(`Failed to sign in teacher_b: ${signInErrB.message}`);
    teacherBClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${sessionB.session!.access_token}` } },
    });

    await signInClient.auth.signOut();

    // Seed sessions: active + draft for teacher_a
    // NOTE: dev-spec §3.2 — sessions requires teacher_id, title, subject, grade, join_code (UNIQUE)
    const { data: activeSess, error: activeErr } = await adminClient
      .from('sessions')
      .insert({
        teacher_id: teacherAId,
        title: 'Active Session',
        subject: '수학',
        grade: '중1',
        join_code: randCode(),
        status: 'active',
      })
      .select('id')
      .single();
    if (activeErr) throw new Error(`Failed to create active session: ${activeErr.message}`);
    activeSessionId = activeSess.id;

    const { data: draftSess, error: draftErr } = await adminClient
      .from('sessions')
      .insert({
        teacher_id: teacherAId,
        title: 'Draft Session',
        subject: '수학',
        grade: '중1',
        join_code: randCode(),
        status: 'draft',
      })
      .select('id')
      .single();
    if (draftErr) throw new Error(`Failed to create draft session: ${draftErr.message}`);
    draftSessionId = draftSess.id;

    // Seed a question for the active session (needed for AC4 responses FK)
    const { data: question, error: qErr } = await adminClient
      .from('questions')
      .insert({
        session_id: activeSessionId,
        content: '1 + 1 = ?',
        options: ['1', '2', '3', '4'],
        correct_answer: 1,
        question_order: 1,
      })
      .select('id')
      .single();
    if (qErr) throw new Error(`Failed to create question: ${qErr.message}`);
    activeQuestionId = question.id;
  });

  afterAll(async () => {
    // Delete seeded data via service role (CASCADE handles child rows)
    if (activeSessionId) {
      await adminClient.from('sessions').delete().eq('id', activeSessionId);
    }
    if (draftSessionId) {
      await adminClient.from('sessions').delete().eq('id', draftSessionId);
    }
    if (teacherAId) {
      await adminClient.from('teachers').delete().eq('id', teacherAId);
      await adminClient.auth.admin.deleteUser(teacherAId);
    }
    if (teacherBId) {
      await adminClient.from('teachers').delete().eq('id', teacherBId);
      await adminClient.auth.admin.deleteUser(teacherBId);
    }
  });

  it('AC6: teacher can INSERT and SELECT own session', async () => {
    const { data: inserted, error: insertErr } = await teacherAClient
      .from('sessions')
      .insert({
        teacher_id: teacherAId,
        title: 'Teacher A Own Session',
        subject: '수학',
        grade: '중1',
        join_code: randCode(),
        status: 'active',
      })
      .select('id')
      .single();
    expect(insertErr).toBeNull();
    expect(inserted).toBeDefined();
    expect(inserted!.id).toBeDefined();

    const { data: selected, error: selectErr } = await teacherAClient
      .from('sessions')
      .select('*')
      .eq('id', inserted!.id)
      .single();
    expect(selectErr).toBeNull();
    expect(selected).toBeDefined();

    // Cleanup this extra session
    await adminClient.from('sessions').delete().eq('id', inserted!.id);
  });

  it('AC4: anonymous user RLS — active sessions visible, draft hidden; INSERT to active allowed, draft rejected', async () => {
    // anon can see active sessions, not draft
    const { data: sessions, error: listErr } = await anonClient
      .from('sessions')
      .select('*');
    expect(listErr).toBeNull();
    const ids = (sessions ?? []).map((s: { id: string }) => s.id);
    expect(ids).toContain(activeSessionId);
    expect(ids).not.toContain(draftSessionId);

    // anon can INSERT responses on active session
    // NOTE: dev-spec §3.2 — responses requires session_id, question_id, nickname,
    // selected_answer, is_correct, response_time_ms
    const { error: respActiveErr } = await anonClient
      .from('responses')
      .insert({
        session_id: activeSessionId,
        question_id: activeQuestionId,
        nickname: '익명학생1',
        selected_answer: 1,
        is_correct: true,
        response_time_ms: 1500,
      });
    expect(respActiveErr).toBeNull();

    // anon cannot INSERT responses on draft session (RLS blocks because status != 'active')
    const { error: respDraftErr } = await anonClient
      .from('responses')
      .insert({
        session_id: draftSessionId,
        question_id: activeQuestionId,
        nickname: '익명학생2',
        selected_answer: 0,
        is_correct: false,
        response_time_ms: 2000,
      });
    expect(respDraftErr).not.toBeNull();

    // anon can INSERT thumbs_feedback on active session
    // NOTE: dev-spec §3.2 — thumbs_feedback requires session_id, nickname, type ('up'|'down')
    const { error: thumbsErr } = await anonClient
      .from('thumbs_feedback')
      .insert({
        session_id: activeSessionId,
        nickname: '익명학생1',
        type: 'up',
      });
    expect(thumbsErr).toBeNull();
  });

  it('AC5: teacher isolation — teacher_b cannot see or update teacher_a sessions', async () => {
    // teacher_b SELECT sessions — should return 0 rows for teacher_a
    const { data: sessions, error: selectErr } = await teacherBClient
      .from('sessions')
      .select('*')
      .eq('teacher_id', teacherAId);
    expect(selectErr).toBeNull();
    expect((sessions ?? []).length).toBe(0);

    // teacher_b cannot UPDATE teacher_a's active session
    const { data: updated, error: updateErr } = await teacherBClient
      .from('sessions')
      .update({ title: 'Hacked by B' })
      .eq('id', activeSessionId)
      .select();
    // Either error or empty result (RLS blocks the update)
    const rowsAffected = (updated ?? []).length;
    const isBlocked = updateErr !== null || rowsAffected === 0;
    expect(isBlocked).toBe(true);
  });
});
