import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from './SignOutButton'

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-orange-500 px-6 py-0 flex items-center justify-between shadow-md">
        <Link
          href="/"
          className="flex items-center gap-2 py-4 text-white font-black text-xl font-pretendard hover:text-orange-100 transition-colors"
        >
          <span className="text-2xl">🎮</span>
          Seeya!
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-orange-100 text-sm font-medium truncate max-w-[200px]">
            {user.email}
          </span>
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
