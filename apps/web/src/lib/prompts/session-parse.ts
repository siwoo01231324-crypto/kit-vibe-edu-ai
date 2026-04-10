import { z } from 'zod';

const QuestionSchema = z.object({
  content: z.string(),
  options: z.array(z.string()).min(4).max(4).transform(a => a as [string, string, string, string]),
  correct_answer: z.coerce.number().int().min(0).max(3),
});

export const SessionParseSchema = z.object({
  title: z.string(),
  subject: z.string(),
  grade: z.string(),
  questions: z.array(QuestionSchema),
  missing: z.array(z.string()),
});

export type SessionParseResult = z.infer<typeof SessionParseSchema>;
export type ParsedQuestion = z.infer<typeof QuestionSchema>;

/**
 * 자연어 입력을 세션 메타데이터 + 문항으로 파싱하는 프롬프트를 생성한다.
 *
 * @param prompt - 선생이 입력한 자연어 (예: "고1 수학, 피타고라스 정리 퀴즈 5문제")
 * @returns system / user 메시지 쌍
 */
export function buildSessionParsePrompt(prompt: string): { system: string; user: string } {
  const system = `당신은 한국 교육 도메인 전문가입니다. 선생님이 입력한 자연어에서 수업 세션 정보를 추출하고 4지선다 문항을 생성합니다. (session_parse)

반드시 다음 JSON 스키마를 준수하며 순수 JSON만 출력합니다:
{
  "title": string,    // 수업 제목 (예: "피타고라스 정리")
  "subject": string,  // 과목 (예: "수학")
  "grade": string,    // 학년 (예: "고1")
  "questions": [      // 4지선다 문항 목록 (요청한 개수, 미언급 시 3개 기본)
    {
      "content": string,                              // 문항 내용
      "options": [string, string, string, string],    // 선택지 4개
      "correct_answer": number                        // 정답 인덱스 (0~3)
    }
  ],
  "missing": string[] // 파악하지 못한 메타데이터 필드명 (예: ["grade"])
}

규칙:
- title, subject, grade 중 불분명한 필드는 빈 문자열("")로 두고 missing 배열에 추가
- missing에 포함 가능한 값: "title", "subject", "grade"
- questions는 입력에서 요청한 개수만큼 생성 (언급 없으면 3개, 최대 5개)
- 각 문항은 반드시 4개의 선택지와 정답 인덱스(0~3)를 포함
- 실제 수업에서 바로 사용 가능한 수준의 문항 작성
- 코드 블록(\`\`\`) 없이 순수 JSON만 출력
- 한국어로 작성`;

  return { system, user: prompt };
}

/**
 * Claude 응답 문자열을 파싱하여 SessionParseResult를 반환한다.
 *
 * @param raw - Claude가 반환한 JSON 문자열
 * @returns 검증된 SessionParseResult
 * @throws Error('PARSE_ERROR') - JSON 파싱 또는 Zod 검증 실패 시
 */
export function parseSessionParseResponse(raw: string): SessionParseResult {
  try {
    // markdown fence 제거 (앞뒤 어디서든)
    let cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '').trim();
    // 앞뒤 여분 텍스트가 있으면 첫 번째 JSON 객체만 추출
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleaned = jsonMatch[0];
    const parsed = JSON.parse(cleaned);
    return SessionParseSchema.parse(parsed);
  } catch {
    throw new Error('PARSE_ERROR');
  }
}
