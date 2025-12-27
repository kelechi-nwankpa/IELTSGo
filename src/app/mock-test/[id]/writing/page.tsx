'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { TestProgress } from '@/components/mock-test';

export default function MockTestWritingPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Placeholder - Writing section will be fully implemented in Phase 7.3
  const handleSkipToSpeaking = async () => {
    setIsSubmitting(true);
    try {
      // Submit placeholder data
      await fetch(`/api/mock-test/${testId}/section/writing/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: 'placeholder',
          answers: { task1: '', task2: '' },
          timeSpent: 0,
        }),
      });
      router.push(`/mock-test/${testId}/speaking`);
    } catch {
      console.error('Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link
              href={`/mock-test/${testId}`}
              className="flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-900"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="hidden sm:inline">Test Overview</span>
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-2xl">✍️</span>
              <h1 className="text-lg font-semibold text-slate-900">Writing</h1>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
          <TestProgress
            currentSection="WRITING"
            completedSections={['LISTENING', 'READING']}
            compact
          />
        </div>
      </div>

      {/* Placeholder content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50 p-12 text-center">
          <div className="mb-4 text-6xl">🚧</div>
          <h2 className="text-2xl font-bold text-purple-900">Writing Section Coming Soon</h2>
          <p className="mt-2 text-purple-700">
            The Writing section with Task 1 and Task 2 will be fully implemented in Phase 7.3.
          </p>
          <p className="mt-4 text-sm text-purple-600">
            For now, you can skip to the Speaking section to continue testing the mock test flow.
          </p>
          <button
            onClick={handleSkipToSpeaking}
            disabled={isSubmitting}
            className="mt-6 rounded-xl bg-purple-600 px-8 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Skipping...' : 'Skip to Speaking Section'}
          </button>
        </div>
      </div>
    </div>
  );
}
