'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'

type QuestionRow = Database['public']['Tables']['questions']['Row']

export interface QuestionDraft {
  content: string
  options: string[]
  correct_answer: number
}

export function useQuestions(sessionId: string, initial: QuestionRow[]) {
  const [questions, setQuestions] = useState<QuestionRow[]>(
    [...initial].sort((a, b) => a.question_order - b.question_order)
  )
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchQuestions = useCallback(async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('question_order', { ascending: true })
    if (error) { setError(error.message); return }
    setQuestions(data ?? [])
  }, [sessionId, supabase])

  const addQuestion = useCallback(async (draft: QuestionDraft) => {
    const maxOrder = questions.reduce((m, q) => Math.max(m, q.question_order), 0)
    const { data, error } = await supabase
      .from('questions')
      .insert({
        session_id: sessionId,
        content: draft.content,
        options: draft.options,
        correct_answer: draft.correct_answer,
        question_order: maxOrder + 1,
      })
      .select('*')
      .single()
    if (error) { setError(error.message); return }
    setQuestions(prev => [...prev, data])
  }, [questions, sessionId, supabase])

  const updateQuestion = useCallback(async (id: string, draft: Partial<QuestionDraft>) => {
    const { data, error } = await supabase
      .from('questions')
      .update(draft)
      .eq('id', id)
      .select('*')
      .single()
    if (error) { setError(error.message); return }
    setQuestions(prev => prev.map(q => q.id === id ? data : q))
  }, [supabase])

  const deleteQuestion = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)
    if (error) { setError(error.message); return }
    setQuestions(prev => prev.filter(q => q.id !== id))
  }, [supabase])

  const moveUp = useCallback(async (id: string) => {
    const idx = questions.findIndex(q => q.id === id)
    if (idx <= 0) return
    const a = questions[idx]
    const b = questions[idx - 1]
    await supabase.from('questions').update({ question_order: b.question_order }).eq('id', a.id)
    await supabase.from('questions').update({ question_order: a.question_order }).eq('id', b.id)
    setQuestions(prev => {
      const next = [...prev]
      next[idx] = { ...a, question_order: b.question_order }
      next[idx - 1] = { ...b, question_order: a.question_order }
      return [...next].sort((x, y) => x.question_order - y.question_order)
    })
  }, [questions, supabase])

  const moveDown = useCallback(async (id: string) => {
    const idx = questions.findIndex(q => q.id === id)
    if (idx < 0 || idx >= questions.length - 1) return
    const a = questions[idx]
    const b = questions[idx + 1]
    await supabase.from('questions').update({ question_order: b.question_order }).eq('id', a.id)
    await supabase.from('questions').update({ question_order: a.question_order }).eq('id', b.id)
    setQuestions(prev => {
      const next = [...prev]
      next[idx] = { ...a, question_order: b.question_order }
      next[idx + 1] = { ...b, question_order: a.question_order }
      return [...next].sort((x, y) => x.question_order - y.question_order)
    })
  }, [questions, supabase])

  return { questions, error, fetchQuestions, addQuestion, updateQuestion, deleteQuestion, moveUp, moveDown }
}
