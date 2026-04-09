import Anthropic from '@anthropic-ai/sdk';

// 서버 전용 모듈 — NEXT_PUBLIC_ 환경변수 사용 금지
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = 'claude-sonnet-4-6';

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

  const request = async () =>
    client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    });

  const isRetryable = (error: unknown): boolean => {
    if (error instanceof Anthropic.APIStatusError) {
      return error.status === 429 || error.status >= 500;
    }
    return false;
  };

  try {
    const response = await request();
    const block = response.content[0];
    if (block.type !== 'text') {
      throw new Error('Claude API 호출 실패');
    }
    return block.text;
  } catch (firstError) {
    if (!isRetryable(firstError)) {
      throw new Error('Claude API 호출 실패');
    }

    // 1회 재시도
    try {
      const response = await request();
      const block = response.content[0];
      if (block.type !== 'text') {
        throw new Error('Claude API 호출 실패');
      }
      return block.text;
    } catch {
      throw new Error('Claude API 호출 실패');
    }
  }
}
