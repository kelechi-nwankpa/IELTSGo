import Link from 'next/link';

export default function WritingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Dashboard
        </Link>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">IELTS Writing Practice</h1>
          <p className="mt-2 text-gray-600">
            Choose your task type to begin practicing with AI-powered feedback
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Task 1 Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                Task 1
              </span>
              <span className="text-sm text-gray-500">150+ words, 20 minutes</span>
            </div>

            <h2 className="mb-3 text-xl font-semibold text-gray-800">Task 1 Writing</h2>

            <div className="mb-6 space-y-3">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <h3 className="mb-1 font-medium text-gray-700">Academic</h3>
                <p className="text-sm text-gray-500">
                  Describe charts, graphs, tables, maps, or process diagrams
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <h3 className="mb-1 font-medium text-gray-700">General Training</h3>
                <p className="text-sm text-gray-500">
                  Write formal, semi-formal, or informal letters
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/writing/task1?type=academic"
                className="flex-1 rounded-lg bg-purple-600 py-2 text-center font-medium text-white transition-colors hover:bg-purple-700"
              >
                Academic
              </Link>
              <Link
                href="/writing/task1?type=general"
                className="flex-1 rounded-lg border border-purple-200 bg-white py-2 text-center font-medium text-purple-600 transition-colors hover:bg-purple-50"
              >
                General
              </Link>
            </div>
          </div>

          {/* Task 2 Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                Task 2
              </span>
              <span className="text-sm text-gray-500">250+ words, 40 minutes</span>
            </div>

            <h2 className="mb-3 text-xl font-semibold text-gray-800">Task 2 Essay</h2>

            <div className="mb-6 space-y-3">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <h3 className="mb-1 font-medium text-gray-700">Academic</h3>
                <p className="text-sm text-gray-500">
                  Write essays on abstract topics like education, technology, and society
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <h3 className="mb-1 font-medium text-gray-700">General Training</h3>
                <p className="text-sm text-gray-500">Write essays on practical, everyday topics</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/writing/task2?type=academic"
                className="flex-1 rounded-lg bg-blue-600 py-2 text-center font-medium text-white transition-colors hover:bg-blue-700"
              >
                Academic
              </Link>
              <Link
                href="/writing/task2?type=general"
                className="flex-1 rounded-lg border border-blue-200 bg-white py-2 text-center font-medium text-blue-600 transition-colors hover:bg-blue-50"
              >
                General
              </Link>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Writing Tips</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Plan before you write</h4>
                <p className="text-sm text-gray-500">Spend 2-3 minutes planning your structure</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Use paragraphs effectively</h4>
                <p className="text-sm text-gray-500">One main idea per paragraph</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Check word count</h4>
                <p className="text-sm text-gray-500">Task 1: 150+, Task 2: 250+ words</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Leave time to review</h4>
                <p className="text-sm text-gray-500">Save 2-3 minutes for proofreading</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
