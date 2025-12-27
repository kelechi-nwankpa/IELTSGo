'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

interface DashboardData {
  user: {
    name: string | null;
    email: string;
    image: string | null;
    targetBand: number | null;
    testDate: string | null;
    role: string;
    subscriptionTier: string;
    memberSince: string;
  };
  subscription: {
    tier: string;
    status: string;
    plan: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    hasStripeAccount: boolean;
  };
  stats: {
    totalEvaluations: number;
    averageBand: number | null;
    bestScore: number | null;
    improvement: number | null;
    evaluationsRemaining: number | null;
    evaluationsUsed: number;
  };
  recentSessions: Array<{
    id: string;
    module: string;
    type: string;
    title: string;
    prompt: string;
    completedAt: string;
    bandScore: number | null;
    criteriaScores: Record<string, number> | null;
  }>;
}

export default function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) {
          throw new Error('Failed to load dashboard');
        }
        const dashboardData = await res.json();
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-slate-200" />
            <div className="grid gap-4 md:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-slate-200" />
              ))}
            </div>
            <div className="h-96 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-lg text-slate-600">{error || 'Failed to load dashboard'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { user, subscription, stats, recentSessions } = data;
  const isPremium = subscription?.tier === 'PREMIUM' && subscription?.status === 'ACTIVE';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
              <span className="text-lg font-bold text-white">G</span>
            </div>
            <span className="text-xl font-bold text-slate-900">IELTSGo</span>
          </Link>
          <div className="flex items-center gap-4">
            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="rounded-lg px-4 py-2 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50"
              >
                Admin
              </Link>
            )}
            <Link
              href="/study-plan"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              Study Plan
            </Link>
            <Link
              href="/history"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              History
            </Link>
            <Link
              href="/mock-test"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              Mock Test
            </Link>
            <Link
              href="/writing"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl"
            >
              Practice Now
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </h1>
            <p className="mt-1 text-slate-600">Track your progress and keep practicing.</p>
          </div>
          <div className="flex items-center gap-3">
            {isPremium ? (
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-green-700">Premium</span>
                  </div>
                  {subscription.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
                    <p className="mt-1 text-xs text-green-600">
                      Ends {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <ManageBillingButton />
              </div>
            ) : stats.evaluationsRemaining !== null ? (
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2">
                  <span className="text-sm font-medium text-amber-700">
                    {stats.evaluationsRemaining} free evaluation
                    {stats.evaluationsRemaining !== 1 ? 's' : ''} remaining
                  </span>
                </div>
                <Link
                  href="/pricing"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/25 hover:shadow-xl"
                >
                  Upgrade
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Practice"
            value={stats.totalEvaluations}
            subtitle="essays evaluated"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            }
            color="blue"
          />
          <StatCard
            label="Average Band"
            value={stats.averageBand ?? '-'}
            subtitle="overall score"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            }
            color="indigo"
          />
          <StatCard
            label="Best Score"
            value={stats.bestScore ?? '-'}
            subtitle="highest achieved"
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            }
            color="amber"
          />
          <StatCard
            label="Improvement"
            value={
              stats.improvement !== null
                ? `${stats.improvement >= 0 ? '+' : ''}${stats.improvement}`
                : '-'
            }
            subtitle={stats.improvement !== null ? 'band score change' : 'need 6+ essays'}
            icon={
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            }
            color="green"
          />
        </div>

        {/* Recent Practice */}
        <div className="rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Recent Practice</h2>
            <Link
              href="/history"
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View All
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          {recentSessions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <svg
                  className="h-6 w-6 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900">No practice sessions yet</h3>
              <p className="mt-1 text-slate-600">
                Start your first writing practice to see your progress here.
              </p>
              <Link
                href="/writing"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500"
              >
                Start Writing Practice
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentSessions.map((session) => {
                const isReading = session.module === 'READING';
                const isListening = session.module === 'LISTENING';
                const isSpeaking = session.module === 'SPEAKING';
                const moduleStyles = isSpeaking
                  ? 'bg-indigo-100'
                  : isListening
                    ? 'bg-purple-100'
                    : isReading
                      ? 'bg-green-100'
                      : 'bg-blue-100';
                const scoreColor = isSpeaking
                  ? 'text-indigo-600'
                  : isListening
                    ? 'text-purple-600'
                    : isReading
                      ? 'text-green-600'
                      : 'text-blue-600';
                const tagStyles = isSpeaking
                  ? 'bg-indigo-100 text-indigo-700'
                  : isListening
                    ? 'bg-purple-100 text-purple-700'
                    : isReading
                      ? 'bg-green-100 text-green-700'
                      : 'bg-slate-100 text-slate-600';

                return (
                  <div
                    key={session.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${moduleStyles}`}
                    >
                      {isSpeaking ? (
                        <svg
                          className="h-5 w-5 text-indigo-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                          />
                        </svg>
                      ) : isListening ? (
                        <svg
                          className="h-5 w-5 text-purple-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                        </svg>
                      ) : isReading ? (
                        <svg
                          className="h-5 w-5 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5 text-blue-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{session.title}</span>
                        <span className={`rounded px-2 py-0.5 text-xs ${tagStyles}`}>
                          {formatTaskType(session.type)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-slate-500">{session.prompt}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      {session.bandScore !== null && (
                        <div className="text-right">
                          <div className={`text-lg font-bold ${scoreColor}`}>
                            {session.bandScore}
                          </div>
                          <div className="text-xs text-slate-500">Band Score</div>
                        </div>
                      )}
                      <div className="text-right text-sm text-slate-500">
                        {formatDate(session.completedAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Study Plan CTA */}
        <div className="mt-8">
          <Link
            href="/study-plan"
            className="group block rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-6 transition-all hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Personalized Study Plan</h3>
                  <p className="text-slate-600">
                    Get an AI-generated study plan tailored to your target band and test date
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-amber-500/25 transition-all group-hover:bg-amber-600 group-hover:shadow-xl">
                Get Started
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Practice Modules */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Practice Modules</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/writing"
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Writing Practice</h3>
                  <p className="text-sm text-slate-500">Task 1 & Task 2 with AI feedback</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">20-40 min per task</span>
                <span className="flex items-center gap-1 text-sm font-medium text-blue-600">
                  Start
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </Link>

            <Link
              href="/reading"
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-green-200 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 transition-colors group-hover:bg-green-600 group-hover:text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Reading Practice</h3>
                  <p className="text-sm text-slate-500">Passages with auto-scoring</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">60 min per passage</span>
                <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                  Start
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </Link>

            <Link
              href="/listening"
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-purple-200 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Listening Practice</h3>
                  <p className="text-sm text-slate-500">Audio sections with auto-scoring</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">30 min per section</span>
                <span className="flex items-center gap-1 text-sm font-medium text-purple-600">
                  Start
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </Link>

            <Link
              href="/speaking"
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-indigo-200 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Speaking Practice</h3>
                  <p className="text-sm text-slate-500">Record & get AI feedback</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">15 min per session</span>
                <span className="flex items-center gap-1 text-sm font-medium text-indigo-600">
                  Start
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Mock Test CTA */}
        <div className="mt-8">
          <Link
            href="/mock-test"
            className="group block rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 p-6 transition-all hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Full Mock Test</h3>
                  <p className="text-slate-600">
                    Take a complete IELTS test with all 4 sections under real exam conditions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 font-semibold text-white shadow-lg shadow-rose-500/25 transition-all group-hover:bg-rose-600 group-hover:shadow-xl">
                Start Test
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtitle,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: 'blue' | 'indigo' | 'amber' | 'green';
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${colorClasses[color]}`}>{icon}</div>
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <div className="mt-3">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function formatTaskType(type: string): string {
  switch (type) {
    case 'TASK1_ACADEMIC':
      return 'Task 1 Academic';
    case 'TASK1_GENERAL':
      return 'Task 1 General';
    case 'TASK2':
      return 'Task 2';
    case 'READING_PASSAGE':
      return 'Reading';
    case 'LISTENING_SECTION':
      return 'Listening';
    case 'SPEAKING_PART1':
      return 'Part 1';
    case 'SPEAKING_PART2':
      return 'Part 2';
    case 'SPEAKING_PART3':
      return 'Part 3';
    default:
      return type;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      if (!res.ok) {
        throw new Error('Failed to open billing portal');
      }
      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error opening billing portal:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
    >
      {loading ? 'Loading...' : 'Manage Billing'}
    </button>
  );
}
