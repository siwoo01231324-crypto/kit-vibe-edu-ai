'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { calculateScore } from '@/lib/scoring';
import { useStudentQuestions } from '@/hooks/useStudentQuestions';
import { useSessionStatus } from '@/hooks/useSessionStatus';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Leaderboard } from '@/components/quiz/Leaderboard';
import type { Database } from '@/types/database';

type QuestionRow = Database['public']['Tables']['questions']['Row'];

interface Feedback {
  choice: number;
  isCorrect: boolean;
}

interface ScoreFloat {
  value: number;
  key: number;
}

// Kahoot-style positional colors (not AI-slop indigo)
const ANSWER_COLORS = [
  { bg: 'bg-rose-500',  shadow: 'shadow-[0_4px_0_#BE123C]', activeShadow: 'shadow-[0_1px_0_#BE123C]', text: 'text-white' },
  { bg: 'bg-sky-400',   shadow: 'shadow-[0_4px_0_#0284C7]', activeShadow: 'shadow-[0_1px_0_#0284C7]', text: 'text-white' },
  { bg: 'bg-amber-400', shadow: 'shadow-[0_4px_0_#CA8A04]', activeShadow: 'shadow-[0_1px_0_#CA8A04]', text: 'text-slate-900' },
  { bg: 'bg-lime-400',  shadow: 'shadow-[0_4px_0_#16A34A]', activeShadow: 'shadow-[0_1px_0_#16A34A]', text: 'text-slate-900' },
];

