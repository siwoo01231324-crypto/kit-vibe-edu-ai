/**
 * 통합 테스트 — POST /api/insights/generate
 * TEST-IU2-I01: 유효한 session_id + auth → 200 with insights
 * TEST-IU2-I02: 동일 요청 반복 → 캐시 반환 (Claude 미호출)
 * TEST-IU2-I03: 타인 세션 → 403
 * TEST-IU2-I04: Claude 무효 JSON 반환 → 500 PARSE_ERROR
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { InsightResult } from '@/lib/prompts/insights';

const TEACHER_ID = 'teacher-uuid-001';
const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';

const mockInsightResult: InsightResult = {
  top_weak_concepts: [
    { concept: '이차방정식', correct_rate: 0.3, evidence: '3문제 중 1문제 정답' },
  ],
  strong_concepts: [{ concept: '일차방정식', correct_rate: 0.9 }],
  next_class_focus: [
    {
      focus: '이차방정식 풀이',
      reason: '정답률 낮음',
      suggested_activity: '단계별 풀이 연습',
    },
  ],
};

// ── vi.hoisted: mutable state accessible in vi.mock factories ─────────────────
const { mockCallClaude, mockGetUser, mockState } = vi.hoisted(() => {
  const insightResult: InsightResult = {
    top_weak_concepts: [
      { concept: '이차방정식', correct_rate: 0.3, evidence: '3문제 중 1문제 정답' },
    ],
    strong_concepts: [{ concept: '일차방정식', correct_rate: 0.9 }],
    next_class_focus: [
      { focus: '이차방정식 풀이', reason: '정답률 낮음', suggested_activity: '단계별 풀이 연습' },
    ],
  };

  const mockCallClaude = vi.fn().mockResolvedValue(JSON.stringify(insightResult));
  const mockGetUser = vi.fn().mockResolvedValue({
    data: { user: { id: 'teacher-uuid-001' } },
  });

  // Mutable state object — mutation is visible inside mock factory closures
  const mockState = {
    cachedInsight: null as InsightResult | null,
    insertCalled: false,
    sessionTeacherId: 'teacher-uuid-001',
  };

  return { mockCallClaude, mockGetUser, mockState };
});

// ── mocks ─────────────────────────────────────────────────────────────────────
vi.mock('@/lib/anthropic', () => ({
  callClaude: (...args: unknown[]) => mockCallClaude(...args),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: () => mockGetUser() },
    from: (table: string) => {
      if (table === 'sessions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: '550e8400-e29b-41d4-a716-446655440000',
              teacher_id: mockState.sessionTeacherId,
              subject: '수학',
              grade: '중2',
            },
            error: null,
          }),
        };
      }
      if (table === 'ai_insights') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: mockState.cachedInsight ? { insights: mockState.cachedInsight } : null,
            error: null,
          }),
          insert: vi.fn().mockImplementation(() => {
            mockState.insertCalled = true;
            return Promise.resolve({ error: null });
          }),
        };
      }
      if (table === 'questions') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'q1',
                content: '이차방정식 x²=4 의 해는?',
                options: ['x=1', 'x=±2', 'x=4', 'x=2'],
                correct_answer: 1,
                question_order: 1,
              },
            ],
            error: null,
          }),
        };
      }
      if (table === 'responses') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: [
              { question_id: 'q1', selected_answer: 2, is_correct: false, response_time_ms: 5000 },
              { question_id: 'q1', selected_answer: 1, is_correct: true, response_time_ms: 3000 },
            ],
            error: null,
          }),
        };
      }
      return {};
    },
  }),
}));

// Static import — mock is already registered above
import { POST } from '@/app/api/insights/generate/route';

// ── helpers ───────────────────────────────────────────────────────────────────
function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/insights/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── tests ─────────────────────────────────────────────────────────────────────
describe('POST /api/insights/generate', () => {
  beforeEach(() => {
    mockState.cachedInsight = null;
    mockState.insertCalled = false;
    mockState.sessionTeacherId = TEACHER_ID;
    mockCallClaude.mockClear();
    mockCallClaude.mockResolvedValue(JSON.stringify(mockInsightResult));
    mockGetUser.mockResolvedValue({ data: { user: { id: TEACHER_ID } } });
  });

  it('TEST-IU2-I01: 유효한 session_id + auth → 200 with insights', async () => {
    const res = await POST(makeRequest({ session_id: SESSION_ID }));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('top_weak_concepts');
    expect(json).toHaveProperty('strong_concepts');
    expect(json).toHaveProperty('next_class_focus');
    expect(mockCallClaude).toHaveBeenCalledOnce();
    expect(mockState.insertCalled).toBe(true);
  });

  it('TEST-IU2-I02: 캐시 존재 시 Claude 미호출 후 200 반환', async () => {
    mockState.cachedInsight = mockInsightResult;
    const res = await POST(makeRequest({ session_id: SESSION_ID }));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('top_weak_concepts');
    expect(mockCallClaude).not.toHaveBeenCalled();
    expect(mockState.insertCalled).toBe(false);
  });

  it('TEST-IU2-I03: 다른 교사의 세션 → 403', async () => {
    mockState.sessionTeacherId = 'other-teacher-uuid';
    const res = await POST(makeRequest({ session_id: SESSION_ID }));

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('FORBIDDEN');
  });

  it('TEST-IU2-I04: Claude 무효 JSON 반환 → 500 PARSE_ERROR', async () => {
    mockCallClaude.mockResolvedValue('this is not valid json {{');
    const res = await POST(makeRequest({ session_id: SESSION_ID }));

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('PARSE_ERROR');
  });
});
