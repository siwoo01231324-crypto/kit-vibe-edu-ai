import type { InsightResult } from './insights';

/**
 * Claude tool use를 위한 문항 생성 프롬프트 + tool schema를 반환한다.
 */
export const DRAFT_QUESTIONS_TOOL = {
  name: 'generate_session_questions',
  description:
    '수업 초안과 취약 개념을 바탕으로 다음 세션에 사용할 4지선다 문항 3~5개를 생성한다.',
  input_schema: {
    type: 'object' as const,
    properties: {
      title: {
        type: 'string',
        description: '세션 제목 (예: "2차 방정식 심화 복습")',
      },
      questions: {
        type: 'array',
        minItems: 3,
        maxItems: 5,
        description: '생성할 문항 목록 (3~5개)',
        items: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: '문항 내용',
            },
            options: {
              type: 'array',
              minItems: 4,
              maxItems: 4,
              description: '4개의 선택지',
              items: { type: 'string' },
            },
            correct_answer: {
              type: 'integer',
              minimum: 0,
              maximum: 3,
              description: '정답 인덱스 (0~3)',
            },
          },
          required: ['content', 'options', 'correct_answer'],
        },
      },
    },
    required: ['title', 'questions'],
  },
} as const;

/**
 * 문항 생성을 위한 system / user 메시지 쌍을 반환한다.
 *
 * @param draftContent - 수업 초안 마크다운 텍스트
 * @param weakConcepts - 인사이트에서 추출한 취약 개념 목록
 */
export function buildDraftQuestionsPrompt(
  draftContent: string,
  weakConcepts: InsightResult['top_weak_concepts'],
): { system: string; user: string } {
  const system = `당신은 경험 많은 한국 교사입니다. 주어진 수업 초안과 취약 개념을 바탕으로 학생들의 이해도를 점검할 4지선다 문항을 생성합니다.

규칙:
- 반드시 generate_session_questions 도구를 사용해 응답
- 취약 개념(top_weak_concepts)을 중심으로 문항 출제
- 문항 수: 3~5개
- 각 문항은 4개의 선택지, 정답 인덱스(0~3) 포함
- 한국어로 작성
- 실제 수업에서 바로 사용 가능한 수준의 문항`;

  const user = JSON.stringify({
    draft_content: draftContent,
    top_weak_concepts: weakConcepts,
  });

  return { system, user };
}
