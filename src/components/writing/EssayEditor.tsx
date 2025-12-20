'use client';

import { useState, useCallback } from 'react';

interface EssayEditorProps {
  initialContent?: string;
  minWords?: number;
  maxWords?: number;
  onSubmit: (content: string, wordCount: number) => void;
  isSubmitting?: boolean;
}

export function EssayEditor({
  initialContent = '',
  minWords = 250,
  maxWords = 400,
  onSubmit,
  isSubmitting = false,
}: EssayEditorProps) {
  const [content, setContent] = useState(initialContent);

  const wordCount = useCallback(() => {
    if (!content.trim()) return 0;
    return content.trim().split(/\s+/).length;
  }, [content]);

  const count = wordCount();
  const isUnderMin = count < minWords;
  const isOverMax = count > maxWords;

  const getWordCountColor = () => {
    if (count === 0) return 'text-gray-400';
    if (isUnderMin) return 'text-amber-500';
    if (isOverMax) return 'text-red-500';
    return 'text-green-600';
  };

  const handleSubmit = () => {
    if (isUnderMin) {
      alert(`Please write at least ${minWords} words before submitting.`);
      return;
    }
    onSubmit(content, count);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your essay here..."
          className="min-h-[400px] w-full resize-y rounded-lg border border-gray-300 p-4 font-mono text-base leading-relaxed focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
          disabled={isSubmitting}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className={`text-sm font-medium ${getWordCountColor()}`}>
          <span className="text-lg font-bold">{count}</span> words
          {isUnderMin && (
            <span className="ml-2 text-amber-500">(minimum {minWords} words required)</span>
          )}
          {isOverMax && (
            <span className="ml-2 text-red-500">(recommended maximum {maxWords} words)</span>
          )}
          {!isUnderMin && !isOverMax && count > 0 && (
            <span className="ml-2 text-green-600">Good length!</span>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || count === 0}
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isSubmitting ? 'Evaluating...' : 'Submit for Evaluation'}
        </button>
      </div>
    </div>
  );
}
