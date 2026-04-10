'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ParsedQuestion } from '@/lib/prompts/session-parse'

export default function NewSessionPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', subject: '', grade: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const [naturalPrompt, setNaturalPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiQuestions, setAiQuestions] = useState<ParsedQuestion[]>([])

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = '제목을 입력하세요'
    if (!form.subject.trim()) errs.subject = '과목을 입력하세요'
    if (!form.grade.trim()) errs.grade = '학년을 입력하세요'
    return errs
  }

  async function handleAiFill() {
    if (!naturalPrompt.trim() || aiLoading) return
    setAiLoading(true)
    setAiError(null)
    setMissingFields([])
    setAiQuestions([])
    try {
      const res = await fetch('/api/sessions/parse-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: naturalPrompt }),
      })
      if (res.status === 401) { router.push('/login'); return }
      if (!res.ok) {
        const data = await res.json()
        setAiError(data.error === 'PARSE_ERROR'
          ? 'AI가 내용을 파악하지 못했습니다. 직접 입력해 주세요.'
          : 'AI 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.')
        return
      }
      const data = await res.json()
      setForm(f => ({
        title: data.title || f.title,
        subject: data.subject || f.subject,
        grade: data.grade || f.grade,
      }))
      setMissingFields(data.missing ?? [])
      setAiQuestions(data.questions ?? [])
    } catch {
      setAiError('네트워크 오류가 발생했습니다.')
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSubmitting(true)
    try {
      // AI 문항이 있으면 복합 엔드포인트로, 없으면 기존 엔드포인트로
      const endpoint = aiQuestions.length > 0 ? '/api/sessions/create-with-content' : '/api/sessions'
      const body = aiQuestions.length > 0
        ? { ...form, questions: aiQuestions }
        : form

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 401) { router.push('/login'); return }
      if (!res.ok) {
        const data = await res.json()
        setErrors({ form: data.error ?? '세션 생성에 실패했습니다' })
        return
      }
      const { id } = await res.json()
      router.push(`/teacher/sessions/${id}/edit`)
    } catch {
      setErrors({ form: '네트워크 오류가 발생했습니다' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">새 세션 만들기</h1>

      {/* 자연어 AI 채우기 */}
      <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
        <label htmlFor="natural-prompt" className="block text-sm font-medium text-slate-700">
          AI로 자동 채우기
        </label>
        <textarea
          id="natural-prompt"
          value={naturalPrompt}
          onChange={e => setNaturalPrompt(e.target.value)}
          maxLength={2000}
          rows={3}
          className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
          placeholder="예: 고1 수학, 피타고라스 정리 퀴즈 5문제 만들어줘"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">{naturalPrompt.length}/2000</span>
          <button
            type="button"
            onClick={handleAiFill}
            disabled={aiLoading || !naturalPrompt.trim()}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold border-b-2 border-orange-700 active:border-b-0 active:translate-y-0.5 transition-all duration-100 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {aiLoading ? '분석 중...' : 'AI로 채우기'}
          </button>
        </div>
        {aiError && <p className="text-red-500 text-sm">{aiError}</p>}
      </div>

      {/* 수동 입력 폼 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
            수업 제목 <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="예: 피타고라스 정리"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          {missingFields.includes('title') && (
            <p className="text-orange-500 text-sm mt-1">이 부분을 좀 더 구체적으로 설명해 주세요</p>
          )}
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">
            과목 <span className="text-red-500">*</span>
          </label>
          <input
            id="subject"
            type="text"
            value={form.subject}
            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="예: 수학"
          />
          {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
          {missingFields.includes('subject') && (
            <p className="text-orange-500 text-sm mt-1">이 부분을 좀 더 구체적으로 설명해 주세요</p>
          )}
        </div>

        <div>
          <label htmlFor="grade" className="block text-sm font-medium text-slate-700 mb-1">
            학년 <span className="text-red-500">*</span>
          </label>
          <input
            id="grade"
            type="text"
            value={form.grade}
            onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
            className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="예: 고1"
          />
          {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade}</p>}
          {missingFields.includes('grade') && (
            <p className="text-orange-500 text-sm mt-1">이 부분을 좀 더 구체적으로 설명해 주세요</p>
          )}
        </div>

        {/* AI 생성 문항 편집 */}
        {aiQuestions.length > 0 && (
          <div className="mt-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-700">
              AI 생성 문항 ({aiQuestions.length}개) — 수정 후 세션 생성 시 함께 저장됩니다
            </h2>
            {aiQuestions.map((q, qi) => (
              <div key={qi} className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Q{qi + 1}. 문항</label>
                  <textarea
                    rows={2}
                    value={q.content}
                    onChange={e => setAiQuestions(qs => qs.map((x, i) => i === qi ? { ...x, content: e.target.value } : x))}
                    className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-500">선택지 (정답 클릭으로 선택)</label>
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAiQuestions(qs => qs.map((x, i) => i === qi ? { ...x, correct_answer: oi } : x))}
                        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-colors ${oi === q.correct_answer ? 'border-green-500 bg-green-500' : 'border-slate-300 bg-white hover:border-orange-400'}`}
                        title="정답으로 설정"
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={e => setAiQuestions(qs => qs.map((x, i) => {
                          if (i !== qi) return x
                          const newOpts = [...x.options] as [string, string, string, string]
                          newOpts[oi] = e.target.value
                          return { ...x, options: newOpts }
                        }))}
                        className={`flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${oi === q.correct_answer ? 'border-green-400 bg-green-50 text-green-800 font-medium' : 'border-slate-300 bg-white text-slate-700'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-orange-500 text-white py-3 min-h-[44px] rounded-xl font-semibold border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all duration-100 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? '생성 중...' : '세션 만들기'}
        </button>
      </form>
    </div>
  )
}
