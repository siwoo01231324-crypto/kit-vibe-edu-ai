'use client';

import React from 'react';
import { createClient } from '@/lib/supabase/client';
import { InsightPanel } from '@/components/dashboard/InsightPanel';
import { ClassDraftPanel } from '@/components/dashboard/ClassDraftPanel';
import type { InsightResult } from '@/lib/prompts/insights';

interface Props { sessionId: string; }

export function InsightsContent({ sessionId }: Props) {
  const [insights, setInsights] = React.useState<InsightResult | null>(null);
  const [insightsLoading, setInsightsLoading] = React.useState(true);
  const [generateLoading, setGenerateLoading] = React.useState(false);
  const [generateError, setGenerateError] = React.useState<string | null>(null);
  const [draftContent, setDraftContent] = React.useState<string | null>(null);
  const [draftLoading, setDraftLoading] = React.useState(false);
  const [draftError, setDraftError] = React.useState<string | null>(null);
  const draftRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setInsightsLoading(true);
    const supabase = createClient();
    supabase
      .from('ai_insights')
      .select('insights')
      .eq('session_id', sessionId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.insights) setInsights(data.insights as InsightResult);
        setInsightsLoading(false);
      });
  }, [sessionId]);

  async function handleGenerateInsights() {
    setGenerateLoading(true);
    setGenerateError(null);
    try {
      const res = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!res.ok) {
        setGenerateError('인사이트 생성에 실패했습니다.');
        return;
      }
      const data = await res.json();
      setInsights(data as InsightResult);
    } catch {
      setGenerateError('네트워크 오류가 발생했습니다.');
    } finally {
      setGenerateLoading(false);
    }
  }

  async function handleGenerateDraft() {
    setDraftLoading(true);
    setDraftError(null);
    try {
      const res = await fetch('/api/class-draft/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.error === 'NO_INSIGHTS') {
          setDraftError('인사이트가 없습니다. 먼저 인사이트를 생성하세요.');
        } else {
          setDraftError('수업 초안 생성에 실패했습니다.');
        }
        return;
      }
      const data = await res.json();
      setDraftContent(data.content);
      setTimeout(() => draftRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch {
      setDraftError('네트워크 오류가 발생했습니다.');
    } finally {
      setDraftLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-slate-900">AI 인사이트</h1>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleGenerateInsights}
            disabled={generateLoading}
            className="rounded-lg border border-slate-300 px-4 py-2 min-h-[44px] text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {generateLoading ? '생성 중...' : insights ? '인사이트 재생성' : '인사이트 생성'}
          </button>
          <button
            onClick={handleGenerateDraft}
            disabled={draftLoading || !insights}
            className="rounded-lg bg-orange-500 px-4 py-2 min-h-[44px] text-sm font-medium text-white border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all duration-100 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {draftLoading ? '생성 중...' : '수업 초안 생성'}
          </button>
        </div>
      </div>

      {/* 에러 */}
      {generateError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {generateError}
        </div>
      )}
      {draftError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {draftError}
        </div>
      )}

      {/* 인사이트 패널 */}
      {insightsLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />
        </div>
      ) : insights ? (
        <InsightPanel insights={insights} />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-400">
          아직 인사이트가 없습니다. 위 버튼을 눌러 생성하세요.
        </div>
      )}

      {/* 수업 초안 패널 — AI 세션 생성 버튼 포함 */}
      {draftContent && (
        <div ref={draftRef}>
          <ClassDraftPanel content={draftContent} sourceSessionId={sessionId} />
        </div>
      )}
    </div>
  );
}
