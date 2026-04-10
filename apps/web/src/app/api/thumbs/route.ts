import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/server';

const bodySchema = z.object({
  session_id: z.string().uuid(),
  nickname: z.string().min(1).max(20),
  type: z.enum(['up', 'down']),
  comment: z.string().max(200).optional().nullable(),
});

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return Response.json({ error: 'VALIDATION_ERROR' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('thumbs_feedback').insert({
    session_id: body.session_id,
    nickname: body.nickname,
    type: body.type,
    comment: body.comment ?? null,
  });

  if (error) {
    console.error('[thumbs] insert error:', error.message);
    return Response.json({ error: 'DB_ERROR' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
