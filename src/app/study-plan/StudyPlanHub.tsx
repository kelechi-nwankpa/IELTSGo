'use client';

import Link from 'next/link';
import { ProgressDashboard } from '@/components/progress';

export function StudyPlanHub() {
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
            <span className="font-medium text-slate-700">Study Plan</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              Dashboard
            </Link>
            <Link
              href="/study-plan/setup"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl"
            >
              Create Study Plan
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Your Study Journey</h1>
          <p className="mt-1 text-slate-600">
            Track your progress and stay on track to reach your target band.
          </p>
        </div>

        {/* Progress Dashboard */}
        <ProgressDashboard />

        {/* Quick Actions */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link
            href="/study-plan/setup"
            className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-blue-200 hover:shadow-lg"
          >
            <div className="mb-3 text-3xl">📋</div>
            <h3 className="font-semibold text-slate-900">Create New Plan</h3>
            <p className="mt-1 text-sm text-slate-500">
              Set your target and get a personalized study plan.
            </p>
          </Link>

          <Link
            href="/study-plan/diagnostic"
            className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-purple-200 hover:shadow-lg"
          >
            <div className="mb-3 text-3xl">🎯</div>
            <h3 className="font-semibold text-slate-900">Take Diagnostic</h3>
            <p className="mt-1 text-sm text-slate-500">
              Assess your current level across all modules.
            </p>
          </Link>

          <Link
            href="/study-plan/tasks"
            className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-green-200 hover:shadow-lg"
          >
            <div className="mb-3 text-3xl">✅</div>
            <h3 className="font-semibold text-slate-900">Today&apos;s Tasks</h3>
            <p className="mt-1 text-sm text-slate-500">
              View and complete your daily practice tasks.
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
