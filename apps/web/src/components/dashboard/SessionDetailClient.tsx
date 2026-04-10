'use client';

import Link from 'next/link';
import { useRealtimeResponses } from '@/hooks/useRealtimeResponses';
import { ResponseChart } from '@/components/dashboard/ResponseChart';
import type { Question, Response } from '@/lib/aggregate';
import type { Database } from '@/types/database';

type SessionRow = Database['public']['Tables']['sessions']['Row'];

const STATUS_LABELS: Record<string, string> = {
  draft: '초안',
  active: '진행중',
  ended: '종료',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700 border-slate-300',
  active: 'bg-green-100 text-green-800 border-green-300',
  ended: 'bg-sky-100 text-sky-800 border-sky-300',
};

interface ThumbsFeedback {
  nickname: string;
  comment: string | null;
}

interface Props {
  session: SessionRow;
  questions: Question[];
  initialResponses: Response[];
  thumbsFeedbacks?: ThumbsFeedback[];
}

export function SessionDetailClient({ session, questions, initialResponses, thumbsFeedbacks }: Props) {
  const { responses, participantCount } = useRealtimeResponses(
    session.id,
    initialResponses
  );

  const withComment = (thumbsFeedbacks ?? []).filter((f) => f.comment);

  return (
    <div className="flex-1 min-w-0">
      {/* Session header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
          <span
            className={`rounded-full border px-3 py-1 text-sm font-medium ${STATUS_COLORS[session.status] ?? ''}`}
          >
            {STATUS_LABELS[session.status] ?? session.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {session.subject} · {session.grade}
        </p>
        <div className="mt-3 flex gap-2">
          <Link
            href={`/teacher/dashboard?session=${session.id}&view=edit`}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            문항 편집
          </Link>
          <Link
            href={`/teacher/dashboard?session=${session.id}&view=live`}
            className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 cursor-pointer"
          >
            라이브 시작
          </Link>
          {session.status === 'ended' && (
            <Link
              href={`/teacher/dashboard?session=${session.id}&view=insights`}
              className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 cursor-pointer"
            >
              AI 인사이트
            </Link>
          )}
        </div>
      </div>

      {/* Participation stats */}
      <div className="flex items-center gap-4 mb-6 p-3 rounded-lg bg-slate-50 border border-slate-200 flex-wrap">
        <span className="text-sm font-medium text-slate-700">
          👥 {participantCount}명 참여중
        </span>
        <span className="text-sm text-slate-500">
          총 응답 {responses.length}개
        </span>
      </div>

      {/* 학생 피드백 */}
      {thumbsFeedbacks && thumbsFeedbacks.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">학생 피드백</h3>
            <span className="text-xs text-slate-400">{thumbsFeedbacks.length}명 응답</span>
          </div>
          {withComment.length > 0 ? (
            <ul className="space-y-2">
              {withComment.map((f, i) => (
                <li key={i} className="flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-2.5">
                  <span className="shrink-0 text-xs font-semibold text-slate-400 mt-0.5 w-16 truncate">{f.nickname}</span>
                  <p className="text-sm text-slate-700 flex-1">{f.comment}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">작성된 코멘트가 없습니다.</p>
          )}
        </div>
      )}

      {/* Response chart */}
      {questions.length === 0 ? (
        <p className="text-sm text-gray-400">문항이 없습니다.</p>
      ) : (
        <ResponseChart questions={questions} responses={responses} />
      )}

      {/* InsightPanel slot — #37 연결은 후속 작업에서 수행 */}
      {/* <InsightPanel insights={...} /> */}
    </div>
  );
}
