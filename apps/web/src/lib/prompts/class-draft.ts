import type { InsightResult } from './insights';

/**
 * Claude에 전달할 수업 초안 작성 프롬프트를 생성한다.
 *
 * @param insights - 인사이트 분석 결과
 * @param subject - 과목명
 * @param grade - 학년
 * @returns system / user 메시지 쌍
 */
export function buildDraftPrompt(
  insights: InsightResult,
  subject: string,
  grade: string,
): { system: string; user: string } {
  const system = `당신은 경험 많은 한국 교사입니다. 주어진 인사이트를 바탕으로 다음 수업의 마크다운 초안을 작성합니다.

출력 형식 (마크다운):
# {subject} {grade} 수업 초안
## 지난 수업 요약
## 오늘 집중할 개념
## 권장 활동

주의사항:
- 반드시 마크다운 형식으로 출력
- 교사가 바로 활용할 수 있는 실용적인 내용
- 한국어로 작성`;

  const user = JSON.stringify({
    subject,
    grade,
    insights,
    next_class_focus: insights.next_class_focus,
  });

  return { system, user };
}
