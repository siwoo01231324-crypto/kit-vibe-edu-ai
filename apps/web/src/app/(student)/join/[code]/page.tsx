'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { validateNickname } from '@/lib/validation';

export default function JoinByCodePage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string).toUpperCase();

  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('sessions')
      .select('id, title, subject, grade')
      .eq('join_code', code)
      .eq('status', 'active')
      .single()
      .then(({ data, error: dbError }) => {
        if (dbError || !data) {
          setNotFound(true);
          return;
        }
        setSessionId(data.id);
        setSessionTitle(data.title);
      });
  }, [code]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!validateNickname(nickname)) {
      setError('닉네임은 한글/영문/숫자/밑줄, 2-12자로 입력하세요.');
      return;
    }

    setIsLoading(true);
    sessionStorage.setItem('studentSession', JSON.stringify({ sessionId, nickname }));
    router.push(`/waiting/${sessionId}`);
  }

  if (notFound) {
    return (
      <main className="relative min-h-screen bg-white overflow-hidden flex flex-col">
        <div className="relative bg-rose-500 px-6 py-10 text-center overflow-hidden flex-shrink-0">
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 16px)',
            }}
          />
          <p className="text-4xl mb-2">😕</p>
          <h1 className="text-2xl font-black text-white font-pretendard">세션을 찾을 수 없습니다</h1>
          <p className="text-rose-100 text-sm mt-1">코드 <span className="font-mono font-bold">{code}</span> 를 확인하세요</p>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <button
            onClick={() => router.push('/join')}
            className="rounded-2xl bg-rose-500 text-white font-black px-8 py-4 min-h-[56px] text-base border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 transition-all duration-100 cursor-pointer"
          >
            직접 코드 입력
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-white overflow-hidden flex flex-col">
      {/* Top stripe */}
      <div className="relative bg-rose-500 px-6 py-10 text-center overflow-hidden flex-shrink-0">
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 16px)',
          }}
        />
        <div className="pointer-events-none absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
        <div className="pointer-events-none absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />

        <p className="text-4xl mb-2">🎓</p>
        <h1 className="text-2xl font-black text-white font-pretendard mb-1">수업 참여</h1>
        {/* Code badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mt-1">
          <span className="text-white/70 text-xs">코드</span>
          <span className="text-white font-black font-mono text-lg tracking-widest">{code}</span>
        </div>
        {sessionTitle && (
          <p className="text-rose-100 text-sm mt-2 font-pretendard">{sessionTitle}</p>
        )}
      </div>

      {/* Form area */}
      <div className="flex-1 flex items-start justify-center p-6 pt-8">
        <div className="w-full max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="nickname" className="mb-2 block text-sm font-bold text-slate-700">
                닉네임
              </label>
              <input
                id="nickname"
                type="text"
                maxLength={12}
                placeholder="2~12자 (한글/영문/숫자/_)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4 text-lg text-slate-900 placeholder-slate-300 focus:border-rose-400 focus:bg-white focus:outline-none transition-all font-pretendard"
                required
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2">
                <span className="text-red-500 text-sm">⚠</span>
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !sessionId}
              className="w-full rounded-2xl bg-rose-500 text-white font-black py-4 min-h-[56px] text-lg border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 transition-all duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  입장 중...
                </span>
              ) : '입장하기 →'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
