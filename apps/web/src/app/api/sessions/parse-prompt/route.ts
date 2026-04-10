import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { callClaude } from '@/lib/anthropic'
import { buildSessionParsePrompt, parseSessionParseResponse } from '@/lib/prompts/session-parse'

const ParsePromptSchema = z.object({
  prompt: z.string().min(10, '10자 이상 입력하세요').max(2000, '2000자 이하로 입력하세요'),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'VALIDATION_ERROR', details: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = ParsePromptSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { prompt } = parsed.data

  let raw: string
  try {
    const { system, user: userMsg } = buildSessionParsePrompt(prompt)
    raw = await callClaude({ system, user: userMsg, maxTokens: 2048 })
  } catch {
    return NextResponse.json({ error: 'API_ERROR' }, { status: 500 })
  }

  try {
    const result = parseSessionParseResponse(raw)
    return NextResponse.json(result)
  } catch {
    console.error('[parse-prompt] PARSE_ERROR raw:', raw.slice(0, 500))
    return NextResponse.json({ error: 'PARSE_ERROR' }, { status: 400 })
  }
}
