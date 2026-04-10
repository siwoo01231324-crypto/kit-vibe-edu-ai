import { z } from 'zod';

/**
 * 집계된 문항 통계 타입 (#27 aggregate.ts 반환 타입과 호환)
 */
export interface AggregatedStat {
  question_id: string;
  content: string;
  correct_rate: number;
  avg_response_time: number;
  wrong_pattern: number | null;
}

export const InsightSchema = z.object({
  top_weak_concepts: z
    .array(
      z.object({
        concept: z.string(),
        correct_rate: z.number().min(0).max(1),
        evidence: z.string(),
      }),
    )
    .max(3),
  strong_concepts: z
    .array(
      z.object({
        concept: z.string(),
        correct_rate: z.number().min(0).max(1),
      }),
    )
    .max(3),
  next_class_focus: z
    .array(
      z.object({
        focus: z.string(),
        reason: z.string(),
        suggested_activity: z.string(),
      }),
    )
    .max(3),
});

export type InsightResult = z.infer<typeof InsightSchema>;

/**
 * Claude에 전달할 인사이트 분석 프롬프트를 생성한다.
 *
 * @param session - 수업 메타데이터 (과목, 학년)
 * @param stats - 집계된 문항별 통계 배열
 * @returns system / user 메시지 쌍
 */
export function buildInsightsPrompt(
  session: { subject: string; grade: string },
  stats: AggregatedStat[],
): { system: string; user: string } {
  const system = `당신은 한국 교육 도메인 전문가입니다. 주어진 수업 통계를 분석하여 교사에게 유용한 인사이트를 제공합니다. 반드시 다음 JSON 스키마를 준수하며 순수 JSON만 출력합니다.

스키마:
{
  "top_weak_concepts": [{ "concept": string, "correct_rate": number, "evidence": string }],  // 최대 3개
  "strong_concepts": [{ "concept": string, "correct_rate": number }],                         // 최대 3개
  "next_class_focus": [{ "focus": string, "reason": string, "suggested_activity": string }]  // 최대 3개
}

주의사항:
- correct_rate는 0~1 사이 소수
- 코드 블록(\`\`\`) 없이 순수 JSON만 출력
- 한국어로 작성`;

  const user = JSON.stringify({
    subject: session.subject,
    grade: session.grade,
    question_stats: stats,
  });

  return { system, user };
}

/**
 * Claude 응답 문자열을 파싱하여 InsightResult를 반환한다.
 *
 * @param raw - Claude가 반환한 JSON 문자열
 * @returns 검증된 InsightResult
 * @throws ZodError - 스키마 불일치 시
 * @throws SyntaxError - JSON 파싱 실패 시
 */
export function parseInsightResponse(raw: string): InsightResult {
  // 코드블록 제거 (```json ... ``` 또는 ``` ... ```)
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  const parsed = JSON.parse(cleaned);
  return InsightSchema.parse(parsed);
}
