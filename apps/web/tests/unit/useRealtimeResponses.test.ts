// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Supabase client mock — set up before importing the hook
const mockRemoveChannel = vi.fn()
const mockSubscribe = vi.fn().mockReturnThis()
let insertCallback: ((payload: { new: unknown }) => void) | null = null

const mockOn = vi.fn().mockImplementation(
  (_event: string, _filter: unknown, cb: (payload: { new: unknown }) => void) => {
    insertCallback = cb
    return { subscribe: mockSubscribe }
  }
)

const mockChannel = vi.fn().mockReturnValue({
  on: mockOn,
  subscribe: mockSubscribe,
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    channel: mockChannel,
    removeChannel: mockRemoveChannel,
  })),
}))

import { useRealtimeResponses } from '@/hooks/useRealtimeResponses'

describe('useRealtimeResponses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    insertCallback = null
    mockSubscribe.mockReturnThis()
    mockOn.mockImplementation(
      (_event: string, _filter: unknown, cb: (payload: { new: unknown }) => void) => {
        insertCallback = cb
        return { subscribe: mockSubscribe }
      }
    )
    mockChannel.mockReturnValue({ on: mockOn, subscribe: mockSubscribe })
  })

  // TEST-IU3-I03: INSERT payload를 수동 트리거 → responses 배열 길이가 +1
  it('I03: INSERT 이벤트가 responses 배열에 반영된다', async () => {
    const initial = [
      { question_id: 'q1', answer: 0, is_correct: true, response_time_ms: 1000, nickname: 'alice' },
    ]

    const { result } = renderHook(() =>
      useRealtimeResponses('sess1', initial)
    )

    expect(result.current.responses).toHaveLength(1)

    const newRow = {
      id: 'r2',
      session_id: 'sess1',
      question_id: 'q1',
      nickname: 'bob',
      selected_answer: 1,
      is_correct: false,
      response_time_ms: 2000,
      score: 0,
      submitted_at: new Date().toISOString(),
    }

    act(() => {
      insertCallback?.({ new: newRow })
    })

    expect(result.current.responses).toHaveLength(2)
  })

  it('초기 responses로 participantCount를 계산한다', () => {
    const initial = [
      { question_id: 'q1', answer: 0, is_correct: true, response_time_ms: 1000, nickname: 'alice' },
      { question_id: 'q1', answer: 1, is_correct: false, response_time_ms: 1500, nickname: 'bob' },
    ]

    const { result } = renderHook(() =>
      useRealtimeResponses('sess1', initial)
    )

    expect(result.current.participantCount).toBe(2)
  })

  it('채널 이름이 session-responses-{sessionId} 형식이다', () => {
    renderHook(() => useRealtimeResponses('test-session-123', []))
    expect(mockChannel).toHaveBeenCalledWith('session-responses-test-session-123')
  })
})
