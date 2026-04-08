import { GoogleSignInButton } from './GoogleSignInButton'

interface Props {
  searchParams: Promise<{ next?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { next, error } = await searchParams
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-8">
        <h1 className="text-2xl font-bold text-center">교사 로그인</h1>
        {error && (
          <p className="text-sm text-red-500 text-center">{decodeURIComponent(error)}</p>
        )}
        <GoogleSignInButton next={next} />
      </div>
    </main>
  )
}
