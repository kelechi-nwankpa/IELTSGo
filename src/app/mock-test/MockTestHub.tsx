'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface QuotaInfo {
  used: number;
  limit: number;
  remaining: number;
}

interface MockTestInfo {
  id: string;
  testType: string;
  status: string;
  currentSection: string | null;
  timing: {
    timeRemainingSeconds: number | null;
  };
}

export function MockTestHub() {
  const { status } = useSession();
  const router = useRouter();
  const [selectedTestType, setSelectedTestType] = useState<'ACADEMIC' | 'GENERAL'>('ACADEMIC');
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [existingTest, setExistingTest] = useState<MockTestInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch quota and check for existing test on mount
  useEffect(() => {
    async function fetchStatus() {
      if (status !== 'authenticated') return;

      try {
        // Check for in-progress mock test and quota
        const testsResponse = await fetch('/api/mock-test/active');
        if (testsResponse.ok) {
          const data = await testsResponse.json();
          if (data.mockTest) {
            setExistingTest(data.mockTest);
          }
          if (data.quota) {
            setQuotaInfo({
              used: data.quota.used,
              limit: data.quota.limit,
              remaining: data.quota.remaining,
            });
          }
        }
      } catch {
        console.error('Failed to fetch status');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStatus();
  }, [status]);

  const handleStartTest = async () => {
    setIsStarting(true);
    setError(null);

    try {
      const response = await fetch('/api/mock-test/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testType: selectedTestType }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'MOCK_TEST_IN_PROGRESS') {
          setExistingTest({ id: data.existingTestId } as MockTestInfo);
          setError('You have an existing mock test in progress.');
        } else if (data.code === 'PREMIUM_REQUIRED') {
          setError('Mock tests are available for Premium members only.');
        } else if (data.code === 'MOCK_TEST_QUOTA_EXCEEDED') {
          setError(data.error);
        } else {
          setError(data.error || 'Failed to start mock test');
        }
        return;
      }

      // Redirect to the mock test
      router.push(`/mock-test/${data.mockTestId}`);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleAbandonTest = async () => {
    if (!existingTest) return;

    const confirmed = window.confirm(
      'Are you sure you want to abandon this test? You cannot resume it and will need to start fresh.'
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/mock-test/${existingTest.id}/abandon`, {
        method: 'POST',
      });

      if (response.ok) {
        setExistingTest(null);
        setError(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to abandon test');
      }
    } catch {
      setError('Failed to abandon test');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Sign in Required</h2>
        <p className="mt-2 text-slate-600">Please sign in to access mock tests.</p>
        <Link
          href="/auth/signin"
          className="mt-4 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold">Full IELTS Mock Test</h1>
        <p className="mt-2 text-blue-100">
          Experience a complete IELTS test simulation with realistic timing and conditions.
        </p>
        <div className="mt-6 grid grid-cols-4 gap-4 text-center">
          <div className="rounded-xl bg-white/10 p-4">
            <div className="text-2xl font-bold">40</div>
            <div className="text-sm text-blue-200">min Listening</div>
          </div>
          <div className="rounded-xl bg-white/10 p-4">
            <div className="text-2xl font-bold">60</div>
            <div className="text-sm text-blue-200">min Reading</div>
          </div>
          <div className="rounded-xl bg-white/10 p-4">
            <div className="text-2xl font-bold">60</div>
            <div className="text-sm text-blue-200">min Writing</div>
          </div>
          <div className="rounded-xl bg-white/10 p-4">
            <div className="text-2xl font-bold">14</div>
            <div className="text-sm text-blue-200">min Speaking</div>
          </div>
        </div>
      </div>

      {/* Existing Test Warning */}
      {existingTest && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-4">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">Test in Progress</h3>
              <p className="mt-1 text-sm text-amber-700">
                You have a mock test in progress. Continue where you left off or abandon it to start
                fresh.
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  href={`/mock-test/${existingTest.id}`}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                >
                  Continue Test
                </Link>
                <button
                  onClick={handleAbandonTest}
                  className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
                >
                  Abandon Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Test Type Selection */}
      {!existingTest && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Select Test Type</h2>
          <p className="mt-1 text-sm text-slate-600">
            Choose the IELTS test type that matches your exam.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => setSelectedTestType('ACADEMIC')}
              className={`rounded-xl border-2 p-6 text-left transition-all ${
                selectedTestType === 'ACADEMIC'
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-2xl">🎓</div>
              <h3 className="mt-2 font-semibold text-slate-900">Academic</h3>
              <p className="mt-1 text-sm text-slate-600">
                For university admissions and professional registration.
              </p>
            </button>

            <button
              onClick={() => setSelectedTestType('GENERAL')}
              className={`rounded-xl border-2 p-6 text-left transition-all ${
                selectedTestType === 'GENERAL'
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-2xl">🌍</div>
              <h3 className="mt-2 font-semibold text-slate-900">General Training</h3>
              <p className="mt-1 text-sm text-slate-600">
                For work experience, immigration, and training programs.
              </p>
            </button>
          </div>

          {/* Start Button */}
          <div className="mt-6">
            <button
              onClick={handleStartTest}
              disabled={isStarting}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
            >
              {isStarting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Starting Test...
                </span>
              ) : (
                'Start Full Mock Test'
              )}
            </button>
            <p className="mt-2 text-center text-sm text-slate-500">
              This test will take approximately 2 hours 45 minutes.
            </p>
          </div>
        </div>
      )}

      {/* Quota Info */}
      {quotaInfo && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Monthly Mock Tests</span>
            <span className="font-semibold text-slate-900">
              {quotaInfo.used} / {quotaInfo.limit} used
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${(quotaInfo.used / quotaInfo.limit) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* What to Expect */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">What to Expect</h2>
        <div className="mt-4 space-y-4">
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
              1
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Listening (40 minutes)</h3>
              <p className="text-sm text-slate-600">
                4 sections with 40 questions. Audio plays once, just like the real test.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">
              2
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Reading (60 minutes)</h3>
              <p className="text-sm text-slate-600">
                3 passages with 40 questions. Timed to match exam conditions.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
              3
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Writing (60 minutes)</h3>
              <p className="text-sm text-slate-600">
                Task 1 (20 min) and Task 2 (40 min). AI evaluation with band scores.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-600">
              4
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Speaking (11-14 minutes)</h3>
              <p className="text-sm text-slate-600">
                Parts 1, 2, and 3. Record your responses for AI evaluation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
