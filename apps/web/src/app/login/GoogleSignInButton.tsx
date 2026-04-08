'use client'

import { createClient } from '@/lib/supabase/client'

interface Props {
  next?: string
}

export function GoogleSignInButton({ next }: Props) {
  const handleSignIn = async () => {
    const supabase = createClient()
    const redirectTo = `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ''}`
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
  }

  return (
    <button
      onClick={handleSignIn}
      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      Google로 시작하기
    </button>
  )
}
