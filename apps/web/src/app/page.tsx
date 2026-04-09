import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 gap-12 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900">Kit Vibe Edu</h1>
        <p className="mt-2 text-slate-500">AI 기반 실시간 퀴즈 수업 플랫폼</p>
      </div>

      <div className="flex flex-col gap-8 w-full max-w-sm">
        {/* 교사 */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">교사</h2>
          <div className="flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/teacher/dashboard"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-center font-medium text-white hover:bg-blue-700"
                >
                  대시보드
                </Link>
                <Link
                  href="/teacher/sessions/new"
                  className="rounded-lg border px-4 py-2 text-center font-medium text-slate-700 hover:bg-slate-50"
                >
                  새 세션 만들기
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-blue-600 px-4 py-2 text-center font-medium text-white hover:bg-blue-700"
              >
                로그인
              </Link>
            )}
          </div>
        </div>

        {/* 학생 */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">학생</h2>
          <div className="flex flex-col gap-2">
            <Link
              href="/join"
              className="rounded-lg bg-green-600 px-4 py-2 text-center font-medium text-white hover:bg-green-700"
            >
              수업 참여하기
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
