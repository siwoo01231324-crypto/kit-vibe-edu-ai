'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSessionStatus } from '@/hooks/useSessionStatus';

export default function WaitingPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [nickname, setNickname] = useState('');
  const [sessionTitle] = useState('');
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
      <main className="flex min-h-screen items-center justify-center bg-[#1E1B4B] p-4">
        <div className="text-center animate-fade-in-up">
          <p className="text-5xl mb-4">🏁</p>
          <p className="text-2xl font-black text-white font-pretendard mb-2">세션이 종료되었습니다</p>
          <p className="text-slate-400 text-sm mb-8">수고하셨습니다!</p>
          <button
            onClick={() => router.push('/join')}
            className="rounded-xl bg-brand text-white font-bold px-8 py-4 min-h-[56px] text-base border-b-4 border-brand-dark active:border-b-0 active:translate-y-1 transition-all duration-100 cursor-pointer"
          >
            새 세션 참여
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#1E1B4B] p-4">
      {/* Star field dots */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-20 animate-pulse-slow"
            style={{
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              top: `${(i * 37 + 11) % 90}%`,
              left: `${(i * 53 + 7) % 95}%`,
              animationDelay: `${(i * 0.3) % 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-sm text-center animate-fade-in-up">
        {isLoading ? (
          <div className="flex justify-center">
            <div className="h-10 w-10 rounded-full border-4 border-white/20 border-t-brand animate-spin" />
          </div>
        ) : (
          <>
            {/* Pulse orb */}
            <div className="mb-10 flex justify-center">
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 rounded-full bg-brand/20 animate-ping" style={{ animationDuration: '2s' }} />
                <div className="absolute inset-3 rounded-full bg-brand/30 animate-ping" style={{ animationDuration: '2.4s', animationDelay: '0.3s' }} />
                <div className="absolute inset-6 rounded-full bg-brand/50" />
                <div className="absolute inset-8 rounded-full bg-brand flex items-center justify-center">
                  <span className="text-white text-xl">⏳</span>
                </div>
              </div>
            </div>

            {nickname && (
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6">
                <span className="text-white/60 text-sm">참여자</span>
                <span className="text-white font-bold text-sm">{nickname}</span>
              </div>
            )}

            {sessionTitle && (
              <p className="mb-4 text-xl font-bold text-white font-pretendard">{sessionTitle}</p>
            )}

            <h1 className="text-2xl md:text-3xl font-black text-white font-pretendard mb-3">
              선생님을 기다리는 중...
            </h1>
            <p className="text-white/50 text-sm">
              선생님이 시작하면 자동으로 이동합니다
            </p>

            {/* Loading dots */}
            <div className="mt-8 flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-brand animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
