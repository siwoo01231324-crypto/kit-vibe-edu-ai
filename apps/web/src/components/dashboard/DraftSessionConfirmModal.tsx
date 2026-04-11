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
  const [editableQuestions, setEditableQuestions] = React.useState<QuestionPreview[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const cachedIdRef = React.useRef<string | null>(null);

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
        setEditableQuestions(data.questions);
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
          questions: editableQuestions,
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
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">AI 세션 생성 미리보기</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
            aria-label="닫기"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
            <p className="text-sm text-slate-500">AI가 문항을 생성하고 있습니다...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {preview && !loading && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">세션 제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">
                문항 목록 ({editableQuestions.length}개) — 수정 후 세션 생성 가능
              </p>
              <div className="space-y-4">
                {editableQuestions.map((q, qi) => (
                  <div key={qi} className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Q{qi + 1}. 문항</label>
                      <textarea
                        rows={2}
                        value={q.content}
                        onChange={(e) => setEditableQuestions((qs) => qs.map((x, i) => i === qi ? { ...x, content: e.target.value } : x))}
                        className="w-full border border-slate-300 bg-white rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-500">선택지 (정답 클릭으로 선택)</label>
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditableQuestions((qs) => qs.map((x, i) => i === qi ? { ...x, correct_answer: oi } : x))}
                            className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-colors ${oi === q.correct_answer ? 'border-green-500 bg-green-500' : 'border-slate-300 bg-white hover:border-orange-400'}`}
                            title="정답으로 설정"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => setEditableQuestions((qs) => qs.map((x, i) => {
                              if (i !== qi) return x;
                              const newOpts = [...x.options] as [string, string, string, string];
                              newOpts[oi] = e.target.value;
                              return { ...x, options: newOpts };
                            }))}
                            className={`flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 ${oi === q.correct_answer ? 'border-green-400 bg-green-50 text-green-800 font-medium' : 'border-slate-300 bg-white text-slate-700'}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting || !title.trim()}
                className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all duration-100 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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
