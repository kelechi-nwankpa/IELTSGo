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
  const [showWarning, setShowWarning] = useState(false);

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
      setShowWarning(true);
      return;
    }
    onSubmit(content, count);
  };

  const handleConfirmSubmit = () => {
    setShowWarning(false);
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

      {/* Under word count warning modal */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <svg
                  className="h-5 w-5 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Below Minimum Word Count</h3>
            </div>
            <p className="mb-2 text-gray-600">
              Your response is <span className="font-semibold text-amber-600">{count} words</span>,
              which is below the minimum of {minWords} words.
            </p>
            <p className="mb-6 text-sm text-gray-500">
              In the real IELTS exam, responses under the word limit receive a penalty in Task
              Achievement. Your evaluation will reflect this.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Keep Writing
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 rounded-lg bg-amber-500 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-600"
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
