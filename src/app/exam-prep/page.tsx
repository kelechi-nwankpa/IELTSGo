'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Exam Day Checklist Items
const CHECKLIST_ITEMS = [
  {
    category: 'Documents',
    items: [
      { id: 'passport', label: 'Valid passport or national ID (same as registration)' },
      { id: 'confirmation', label: 'Test confirmation email/letter printed' },
      { id: 'photo', label: 'Recent passport-sized photo (if required by test center)' },
    ],
  },
  {
    category: 'Equipment',
    items: [
      { id: 'pencils', label: 'Several HB pencils (wooden, not mechanical)' },
      { id: 'eraser', label: 'Good quality eraser' },
      { id: 'sharpener', label: 'Pencil sharpener' },
      { id: 'watch', label: 'Analog watch (no smart features) - optional but helpful' },
    ],
  },
  {
    category: 'Preparation',
    items: [
      { id: 'sleep', label: 'Get 7-8 hours of sleep the night before' },
      { id: 'breakfast', label: 'Eat a nutritious breakfast' },
      { id: 'water', label: 'Stay hydrated (water bottle for breaks)' },
      { id: 'clothes', label: 'Wear comfortable, layered clothing' },
      { id: 'route', label: 'Know your route to the test center' },
      { id: 'arrive', label: 'Plan to arrive 30 minutes early' },
    ],
  },
  {
    category: 'On Test Day',
    items: [
      { id: 'phone', label: 'Turn off and store your phone (will be collected)' },
      { id: 'bathroom', label: 'Use the bathroom before the test starts' },
      { id: 'listen', label: 'Listen carefully to all instructions' },
      { id: 'calm', label: 'Stay calm - you have prepared for this!' },
    ],
  },
];

// Time Management Tips
const TIME_TIPS = {
  listening: [
    {
      title: 'Use the reading time wisely',
      description:
        'Before each section plays, quickly scan the questions to know what information to listen for.',
    },
    {
      title: "Don't get stuck",
      description:
        "If you miss an answer, move on. You won't hear it again, and dwelling will cause you to miss more.",
    },
    {
      title: 'Write answers immediately',
      description:
        'Write your answers on the question paper as you hear them. You get 10 minutes at the end to transfer.',
    },
    {
      title: 'Check spelling during transfer',
      description:
        'Use the 10-minute transfer time to double-check your spelling and that answers are in the right place.',
    },
  ],
  reading: [
    {
      title: 'Allocate time per passage',
      description:
        'Spend roughly 20 minutes per passage. Passage 3 is usually hardest, so watch your time.',
    },
    {
      title: 'Skim first, then scan',
      description:
        'Quickly skim the passage for main ideas (2-3 minutes), then scan for specific answers.',
    },
    {
      title: "Don't read every word",
      description:
        "You don't need to understand everything. Focus on finding the information that answers the questions.",
    },
    {
      title: 'Answer all questions',
      description:
        "Never leave a blank. If you're running out of time, make educated guesses - there's no penalty.",
    },
  ],
  writing: [
    {
      title: 'Stick to the time split',
      description: 'Task 1: 20 minutes maximum. Task 2: 40 minutes. Task 2 is worth twice as much.',
    },
    {
      title: 'Plan before writing',
      description:
        'Spend 3-5 minutes planning each task. A clear structure will save time and improve coherence.',
    },
    {
      title: 'Watch your word count',
      description:
        'Task 1: 150+ words. Task 2: 250+ words. Going under loses marks; going way over wastes time.',
    },
    {
      title: 'Leave time to review',
      description:
        'Save 2-3 minutes at the end of each task to check for basic grammar and spelling errors.',
    },
  ],
  speaking: [
    {
      title: 'Pace yourself in Part 2',
      description:
        'You have 1 minute to prepare and should speak for 1-2 minutes. Use the full time available.',
    },
    {
      title: "Don't rush",
      description:
        'Speaking too fast can hurt fluency scores. A moderate, natural pace shows confidence.',
    },
    {
      title: 'Extend your answers',
      description:
        "In Parts 1 and 3, don't give one-word answers. Aim for 2-3 sentences that show range.",
    },
    {
      title: "It's okay to pause",
      description:
        'Brief, natural pauses to think are fine. Use fillers like "Let me think..." rather than "um".',
    },
  ],
};

