import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'

const SAFE_NEXT_PATTERN = /^\/teacher(\/|$)/

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const rawNext = searchParams.get('next') ?? '/teacher/dashboard'

  // next 파라미터 allowlist (open redirect 방어)
  const safeNext = SAFE_NEXT_PATTERN.test(rawNext) ? rawNext : '/teacher/dashboard'

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`
    )
  }

  // Option C: callback에서 teachers 프로필 upsert (최신 메타데이터 동기화)
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('teachers').upsert(
      {
        id: user.id,
        name:
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email ??
          'Unknown Teacher',
        email: user.email ?? '',
      },
      { onConflict: 'id' }
    )
  }

  return NextResponse.redirect(`${origin}${safeNext}`)
}
