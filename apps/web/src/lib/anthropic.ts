import Anthropic from '@anthropic-ai/sdk';

// 서버 전용 모듈 — NEXT_PUBLIC_ 환경변수 사용 금지
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-haiku-4-5-20251001';

/**
 * Claude API를 호출하여 텍스트 응답을 반환한다.
 * 429 / 5xx 에러 발생 시 1회 재시도하며, 재시도 후에도 실패하면 throw한다.
 *
 * @param params.system - 시스템 프롬프트
 * @param params.user - 사용자 메시지
 * @param params.maxTokens - 최대 토큰 수 (기본값: 1024)
 * @returns Claude의 텍스트 응답
 * @throws Error('Claude API 호출 실패') - 재시도 후에도 실패 시
 */
export async function callClaude(params: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const { system, user, maxTokens = 1024 } = params;

  // MOCK_CLAUDE=1 환경에서 실제 API 호출 없이 고정 응답 반환 (E2E 테스트용)
  if (process.env.MOCK_CLAUDE === '1') {
    if (system.includes('session_parse')) {
      return JSON.stringify({
        title: '피타고라스 정리',
        subject: '수학',
        grade: '고1',
        questions: [
          {
            content: '직각삼각형에서 빗변의 길이가 5, 한 변의 길이가 3일 때 나머지 변의 길이는?',
            options: ['2', '4', '6', '8'],
            correct_answer: 1,
          },
          {
            content: '피타고라스 정리를 올바르게 나타낸 것은?',
            options: ['a + b = c', 'a² + b² = c²', 'a² - b² = c²', 'a × b = c²'],
            correct_answer: 1,
          },
          {
            content: '빗변의 길이가 10, 한 변의 길이가 6인 직각삼각형의 나머지 변의 길이는?',
            options: ['6', '7', '8', '9'],
            correct_answer: 2,
          },
        ],
        missing: [],
      });
    }
    const isInsight = system.includes('top_weak_concepts') || system.includes('인사이트');
    if (isInsight) {
      return JSON.stringify({
        top_weak_concepts: [
          { concept: '분수 연산', correct_rate: 0.35, evidence: '3문항 중 2문항 오답률 65%' },
          { concept: '방정식 풀기', correct_rate: 0.40, evidence: '오답 패턴 집중' },
        ],
        strong_concepts: [
          { concept: '기본 덧셈', correct_rate: 0.90 },
        ],
        next_class_focus: [
          { focus: '분수 연산 집중', reason: '취약 개념 우선', suggested_activity: '분수 카드 게임' },
        ],
      });
    }
    return '# 수업 초안\n\n## 도입 (5분)\n분수 복습\n\n## 전개 (30분)\n연산 연습\n\n## 정리 (10분)\n형성평가';
  }

  const FAILURE = new Error('Claude API 호출 실패');

  const requestText = async (): Promise<string> => {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    });
    const block = response.content[0];
    if (!block || block.type !== 'text') {
      throw FAILURE;
    }
    return block.text;
  };

  const isRetryable = (error: unknown): boolean =>
    error instanceof Anthropic.APIError && (error.status === 429 || error.status >= 500);

  try {
    return await requestText();
  } catch (firstError) {
    if (!isRetryable(firstError)) {
      throw FAILURE;
    }
    // 1회 재시도
    try {
      return await requestText();
    } catch {
      throw FAILURE;
    }
  }
}