// Common Mistakes
const COMMON_MISTAKES = {
  listening: [
    {
      mistake: 'Reading ahead while audio plays',
      fix: 'Focus on the current section. Use the pause between sections to preview the next set of questions.',
    },
    {
      mistake: 'Writing full sentences for fill-in-blanks',
      fix: 'Only write the missing word(s). The word limit is strict (usually 1-3 words).',
    },
    {
      mistake: 'Ignoring word limits',
      fix: 'If it says "NO MORE THAN TWO WORDS", writing three words is automatically wrong.',
    },
    {
      mistake: 'Mishearing similar sounds',
      fix: "Practice distinguishing: thirteen/thirty, can/can't, numbers, and spelling variations.",
    },
  ],
  reading: [
    {
      mistake: 'Spending too long on one passage',
      fix: 'Set a timer for 20 minutes per passage. Move on even if not finished.',
    },
    {
      mistake: 'Using general knowledge instead of passage',
      fix: 'All answers must come from the text. Your opinion or knowledge is irrelevant.',
    },
    {
      mistake: 'Confusing Not Given with False',
      fix: "Not Given = passage doesn't mention it. False = passage contradicts it.",
    },
    {
      mistake: 'Not reading instructions carefully',
      fix: 'Each question set may have different rules. Always read the rubric first.',
    },
  ],
  writing: [
    {
      mistake: 'Not answering all parts of the question',
      fix: 'Underline key parts of the prompt. Make sure your essay addresses each one.',
    },
    {
      mistake: 'Memorized essays or phrases',
      fix: 'Examiners spot these immediately. Write naturally and respond to the specific question.',
    },
    {
      mistake: 'Task 1: Describing every detail',
      fix: 'Select and summarize main trends. Compare and contrast key features, not everything.',
    },
    {
      mistake: 'Task 2: No clear position',
      fix: 'State your opinion clearly in the introduction and maintain it throughout.',
    },
  ],
  speaking: [
    {
      mistake: 'One-word or very short answers',
      fix: 'Always extend your responses. Give reasons, examples, or additional details.',
    },
    {
      mistake: 'Memorized responses',
      fix: 'Examiners can tell. It sounds unnatural and you may not answer the actual question.',
    },
    {
      mistake: 'Correcting every small error',
      fix: 'Self-correction is okay occasionally, but frequent corrections hurt fluency.',
    },
    {
      mistake: 'Speaking off-topic in Part 2',
      fix: "Follow the cue card points. They're there to help structure your 2-minute talk.",
    },
  ],
};

type Module = 'listening' | 'reading' | 'writing' | 'speaking';

