'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type ResponseRow = Database['public']['Tables']['responses']['Row']

interface QuestionItem {
  id: string
  question_order: number
  content: string
  options: string[]
  correct_answer: number
}

interface Props {
  sessionId: string
  questions: QuestionItem[]
}

const OPTION_LABELS = ['①', '②', '③', '④', '⑤']

export function LiveStatsPanel({ sessionId, questions }: Props) {
  const [responses, setResponses] = useState<ResponseRow[]>([])

  useEffect(() => {
    if (!sessionId) return
    const supabase = createClient()

    async function fetchAll() {
      const { data } = await supabase
        .from('responses')
        .select('*')
        .eq('session_id', sessionId)
      if (data) setResponses(data as ResponseRow[])
    }

    fetchAll()

    const channel = supabase
      .channel(`live-stats-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'responses',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setResponses((prev) => [...prev, payload.new as ResponseRow])
        }
      )
      .subscribe()

    const pollTimer = setInterval(fetchAll, 3000)

    return () => {
      clearInterval(pollTimer)
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  const participants = new Set(responses.map((r) => r.nickname)).size

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">실시간 응답 현황</h2>
        <span className="text-sm text-slate-500">
          참여 학생 <span className="font-bold text-orange-500">{participants}</span>명
        </span>
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">등록된 문항이 없습니다</p>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => {
            const qResponses = responses.filter((r) => r.question_id === q.id)
            const total = qResponses.length

            return (
              <div key={q.id} className="border border-slate-100 rounded-xl p-4 space-y-3">
                {/* 문항 헤더 */}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    <span className="text-slate-400 mr-1">Q{q.question_order}.</span>
                    {q.content}
                  </p>
                  <span className="shrink-0 text-xs text-slate-400 whitespace-nowrap">
                    {total}명 응답
                  </span>
                </div>

                {/* 선택지별 응답 분포 */}
                <div className="space-y-2">
                  {q.options.map((option, idx) => {
                    const count = qResponses.filter((r) => r.selected_answer === idx).length
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0
                    const isCorrect = idx === q.correct_answer

                    return (
                      <div key={idx} className="flex items-center gap-2">
                        {/* 번호 뱃지 */}
                        <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCorrect ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {OPTION_LABELS[idx]}
                        </span>

                        {/* 선택지 텍스트 + 바 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-xs truncate ${isCorrect ? 'text-green-700 font-medium' : 'text-slate-600'}`}>
                              {option}
                            </span>
                            <span className="text-xs text-slate-400 ml-2 shrink-0">{count}명 ({pct}%)</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                isCorrect ? 'bg-green-400' : 'bg-orange-300'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">실시간 업데이트 중...</p>
    </div>
  )
}
