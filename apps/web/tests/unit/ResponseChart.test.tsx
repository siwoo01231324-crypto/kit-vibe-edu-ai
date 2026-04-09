// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResponseChart } from '@/components/dashboard/ResponseChart'
import type { Question, Response } from '@/lib/aggregate'

const questions: Question[] = [
  { id: 'q1', content: '1 + 1 = ?', options: ['1', '2', '3', '4'] },
]

const responses: Response[] = [
  { question_id: 'q1', answer: 1, is_correct: true, response_time_ms: 1000 },
  { question_id: 'q1', answer: 1, is_correct: true, response_time_ms: 1200 },
  { question_id: 'q1', answer: 2, is_correct: false, response_time_ms: 2000 },
  { question_id: 'q1', answer: 0, is_correct: false, response_time_ms: 1500 },
]

describe('ResponseChart', () => {
  it('문항 내용을 렌더한다', () => {
    render(<ResponseChart questions={questions} responses={responses} />)
    expect(screen.getByText('1 + 1 = ?')).toBeTruthy()
  })

  it('정답률 퍼센트를 표시한다', () => {
    render(<ResponseChart questions={questions} responses={responses} />)
    // 4개 응답 중 2개 정답 → 50%
    expect(screen.getByText('50%')).toBeTruthy()
  })

  it('4개 선택지 막대가 렌더된다', () => {
    const { container } = render(<ResponseChart questions={questions} responses={responses} />)
    // data-testid="option-bar" 막대 4개 존재
    const bars = container.querySelectorAll('[data-testid="option-bar"]')
    expect(bars.length).toBe(4)
  })

  it('응답이 없을 때 0%를 표시한다', () => {
    render(<ResponseChart questions={questions} responses={[]} />)
    expect(screen.getByText('0%')).toBeTruthy()
  })

  it('문항이 여러 개일 때 모두 렌더한다', () => {
    const multiQuestions: Question[] = [
      { id: 'q1', content: '문항 A', options: ['1', '2', '3', '4'] },
      { id: 'q2', content: '문항 B', options: ['가', '나', '다', '라'] },
    ]
    render(<ResponseChart questions={multiQuestions} responses={[]} />)
    expect(screen.getByText('문항 A')).toBeTruthy()
    expect(screen.getByText('문항 B')).toBeTruthy()
  })
})
