'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { TestProgress } from '@/components/mock-test';

export default function MockTestSpeakingPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Placeholder - Speaking section will be fully implemented in Phase 7.3
  const handleCompleteTest = async () => {
    setIsSubmitting(true);
    try {
      // Submit placeholder data
      await fetch(`/api/mock-test/${testId}/section/speaking/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: 'placeholder',
          answers: { part1: '', part2: '', part3: '' },
          timeSpent: 0,
        }),
      });
      router.push(`/mock-test/${testId}/results`);
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
              <span className="text-2xl">🎤</span>
              <h1 className="text-lg font-semibold text-slate-900">Speaking</h1>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
          <TestProgress
            currentSection="SPEAKING"
            completedSections={['LISTENING', 'READING', 'WRITING']}
            compact
          />
        </div>
      </div>

      {/* Placeholder content */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-12 text-center">
          <div className="mb-4 text-6xl">🚧</div>
          <h2 className="text-2xl font-bold text-amber-900">Speaking Section Coming Soon</h2>
          <p className="mt-2 text-amber-700">
            The Speaking section with Parts 1, 2, and 3 will be fully implemented in Phase 7.3.
          </p>
          <p className="mt-4 text-sm text-amber-600">
            For now, you can complete the test to see the results page.
          </p>
          <button
            onClick={handleCompleteTest}
            disabled={isSubmitting}
            className="mt-6 rounded-xl bg-amber-600 px-8 py-3 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Completing...' : 'Complete Test & View Results'}
          </button>
        </div>
      </div>
    </div>
  );
}
