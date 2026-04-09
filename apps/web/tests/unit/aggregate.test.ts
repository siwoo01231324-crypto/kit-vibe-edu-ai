import { describe, it, expect } from 'vitest';
import {
  calculateCorrectRate,
  groupByQuestion,
  aggregateResponses,
} from '@/lib/aggregate';
import type { Response, Question } from '@/lib/aggregate';

const q1: Question = { id: 'q1', content: '문항1', options: ['A', 'B', 'C', 'D'] };
const q2: Question = { id: 'q2', content: '문항2', options: ['가', '나', '다', '라'] };

describe('calculateCorrectRate', () => {
  it('빈 배열 → 0', () => {
    expect(calculateCorrectRate([])).toBe(0);
  });

  it('정답 2개, 오답 1개 → 2/3', () => {
    const responses: Response[] = [
      { question_id: 'q1', is_correct: true, answer: 0, response_time_ms: 1000 },
      { question_id: 'q1', is_correct: true, answer: 0, response_time_ms: 2000 },
      { question_id: 'q1', is_correct: false, answer: 1, response_time_ms: 3000 },
    ];
    expect(calculateCorrectRate(responses)).toBeCloseTo(2 / 3);
  });

  it('모두 정답 → 1', () => {
    const responses: Response[] = [
      { question_id: 'q1', is_correct: true, answer: 0, response_time_ms: 500 },
      { question_id: 'q1', is_correct: true, answer: 0, response_time_ms: 600 },
    ];
    expect(calculateCorrectRate(responses)).toBe(1);
  });

  it('모두 오답 → 0', () => {
    const responses: Response[] = [
      { question_id: 'q1', is_correct: false, answer: 2, response_time_ms: 500 },
    ];
    expect(calculateCorrectRate(responses)).toBe(0);
  });
});

describe('groupByQuestion', () => {
  it('option_distribution은 항상 길이 4', () => {
    const responses: Response[] = [
      { question_id: 'q1', is_correct: true, answer: 0, response_time_ms: 1000 },
      { question_id: 'q1', is_correct: false, answer: 2, response_time_ms: 2000 },
    ];
    const result = groupByQuestion([q1], responses);
    expect(result).toHaveLength(1);
    expect(result[0].option_distribution).toHaveLength(4);
  });

  it('option_distribution 각 인덱스에 정확한 카운트', () => {
    const responses: Response[] = [
      { question_id: 'q1', is_correct: true, answer: 0, response_time_ms: 1000 },
      { question_id: 'q1', is_correct: false, answer: 0, response_time_ms: 1500 },
      { question_id: 'q1', is_correct: false, answer: 2, response_time_ms: 2000 },
    ];
    const result = groupByQuestion([q1], responses);
    expect(result[0].option_distribution).toEqual([2, 0, 1, 0]);
  });

  it('correct_rate 정확성', () => {
    const responses: Response[] = [
      { question_id: 'q1', is_correct: true, answer: 0, response_time_ms: 1000 },
      { question_id: 'q1', is_correct: false, answer: 1, response_time_ms: 2000 },
      { question_id: 'q1', is_correct: false, answer: 2, response_time_ms: 3000 },
    ];
    const result = groupByQuestion([q1], responses);
    expect(result[0].correct_rate).toBeCloseTo(1 / 3);
    expect(result[0].total).toBe(3);
  });

  it('응답이 없는 question → total 0, correct_rate 0', () => {
    const result = groupByQuestion([q1], []);
    expect(result[0].total).toBe(0);
    expect(result[0].correct_rate).toBe(0);
    expect(result[0].option_distribution).toEqual([0, 0, 0, 0]);
  });

  it('여러 question 분리', () => {
    const responses: Response[] = [
      { question_id: 'q1', is_correct: true, answer: 0, response_time_ms: 1000 },
      { question_id: 'q2', is_correct: false, answer: 3, response_time_ms: 2000 },
    ];
    const result = groupByQuestion([q1, q2], responses);
    expect(result).toHaveLength(2);
    expect(result[0].total).toBe(1);
    expect(result[1].total).toBe(1);
    expect(result[1].option_distribution[3]).toBe(1);
  });
});

describe('aggregateResponses', () => {
  it('avg_response_time 평균값 정확성', () => {
    const responses: Response[] = [
      { question_id: 'q1', is_correct: true, answer: 0, response_time_ms: 1000 },
      { question_id: 'q1', is_correct: false, answer: 2, response_time_ms: 3000 },
    ];
    const result = aggregateResponses([q1], responses);
    expect(result[0].avg_response_time).toBe(2000);
  });

  it('응답 없을 때 avg_response_time → 0', () => {
    const result = aggregateResponses([q1], []);
    expect(result[0].avg_response_time).toBe(0);
  });

  it('wrong_pattern: 가장 많이 선택된 오답 인덱스 반환', () => {
    const responses: Response[] = [
      { question_id: 'q1', is_correct: false, answer: 2, response_time_ms: 1000 },
      { question_id: 'q1', is_correct: false, answer: 2, response_time_ms: 1500 },
      { question_id: 'q1', is_correct: false, answer: 1, response_time_ms: 2000 },
      { question_id: 'q1', is_correct: true, answer: 0, response_time_ms: 500 },
    ];
    const result = aggregateResponses([q1], responses);
    expect(result[0].wrong_pattern).toBe(2);
  });

  it('오답 없을 때 wrong_pattern → null', () => {
    const responses: Response[] = [
      { question_id: 'q1', is_correct: true, answer: 0, response_time_ms: 1000 },
      { question_id: 'q1', is_correct: true, answer: 0, response_time_ms: 1500 },
    ];
    const result = aggregateResponses([q1], responses);
    expect(result[0].wrong_pattern).toBeNull();
  });

  it('correct_rate와 content가 올바르게 매핑', () => {
    const responses: Response[] = [
      { question_id: 'q1', is_correct: true, answer: 0, response_time_ms: 1000 },
    ];
    const result = aggregateResponses([q1], responses);
    expect(result[0].question_id).toBe('q1');
    expect(result[0].content).toBe('문항1');
    expect(result[0].correct_rate).toBe(1);
  });
});
