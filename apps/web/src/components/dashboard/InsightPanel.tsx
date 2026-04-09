import type { InsightResult } from '@/lib/prompts/insights';

interface Props {
  insights: InsightResult;
}

export function InsightPanel({ insights }: Props) {
  return (
    <div className="space-y-6">
      {/* 취약 개념 */}
      <section>
        <h2 className="text-lg font-semibold text-red-700 mb-3">취약 개념</h2>
        <div className="grid gap-3">
          {insights.top_weak_concepts.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900">{item.concept}</span>
                <span className="text-sm font-semibold text-red-600">
                  정답률 {Math.round(item.correct_rate * 100)}%
                </span>
              </div>
              <p className="text-sm text-gray-600">{item.evidence}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 강점 개념 */}
      <section>
        <h2 className="text-lg font-semibold text-green-700 mb-3">강점 개념</h2>
        <div className="grid gap-3">
          {insights.strong_concepts.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{item.concept}</span>
                <span className="text-sm font-semibold text-green-600">
                  정답률 {Math.round(item.correct_rate * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 다음 수업 포커스 */}
      <section>
        <h2 className="text-lg font-semibold text-blue-700 mb-3">다음 수업 포커스</h2>
        <div className="grid gap-3">
          {insights.next_class_focus.map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm"
            >
              <p className="font-medium text-gray-900 mb-1">{item.focus}</p>
              <p className="text-sm text-gray-600 mb-2">{item.reason}</p>
              <p className="text-sm text-blue-700 font-medium">
                추천 활동: {item.suggested_activity}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
