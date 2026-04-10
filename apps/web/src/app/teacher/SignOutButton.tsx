'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
    >
      로그아웃
    </button>
  )
}
