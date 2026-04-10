import { describe, it, expect } from 'vitest';
import {
  buildSessionParsePrompt,
  parseSessionParseResponse,
  type SessionParseResult,
} from '@/lib/prompts/session-parse';

const validQuestion = {
  content: '피타고라스 정리를 올바르게 나타낸 것은?',
  options: ['a + b = c', 'a² + b² = c²', 'a² - b² = c²', 'a × b = c²'] as [string, string, string, string],
  correct_answer: 1,
};

const valid: SessionParseResult = {
  title: '피타고라스 정리',
  subject: '수학',
  grade: '고1',
  questions: [validQuestion],
  missing: [],
};

describe('buildSessionParsePrompt', () => {
  it('system에 session_parse 키워드 포함 (MOCK_CLAUDE 감지용)', () => {
    const { system } = buildSessionParsePrompt('고1 수학 피타고라스 정리');
    expect(system).toContain('session_parse');
  });

  it('user에 입력 프롬프트가 그대로 반환', () => {
    const input = '고1 수학 피타고라스 정리 퀴즈 5문제';
    const { user } = buildSessionParsePrompt(input);
    expect(user).toBe(input);
  });

  it('system에 JSON 스키마 필드(title, subject, grade, questions, missing) 명시', () => {
    const { system } = buildSessionParsePrompt('테스트');
    expect(system).toContain('title');
    expect(system).toContain('subject');
    expect(system).toContain('grade');
    expect(system).toContain('questions');
    expect(system).toContain('missing');
  });
});

describe('parseSessionParseResponse', () => {
  it('유효한 JSON → SessionParseResult 반환', () => {
    const result = parseSessionParseResponse(JSON.stringify(valid));
    expect(result.title).toBe('피타고라스 정리');
    expect(result.subject).toBe('수학');
    expect(result.grade).toBe('고1');
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].correct_answer).toBe(1);
    expect(result.missing).toEqual([]);
  });

  it('markdown fence로 감싼 JSON → fence 제거 후 정상 파싱', () => {
    const fenced = '```json\n' + JSON.stringify(valid) + '\n```';
    const result = parseSessionParseResponse(fenced);
    expect(result.title).toBe('피타고라스 정리');
    expect(result.questions).toHaveLength(1);
  });

  it('missing 배열에 필드명 포함 → 정상 파싱', () => {
    const withMissing: SessionParseResult = { ...valid, grade: '', missing: ['grade'] };
    const result = parseSessionParseResponse(JSON.stringify(withMissing));
    expect(result.missing).toContain('grade');
    expect(result.grade).toBe('');
  });

  it('questions 빈 배열 → 정상 파싱', () => {
    const noQ: SessionParseResult = { ...valid, questions: [] };
    const result = parseSessionParseResponse(JSON.stringify(noQ));
    expect(result.questions).toHaveLength(0);
  });

  it('완전히 유효하지 않은 JSON → PARSE_ERROR throw', () => {
    expect(() => parseSessionParseResponse('not json at all')).toThrow('PARSE_ERROR');
  });

  it('Zod 스키마 불일치 (missing이 string[]이 아님) → PARSE_ERROR throw', () => {
    const invalid = JSON.stringify({ ...valid, missing: 'grade' });
    expect(() => parseSessionParseResponse(invalid)).toThrow('PARSE_ERROR');
  });

  it('questions options가 4개가 아님 → PARSE_ERROR throw', () => {
    const invalid = JSON.stringify({
      ...valid,
      questions: [{ content: '문제', options: ['a', 'b'], correct_answer: 0 }],
    });
    expect(() => parseSessionParseResponse(invalid)).toThrow('PARSE_ERROR');
  });
});
