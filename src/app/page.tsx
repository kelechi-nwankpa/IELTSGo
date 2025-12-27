import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-slate-100 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
              <span className="text-lg font-bold text-white">G</span>
            </div>
            <span className="text-xl font-bold text-slate-900">IELTSGo</span>
          </Link>
          <nav className="flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Dashboard
                </Link>
                <Link
                  href="/writing"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
                >
                  Practice Now
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
                >
                  Start Free
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pt-32 pb-20">
          {/* Decorative elements */}
          <div className="pointer-events-none absolute top-20 left-1/4 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute top-40 right-1/4 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col items-center text-center">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                </span>
                <span className="text-sm font-medium text-amber-700">
                  3 free evaluations to start
                </span>
              </div>

              <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Finally understand{' '}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  why you&apos;re stuck
                </span>{' '}
                at your current band
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
                Stop wondering what&apos;s holding you back. See exactly which criteria are keeping
                you from Band 7+ and get specific steps to fix them — without expensive tutors.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                {session ? (
                  <Link
                    href="/writing"
                    className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-2xl hover:shadow-blue-500/30"
                  >
                    Start Writing
                    <svg
                      className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/signup"
                      className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:shadow-2xl hover:shadow-blue-500/30"
                    >
                      Try it free
                      <svg
                        className="h-5 w-5 transition-transform group-hover:translate-x-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </Link>
                    <Link
                      href="/auth/signin"
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                    >
                      Sign in
                    </Link>
                  </>
                )}
              </div>

              <p className="mt-4 text-sm text-slate-500">No credit card required</p>
            </div>

            {/* Product Mockup */}
            <div className="relative mx-auto mt-16 max-w-4xl">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-slate-300" />
                    <div className="h-3 w-3 rounded-full bg-slate-300" />
                    <div className="h-3 w-3 rounded-full bg-slate-300" />
                  </div>
                  <div className="flex-1 text-center text-xs text-slate-400">ieltsgo.app</div>
                </div>
                {/* Mockup content */}
                <div className="grid md:grid-cols-2">
                  {/* Writing area */}
                  <div className="border-r border-slate-100 p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900">Task 2 Essay</span>
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                        287 words
                      </span>
                    </div>
                    <div className="space-y-2 text-sm leading-relaxed text-slate-600">
                      <p>
                        In recent years, the debate around remote work has gained significant
                        attention...
                      </p>
                      <p className="text-slate-400">
                        [Your essay continues here with real-time word count...]
                      </p>
                    </div>
                  </div>
                  {/* Feedback area */}
                  <div className="bg-gradient-to-br from-slate-50 to-white p-6">
                    <div className="mb-4 text-sm font-medium text-slate-900">Your Results</div>
                    <div className="space-y-3">
                      <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-600">Overall Band</span>
                          <span className="text-lg font-bold text-blue-600">7.0</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-green-50 p-2 text-center">
                          <div className="text-xs text-green-600">Task Response</div>
                          <div className="font-semibold text-green-700">7.0</div>
                        </div>
                        <div className="rounded-lg bg-blue-50 p-2 text-center">
                          <div className="text-xs text-blue-600">Coherence</div>
                          <div className="font-semibold text-blue-700">7.0</div>
                        </div>
                        <div className="rounded-lg bg-purple-50 p-2 text-center">
                          <div className="text-xs text-purple-600">Vocabulary</div>
                          <div className="font-semibold text-purple-700">7.5</div>
                        </div>
                        <div className="rounded-lg bg-amber-50 p-2 text-center">
                          <div className="text-xs text-amber-600">Grammar</div>
                          <div className="font-semibold text-amber-700">6.5</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative gradient */}
              <div className="absolute -inset-x-20 -bottom-10 h-40 bg-gradient-to-t from-white via-white/80 to-transparent" />
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="border-y border-slate-100 bg-white py-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col items-center justify-center gap-8 md:flex-row md:gap-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">10,000+</div>
                <div className="text-sm text-slate-500">Essays evaluated</div>
              </div>
              <div className="hidden h-8 w-px bg-slate-200 md:block" />
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900">Band 7+</div>
                <div className="text-sm text-slate-500">Average improvement</div>
              </div>
              <div className="hidden h-8 w-px bg-slate-200 md:block" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-3xl font-bold text-slate-900">
                  4.9
                  <svg className="h-6 w-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="text-sm text-slate-500">User rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                See your band score improve week by week
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Know exactly what&apos;s holding you back. Fix it. Watch your scores climb.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Main feature - spans 2 cols */}
              <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white md:col-span-2">
                <div className="relative z-10">
                  <div className="mb-4 inline-flex rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold">Know Exactly Where You Stand</h3>
                  <p className="mt-2 max-w-md text-blue-100">
                    Get scored on the same four criteria real examiners use — so you know precisely
                    which area to focus on to reach your target band.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {['Task Response', 'Coherence', 'Vocabulary', 'Grammar'].map((criteria) => (
                      <span
                        key={criteria}
                        className="rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur-sm"
                      >
                        {criteria}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10" />
                <div className="absolute -top-10 right-20 h-20 w-20 rounded-full bg-white/10" />
              </div>

              {/* Instant feedback */}
              <div className="group rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-lg">
                <div className="mb-4 inline-flex rounded-xl bg-amber-100 p-3">
                  <svg
                    className="h-6 w-6 text-amber-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Practice Daily, Improve Faster</h3>
                <p className="mt-2 text-slate-600">
                  No more waiting weeks for tutor feedback. Practice as much as you want and see
                  results immediately.
                </p>
              </div>

              {/* Specific suggestions */}
              <div className="group rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-lg">
                <div className="mb-4 inline-flex rounded-xl bg-green-100 p-3">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Stop Repeating the Same Mistakes
                </h3>
                <p className="mt-2 text-slate-600">
                  Get told exactly what&apos;s costing you marks — and how to fix it in your next
                  essay.
                </p>
              </div>

              {/* Real prompts */}
              <div className="group rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-lg">
                <div className="mb-4 inline-flex rounded-xl bg-purple-100 p-3">
                  <svg
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Walk Into the Exam Confident</h3>
                <p className="mt-2 text-slate-600">
                  Practice with prompts that mirror real exam questions — no surprises on test day.
                </p>
              </div>

              {/* Speaking feature */}
              <div className="relative overflow-hidden rounded-3xl border border-green-200 bg-green-50/50 p-6 md:col-span-2">
                <div className="flex items-start gap-4">
                  <div className="inline-flex rounded-xl bg-green-100 p-3">
                    <svg
                      className="h-6 w-6 text-green-600"
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
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        Practice Speaking Daily Without a Tutor
                      </h3>
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">
                        Available Now
                      </span>
                    </div>
                    <p className="mt-1 text-slate-600">
                      No need to book expensive sessions. Practice all three speaking parts anytime,
                      get feedback on fluency, vocabulary, and grammar — and track your progress.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-slate-900 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                From confused to confident in three steps
              </h2>
              <p className="mt-4 text-lg text-slate-400">
                Finally know what examiners are looking for
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="relative">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
                  1
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">Choose your challenge</h3>
                <p className="text-slate-400">
                  Pick a writing or speaking task that matches what you&apos;ll face on exam day.
                </p>
                {/* Connector line */}
                <div className="absolute top-6 right-0 hidden h-0.5 w-1/3 bg-gradient-to-r from-blue-500/50 to-transparent md:block" />
              </div>

              <div className="relative">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-xl font-bold text-white shadow-lg shadow-indigo-500/30">
                  2
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">Give it your best shot</h3>
                <p className="text-slate-400">
                  Write or speak your response with a timer — just like the real test conditions.
                </p>
                {/* Connector line */}
                <div className="absolute top-6 right-0 hidden h-0.5 w-1/3 bg-gradient-to-r from-purple-500/50 to-transparent md:block" />
              </div>

              <div>
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-xl font-bold text-white shadow-lg shadow-purple-500/30">
                  3
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">See exactly what to fix</h3>
                <p className="text-slate-400">
                  Get your band score breakdown and specific steps to improve — know exactly what to
                  work on next.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-24">
          <div className="mx-auto max-w-4xl px-6">
            <figure className="text-center">
              <div className="mb-6 flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-6 w-6 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-2xl font-medium text-slate-900 sm:text-3xl">
                &ldquo;I went from Band 6.0 to 7.5 in just two months. The feedback is incredibly
                detailed — way better than what I got from my expensive tutor.&rdquo;
              </blockquote>
              <figcaption className="mt-6">
                <div className="font-semibold text-slate-900">Sarah Chen</div>
                <div className="text-slate-500">
                  Achieved Band 7.5, now studying at Melbourne University
                </div>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-8 py-16 text-center">
              {/* Decorative elements */}
              <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/10" />
              <div className="absolute -right-10 -bottom-10 h-60 w-60 rounded-full bg-white/10" />

              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Ready to break through your plateau?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-blue-100">
                  Join thousands of students who finally understood what was holding them back.
                  Start with 3 free evaluations — no credit card needed.
                </p>
                <div className="mt-8">
                  {session ? (
                    <Link
                      href="/writing"
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl transition-all hover:bg-blue-50"
                    >
                      Go to Practice
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </Link>
                  ) : (
                    <Link
                      href="/auth/signup"
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl transition-all hover:bg-blue-50"
                    >
                      Start Free Practice
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <span className="text-sm font-bold text-white">G</span>
              </div>
              <span className="text-lg font-bold text-slate-900">IELTSGo</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link href="#" className="hover:text-slate-900">
                Privacy
              </Link>
              <Link href="#" className="hover:text-slate-900">
                Terms
              </Link>
              <Link href="#" className="hover:text-slate-900">
                Contact
              </Link>
            </div>
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} IELTSGo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
