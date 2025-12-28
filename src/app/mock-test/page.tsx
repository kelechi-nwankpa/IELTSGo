import { Metadata } from 'next';
import Link from 'next/link';
import { MockTestHub } from './MockTestHub';

export const metadata: Metadata = {
  title: 'Mock Test | IELTSGo',
  description: 'Take a full IELTS mock test with realistic timing and AI-powered evaluation.',
};

export default function MockTestPage() {
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
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              Dashboard
            </Link>
            <Link
              href="/study-plan"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              Study Plan
            </Link>
            <Link
              href="/exam-prep"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              Exam Prep
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <MockTestHub />
      </main>
    </div>
  );
}
