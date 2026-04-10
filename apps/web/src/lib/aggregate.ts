/**
 * 응답 집계 유틸 — 교사 대시보드(IU-03) + AI 인사이트(IU-02) 공용
 */

export interface Response {
  question_id: string;
  is_correct: boolean;
  answer: number; // 0-based 선택지 인덱스
  response_time_ms: number;
  nickname?: string;
}

export interface Question {
  id: string;
  content: string;
  options: string[];
  correct_answer?: number; // 0-based 정답 인덱스
}

export interface GroupedQuestion {
  question: Question;
  total: number;
  correct_rate: number;
  option_distribution: number[]; // 길이 4, 각 선택지 선택 횟수
}

export interface AggregatedStat {
  question_id: string;
  content: string;
  correct_rate: number;
  avg_response_time: number;
  wrong_pattern: number | null; // 가장 많이 선택된 오답 인덱스
}

function mean(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}

function mostFrequent(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const freq = new Map<number, number>();
  for (const n of nums) freq.set(n, (freq.get(n) ?? 0) + 1);
  let maxCount = 0;
  let result = null;
  for (const [val, count] of freq) {
    if (count > maxCount) {
      maxCount = count;
      result = val;
    }
  }
  return result;
}

/**
 * 응답 배열의 정답률 계산 (0~1)
 * 빈 배열이면 0 반환
 */
export function calculateCorrectRate(responses: Response[]): number {
  if (responses.length === 0) return 0;
  return responses.filter((r) => r.is_correct).length / responses.length;
}

/**
 * 문항별 응답 그룹화
 */
export function groupByQuestion(
  questions: Question[],
  responses: Response[]
): GroupedQuestion[] {
  return questions.map((q) => {
    const qResponses = responses.filter((r) => r.question_id === q.id);
    return {
      question: q,
      total: qResponses.length,
      correct_rate: calculateCorrectRate(qResponses),
      option_distribution: [0, 1, 2, 3].map(
        (i) => qResponses.filter((r) => r.answer === i).length
      ),
    };
  });
}

/**
 * 문항별 집계 (정답률 + 평균 응답시간 + 오답 패턴)
 */
export function aggregateResponses(
  questions: Question[],
  responses: Response[]
): AggregatedStat[] {
  return questions.map((q) => {
    const qResponses = responses.filter((r) => r.question_id === q.id);
    const wrongAnswers = qResponses
      .filter((r) => !r.is_correct)
      .map((r) => r.answer);
    return {
      question_id: q.id,
      content: q.content,
      correct_rate: calculateCorrectRate(qResponses),
      avg_response_time: mean(qResponses.map((r) => r.response_time_ms)),
      wrong_pattern: mostFrequent(wrongAnswers),
    };
  });
}
