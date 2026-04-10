'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Markdown from 'react-markdown';
import { copyToClipboard } from '@/lib/clipboard';
import { DraftSessionConfirmModal } from './DraftSessionConfirmModal';

interface Props {
  content: string;
  sourceSessionId: string;
}

export function ClassDraftPanel({ content, sourceSessionId }: Props) {
  const router = useRouter();
  const [copied, setCopied] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreated = (sessionId: string) => {
    setModalOpen(false);
    router.push(`/teacher/sessions/${sessionId}/edit`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">수업 초안</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100"
          >
            {copied ? '복사됨!' : '복사'}
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            AI 세션 생성
          </button>
        </div>
      </div>
      <div className="prose prose-sm max-w-none rounded-lg border bg-white p-4">
        <Markdown>{content}</Markdown>
      </div>

      <DraftSessionConfirmModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sourceSessionId={sourceSessionId}
        onCreated={handleCreated}
      />
    </div>
  );
}
