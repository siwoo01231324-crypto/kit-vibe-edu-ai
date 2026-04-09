'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Database } from '@/types/database';

type SessionRow = Database['public']['Tables']['sessions']['Row'];
type StatusFilter = 'all' | 'draft' | 'active' | 'ended';

interface Props {
  sessions: Pick<SessionRow, 'id' | 'title' | 'subject' | 'grade' | 'status' | 'created_at'>[];
}

const STATUS_LABELS: Record<string, string> = {
  draft: '초안',
  active: '진행중',
  ended: '종료',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  active: 'bg-green-100 text-green-700',
  ended: 'bg-blue-100 text-blue-700',
};

export function SessionSidebar({ sessions }: Props) {
  const [filter, setFilter] = useState<StatusFilter>('all');

  const filtered =
    filter === 'all' ? sessions : sessions.filter((s) => s.status === filter);

  return (
    <aside className="w-64 shrink-0">
      {/* Status filter */}
      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as StatusFilter)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <p className="text-sm text-gray-400 px-2">세션이 없습니다.</p>
        )}
        {filtered.map((session) => (
          <Link
            key={session.id}
            href={`/teacher/sessions/${session.id}`}
            className="block rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">{session.title}</p>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[session.status] ?? ''}`}
              >
                {STATUS_LABELS[session.status] ?? session.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {session.subject} · {session.grade}
            </p>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
