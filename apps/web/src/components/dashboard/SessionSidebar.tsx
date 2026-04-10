'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Database } from '@/types/database';

type SessionRow = Database['public']['Tables']['sessions']['Row'];
type StatusFilter = 'all' | 'draft' | 'active' | 'ended';

interface Props {
  sessions: Pick<SessionRow, 'id' | 'title' | 'subject' | 'grade' | 'status' | 'created_at'>[];
  selectedId?: string;
}

const STATUS_LABELS: Record<string, string> = {
  draft: '초안',
  active: '진행중',
  ended: '종료',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  active: 'bg-green-100 text-green-700',
  ended: 'bg-sky-100 text-sky-700',
};

export function SessionSidebar({ sessions, selectedId }: Props) {
  const [filter, setFilter] = useState<StatusFilter>('all');

  const filtered =
    filter === 'all' ? sessions : sessions.filter((s) => s.status === filter);

  return (
    <aside className="w-64 shrink-0">
      {/* 새 세션 버튼 */}
      <Link
        href="/teacher/sessions/new"
        className="mb-4 flex items-center justify-center gap-1 w-full rounded-lg bg-orange-500 px-4 py-2 min-h-[44px] text-sm font-semibold text-white hover:bg-orange-600 transition-colors cursor-pointer"
      >
        + 새 세션
      </Link>

      {/* Status filter */}
      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as StatusFilter)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="all">전체</option>
          <option value="draft">초안</option>
          <option value="active">진행중</option>
          <option value="ended">종료</option>
        </select>
      </div>

      {/* Session list */}
      <nav className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-sm text-slate-400 px-2">세션이 없습니다.</p>
        )}
        {filtered.map((session) => (
          <Link
            key={session.id}
            href={`/teacher/dashboard?session=${session.id}`}
            className={[
              'block rounded-lg border p-3 transition-colors',
              selectedId === session.id
                ? 'border-orange-400 bg-orange-50'
                : 'border-slate-200 bg-white hover:bg-slate-50',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-slate-800 line-clamp-2">{session.title}</p>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[session.status] ?? ''}`}
              >
                {STATUS_LABELS[session.status] ?? session.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {session.subject} · {session.grade}
            </p>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