const ANSWER_LABELS = ['A', 'B', 'C', 'D'];

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [nickname, setNickname] = useState('');
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [thumbsSubmitted, setThumbsSubmitted] = useState(false);
  const [thumbsError, setThumbsError] = useState<string | null>(null);
  const [thumbsComment, setThumbsComment] = useState('');
  const [totalScore, setTotalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [scoreFloat, setScoreFloat] = useState<ScoreFloat | null>(null);
  const questionStartAt = useRef<number>(Date.now());

  const { questions, isLoading } = useStudentQuestions(sessionId);
  const { status } = useSessionStatus(sessionId);
  const { leaderboard, isLoading: leaderboardLoading } = useLeaderboard(sessionId);

  // sessionStorage 가드
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

  const currentQuestion: QuestionRow | undefined = questions.find(
    (q) => !answeredQuestionIds.has(q.id)
  );

  useEffect(() => {
    questionStartAt.current = Date.now();
  }, [currentQuestion?.id]);

  // confetti — 결과 화면 진입 시
  useEffect(() => {
    if (status !== 'ended') return;
    const fireConfetti = async () => {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#F97316', '#22C55E', '#38BDF8', '#F59E0B'],
      });
    };
    fireConfetti();
  }, [status]);

  async function handleSelect(choiceIndex: number) {
    if (!currentQuestion) return;
    if (answeredQuestionIds.has(currentQuestion.id)) return;

    const questionId = currentQuestion.id;
    setAnsweredQuestionIds((prev) => new Set(prev).add(questionId));

    const responseTimeMs = Date.now() - questionStartAt.current;
    const isCorrect = choiceIndex === currentQuestion.correct_answer;
    const score = calculateScore(isCorrect, responseTimeMs, questions.length);

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      // float-up 점수 효과
      setScoreFloat({ value: score, key: Date.now() });
      setTimeout(() => setScoreFloat(null), 1100);
    }
    setTotalScore((s) => s + score);
    setFeedback({ choice: choiceIndex, isCorrect });

    const supabase = createClient();
    const { error } = await supabase.from('responses').insert({
      session_id: sessionId,
      question_id: questionId,
      nickname,
      selected_answer: choiceIndex,
      is_correct: isCorrect,
      response_time_ms: responseTimeMs,
      score,
    });

    if (error) {
      console.error('responses INSERT 실패:', error.message);
      setAnsweredQuestionIds((prev) => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
      setFeedback(null);
      return;
    }

    setTimeout(() => {
      setFeedback(null);
    }, 1500);
  }

  async function handleThumbsFeedback(type: 'up' | 'down') {
    if (thumbsSubmitted) return;

    setThumbsSubmitted(true);
    setThumbsError(null);
    try {
      const res = await fetch('/api/thumbs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          nickname,
          type,
          comment: thumbsComment.trim() || null,
        }),
      });
      if (!res.ok) {
        setThumbsSubmitted(false);
        setThumbsError('피드백 전송에 실패했습니다. 다시 시도해주세요.');
      }
    } catch {
      setThumbsSubmitted(false);
      setThumbsError('네트워크 오류가 발생했습니다.');
    }
  }

  // 세션 종료 — 결과 화면 (다크 게임 배경)
  if (status === 'ended') {
    const total = answeredQuestionIds.size;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    return (
      <main className="flex min-h-screen flex-col items-center bg-[#1E1B4B] p-4 py-10">
        <div className="w-full max-w-md space-y-6">
          {/* 결과 카드 */}
          <div className="rounded-2xl bg-[#2D2A5E] border border-white/10 p-8 text-center animate-fade-in-up">
            <p className="text-5xl mb-3">🏆</p>
            <p className="text-2xl font-black text-white mb-1 font-pretendard">퀴즈 종료!</p>
            {nickname && (
              <p className="text-sm text-white/50 mb-6">{nickname} 님의 결과</p>
            )}

            {/* 점수 통계 */}
            <div className="grid grid-cols-3 gap-3 text-center mb-6">
              <div className="rounded-xl bg-amber-500/20 border border-amber-400/30 p-3">
                <p className="text-2xl font-black text-amber-400 font-space-grotesk">{totalScore}</p>
                <p className="text-xs text-white/50 mt-1">총 점수</p>
              </div>
              <div className="rounded-xl bg-lime-500/20 border border-lime-400/30 p-3">
                <p className="text-2xl font-black text-lime-400 font-space-grotesk">{correctCount}/{total}</p>
                <p className="text-xs text-white/50 mt-1">정답</p>
              </div>
              <div className="rounded-xl bg-sky-500/20 border border-sky-400/30 p-3">
                <p className="text-2xl font-black text-sky-400 font-space-grotesk">{accuracy}%</p>
                <p className="text-xs text-white/50 mt-1">정답률</p>
              </div>
            </div>

            {/* 따봉 피드백 */}
            <div className="mb-6">
              <p className="text-sm text-white/60 mb-3">수업이 어땠나요?</p>
              {thumbsSubmitted ? (
                <p className="text-sm font-bold text-lime-400">피드백을 보내주셔서 감사합니다! 🎉</p>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={thumbsComment}
                    onChange={(e) => setThumbsComment(e.target.value)}
                    placeholder="어디가 어려웠나요? (선택)"
                    maxLength={200}
                    rows={2}
                    className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-white/40 resize-none focus:outline-none focus:border-brand"
                  />
                  <button
                    onClick={() => handleThumbsFeedback('up')}
                    className="w-full rounded-xl bg-white/10 border border-white/20 text-white font-bold py-2 min-h-[44px] hover:bg-white/20 transition-all cursor-pointer text-sm"
                  >
                    피드백 전송
                  </button>
                </div>
              )}
              {thumbsError && (
                <p className="mt-2 text-xs text-rose-400">{thumbsError}</p>
              )}
            </div>

            <button
              onClick={() => router.push('/join')}
              className="w-full rounded-xl bg-brand text-white font-black py-4 text-base border-b-4 border-brand-dark active:border-b-0 active:translate-y-1 transition-all duration-100 cursor-pointer"
            >
              처음으로
            </button>
          </div>

          {/* 리더보드 */}
          <Leaderboard
            leaderboard={leaderboard}
            currentNickname={nickname}
            isLoading={leaderboardLoading}
          />
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#1E1B4B]">
        <div className="h-10 w-10 rounded-full border-4 border-white/20 border-t-brand animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#1E1B4B] p-4">
      <div className="w-full max-w-lg">
        {/* 상단: 닉네임 + 점수 */}
        <div className="flex items-center justify-between mb-6">
          {nickname && (
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
              <span className="text-white/60 text-xs">👤</span>
              <span className="text-white text-sm font-bold font-pretendard">{nickname}</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 rounded-full px-3 py-1.5 ml-auto">
            <span className="text-amber-400 text-xs">⭐</span>
            <span className="text-amber-400 text-sm font-black font-space-grotesk">{totalScore}</span>
          </div>
        </div>

        {currentQuestion ? (
          <>
            {/* 문항 번호 */}
            <p className="mb-3 text-center text-sm font-bold text-white/40 font-space-grotesk tracking-wider uppercase">
              Question {currentQuestion.question_order} / {questions.length}
            </p>

            {/* 문항 카드 */}
            <div className="mb-5 rounded-2xl bg-[#2D2A5E] border border-white/10 shadow-lg p-6">
              <p className="text-lg md:text-xl font-bold text-white text-center leading-relaxed font-pretendard">
                {currentQuestion.content}
              </p>
            </div>

            {/* 선택지 grid — relative로 float-up 앵커 */}
            <div className="relative">
              {/* Float-up 점수 */}
              {scoreFloat && (
                <div
                  key={scoreFloat.key}
                  className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 z-10 animate-float-up font-space-grotesk font-black text-score-text text-3xl drop-shadow-lg"
                >
                  +{scoreFloat.value}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(currentQuestion.options as string[]).map((option, idx) => {
                  const color = ANSWER_COLORS[idx % ANSWER_COLORS.length]!;
                  const isAnswered = answeredQuestionIds.has(currentQuestion.id);
                  const isSelected = feedback?.choice === idx;
                  const isCorrectChoice = idx === currentQuestion.correct_answer;

                  let cls =
                    `relative min-h-[80px] md:min-h-[100px] rounded-xl p-4 text-base font-bold transition-all duration-200 flex items-center gap-3 ` +
                    `${color.bg} ${color.text} `;

                  if (!isAnswered) {
                    cls += `${color.shadow} active:shadow-none active:translate-y-1 cursor-pointer hover:brightness-110`;
                  } else if (isSelected && feedback?.isCorrect) {
                    cls += `animate-burst shadow-[0_4px_0_#16A34A] bg-correct border-2 border-correct/50`;
                  } else if (isSelected && !feedback?.isCorrect) {
                    cls += `animate-shake-x shadow-[0_4px_0_#BE123C] bg-wrong border-2 border-wrong/50 opacity-90`;
                  } else if (isCorrectChoice && isAnswered) {
                    cls += `shadow-[0_4px_0_#16A34A] bg-correct border-2 border-correct/50`;
                  } else {
                    cls += `opacity-25 cursor-not-allowed`;
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={isAnswered}
                      className={cls}
                    >
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center text-sm font-black">
                        {ANSWER_LABELS[idx]}
                      </span>
                      <span className="text-left leading-snug">{option}</span>

                      {/* 피드백 배지 */}
                      {isAnswered && isSelected && feedback?.isCorrect && (
                        <span className="ml-auto text-xs font-black bg-white/20 px-2 py-1 rounded-full whitespace-nowrap">
                          ✓ 정답!
                        </span>
                      )}
                      {isAnswered && isSelected && !feedback?.isCorrect && (
                        <span className="ml-auto text-xs font-black bg-white/20 px-2 py-1 rounded-full whitespace-nowrap">
                          ✗ 오답
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl bg-[#2D2A5E] border border-white/10 shadow-lg p-10 text-center animate-fade-in-up">
            {questions.length === 0 ? (
              <>
                <p className="text-4xl mb-4">⏳</p>
                <p className="text-xl font-black text-white mb-2 font-pretendard">곧 문제가 시작됩니다</p>
                <p className="text-sm text-white/50">선생님이 문제를 준비 중입니다...</p>
                <div className="mt-6 flex justify-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full bg-brand animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </>
            ) : answeredQuestionIds.size >= questions.length ? (
              <>
                <p className="text-4xl mb-4">🎉</p>
                <p className="text-xl font-black text-white mb-2 font-pretendard">모든 문항 완료!</p>
                <p className="text-sm text-white/50">선생님이 세션을 종료할 때까지 기다려주세요.</p>
              </>
            ) : (
              <>
                <p className="text-4xl mb-4">⏳</p>
                <p className="text-xl font-black text-white mb-2 font-pretendard">다음 문항 대기 중...</p>
                <p className="text-sm text-white/50">선생님이 다음 문제를 준비 중입니다.</p>
                <div className="mt-6 flex justify-center gap-2">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full bg-brand animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
