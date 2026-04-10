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
        const correctIdx = question.correct_answer;
        const correctCount = correctIdx !== undefined ? (option_distribution[correctIdx] ?? 0) : 0;
        const wrongCount = total - correctCount;

        const wrongCounts = option_distribution.filter((_, i) => i !== correctIdx);
        const maxWrongCount = wrongCounts.length > 0 ? Math.max(...wrongCounts) : 0;

        return (
          <div key={question.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            {/* Question header */}
            <div className="flex items-start justify-between gap-3 mb-1">
              <p className="font-medium text-gray-900">{question.content}</p>
              <span className="text-2xl font-bold text-blue-600 shrink-0">
                {Math.round(correct_rate * 100)}%
              </span>
            </div>

            {/* Per-question stats */}
            <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
              <span>총 {total}명 응답</span>
              {correctIdx !== undefined && (
                <>
                  <span className="text-green-600 font-medium">✓ 정답 {correctCount}명</span>
                  <span className="text-red-500">✗ 오답 {wrongCount}명</span>
                  <span>정답률 {Math.round(correct_rate * 100)}%</span>
                  <span>오답률 {Math.round((1 - correct_rate) * 100)}%</span>
                </>
              )}
            </div>

            {/* Option distribution bars */}
            <div className="space-y-2">
              {question.options.map((option, idx) => {
                const count = option_distribution[idx] ?? 0;
                const ratio = count / maxCount;
                const isCorrect = correctIdx !== undefined && idx === correctIdx;

                let barColor = 'bg-gray-300';
                if (isCorrect) barColor = 'bg-green-400';
                else if (count > 0 && count === maxWrongCount) {
                  barColor = 'bg-red-400';
                }

                return (
                  <div key={idx} className="flex items-center gap-2">
                    <span className={`w-4 text-xs shrink-0 font-medium ${isCorrect ? 'text-green-600' : 'text-gray-500'}`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className={`text-xs truncate ${isCorrect ? 'text-green-700 font-medium' : 'text-slate-600'}`}>
                          {option}
                        </span>
                        {isCorrect && (
                          <span className="text-xs bg-green-100 text-green-700 px-1 rounded shrink-0">정답</span>
                        )}
                      </div>
                      <div className="bg-gray-100 rounded overflow-hidden h-4">
                        <div
                          data-testid="option-bar"
                          className={`h-full rounded ${barColor} transition-all duration-300`}
                          style={{ width: `${ratio * 100}%` }}
                        />
                      </div>
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
