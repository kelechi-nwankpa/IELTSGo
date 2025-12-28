'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface MockTestResults {
  id: string;
  testType: string;
  status: string;
  timing: {
    startedAt: string;
    completedAt: string;
  };
  results: {
    listeningBand: number | null;
    readingBand: number | null;
    writingBand: number | null;
    speakingBand: number | null;
    overallBand: number | null;
  };
}

function getBandColor(band: number | null): string {
  if (band === null) return 'text-slate-400';
  if (band >= 7) return 'text-green-600';
  if (band >= 6) return 'text-blue-600';
  if (band >= 5) return 'text-amber-600';
  return 'text-red-600';
}

function getBandBgColor(band: number | null): string {
  if (band === null) return 'bg-slate-50 border-slate-200';
  if (band >= 7) return 'bg-green-50 border-green-200';
  if (band >= 6) return 'bg-blue-50 border-blue-200';
  if (band >= 5) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

function getBandDescription(band: number): string {
  if (band >= 8.5) return 'Expert User';
  if (band >= 7.5) return 'Very Good User';
  if (band >= 6.5) return 'Good User';
  if (band >= 5.5) return 'Competent User';
  if (band >= 4.5) return 'Modest User';
  return 'Limited User';
}

function getModuleIcon(module: string): string {
  switch (module) {
    case 'Listening':
      return '🎧';
    case 'Reading':
      return '📖';
    case 'Writing':
      return '✍️';
    case 'Speaking':
      return '🎤';
    default:
      return '📊';
  }
}

export default function MockTestResultsPage() {
  const params = useParams();
  const testId = params.id as string;

  const [results, setResults] = useState<MockTestResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      const response = await fetch(`/api/mock-test/${testId}`);
      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to load results');
        return;
      }
      const data = await response.json();
      setResults(data);
    } catch {
      setError('Failed to load results');
    } finally {
      setIsLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Poll for updates if bands are pending (must be before early returns)
  useEffect(() => {
    // Only poll if we have results and some bands are pending
    if (!results) return;

    const { listeningBand, readingBand, writingBand, speakingBand } = results.results;
    const hasPendingBands =
      writingBand === null ||
      speakingBand === null ||
      listeningBand === null ||
      readingBand === null;

    if (!hasPendingBands) return;

    const pollInterval = setInterval(() => {
      fetchResults();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [results, fetchResults]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-slate-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 text-4xl">❌</div>
          <h2 className="text-xl font-semibold text-slate-900">{error || 'Results not found'}</h2>
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

  const { listeningBand, readingBand, writingBand, speakingBand, overallBand } = results.results;

  // Calculate performance analysis
  const moduleScores = [
    { module: 'Listening', band: listeningBand },
    { module: 'Reading', band: readingBand },
    { module: 'Writing', band: writingBand },
    { module: 'Speaking', band: speakingBand },
  ].filter((m): m is { module: string; band: number } => m.band !== null);

  const avgBand =
    moduleScores.length > 0
      ? moduleScores.reduce((sum, m) => sum + m.band, 0) / moduleScores.length
      : 0;

  const sortedScores = [...moduleScores].sort((a, b) => b.band - a.band);
  const strengths = sortedScores.filter((m) => m.band >= avgBand);
  const weaknesses = sortedScores.filter((m) => m.band < avgBand);

  // Generate recommendations based on weak areas
  const getRecommendations = (): string[] => {
    const recs: string[] = [];

    if (weaknesses.length === 0 && moduleScores.length > 0) {
      recs.push(
        'Great balanced performance! Continue practicing all modules to maintain your level.'
      );
    }

    for (const weak of weaknesses) {
      switch (weak.module) {
        case 'Listening':
          recs.push(
            'Practice listening with varied accents (British, American, Australian) using podcasts and TED talks.'
          );
          break;
        case 'Reading':
          recs.push(
            'Improve reading speed and comprehension by practicing timed reading passages daily.'
          );
          break;
        case 'Writing':
          recs.push(
            'Focus on essay structure and coherence. Practice writing Task 2 essays with clear arguments.'
          );
          break;
        case 'Speaking':
          recs.push(
            'Practice speaking fluently on various topics. Record yourself and review for filler words.'
          );
          break;
      }
    }

    return recs.slice(0, 3); // Max 3 recommendations
  };

  const recommendations = getRecommendations();

  // Calculate duration
  const startTime = new Date(results.timing.startedAt);
  const endTime = new Date(results.timing.completedAt);
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMinutes = Math.floor(durationMs / 60000);
  const durationHours = Math.floor(durationMinutes / 60);
  const remainingMinutes = durationMinutes % 60;

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
            <span className="font-medium text-slate-700">Mock Test Results</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Celebration Banner */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white shadow-xl">
          <div className="mb-4 text-5xl">🎉</div>
          <h1 className="text-3xl font-bold">Test Completed!</h1>
          <p className="mt-2 text-blue-100">
            Great job completing your {results.testType} mock test.
          </p>
        </div>

        {/* Overall Band */}
        <div className={`mb-8 rounded-2xl border-2 p-8 text-center ${getBandBgColor(overallBand)}`}>
          <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">
            Estimated Overall Band
          </p>
          <div className={`mt-2 text-6xl font-bold ${getBandColor(overallBand)}`}>
            {overallBand !== null ? overallBand.toFixed(1) : 'Pending'}
          </div>
          {overallBand !== null && (
            <p className="mt-2 text-slate-600">
              {overallBand >= 7
                ? "Excellent! You're well prepared."
                : overallBand >= 6
                  ? 'Good progress! Keep practicing.'
                  : 'Room for improvement. Focus on your weak areas.'}
            </p>
          )}
        </div>

        {/* Module Scores */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className={`rounded-xl border p-6 ${getBandBgColor(listeningBand)}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎧</span>
              <div>
                <p className="text-sm text-slate-500">Listening</p>
                <p className={`text-2xl font-bold ${getBandColor(listeningBand)}`}>
                  {listeningBand !== null ? listeningBand.toFixed(1) : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-6 ${getBandBgColor(readingBand)}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">📖</span>
              <div>
                <p className="text-sm text-slate-500">Reading</p>
                <p className={`text-2xl font-bold ${getBandColor(readingBand)}`}>
                  {readingBand !== null ? readingBand.toFixed(1) : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-6 ${getBandBgColor(writingBand)}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">✍️</span>
              <div>
                <p className="text-sm text-slate-500">Writing</p>
                <p className={`text-2xl font-bold ${getBandColor(writingBand)}`}>
                  {writingBand !== null ? writingBand.toFixed(1) : 'Pending'}
                </p>
              </div>
            </div>
            {writingBand === null && (
              <p className="mt-2 text-xs text-slate-500">AI evaluation in progress...</p>
            )}
          </div>

          <div className={`rounded-xl border p-6 ${getBandBgColor(speakingBand)}`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎤</span>
              <div>
                <p className="text-sm text-slate-500">Speaking</p>
                <p className={`text-2xl font-bold ${getBandColor(speakingBand)}`}>
                  {speakingBand !== null ? speakingBand.toFixed(1) : 'Pending'}
                </p>
              </div>
            </div>
            {speakingBand === null && (
              <p className="mt-2 text-xs text-slate-500">AI evaluation in progress...</p>
            )}
          </div>
        </div>

        {/* Performance Summary */}
        {moduleScores.length > 0 && (
          <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-slate-900">Performance Summary</h3>

            {/* Overall Assessment */}
            {overallBand !== null && (
              <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <p className="font-medium text-slate-900">
                      {getBandDescription(overallBand)} (Band {overallBand.toFixed(1)})
                    </p>
                    <p className="text-sm text-slate-600">
                      {overallBand >= 7
                        ? 'You demonstrate excellent English proficiency for academic and professional purposes.'
                        : overallBand >= 6
                          ? 'You have a good command of English with occasional inaccuracies.'
                          : 'You can communicate in familiar situations but may struggle with complex language.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Strengths & Weaknesses */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              {/* Strengths */}
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <h4 className="mb-3 flex items-center gap-2 font-medium text-green-800">
                  <span>💪</span> Strengths
                </h4>
                {strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {strengths.map((s) => (
                      <li key={s.module} className="flex items-center gap-2 text-sm text-green-700">
                        <span>{getModuleIcon(s.module)}</span>
                        <span>
                          {s.module}: Band {s.band.toFixed(1)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-green-600">
                    Complete all sections to see your strengths.
                  </p>
                )}
              </div>

              {/* Areas for Improvement */}
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h4 className="mb-3 flex items-center gap-2 font-medium text-amber-800">
                  <span>🎯</span> Focus Areas
                </h4>
                {weaknesses.length > 0 ? (
                  <ul className="space-y-2">
                    {weaknesses.map((w) => (
                      <li key={w.module} className="flex items-center gap-2 text-sm text-amber-700">
                        <span>{getModuleIcon(w.module)}</span>
                        <span>
                          {w.module}: Band {w.band.toFixed(1)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-amber-600">
                    Great job! All modules are above average.
                  </p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-3 flex items-center gap-2 font-medium text-blue-800">
                  <span>💡</span> Recommendations
                </h4>
                <ul className="space-y-2">
                  {recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-blue-700">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Test Details */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-slate-900">Test Details</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm text-slate-500">Test Type</p>
              <p className="font-medium text-slate-900">{results.testType}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Date</p>
              <p className="font-medium text-slate-900">{startTime.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Duration</p>
              <p className="font-medium text-slate-900">
                {durationHours > 0
                  ? `${durationHours}h ${remainingMinutes}m`
                  : `${durationMinutes}m`}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/mock-test"
            className="rounded-xl bg-blue-600 px-8 py-3 text-center font-semibold text-white shadow-lg hover:bg-blue-700"
          >
            Take Another Test
          </Link>
          <Link
            href="/study-plan"
            className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Study Plan
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-center font-semibold text-slate-700 hover:bg-slate-50"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
