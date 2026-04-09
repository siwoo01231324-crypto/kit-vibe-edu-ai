'use client';

import React from 'react';
import { createClient } from '@/lib/supabase/client';
import { InsightPanel } from '@/components/dashboard/InsightPanel';
import { ClassDraftPanel } from '@/components/dashboard/ClassDraftPanel';
import type { InsightResult } from '@/lib/prompts/insights';

interface Props {
  params: Promise<{ id: string }>;
}

export default function InsightsPage({ params }: Props) {
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [insights, setInsights] = React.useState<InsightResult | null>(null);
  const [insightsLoading, setInsightsLoading] = React.useState(true);
  const [generateLoading, setGenerateLoading] = React.useState(false);
  const [generateError, setGenerateError] = React.useState<string | null>(null);
  const [draftContent, setDraftContent] = React.useState<string | null>(null);
  const [draftLoading, setDraftLoading] = React.useState(false);
  const [draftError, setDraftError] = React.useState<string | null>(null);

  // params 해석 + 기존 인사이트 로딩
  React.useEffect(() => {
    params.then(({ id }) => {
      setSessionId(id);
      const supabase = createClient();
      supabase
        .from('ai_insights')
        .select('insights')
        .eq('session_id', id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.insights) setInsights(data.insights as InsightResult);
          setInsightsLoading(false);
        });
    });
  }, [params]);

  async function handleGenerateInsights() {
    if (!sessionId) return;
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
    if (!sessionId) return;
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
    } catch {
      setDraftError('네트워크 오류가 발생했습니다.');
    } finally {
      setDraftLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">AI 인사이트</h1>
        <div className="flex gap-2">
          <button
            onClick={handleGenerateInsights}
            disabled={generateLoading || !sessionId}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generateLoading ? '생성 중...' : insights ? '인사이트 재생성' : '인사이트 생성'}
          </button>
          <button
            onClick={handleGenerateDraft}
            disabled={draftLoading || !insights || !sessionId}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {draftLoading ? '생성 중...' : '수업 초안 생성'}
          </button>
        </div>
      </div>

      {/* 에러 */}
      {generateError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {generateError}
        </div>
      )}
      {draftError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {draftError}
        </div>
      )}

      {/* 인사이트 패널 */}
      {insightsLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        </div>
      ) : insights ? (
        <InsightPanel insights={insights} />
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center text-sm text-gray-400">
          아직 인사이트가 없습니다. 위 버튼을 눌러 생성하세요.
        </div>
      )}

      {/* 수업 초안 패널 */}
      {draftContent && <ClassDraftPanel content={draftContent} />}
    </div>
  );
}
