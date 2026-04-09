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
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold hover:text-blue-600 transition-colors">
          Kit Vibe Edu
        </Link>
        <SignOutButton />
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
