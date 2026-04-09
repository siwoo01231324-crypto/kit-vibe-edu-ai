'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSessionStatus } from '@/hooks/useSessionStatus';

export default function WaitingPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [nickname, setNickname] = useState('');
  const [sessionTitle, setSessionTitle] = useState('');
  const { status, isLoading } = useSessionStatus(sessionId);

  useEffect(() => {
    const raw = sessionStorage.getItem('studentSession');
    if (!raw) {
      router.replace('/join');
      return;
    }
    try {
      const { sessionId: storedId, nickname: storedNickname } = JSON.parse(raw);
      if (storedId !== sessionId) {
        router.replace('/join');
        return;
      }
      setNickname(storedNickname);
    } catch {
      router.replace('/join');
    }
  }, [sessionId, router]);

  useEffect(() => {
    if (status === 'active') {
      router.push(`/quiz/${sessionId}`);
    }
  }, [status, sessionId, router]);

  if (status === 'ended') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-700">세션이 종료되었습니다.</p>
          <button
            onClick={() => router.push('/join')}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            새 세션 참여
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md text-center">
        {isLoading ? (
          <p className="text-gray-500">로딩 중...</p>
        ) : (
          <>
            {nickname && (
              <p className="mb-2 text-sm text-gray-400">
                참여자: <span className="font-semibold text-gray-700">{nickname}</span>
              </p>
            )}
            {sessionTitle && (
              <p className="mb-4 text-lg font-semibold text-gray-800">{sessionTitle}</p>
            )}
            <div className="mb-6 flex justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </div>
            <p className="text-gray-600">세션 시작을 기다리는 중...</p>
          </>
        )}
      </div>
    </main>
  );
}
