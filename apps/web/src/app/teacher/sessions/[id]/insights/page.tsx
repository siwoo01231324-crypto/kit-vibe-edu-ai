'use client';

import React from 'react';
import { ClassDraftPanel } from '@/components/dashboard/ClassDraftPanel';

interface Props {
  params: Promise<{ id: string }>;
}

export default function InsightsPage({ params }: Props) {
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [draftContent, setDraftContent] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    params.then(({ id }) => setSessionId(id));
  }, [params]);

  const handleGenerateDraft = async () => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/class-draft/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        if (json.error === 'NO_INSIGHTS') {
          setError('인사이트가 없습니다. 먼저 인사이트를 생성하세요.');
        } else {
          setError('수업 초안 생성에 실패했습니다.');
        }
        return;
      }
      const data = await res.json();
      setDraftContent(data.content);
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">AI 인사이트</h1>
        <button
          onClick={handleGenerateDraft}
          disabled={loading || !sessionId}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? '생성 중...' : '수업 초안 생성'}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {draftContent && <ClassDraftPanel content={draftContent} />}
    </div>
  );
}
