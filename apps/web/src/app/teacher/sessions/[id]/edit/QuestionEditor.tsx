'use client'

import { useState } from 'react'
import { useQuestions, type QuestionDraft } from '@/hooks/useQuestions'
import { validateQuestion } from '@/lib/validation'
import type { Database } from '@/types/database'

type QuestionRow = Database['public']['Tables']['questions']['Row']

const EMPTY_DRAFT: QuestionDraft = {
  content: '',
  options: ['', '', '', ''],
  correct_answer: 0,
}

interface QuestionFormProps {
  initial?: QuestionDraft
  onSave: (draft: QuestionDraft) => void
  onCancel: () => void
}

function QuestionForm({ initial = EMPTY_DRAFT, onSave, onCancel }: QuestionFormProps) {
  const [draft, setDraft] = useState<QuestionDraft>({
    content: initial.content,
    options: [...initial.options],
    correct_answer: initial.correct_answer,
  })
  const [formError, setFormError] = useState('')

  function handleOptionChange(idx: number, value: string) {
    setDraft(d => {
      const options = [...d.options]
      options[idx] = value
      return { ...d, options }
    })
  }

  function addOption() {
    if (draft.options.length >= 5) return
    setDraft(d => ({ ...d, options: [...d.options, ''] }))
  }

  function removeOption(idx: number) {
    if (draft.options.length <= 2) return
    setDraft(d => {
      const options = d.options.filter((_, i) => i !== idx)
      const correct_answer = d.correct_answer >= options.length
        ? options.length - 1
        : d.correct_answer
      return { ...d, options, correct_answer }
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateQuestion(draft)) {
      setFormError('내용, 보기(2~5개), 정답을 올바르게 입력하세요')
      return
    }
    setFormError('')
    onSave(draft)
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded p-4 bg-gray-50 space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">문제 내용 <span className="text-red-500">*</span></label>
        <textarea
          value={draft.content}
          onChange={e => setDraft(d => ({ ...d, content: e.target.value }))}
          className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="문제를 입력하세요"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">보기 (2~5개) <span className="text-red-500">*</span></label>
          <span className="text-xs text-gray-400">보기를 클릭하면 정답으로 설정됩니다</span>
        </div>
        {draft.options.map((opt, idx) => {
          const isCorrect = draft.correct_answer === idx
          return (
            <div key={idx} className="flex items-center gap-2 mb-2">
              {/* 정답 선택 버튼 */}
              <button
                type="button"
                onClick={() => setDraft(d => ({ ...d, correct_answer: idx }))}
                className={`shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                  isCorrect
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 text-gray-400 hover:border-green-400'
                }`}
                title="정답으로 설정"
              >
                {isCorrect ? '✓' : ['①','②','③','④','⑤'][idx]}
              </button>
              {/* 보기 입력 */}
              <input
                type="text"
                value={opt}
                onChange={e => handleOptionChange(idx, e.target.value)}
                className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
                  isCorrect
                    ? 'border-green-400 bg-green-50 focus:ring-green-400'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder={`보기 ${idx + 1}`}
              />
              {draft.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  className="text-gray-300 hover:text-red-400 text-lg leading-none px-1"
                  title="삭제"
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
        {draft.options.length < 5 && (
          <button
            type="button"
            onClick={addOption}
            className="text-blue-500 hover:text-blue-700 text-sm mt-1"
          >
            + 보기 추가
          </button>
        )}
      </div>

      {formError && <p className="text-red-500 text-sm">{formError}</p>}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
        >
          취소
        </button>
        <button
          type="submit"
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          저장
        </button>
      </div>
    </form>
  )
}

interface QuestionCardProps {
  question: QuestionRow
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onUpdate: (draft: QuestionDraft) => void
}

function QuestionCard({ question, index, total, onMoveUp, onMoveDown, onDelete, onUpdate }: QuestionCardProps) {
  const [editing, setEditing] = useState(false)
  const options = Array.isArray(question.options) ? question.options as string[] : []

  if (editing) {
    return (
      <QuestionForm
        initial={{ content: question.content, options, correct_answer: question.correct_answer }}
        onSave={draft => { onUpdate(draft); setEditing(false) }}
        onCancel={() => setEditing(false)}
      />
    )
  }

  return (
    <div className="border rounded p-4 bg-white">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-1">문항 {index + 1}</p>
          <p className="font-medium">{question.content}</p>
          <ul className="mt-2 space-y-1">
            {options.map((opt, i) => (
              <li
                key={i}
                className={`text-sm px-2 py-1 rounded ${i === question.correct_answer ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600'}`}
              >
                {i === question.correct_answer ? '✓ ' : ''}{opt}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="text-xs border rounded px-2 py-1 hover:bg-gray-50 disabled:opacity-30"
          >
            위
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="text-xs border rounded px-2 py-1 hover:bg-gray-50 disabled:opacity-30"
          >
            아래
          </button>
          <button
            onClick={() => setEditing(true)}
            className="text-xs border rounded px-2 py-1 hover:bg-gray-50 text-blue-600"
          >
            편집
          </button>
          <button
            onClick={onDelete}
            className="text-xs border rounded px-2 py-1 hover:bg-gray-50 text-red-500"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
}

interface QuestionEditorProps {
  sessionId: string
  initialQuestions: QuestionRow[]
}

export function QuestionEditor({ sessionId, initialQuestions }: QuestionEditorProps) {
  const { questions, error, addQuestion, updateQuestion, deleteQuestion, moveUp, moveDown } =
    useQuestions(sessionId, initialQuestions)
  const [adding, setAdding] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">퀴즈 문항 ({questions.length}개)</h2>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="bg-blue-600 text-white px-3 py-1.5 text-sm rounded hover:bg-blue-700"
          >
            + 문항 추가
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {adding && (
        <QuestionForm
          onSave={async draft => { await addQuestion(draft); setAdding(false) }}
          onCancel={() => setAdding(false)}
        />
      )}

      {questions.length === 0 && !adding && (
        <p className="text-gray-400 text-sm text-center py-8">문항이 없습니다. 위 버튼으로 추가하세요.</p>
      )}

      {questions.map((q, idx) => (
        <QuestionCard
          key={q.id}
          question={q}
          index={idx}
          total={questions.length}
          onMoveUp={() => moveUp(q.id)}
          onMoveDown={() => moveDown(q.id)}
          onDelete={() => deleteQuestion(q.id)}
          onUpdate={draft => updateQuestion(q.id, draft)}
        />
      ))}
    </div>
  )
}
