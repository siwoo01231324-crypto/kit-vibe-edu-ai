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
        <span className="font-semibold">Kit Vibe Edu</span>
        <SignOutButton />
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
