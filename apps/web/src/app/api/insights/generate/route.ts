import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { callClaude } from '@/lib/anthropic';
import { buildInsightsPrompt, parseInsightResponse } from '@/lib/prompts/insights';
import { aggregateResponses } from '@/lib/aggregate';

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

  // 4. Cache check
  const { data: cached } = await supabase
    .from('ai_insights')
    .select('insights')
    .eq('session_id', session_id)
    .maybeSingle();

  if (cached) return Response.json(cached.insights);

  // 5. Aggregate responses
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('session_id', session_id);
  const { data: responses } = await supabase
    .from('responses')
    .select('*')
    .eq('session_id', session_id);

  const stats = aggregateResponses(
    (questions ?? []).map((q) => ({
      id: q.id,
      content: q.content,
      options: q.options as string[],
    })),
    (responses ?? []).map((r) => ({
      question_id: r.question_id,
      is_correct: r.is_correct,
      answer: r.selected_answer,
      response_time_ms: r.response_time_ms,
    })),
  );

  // 6. Call Claude
  const { system, user: userMsg } = buildInsightsPrompt(
    { subject: session.subject, grade: session.grade },
    stats,
  );

  let raw: string;
  try {
    raw = await callClaude({ system, user: userMsg, maxTokens: 2048 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json({ error: 'CLAUDE_ERROR', message }, { status: 500 });
  }

  // 7. Parse + zod validate
  let insights: ReturnType<typeof parseInsightResponse>;
  try {
    insights = parseInsightResponse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      { error: 'PARSE_ERROR', message },
      { status: 500 },
    );
  }

  // 8. Save to ai_insights
  await supabase.from('ai_insights').insert({ session_id, insights });

  return Response.json(insights);
}
