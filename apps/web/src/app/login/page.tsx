import { GoogleSignInButton } from './GoogleSignInButton'

interface Props {
  searchParams: Promise<{ next?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams
  return (
    <main className="relative min-h-screen bg-white overflow-hidden flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="pointer-events-none absolute top-0 right-0 w-[400px] h-[400px] bg-orange-100 rounded-full blur-3xl opacity-50 -translate-y-1/4 translate-x-1/4" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-50 rounded-full blur-3xl opacity-60 translate-y-1/4 -translate-x-1/4" />

      <div className="relative w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          <p className="text-5xl mb-3">🎮</p>
          <h1 className="text-3xl font-black text-slate-900 font-pretendard">Kit Vibe Edu</h1>
          <p className="text-slate-500 text-sm mt-1">교사 로그인</p>
        </div>

        <div className="rounded-2xl bg-white border-2 border-slate-100 shadow-sm p-8">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2">
              <span className="text-red-500 text-sm">⚠</span>
              <p className="text-sm font-medium text-red-600">{decodeURIComponent(error)}</p>
            </div>
          )}
          <GoogleSignInButton next={next} />
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Google 계정으로 안전하게 로그인합니다
        </p>
      </div>
    </main>
  )
}
