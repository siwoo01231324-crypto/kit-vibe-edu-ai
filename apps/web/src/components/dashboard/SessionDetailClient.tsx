'use client';

import { useEffect, useState } from 'react';
import { useRealtimeResponses } from '@/hooks/useRealtimeResponses';
import { ResponseChart } from '@/components/dashboard/ResponseChart';
import { createClient } from '@/lib/supabase/client';
import type { Question, Response } from '@/lib/aggregate';
import type { Database } from '@/types/database';

type SessionRow = Database['public']['Tables']['sessions']['Row'];

const STATUS_LABELS: Record<string, string> = {
  draft: '초안',
  active: '진행중',
  ended: '종료',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  active: 'bg-green-100 text-green-800 border-green-300',
  ended: 'bg-blue-100 text-blue-800 border-blue-300',
};

interface Props {
  session: SessionRow;
  questions: Question[];
  initialResponses: Response[];
}

export function SessionDetailClient({ session, questions, initialResponses }: Props) {
  const { responses, participantCount } = useRealtimeResponses(
    session.id,
    initialResponses
  );

  const [thumbsStats, setThumbsStats] = useState({ up: 0, down: 0 });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('thumbs_feedback')
      .select('type')
      .eq('session_id', session.id)
      .then(({ data }) => {
        if (!data) return;
        setThumbsStats({
          up: data.filter((r) => r.type === 'up').length,
          down: data.filter((r) => r.type === 'down').length,
        });
      });
  }, [session.id]);

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
      </div>

      {/* Participation stats */}
      <div className="flex items-center gap-4 mb-6 p-3 rounded-lg bg-gray-50 border border-gray-200 flex-wrap">
        <span className="text-sm font-medium text-gray-700">
          👥 {participantCount}명 참여중
        </span>
        <span className="text-sm text-gray-500">
          총 응답 {responses.length}개
        </span>
        <span className="text-sm font-medium text-green-700 rounded-full bg-green-100 border border-green-300 px-3 py-0.5">
          👍 {thumbsStats.up}명
        </span>
        <span className="text-sm font-medium text-red-700 rounded-full bg-red-100 border border-red-300 px-3 py-0.5">
          👎 {thumbsStats.down}명
        </span>
      </div>

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
