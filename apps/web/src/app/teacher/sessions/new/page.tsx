'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewSessionPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', subject: '', grade: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.title.trim()) errs.title = '제목을 입력하세요'
    if (!form.subject.trim()) errs.subject = '과목을 입력하세요'
    if (!form.grade.trim()) errs.grade = '학년을 입력하세요'
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setSubmitting(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.status === 401) {
        router.push('/login')
        return
      }
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            수업 제목 <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 피타고라스 정리"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-1">
            과목 <span className="text-red-500">*</span>
          </label>
          <input
            id="subject"
            type="text"
            value={form.subject}
            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 수학"
          />
          {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
        </div>

        <div>
          <label htmlFor="grade" className="block text-sm font-medium mb-1">
            학년 <span className="text-red-500">*</span>
          </label>
          <input
            id="grade"
            type="text"
            value={form.grade}
            onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 고1"
          />
          {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade}</p>}
        </div>

        {errors.form && (
          <p className="text-red-500 text-sm">{errors.form}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? '생성 중...' : '세션 만들기'}
        </button>
      </form>
    </div>
  )
}
