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
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-lg text-gray-600">세션을 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push('/join')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            직접 코드 입력
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">수업 참여</h1>
        {sessionTitle && (
          <p className="mb-6 text-center text-gray-500">{sessionTitle}</p>
        )}
        <p className="mb-4 text-center font-mono text-lg font-semibold tracking-widest text-blue-600">
          {code}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            disabled={isLoading || !sessionId}
            className="w-full rounded-lg bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '입장 중...' : '입장하기'}
          </button>
        </form>
      </div>
    </main>
  );
}
