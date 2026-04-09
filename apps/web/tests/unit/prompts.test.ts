import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildInsightsPrompt, parseInsightResponse, type AggregatedStat } from '@/lib/prompts/insights';
import { buildDraftPrompt } from '@/lib/prompts/class-draft';
import type { InsightResult } from '@/lib/prompts/insights';

// Mock @anthropic-ai/sdk so callClaude unit tests don't hit real API
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn(),
      },
    })),
  };
});

const sampleStats: AggregatedStat[] = [
  {
    question_id: 'q1',
    content: '분수의 덧셈',
    correct_rate: 0.45,
    avg_response_time: 32,
    wrong_pattern: 2,
  },
  {
    question_id: 'q2',
    content: '소수점 곱셈',
    correct_rate: 0.78,
    avg_response_time: 18,
    wrong_pattern: null,
  },
];

const sampleSession = { subject: '수학', grade: '5학년' };

describe('buildInsightsPrompt', () => {
  it('반환된 user 문자열에 subject, grade, question_stats 키 포함', () => {
    const { system, user } = buildInsightsPrompt(sampleSession, sampleStats);
    const parsed = JSON.parse(user);
    expect(parsed).toHaveProperty('subject', '수학');
    expect(parsed).toHaveProperty('grade', '5학년');
    expect(parsed).toHaveProperty('question_stats');
    expect(Array.isArray(parsed.question_stats)).toBe(true);
    expect(parsed.question_stats).toHaveLength(2);
  });

  it('system 프롬프트에 JSON 출력 지시 포함', () => {
    const { system } = buildInsightsPrompt(sampleSession, sampleStats);
    expect(system).toContain('JSON');
  });
});

describe('parseInsightResponse', () => {
  const validInsight: InsightResult = {
    top_weak_concepts: [
      { concept: '분수 덧셈', correct_rate: 0.45, evidence: '오답률 55%' },
    ],
    strong_concepts: [
      { concept: '소수점 곱셈', correct_rate: 0.78 },
    ],
    next_class_focus: [
      { focus: '분수 덧셈', reason: '이해 부족', suggested_activity: '시각적 교구 활용' },
    ],
  };

  it('유효한 JSON → InsightResult 반환', () => {
    const result = parseInsightResponse(JSON.stringify(validInsight));
    expect(result.top_weak_concepts[0].concept).toBe('분수 덧셈');
    expect(result.strong_concepts[0].correct_rate).toBe(0.78);
    expect(result.next_class_focus[0].suggested_activity).toBe('시각적 교구 활용');
  });

  it('스키마 불일치 JSON → ZodError throw', () => {
    const invalid = JSON.stringify({ top_weak_concepts: 'not-an-array' });
    expect(() => parseInsightResponse(invalid)).toThrow();
  });

  it('invalid JSON → throw', () => {
    expect(() => parseInsightResponse('not json')).toThrow();
  });
});

describe('buildDraftPrompt', () => {
  const sampleInsight: InsightResult = {
    top_weak_concepts: [
      { concept: '분수 덧셈', correct_rate: 0.45, evidence: '오답률 55%' },
    ],
    strong_concepts: [],
    next_class_focus: [
      { focus: '분수 덧셈 복습', reason: '이해 부족', suggested_activity: '교구 활용' },
    ],
  };

  it('반환된 user 문자열에 subject, grade, next_class_focus 키 포함', () => {
    const { system, user } = buildDraftPrompt(sampleInsight, '수학', '5학년');
    const parsed = JSON.parse(user);
    expect(parsed).toHaveProperty('subject', '수학');
    expect(parsed).toHaveProperty('grade', '5학년');
    expect(parsed).toHaveProperty('next_class_focus');
    expect(Array.isArray(parsed.next_class_focus)).toBe(true);
  });

  it('system 프롬프트에 마크다운 수업 초안 지시 포함', () => {
    const { system } = buildDraftPrompt(sampleInsight, '수학', '5학년');
    expect(system).toContain('마크다운');
  });
});
