'use client';

import React from 'react';
import type { PreviewResponse, QuestionPreview } from '@/app/api/sessions/from-draft/preview/route';

interface Props {
  open: boolean;
  onClose: () => void;
  sourceSessionId: string;
  onCreated: (sessionId: string) => void;
}

export function DraftSessionConfirmModal({ open, onClose, sourceSessionId, onCreated }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<PreviewResponse | null>(null);
  const [title, setTitle] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  // 같은 세션에 대한 재오픈 시 재호출 방지
  const cachedIdRef = React.useRef<string | null>(null);

  // open이 true가 될 때 preview 호출 (캐시 + AbortController)
  React.useEffect(() => {
    if (!open) return;
    if (cachedIdRef.current === sourceSessionId && preview) return;

    const ac = new AbortController();
    setPreview(null);
    setError(null);
    setTitle('');
    setLoading(true);

    fetch('/api/sessions/from-draft/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_session_id: sourceSessionId }),
      signal: ac.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          setError(json.error ?? '미리보기 생성에 실패했습니다.');
          return;
        }
        const data: PreviewResponse = await res.json();
        cachedIdRef.current = sourceSessionId;
        setPreview(data);
        setTitle(data.title);
      })
      .catch((err) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError('네트워크 오류가 발생했습니다.');
      })
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [open, sourceSessionId]);

  async function handleCreate() {
    if (!preview || submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/sessions/from-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_session_id: sourceSessionId,
          title,
          questions: preview.questions,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? '세션 생성에 실패했습니다.');
        return;
      }

      const data = await res.json();
      onCreated(data.id as string);
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">AI 세션 생성 미리보기</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="닫기"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* 로딩 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="text-sm text-gray-500">AI가 문항을 생성하고 있습니다...</p>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {/* 미리보기 내용 */}
        {preview && !loading && (
          <div className="space-y-5">
            {/* 제목 편집 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">세션 제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* 문항 목록 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                문항 목록 ({preview.questions.length}개)
              </p>
              <ol className="space-y-4">
                {preview.questions.map((q: QuestionPreview, qi: number) => (
                  <li key={qi} className="rounded-lg border border-gray-200 p-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      {qi + 1}. {q.content}
                    </p>
                    <ul className="space-y-1">
                      {q.options.map((opt: string, oi: number) => (
                        <li
                          key={oi}
                          className={`rounded px-3 py-1.5 text-sm ${
                            oi === q.correct_answer
                              ? 'bg-green-50 text-green-800 font-medium border border-green-200'
                              : 'text-gray-600'
                          }`}
                        >
                          {oi + 1}. {opt}
                          {oi === q.correct_answer && (
                            <span className="ml-2 text-xs text-green-600">(정답)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>

            {/* 하단 버튼 */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting || !title.trim()}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? '생성 중...' : '세션 생성'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
