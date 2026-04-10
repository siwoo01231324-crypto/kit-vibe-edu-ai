import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { generateUniqueJoinCode } from '@/lib/join-code';

const questionSchema = z.object({
  content: z.string().min(1),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correct_answer: z.number().int().min(0).max(3),
});

const bodySchema = z.object({
  source_session_id: z.string().uuid(),
  title: z.string().min(1),
  questions: z.array(questionSchema).min(3).max(5),
});

export async function POST(request: Request) {
  const supabase = await createClient();

  // 1. 인증
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  // 2. Body 검증
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return Response.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
  }

  const { source_session_id, title, questions } = body;

  // 3. 소유권 확인 + subject/grade 가져오기
  const { data: sourceSession } = await supabase
    .from('sessions')
    .select('id, teacher_id, subject, grade')
    .eq('id', source_session_id)
    .single() as { data: { id: string; teacher_id: string; subject: string; grade: string } | null; error: unknown };

  if (!sourceSession || sourceSession.teacher_id !== user.id)
    return Response.json({ error: 'FORBIDDEN' }, { status: 403 });

  // 4. join_code 생성
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const join_code = await generateUniqueJoinCode(supabase as any);

  // 5. 세션 INSERT
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: newSession, error: sessionError } = await sb
    .from('sessions')
    .insert({
      teacher_id: user.id,
      title,
      subject: sourceSession.subject,
      grade: sourceSession.grade,
      join_code,
      status: 'draft',
    })
    .select('id')
    .single() as { data: { id: string } | null; error: { message: string } | null };

  if (sessionError || !newSession) {
    return Response.json({ error: 'DB_ERROR', details: sessionError?.message }, { status: 500 });
  }

  // 6. 문항 bulk INSERT
  const questionRows = questions.map((q, i) => ({
    session_id: newSession.id,
    content: q.content,
    options: q.options,
    correct_answer: q.correct_answer,
    question_order: i,
  }));

  const { error: questionsError } = await sb.from('questions').insert(questionRows) as { error: { message: string } | null };

  if (questionsError) {
    // 롤백: 세션 삭제
    const { error: rollbackErr } = await sb.from('sessions').delete().eq('id', newSession.id);
    if (rollbackErr) console.error('[from-draft] rollback failed', { sessionId: newSession.id, rollbackErr });
    return Response.json({ error: 'DB_ERROR', details: questionsError.message }, { status: 500 });
  }

  return Response.json({ id: newSession.id }, { status: 201 });
}
