'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { validateNickname } from '@/lib/validation';

export default function JoinPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const code = joinCode.trim().toUpperCase();

    if (code.length !== 6) {
      setError('참여 코드는 6자리입니다.');
      return;
    }

    if (!validateNickname(nickname)) {
      setError('닉네임은 한글/영문/숫자/밑줄, 2-12자로 입력하세요.');
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error: dbError } = await supabase
        .from('sessions')
        .select('id, title, subject, grade')
        .eq('join_code', code)
        .eq('status', 'active')
        .single();

      if (dbError || !data) {
        setError('세션을 찾을 수 없습니다.');
        return;
      }

      sessionStorage.setItem('studentSession', JSON.stringify({ sessionId: data.id, nickname }));
      router.push(`/waiting/${data.id}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-white overflow-hidden flex flex-col">
      {/* Top orange stripe */}
      <div className="relative bg-rose-500 px-6 py-10 text-center overflow-hidden flex-shrink-0">
        {/* stripe pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 16px)',
          }}
        />
        <div className="pointer-events-none absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
        <div className="pointer-events-none absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />

        <p className="text-4xl mb-2">🎓</p>
        <h1 className="text-2xl md:text-3xl font-black text-white font-pretendard">수업 참여</h1>
        <p className="text-rose-100 text-sm mt-1">코드와 닉네임을 입력하세요</p>
      </div>

      {/* Form area */}
      <div className="flex-1 flex items-start justify-center p-6 pt-8">
        <div className="w-full max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Join code input */}
            <div>
              <label htmlFor="joinCode" className="mb-2 block text-sm font-bold text-slate-700">
                참여 코드
              </label>
              <input
                id="joinCode"
                type="text"
                maxLength={6}
                placeholder="A1B2C3"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4 text-center text-3xl font-black font-mono tracking-[0.3em] uppercase text-slate-900 placeholder-slate-300 focus:border-rose-400 focus:bg-white focus:outline-none transition-all"
                required
              />
            </div>

            {/* Nickname input */}
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
              disabled={isLoading}
              className="w-full rounded-2xl bg-rose-500 text-white font-black py-4 min-h-[56px] text-lg border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 transition-all duration-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:border-b-4"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  확인 중...
                </span>
              ) : '입장하기 →'}
            </button>
          </form>

          {/* Hint */}
          <p className="mt-8 text-center text-xs text-slate-400">
            코드는 선생님에게 받으세요
          </p>
        </div>
      </div>
    </main>
  );
}