export default function ExamPrepPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'checklist' | 'tips' | 'mistakes' | 'revision'>(
    'checklist'
  );
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [selectedModule, setSelectedModule] = useState<Module>('listening');
  const [weakAreas, setWeakAreas] = useState<{ module: string; avgBand: number }[]>([]);
  const [loadingRevision, setLoadingRevision] = useState(false);

  // Load checklist state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('examChecklist');
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    }
  }, []);

  // Save checklist state to localStorage
  useEffect(() => {
    localStorage.setItem('examChecklist', JSON.stringify(checkedItems));
  }, [checkedItems]);

  // Load weak areas for revision mode
  useEffect(() => {
    if (activeTab === 'revision' && session?.user) {
      loadWeakAreas();
    }
  }, [activeTab, session]);

  const loadWeakAreas = async () => {
    setLoadingRevision(true);
    try {
      const response = await fetch('/api/progress/band-trends');
      if (response.ok) {
        const data = await response.json();
        // Calculate average bands and find weak areas
        const moduleAverages: { module: string; avgBand: number }[] = [];

        for (const moduleName of ['WRITING', 'SPEAKING', 'READING', 'LISTENING']) {
          const moduleData = data[moduleName.toLowerCase()];
          if (moduleData && moduleData.length > 0) {
            const avg =
              moduleData.reduce((sum: number, d: { band: number }) => sum + d.band, 0) /
              moduleData.length;
            moduleAverages.push({ module: moduleName, avgBand: Math.round(avg * 2) / 2 });
          }
        }

        // Sort by band (lowest first) to identify weak areas
        moduleAverages.sort((a, b) => a.avgBand - b.avgBand);
        setWeakAreas(moduleAverages);
      }
    } catch (error) {
      console.error('Failed to load weak areas:', error);
    } finally {
      setLoadingRevision(false);
    }
  };

  const toggleCheckItem = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getChecklistProgress = () => {
    const total = CHECKLIST_ITEMS.reduce((sum, cat) => sum + cat.items.length, 0);
    const checked = Object.values(checkedItems).filter(Boolean).length;
    return { total, checked, percent: Math.round((checked / total) * 100) };
  };

  const resetChecklist = () => {
    setCheckedItems({});
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  const progress = getChecklistProgress();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/dashboard"
                className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
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
              <h1 className="text-2xl font-bold text-slate-900">Exam Day Preparation</h1>
              <p className="mt-1 text-slate-600">
                Everything you need to be ready for your IELTS test
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-2 overflow-x-auto">
            {[
              { id: 'checklist', label: 'Checklist', icon: '✓' },
              { id: 'tips', label: 'Time Tips', icon: '⏱' },
              { id: 'mistakes', label: 'Common Mistakes', icon: '⚠' },
              { id: 'revision', label: 'Quick Review', icon: '📝' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Exam Day Checklist</h2>
                  <p className="text-sm text-slate-500">
                    {progress.checked} of {progress.total} items completed
                  </p>
                </div>
                <button
                  onClick={resetChecklist}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  Reset
                </button>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              {progress.percent === 100 && (
                <p className="mt-3 text-center text-green-600">
                  You&apos;re all set for exam day! Good luck! 🎉
                </p>
              )}
            </div>

            {/* Checklist Categories */}
            {CHECKLIST_ITEMS.map((category) => (
              <div key={category.category} className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-semibold text-slate-900">{category.category}</h3>
                <div className="space-y-3">
                  {category.items.map((item) => (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={checkedItems[item.id] || false}
                        onChange={() => toggleCheckItem(item.id)}
                        className="mt-0.5 h-5 w-5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                      />
                      <span
                        className={
                          checkedItems[item.id] ? 'text-slate-400 line-through' : 'text-slate-700'
                        }
                      >
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {/* Print Button */}
            <div className="text-center">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print this checklist
              </button>
            </div>
          </div>
        )}

        {/* Time Management Tips Tab */}
        {activeTab === 'tips' && (
          <div className="space-y-6">
            {/* Module Selector */}
            <div className="flex flex-wrap gap-2">
              {(['listening', 'reading', 'writing', 'speaking'] as Module[]).map((module) => (
                <button
                  key={module}
                  onClick={() => setSelectedModule(module)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    selectedModule === module
                      ? module === 'listening'
                        ? 'bg-purple-600 text-white'
                        : module === 'reading'
                          ? 'bg-green-600 text-white'
                          : module === 'writing'
                            ? 'bg-blue-600 text-white'
                            : 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {module}
                </button>
              ))}
            </div>

            {/* Tips */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 capitalize">
                {selectedModule} Time Management
              </h2>
              <div className="space-y-4">
                {TIME_TIPS[selectedModule].map((tip, index) => (
                  <div key={index} className="flex gap-4 rounded-lg bg-slate-50 p-4">
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                        selectedModule === 'listening'
                          ? 'bg-purple-500'
                          : selectedModule === 'reading'
                            ? 'bg-green-500'
                            : selectedModule === 'writing'
                              ? 'bg-blue-500'
                              : 'bg-indigo-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{tip.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Reference */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">Quick Time Reference</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                  <div className="font-medium text-purple-900">Listening</div>
                  <div className="mt-1 text-sm text-purple-700">30 min + 10 min transfer</div>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="font-medium text-green-900">Reading</div>
                  <div className="mt-1 text-sm text-green-700">60 min (20 min per passage)</div>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="font-medium text-blue-900">Writing</div>
                  <div className="mt-1 text-sm text-blue-700">60 min (20 + 40 min split)</div>
                </div>
                <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                  <div className="font-medium text-indigo-900">Speaking</div>
                  <div className="mt-1 text-sm text-indigo-700">11-14 min (3 parts)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Common Mistakes Tab */}
        {activeTab === 'mistakes' && (
          <div className="space-y-6">
            {/* Module Selector */}
            <div className="flex flex-wrap gap-2">
              {(['listening', 'reading', 'writing', 'speaking'] as Module[]).map((module) => (
                <button
                  key={module}
                  onClick={() => setSelectedModule(module)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    selectedModule === module
                      ? module === 'listening'
                        ? 'bg-purple-600 text-white'
                        : module === 'reading'
                          ? 'bg-green-600 text-white'
                          : module === 'writing'
                            ? 'bg-blue-600 text-white'
                            : 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {module}
                </button>
              ))}
            </div>

            {/* Mistakes */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 capitalize">
                Common {selectedModule} Mistakes
              </h2>
              <div className="space-y-4">
                {COMMON_MISTAKES[selectedModule].map((item, index) => (
                  <div key={index} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                        <svg
                          className="h-4 w-4 text-red-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-red-900">{item.mistake}</h3>
                      </div>
                    </div>
                    <div className="mt-3 flex items-start gap-3 pl-9">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-slate-600">{item.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning Banner */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900">Remember</h3>
                  <p className="mt-1 text-sm text-amber-800">
                    Awareness is the first step. If you&apos;ve been making any of these mistakes
                    during practice, consciously work on avoiding them before your exam.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Review Tab */}
        {activeTab === 'revision' && (
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">Your Progress Overview</h2>

              {loadingRevision ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                </div>
              ) : weakAreas.length > 0 ? (
                <>
                  <p className="mb-4 text-slate-600">
                    Based on your practice history, here&apos;s how you&apos;re doing:
                  </p>
                  <div className="space-y-3">
                    {weakAreas.map((area, index) => (
                      <div
                        key={area.module}
                        className="flex items-center justify-between rounded-lg bg-slate-50 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
                              index === 0
                                ? 'bg-red-500'
                                : index === 1
                                  ? 'bg-amber-500'
                                  : 'bg-green-500'
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="font-medium text-slate-900 capitalize">
                            {area.module.toLowerCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-lg font-bold ${
                              area.avgBand >= 7
                                ? 'text-green-600'
                                : area.avgBand >= 6
                                  ? 'text-amber-600'
                                  : 'text-red-600'
                            }`}
                          >
                            {area.avgBand}
                          </span>
                          <span className="text-sm text-slate-500">avg band</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Focus Recommendation */}
                  {weakAreas.length > 0 && weakAreas[0].avgBand < 7 && (
                    <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <h3 className="font-semibold text-blue-900">Recommended Focus</h3>
                      <p className="mt-1 text-sm text-blue-700">
                        Your{' '}
                        <span className="font-medium">{weakAreas[0].module.toLowerCase()}</span>{' '}
                        section could use some extra practice. Consider reviewing the time
                        management tips and common mistakes for this module.
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Link
                          href={`/${weakAreas[0].module.toLowerCase()}`}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Practice {weakAreas[0].module.toLowerCase()}
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedModule(weakAreas[0].module.toLowerCase() as Module);
                            setActiveTab('tips');
                          }}
                          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                        >
                          View Tips
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-8 text-center">
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-600">
                    Complete some practice sessions to see your progress analysis here.
                  </p>
                  <Link
                    href="/dashboard"
                    className="mt-4 inline-block text-blue-600 hover:underline"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Practice Links */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-slate-900">Quick Practice</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  href="/writing"
                  className="rounded-lg border border-blue-200 bg-blue-50 p-4 transition-colors hover:bg-blue-100"
                >
                  <div className="font-medium text-blue-900">Writing Practice</div>
                  <div className="mt-1 text-sm text-blue-700">Task 1 & Task 2 with AI feedback</div>
                </Link>
                <Link
                  href="/speaking"
                  className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 transition-colors hover:bg-indigo-100"
                >
                  <div className="font-medium text-indigo-900">Speaking Practice</div>
                  <div className="mt-1 text-sm text-indigo-700">All 3 parts with evaluation</div>
                </Link>
                <Link
                  href="/reading"
                  className="rounded-lg border border-green-200 bg-green-50 p-4 transition-colors hover:bg-green-100"
                >
                  <div className="font-medium text-green-900">Reading Practice</div>
                  <div className="mt-1 text-sm text-green-700">
                    Passages with all question types
                  </div>
                </Link>
                <Link
                  href="/listening"
                  className="rounded-lg border border-purple-200 bg-purple-50 p-4 transition-colors hover:bg-purple-100"
                >
                  <div className="font-medium text-purple-900">Listening Practice</div>
                  <div className="mt-1 text-sm text-purple-700">Audio exercises by section</div>
                </Link>
              </div>
            </div>

            {/* Mock Test CTA */}
            <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-sm">
              <h3 className="text-lg font-semibold">Ready for a Full Test?</h3>
              <p className="mt-1 text-blue-100">
                Take a complete mock test to simulate real exam conditions.
              </p>
              <Link
                href="/mock-test"
                className="mt-4 inline-block rounded-lg bg-white px-6 py-2 font-medium text-blue-600 transition-colors hover:bg-blue-50"
              >
                Start Mock Test
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
