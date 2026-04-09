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

describe.skipIf(skipFlag)('thumbs_feedback RLS & unique', () => {
  let adminClient: SupabaseClient;
  let anonClient: SupabaseClient;
  let teacherClient: SupabaseClient;

  let teacherId: string;
  let activeSessionId: string;
  let inactiveSessionId: string;

  const randCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

  beforeAll(async () => {
    adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Create teacher
    const { data: user, error: userErr } = await adminClient.auth.admin.createUser({
      email: 'thumbs_teacher_test@example.com',
      password: 'test-password-thumbs',
      email_confirm: true,
    });
    if (userErr) throw new Error(`Failed to create teacher: ${userErr.message}`);
    teacherId = user.user.id;

    await adminClient.from('teachers').insert({
      id: teacherId,
      email: 'thumbs_teacher_test@example.com',
      name: 'Thumbs Teacher',
    });

    // Sign in as teacher
    const signInClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: session, error: signInErr } = await signInClient.auth.signInWithPassword({
      email: 'thumbs_teacher_test@example.com',
      password: 'test-password-thumbs',
    });
    if (signInErr) throw new Error(`Failed to sign in teacher: ${signInErr.message}`);
    teacherClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${session.session!.access_token}` } },
    });

    // Create active session
    const { data: activeSess, error: activeErr } = await adminClient
      .from('sessions')
      .insert({
        teacher_id: teacherId,
        title: 'Thumbs Active Session',
        subject: '수학',
        grade: '중1',
        join_code: randCode(),
        status: 'active',
      })
      .select('id')
      .single();
    if (activeErr) throw new Error(`Failed to create active session: ${activeErr.message}`);
    activeSessionId = activeSess.id;

    // Create ended (inactive) session
    const { data: inactiveSess, error: inactiveErr } = await adminClient
      .from('sessions')
      .insert({
        teacher_id: teacherId,
        title: 'Thumbs Ended Session',
        subject: '수학',
        grade: '중1',
        join_code: randCode(),
        status: 'ended',
      })
      .select('id')
      .single();
    if (inactiveErr) throw new Error(`Failed to create inactive session: ${inactiveErr.message}`);
    inactiveSessionId = inactiveSess.id;
  });

  afterAll(async () => {
    if (activeSessionId) {
      await adminClient.from('sessions').delete().eq('id', activeSessionId);
    }
    if (inactiveSessionId) {
      await adminClient.from('sessions').delete().eq('id', inactiveSessionId);
    }
    if (teacherId) {
      await adminClient.from('teachers').delete().eq('id', teacherId);
      await adminClient.auth.admin.deleteUser(teacherId);
    }
  });

  it('TEST-IU6-I01: anon이 active 세션에 thumbs_feedback INSERT 성공', async () => {
    const { error } = await anonClient.from('thumbs_feedback').insert({
      session_id: activeSessionId,
      nickname: '학생A',
      type: 'up',
    });
    expect(error).toBeNull();
  });

  it('TEST-IU6-I02: unique(session_id, nickname) 중복 INSERT 실패', async () => {
    // First insert (same nickname as I01 test)
    const { error: firstErr } = await anonClient.from('thumbs_feedback').insert({
      session_id: activeSessionId,
      nickname: '학생B',
      type: 'up',
    });
    expect(firstErr).toBeNull();

    // Duplicate insert — same session_id + nickname
    const { error: dupErr } = await anonClient.from('thumbs_feedback').insert({
      session_id: activeSessionId,
      nickname: '학생B',
      type: 'down',
    });
    expect(dupErr).not.toBeNull();
  });

  it('TEST-IU6-I03: inactive(ended) 세션에 INSERT 시도 → RLS 거절', async () => {
    const { error } = await anonClient.from('thumbs_feedback').insert({
      session_id: inactiveSessionId,
      nickname: '학생C',
      type: 'up',
    });
    expect(error).not.toBeNull();
  });
});
