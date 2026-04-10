import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="relative min-h-screen bg-white overflow-hidden">
      {/* Background decorative blobs */}
      <div className="pointer-events-none absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100 rounded-full blur-3xl opacity-60 -translate-y-1/4 translate-x-1/4" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-100 rounded-full blur-3xl opacity-50 translate-y-1/4 -translate-x-1/4" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-amber-50 rounded-full blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2" />

      {/* Geometric accent shapes */}
      <div className="pointer-events-none absolute top-16 left-12 w-8 h-8 bg-orange-400 rounded-lg rotate-12 opacity-70" />
      <div className="pointer-events-none absolute top-32 right-24 w-5 h-5 bg-rose-400 rounded-full opacity-60" />
      <div className="pointer-events-none absolute bottom-32 right-16 w-10 h-10 bg-lime-400 rounded-lg -rotate-6 opacity-50" />
      <div className="pointer-events-none absolute bottom-20 left-20 w-6 h-6 bg-sky-400 rounded-full opacity-60" />

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Badge row */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in-up">
          <span className="px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-bold border border-orange-200">
            🎮 게임형 수업
          </span>
          <span className="px-4 py-1.5 bg-rose-100 text-rose-700 rounded-full text-sm font-bold border border-rose-200">
            ⚡ 실시간
          </span>
          <span className="px-4 py-1.5 bg-sky-100 text-sky-700 rounded-full text-sm font-bold border border-sky-200">
            🤖 AI 생성
          </span>
          <span className="px-4 py-1.5 bg-lime-100 text-lime-700 rounded-full text-sm font-bold border border-lime-200">
            🏆 리더보드
          </span>
        </div>

        {/* Main title */}
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-4 font-pretendard leading-none tracking-tight animate-fade-in-up">
          Kit{' '}
          <span className="text-brand relative">
            Vibe
            <span className="absolute -bottom-1 left-0 w-full h-1.5 bg-brand rounded-full" />
          </span>{' '}
          Edu
        </h1>

        <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-md font-pretendard animate-fade-in-up">
          AI가 만드는 실시간 퀴즈 수업 플랫폼
        </p>

        {/* Teacher / Student cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-2xl animate-fade-in-up">
          {/* Teacher card */}
          <div className="group rounded-2xl bg-orange-500 p-7 text-left text-white border-b-4 border-orange-700 hover:brightness-105 transition-all duration-200 hover:-translate-y-0.5">
            <div className="text-4xl mb-3">👩‍🏫</div>
            <h2 className="text-2xl font-black mb-1 font-pretendard">교사</h2>
            <p className="text-orange-100 text-sm mb-6 leading-relaxed">
              AI로 퀴즈를 만들고<br />실시간 수업을 진행하세요
            </p>
            {user ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/teacher/dashboard"
                  className="block w-full rounded-xl bg-white text-orange-600 text-center font-bold py-3 min-h-[56px] flex items-center justify-center border-b-4 border-orange-200 active:border-b-0 active:translate-y-1 transition-all duration-100 text-base"
                >
                  대시보드 →
                </Link>
                <Link
                  href="/teacher/sessions/new"
                  className="block w-full rounded-xl bg-orange-600 text-white text-center font-bold py-3 min-h-[48px] flex items-center justify-center transition-colors text-base hover:bg-orange-700"
                >
                  새 세션 만들기
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="block w-full rounded-xl bg-white text-orange-600 text-center font-bold py-3 min-h-[56px] flex items-center justify-center border-b-4 border-orange-200 active:border-b-0 active:translate-y-1 transition-all duration-100 text-base"
              >
                로그인 →
              </Link>
            )}
          </div>

          {/* Student card */}
          <div className="group rounded-2xl bg-rose-500 p-7 text-left text-white border-b-4 border-rose-700 hover:brightness-105 transition-all duration-200 hover:-translate-y-0.5">
            <div className="text-4xl mb-3">🎓</div>
            <h2 className="text-2xl font-black mb-1 font-pretendard">학생</h2>
            <p className="text-rose-100 text-sm mb-6 leading-relaxed">
              코드를 입력하고<br />게임처럼 수업에 참여하세요
            </p>
            <Link
              href="/join"
              className="block w-full rounded-xl bg-white text-rose-600 text-center font-bold py-3 min-h-[56px] flex items-center justify-center border-b-4 border-rose-200 active:border-b-0 active:translate-y-1 transition-all duration-100 text-base"
            >
              수업 참여하기 →
            </Link>
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="mt-12 text-xs text-slate-400 font-pretendard">
          Powered by Claude AI · 실시간 Supabase Realtime
        </p>
      </section>
    </main>
  )
}
