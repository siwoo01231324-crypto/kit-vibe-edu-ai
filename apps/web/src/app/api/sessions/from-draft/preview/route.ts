import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { buildDraftQuestionsPrompt, DRAFT_QUESTIONS_TOOL } from '@/lib/prompts/draft-questions';
import type { InsightResult } from '@/lib/prompts/insights';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const bodySchema = z.object({ source_session_id: z.string().uuid() });

export interface QuestionPreview {
  content: string;
  options: [string, string, string, string];
  correct_answer: number;
}

export interface PreviewResponse {
  title: string;
  questions: QuestionPreview[];
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  let source_session_id: string;
  try {
    const parsed = bodySchema.parse(await request.json());
    source_session_id = parsed.source_session_id;
  } catch {
    return Response.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
  }

  const { data: session } = await supabase
    .from('sessions')
    .select('id, teacher_id')
    .eq('id', source_session_id)
    .single() as { data: { id: string; teacher_id: string } | null; error: unknown };

  if (!session || session.teacher_id !== user.id)
    return Response.json({ error: 'FORBIDDEN' }, { status: 403 });

  const [{ data: draft }, { data: insightRow }] = await Promise.all([
    supabase
      .from('class_drafts')
      .select('content')
      .eq('session_id', source_session_id)
      .maybeSingle() as unknown as Promise<{ data: { content: string } | null; error: unknown }>,
    supabase
      .from('ai_insights')
      .select('insights')
      .eq('session_id', source_session_id)
      .maybeSingle() as unknown as Promise<{ data: { insights: unknown } | null; error: unknown }>,
  ]);

  if (!draft) return Response.json({ error: 'NO_DRAFT' }, { status: 404 });
  if (!insightRow) return Response.json({ error: 'NO_INSIGHTS' }, { status: 404 });

  const insights = insightRow.insights as InsightResult;
  const weakConcepts = insights.top_weak_concepts ?? [];

  const { system, user: userMsg } = buildDraftQuestionsPrompt(draft.content, weakConcepts);

  let result: PreviewResponse;
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system,
      tools: [DRAFT_QUESTIONS_TOOL],
      tool_choice: { type: 'tool', name: 'generate_session_questions' },
      messages: [{ role: 'user', content: userMsg }],
    });

    const toolBlock = response.content.find((b) => b.type === 'tool_use');
    if (!toolBlock || toolBlock.type !== 'tool_use') {
      return Response.json({ error: 'CLAUDE_ERROR' }, { status: 500 });
    }

    const input = toolBlock.input as { title: string; questions: QuestionPreview[] };
    result = { title: input.title, questions: input.questions };
  } catch (err) {
    console.error('[from-draft/preview] Claude error:', err);
    return Response.json({ error: 'CLAUDE_ERROR' }, { status: 500 });
  }

  return Response.json(result);
}
