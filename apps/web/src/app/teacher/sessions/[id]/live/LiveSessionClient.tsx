'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeDisplay } from '@/components/shared/QRCodeDisplay'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { Leaderboard } from '@/components/quiz/Leaderboard'
import { LiveStatsPanel } from './LiveStatsPanel'

interface Session {
  id: string
  title: string
  subject: string
  grade: string
  status: string
  join_code: string
  started_at: string | null
  ended_at: string | null
}

interface Question {
  id: string
  question_order: number
  content: string
  options: string[]
  correct_answer: number
}

interface Props {
  session: Session
  joinUrl: string
  questions: Question[]
}

export function LiveSessionClient({ session, joinUrl, questions }: Props) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { leaderboard, isLoading: leaderboardLoading } = useLeaderboard(session.id)

  async function handleActivate() {
    setIsPending(true)
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/sessions/${session.id}/activate`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setErrorMsg(body.error ?? '세션 시작에 실패했습니다.')
        return
      }
      router.refresh()
    } catch {
      setErrorMsg('네트워크 오류가 발생했습니다.')
    } finally {
      setIsPending(false)
    }
  }

  async function handleReset() {
    if (!confirm('세션을 초기화하면 draft 상태로 돌아갑니다. 기존 응답 데이터는 유지됩니다. 계속하시겠습니까?')) return
    setIsPending(true)
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/sessions/${session.id}/reset`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setErrorMsg(body.error ?? '초기화에 실패했습니다.')
        return
      }
      router.refresh()
    } catch {
      setErrorMsg('네트워크 오류가 발생했습니다.')
    } finally {
      setIsPending(false)
    }
  }

  async function handleEnd() {
    setIsPending(true)
    setErrorMsg(null)
    try {
      const res = await fetch(`/api/sessions/${session.id}/end`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setErrorMsg(body.error ?? '세션 종료에 실패했습니다.')
        return
      }
      router.refresh()
    } catch {
      setErrorMsg('네트워크 오류가 발생했습니다.')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{session.title}</h1>
        <p className="text-sm text-slate-500 mt-1">{session.subject} · {session.grade}</p>
      </div>

      {/* 참여 코드 */}
      <div className="bg-orange-50 rounded-xl border border-orange-200 p-6 text-center space-y-2">
        <p className="text-sm text-slate-500">참여 코드</p>
        <p className="text-4xl font-mono font-bold tracking-widest text-orange-600">{session.join_code}</p>
        <p className="text-xs text-slate-400">{joinUrl}</p>
      </div>

      {/* QR 코드 */}
      <div className="flex justify-center">
        <QRCodeDisplay value={joinUrl} size={320} />
      </div>

      {/* 상태별 버튼 */}
      <div className="flex justify-center">
        {session.status === 'draft' && (
          <button
            onClick={handleActivate}
            disabled={isPending}
            className="px-8 py-3 bg-correct text-slate-900 rounded-xl font-semibold border-b-4 border-correct-dark active:border-b-0 active:translate-y-1 transition-all duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? '처리 중...' : '세션 시작'}
          </button>
        )}
        {session.status === 'active' && (
          <button
            onClick={handleEnd}
            disabled={isPending}
            className="px-8 py-3 bg-wrong text-white rounded-xl font-semibold border-b-4 border-wrong-dark active:border-b-0 active:translate-y-1 transition-all duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? '처리 중...' : '세션 종료'}
          </button>
        )}
        {session.status === 'ended' && (
          <div className="flex flex-col items-center gap-3">
            <span className="px-6 py-2 bg-slate-100 text-slate-500 rounded-xl text-sm border border-slate-200">
              종료된 세션
            </span>
            <button
              onClick={() => router.push(`/teacher/dashboard?session=${session.id}`)}
              className="px-8 py-3 bg-brand text-white rounded-xl font-semibold border-b-4 border-brand-dark active:border-b-0 active:translate-y-1 transition-all duration-100 cursor-pointer"
            >
              대시보드로 돌아가기
            </button>
            <button
              onClick={handleReset}
              disabled={isPending}
              className="px-6 py-2 border border-slate-300 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? '처리 중...' : '다시하기'}
            </button>
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {errorMsg && (
        <p className="text-center text-red-600 text-sm">{errorMsg}</p>
      )}

      {/* 실시간 응답 현황 + 순위 리더보드 */}
      {(session.status === 'active' || session.status === 'ended') && (
        <>
          <LiveStatsPanel sessionId={session.id} questions={questions} />
          <Leaderboard leaderboard={leaderboard} isLoading={leaderboardLoading} />
        </>
      )}
    </div>
  )
}
