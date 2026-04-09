/**
 * 통합 테스트 — POST /api/class-draft/generate
 * TEST-IU4-I01: 유효한 session_id + auth + insights 존재 → 200, content 반환
 * TEST-IU4-I02: 동일 session_id 재요청 → 캐시 반환 (Claude 미호출)
 * TEST-IU4-I03: insights 없음 → 400 NO_INSIGHTS
 * TEST-IU4-I04: 타인 소유 session_id → 403 FORBIDDEN
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { InsightResult } from '@/lib/prompts/insights';

const TEACHER_ID = 'teacher-uuid-001';
const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';
const DRAFT_CONTENT = '# 수학 중2 수업 초안\n## 지난 수업 요약\n이차방정식 학습';


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
  // Use literal here: vi.hoisted runs before module-level const declarations
  const mockCallClaude = vi.fn().mockResolvedValue('# 수학 중2 수업 초안\n## 지난 수업 요약\n이차방정식 학습');
  const mockGetUser = vi.fn().mockResolvedValue({
    data: { user: { id: 'teacher-uuid-001' } },
  });

  const mockState = {
    cachedDraft: null as { content: string } | null,
    hasInsights: true,
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
              id: SESSION_ID,
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
            data: mockState.hasInsights ? { insights: mockInsightResult } : null,
            error: null,
          }),
        };
      }
      if (table === 'class_drafts') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: vi.fn().mockResolvedValue({
            data: mockState.cachedDraft,
            error: null,
          }),
          insert: vi.fn().mockImplementation(() => {
            mockState.insertCalled = true;
            return Promise.resolve({ error: null });
          }),
        };
      }
      return {};
    },
  }),
}));

// Static import — mock is already registered above
import { POST } from '@/app/api/class-draft/generate/route';

// ── helpers ───────────────────────────────────────────────────────────────────
function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/class-draft/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ── tests ─────────────────────────────────────────────────────────────────────
describe('POST /api/class-draft/generate', () => {
  beforeEach(() => {
    mockState.cachedDraft = null;
    mockState.hasInsights = true;
    mockState.insertCalled = false;
    mockState.sessionTeacherId = TEACHER_ID;
    mockCallClaude.mockClear();
    mockCallClaude.mockResolvedValue(DRAFT_CONTENT);
    mockGetUser.mockResolvedValue({ data: { user: { id: TEACHER_ID } } });
  });

  it('TEST-IU4-I01: 유효한 session_id + auth + insights 존재 → 200 with content', async () => {
    const res = await POST(makeRequest({ session_id: SESSION_ID }));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('content');
    expect(typeof json.content).toBe('string');
    expect(mockCallClaude).toHaveBeenCalledOnce();
    expect(mockState.insertCalled).toBe(true);
  });

  it('TEST-IU4-I02: 동일 session_id 재요청 → 캐시 반환 (Claude 미호출)', async () => {
    mockState.cachedDraft = { content: DRAFT_CONTENT };
    const res = await POST(makeRequest({ session_id: SESSION_ID }));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.content).toBe(DRAFT_CONTENT);
    expect(mockCallClaude).not.toHaveBeenCalled();
    expect(mockState.insertCalled).toBe(false);
  });

  it('TEST-IU4-I03: insights 없음 → 400 NO_INSIGHTS', async () => {
    mockState.hasInsights = false;
    const res = await POST(makeRequest({ session_id: SESSION_ID }));

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('NO_INSIGHTS');
  });

  it('TEST-IU4-I04: 타인 소유 session_id → 403 FORBIDDEN', async () => {
    mockState.sessionTeacherId = 'other-teacher-uuid';
    const res = await POST(makeRequest({ session_id: SESSION_ID }));

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('FORBIDDEN');
  });
});
