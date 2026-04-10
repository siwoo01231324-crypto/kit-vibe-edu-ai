import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { callClaude } from '@/lib/anthropic';
import { buildDraftPrompt } from '@/lib/prompts/class-draft';
import type { InsightResult } from '@/lib/prompts/insights';

const bodySchema = z.object({ session_id: z.string().uuid() });

export async function POST(request: Request) {
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  // 2. Body validation
  let session_id: string;
  try {
    const parsed = bodySchema.parse(await request.json());
    session_id = parsed.session_id;
  } catch {
    return Response.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
  }

  // 3. Ownership check
  const { data: session } = await supabase
    .from('sessions')
    .select('id, subject, grade, teacher_id')
    .eq('id', session_id)
    .single();

  if (!session || session.teacher_id !== user.id)
    return Response.json({ error: 'FORBIDDEN' }, { status: 403 });

  // 4. Insights existence check
  const { data: insightRow } = await supabase
    .from('ai_insights')
    .select('insights')
    .eq('session_id', session_id)
    .maybeSingle();

  if (!insightRow) {
    return Response.json(
      { error: 'NO_INSIGHTS', message: 'insights가 없습니다. 먼저 인사이트를 생성하세요.' },
      { status: 400 },
    );
  }

  // 5. Cache check
  const { data: cached } = await supabase
    .from('class_drafts')
    .select('content')
    .eq('session_id', session_id)
    .maybeSingle();

  if (cached) return Response.json({ content: cached.content });

  // 6. Build prompt and call Claude
  const { system, user: userMsg } = buildDraftPrompt(
    insightRow.insights as unknown as InsightResult,
    session.subject,
    session.grade,
  );

  let content: string;
  try {
    content = await callClaude({ system, user: userMsg, maxTokens: 2048 });
  } catch {
    return Response.json({ error: 'CLAUDE_ERROR' }, { status: 500 });
  }

  // 7. Save to class_drafts
  await supabase.from('class_drafts').insert({ session_id, content });

  return Response.json({ content });
}
