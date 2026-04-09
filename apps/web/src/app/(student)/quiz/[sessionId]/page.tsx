'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { calculateScore } from '@/lib/scoring';
import { useStudentQuestions } from '@/hooks/useStudentQuestions';
import { useSessionStatus } from '@/hooks/useSessionStatus';
import type { Database } from '@/types/database';

type QuestionRow = Database['public']['Tables']['questions']['Row'];

interface Feedback {
  choice: number;
  isCorrect: boolean;
}

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [nickname, setNickname] = useState('');
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const questionStartAt = useRef<number>(Date.now());

  const { questions, isLoading } = useStudentQuestions(sessionId);
  const { status } = useSessionStatus(sessionId);

  // sessionStorage 가드 — waiting 페이지와 동일 패턴
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

  // 현재 문항 결정 — answeredQuestionIds 에 없는 첫 번째 (question_order asc)
  const currentQuestion: QuestionRow | undefined = questions.find(
    (q) => !answeredQuestionIds.has(q.id)
  );

  // 문항 시작 시각 기록
  useEffect(() => {
    questionStartAt.current = Date.now();
  }, [currentQuestion?.id]);

  // 선택지 클릭 핸들러
  async function handleSelect(choiceIndex: number) {
    if (!currentQuestion) return;
    if (answeredQuestionIds.has(currentQuestion.id)) return; // 중복 가드

    // 즉시 버튼 비활성화 (클라이언트 가드)
    const questionId = currentQuestion.id;
    setAnsweredQuestionIds((prev) => new Set(prev).add(questionId));

    const responseTimeMs = Date.now() - questionStartAt.current;
    const isCorrect = choiceIndex === currentQuestion.correct_answer;
    const score = calculateScore(isCorrect, responseTimeMs);

    // 피드백 표시
    setFeedback({ choice: choiceIndex, isCorrect });

    // responses INSERT (anon, Supabase Direct)
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
      // INSERT 실패 시 가드 롤백 (재시도 허용)
      setAnsweredQuestionIds((prev) => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
      setFeedback(null);
      return;
    }

    // 1.5초 후 피드백 해제 → 다음 문항 대기
    setTimeout(() => {
      setFeedback(null);
    }, 1500);
  }

  // 세션 종료
  if (status === 'ended') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800 mb-2">퀴즈가 종료되었습니다</p>
          <p className="text-gray-500 mb-6">수고하셨습니다!</p>
          <button
            onClick={() => router.push('/join')}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            처음으로
          </button>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg">
        {/* 닉네임 배지 */}
        {nickname && (
          <p className="mb-4 text-center text-sm text-gray-400">
            참여자: <span className="font-semibold text-gray-700">{nickname}</span>
          </p>
        )}

        {currentQuestion ? (
          <>
            {/* 문항 번호 */}
            <p className="mb-2 text-center text-sm text-gray-400">
              문제 {currentQuestion.question_order} / {questions.length}
            </p>

            {/* 문항 내용 */}
            <div className="mb-6 rounded-2xl bg-white p-6 shadow-md">
              <p className="text-lg font-semibold text-gray-800 text-center leading-relaxed">
                {currentQuestion.content}
              </p>
            </div>

            {/* 선택지 grid */}
            <div className="grid grid-cols-2 gap-3">
              {(currentQuestion.options as string[]).map((option, idx) => {
                const isAnswered = answeredQuestionIds.has(currentQuestion.id);
                const isSelected = feedback?.choice === idx;
                const isCorrectChoice = idx === currentQuestion.correct_answer;

                let buttonClass =
                  'rounded-xl p-4 text-sm font-medium transition-all duration-300 border-2 ';

                if (isAnswered && feedback) {
                  if (isSelected && feedback.isCorrect) {
                    buttonClass += 'bg-green-500 border-green-500 text-white scale-105';
                  } else if (isSelected && !feedback.isCorrect) {
                    buttonClass += 'bg-red-500 border-red-500 text-white animate-shake';
                  } else if (isCorrectChoice) {
                    buttonClass += 'bg-green-100 border-green-400 text-green-800';
                  } else {
                    buttonClass += 'bg-gray-100 border-gray-200 text-gray-400 opacity-50';
                  }
                } else if (isAnswered) {
                  buttonClass += 'bg-gray-100 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed';
                } else {
                  buttonClass += 'bg-white border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isAnswered}
                    className={buttonClass}
                  >
                    <span className="mr-2 font-bold text-blue-500">
                      {['①', '②', '③', '④'][idx]}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          /* 다음 문항 대기 */
          <div className="rounded-2xl bg-white p-10 shadow-md text-center">
            {questions.length === 0 ? (
              <>
                <p className="text-lg font-semibold text-gray-700 mb-2">곧 문제가 시작됩니다</p>
                <p className="text-sm text-gray-400">선생님이 문제를 준비 중입니다...</p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-gray-700 mb-2">다음 문항 대기 중...</p>
                <p className="text-sm text-gray-400">선생님이 다음 문제를 준비 중입니다.</p>
              </>
            )}
            <div className="mt-6 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
