'use client';

import React from 'react';
import Markdown from 'react-markdown';
import { copyToClipboard } from '@/lib/clipboard';

interface Props {
  content: string;
}

export function ClassDraftPanel({ content }: Props) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">수업 초안</h2>
        <button
          onClick={handleCopy}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 active:bg-gray-100"
        >
          {copied ? '복사됨!' : '복사'}
        </button>
      </div>
      <div className="prose prose-sm max-w-none rounded-lg border bg-white p-4">
        <Markdown>{content}</Markdown>
      </div>
    </div>
  );
}
