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
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">수업 참여</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="joinCode" className="mb-1 block text-sm font-medium text-gray-700">
              참여 코드
            </label>
            <input
              id="joinCode"
              type="text"
              maxLength={6}
              placeholder="6자리 코드 입력"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-center text-xl font-mono tracking-widest uppercase focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="nickname" className="mb-1 block text-sm font-medium text-gray-700">
              닉네임
            </label>
            <input
              id="nickname"
              type="text"
              maxLength={12}
              placeholder="2-12자 (한글/영문/숫자/_)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '확인 중...' : '입장하기'}
          </button>
        </form>
      </div>
    </main>
  );
}
