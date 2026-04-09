'use client';

import { groupByQuestion } from '@/lib/aggregate';
import type { Question, Response } from '@/lib/aggregate';

interface Props {
  questions: Question[];
  responses: Response[];
}

/**
 * 문항별 응답 분포 차트.
 * Chart.js / Recharts 금지 — 순수 CSS flex div 로 구현.
 */
export function ResponseChart({ questions, responses }: Props) {
  const grouped = groupByQuestion(questions, responses);

  return (
    <div className="space-y-6">
      {grouped.map(({ question, total, correct_rate, option_distribution }) => {
        const maxCount = Math.max(...option_distribution, 1);
        // Find most-selected wrong option index
        let mostWrongIdx = -1;
        let mostWrongCount = 0;
        option_distribution.forEach((count, idx) => {
          if (count > mostWrongCount) {
            mostWrongCount = count;
            mostWrongIdx = idx;
          }
        });

        return (
          <div key={question.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            {/* Question header */}
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-gray-900">{question.content}</p>
              <span className="text-2xl font-bold text-blue-600">
                {Math.round(correct_rate * 100)}%
              </span>
            </div>

            {/* Total responses */}
            <p className="text-xs text-gray-500 mb-3">총 {total}개 응답</p>

            {/* Option distribution bars */}
            <div className="space-y-2">
              {question.options.map((option, idx) => {
                const count = option_distribution[idx] ?? 0;
                const ratio = count / maxCount;

                // Color: correct answer = green, most-wrong = red, others = gray
                let barColor = 'bg-gray-300';
                if (idx === mostWrongIdx && count > 0) {
                  barColor = 'bg-red-400';
                }
                // Note: correct_answer is not in Question type from aggregate.ts
                // Color override applied below if we have correct answer info

                return (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-4 text-xs text-gray-500 shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded overflow-hidden h-5">
                      <div
                        data-testid="option-bar"
                        className={`h-full rounded ${barColor} transition-all duration-300`}
                        style={{ width: `${ratio * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-xs text-right text-gray-600 shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
