'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { TestTimer, TestProgress } from '@/components/mock-test';

interface MockTestData {
  id: string;
  testType: string;
  status: string;
  currentSection: string | null;
  timing: {
    startedAt: string;
    currentSectionStartedAt: string | null;
    currentSectionDeadline: string | null;
    timeRemainingSeconds: number | null;
    isOvertime: boolean;
    sectionDurations: {
      LISTENING: number;
      READING: number;
      WRITING: number;
      SPEAKING: number;
    };
  };
  progress: {
    completedSections: string[];
    currentSectionIndex: number;
    totalSections: number;
    percentComplete: number;
  };
  results: {
    listeningBand: number | null;
    readingBand: number | null;
    writingBand: number | null;
    speakingBand: number | null;
    overallBand: number | null;
  } | null;
}

const SECTION_INFO = {
  LISTENING: {
    name: 'Listening',
    icon: '🎧',
    description: 'Listen to recordings and answer 40 questions.',
    duration: 40,
    path: 'listening',
  },
  READING: {
    name: 'Reading',
    icon: '📖',
    description: 'Read 3 passages and answer 40 questions.',
    duration: 60,
    path: 'reading',
  },
  WRITING: {
    name: 'Writing',
    icon: '✍️',
    description: 'Complete Task 1 (20 min) and Task 2 (40 min).',
    duration: 60,
    path: 'writing',
  },
  SPEAKING: {
    name: 'Speaking',
    icon: '🎤',
    description: 'Record your responses for Parts 1, 2, and 3.',
    duration: 14,
    path: 'speaking',
  },
} as const;

export default function MockTestOrchestratorPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  const [mockTest, setMockTest] = useState<MockTestData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestData = useCallback(async () => {
    try {
      const response = await fetch(`/api/mock-test/${testId}`);
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to load mock test');
        return;
      }
      const data = await response.json();
      setMockTest(data);

      // Redirect based on status
      if (data.status === 'COMPLETED') {
        router.push(`/mock-test/${testId}/results`);
      } else if (data.status === 'ABANDONED') {
        router.push('/mock-test');
      }
    } catch {
      setError('Failed to load mock test');
    } finally {
      setIsLoading(false);
    }
  }, [testId, router]);

  useEffect(() => {
    fetchTestData();
  }, [fetchTestData]);

  // Poll for updates every 30 seconds
  useEffect(() => {
    if (!mockTest || mockTest.status !== 'IN_PROGRESS') return;

    const interval = setInterval(fetchTestData, 30000);
    return () => clearInterval(interval);
  }, [mockTest, fetchTestData]);

  const handleStartSection = () => {
    if (!mockTest?.currentSection) return;
    const sectionPath = SECTION_INFO[mockTest.currentSection as keyof typeof SECTION_INFO]?.path;
    if (sectionPath) {
      router.push(`/mock-test/${testId}/${sectionPath}`);
    }
  };

  const handleAbandon = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to abandon this test? You cannot resume it and will need to start fresh.'
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/mock-test/${testId}/abandon`, {
        method: 'POST',
      });
      if (response.ok) {
        router.push('/mock-test');
      }
    } catch {
      setError('Failed to abandon test');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-slate-600">Loading your test...</p>
        </div>
      </div>
    );
  }

  if (error || !mockTest) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 text-4xl">❌</div>
          <h2 className="text-xl font-semibold text-slate-900">{error || 'Test not found'}</h2>
          <Link
            href="/mock-test"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Back to Mock Tests
          </Link>
        </div>
      </div>
    );
  }

  const currentSectionInfo = mockTest.currentSection
    ? SECTION_INFO[mockTest.currentSection as keyof typeof SECTION_INFO]
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
                <span className="text-lg font-bold text-white">G</span>
              </div>
              <span className="text-xl font-bold text-slate-900">IELTSGo</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-700">Mock Test</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {mockTest.testType}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {mockTest.timing.currentSectionDeadline && (
              <TestTimer
                deadline={new Date(mockTest.timing.currentSectionDeadline)}
                showProgress
                totalDurationMinutes={currentSectionInfo?.duration}
              />
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Progress Indicator */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
          <TestProgress
            currentSection={mockTest.currentSection}
            completedSections={mockTest.progress.completedSections}
          />
        </div>

        {/* Current Section Card */}
        {currentSectionInfo && (
          <div className="mb-8 overflow-hidden rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="p-8">
              <div className="mb-4 text-5xl">{currentSectionInfo.icon}</div>
              <h2 className="text-2xl font-bold text-slate-900">{currentSectionInfo.name}</h2>
              <p className="mt-2 text-slate-600">{currentSectionInfo.description}</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {currentSectionInfo.duration} minutes
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={handleStartSection}
                  className="rounded-xl bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
                >
                  {mockTest.progress.completedSections.length === 0
                    ? 'Begin Section'
                    : 'Continue Section'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test Info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-medium text-slate-500">Test Started</h3>
            <p className="mt-1 font-semibold text-slate-900">
              {new Date(mockTest.timing.startedAt).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-medium text-slate-500">Progress</h3>
            <p className="mt-1 font-semibold text-slate-900">
              {mockTest.progress.completedSections.length} of {mockTest.progress.totalSections}{' '}
              sections
            </p>
          </div>
        </div>

        {/* Abandon Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleAbandon}
            className="text-sm text-slate-500 underline hover:text-slate-700"
          >
            Abandon this test
          </button>
        </div>
      </main>
    </div>
  );
}
