import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // (teacher)/* 보호: 미인증 시 /login 리다이렉트
  if (pathname.startsWith('/teacher') && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 이미 로그인 상태에서 /login 접근 시 /teacher/dashboard 로
  if (pathname === '/login' && user) {
    const dashUrl = request.nextUrl.clone()
    dashUrl.pathname = '/teacher/dashboard'
    dashUrl.searchParams.delete('next')
    return NextResponse.redirect(dashUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
