'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { TestTimer, TestProgress, SectionTransition } from '@/components/mock-test';

interface WritingTask {
  id: string;
  taskNumber: 1 | 2;
  title: string;
  prompt: string;
  topic?: string;
  imageUrl?: string;
  imageDescription?: string;
  minWords: number;
  recommendedTime: number; // minutes
}

interface SectionData {
  section: string;
  timing: {
    startedAt: string;
    deadline: string;
    durationMinutes: number;
  };
  content: {
    task1: WritingTask;
    task2: WritingTask;
  } | null;
  contentId: string | null;
}

export default function MockTestWritingPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  const [sectionData, setSectionData] = useState<SectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  // Current task state
  const [currentTask, setCurrentTask] = useState<1 | 2>(1);
  const [task1Essay, setTask1Essay] = useState('');
  const [task2Essay, setTask2Essay] = useState('');
  const [task1TimeSpent, setTask1TimeSpent] = useState(0);
  const [task2TimeSpent, setTask2TimeSpent] = useState(0);
  const [taskStartTime, setTaskStartTime] = useState<Date | null>(null);

  // Fetch section content
  useEffect(() => {
    async function startSection() {
      try {
        const response = await fetch(`/api/mock-test/${testId}/section/writing/start`, {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Failed to start writing section');
          return;
        }

        const data = await response.json();

        // Use API-provided content if available, otherwise use placeholders
        const apiContent = data.content as {
          task1?: WritingTask;
          task2?: WritingTask;
        } | null;

        const sectionContent: SectionData = {
          section: data.section,
          timing: data.timing,
          contentId: data.contentId,
          content: apiContent
            ? {
                task1: {
                  id: apiContent.task1?.id || 'task1-placeholder',
                  taskNumber: 1,
                  title: apiContent.task1?.title || 'Task 1',
                  prompt: apiContent.task1?.prompt || 'Task 1 writing prompt',
                  topic: apiContent.task1?.topic,
                  imageUrl: apiContent.task1?.imageUrl,
                  imageDescription: apiContent.task1?.imageDescription,
                  minWords: apiContent.task1?.minWords || 150,
                  recommendedTime: apiContent.task1?.recommendedTime || 20,
                },
                task2: {
                  id: apiContent.task2?.id || 'task2-placeholder',
                  taskNumber: 2,
                  title: apiContent.task2?.title || 'Task 2',
                  prompt: apiContent.task2?.prompt || 'Task 2 writing prompt',
                  topic: apiContent.task2?.topic,
                  minWords: apiContent.task2?.minWords || 250,
                  recommendedTime: apiContent.task2?.recommendedTime || 40,
                },
              }
            : {
                task1: {
                  id: 'task1-placeholder',
                  taskNumber: 1,
                  title: 'Task 1',
                  prompt:
                    'The chart below shows information about changes in average house prices in five different cities between 1990 and 2002 compared with the average house prices in 1989.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.',
                  topic: 'House Prices',
                  minWords: 150,
                  recommendedTime: 20,
                },
                task2: {
                  id: 'task2-placeholder',
                  taskNumber: 2,
                  title: 'Task 2',
                  prompt:
                    'Some people believe that university students should be required to attend classes. Others believe that going to classes should be optional for students.\n\nWhich point of view do you agree with? Use specific reasons and details to explain your answer.',
                  topic: 'Education',
                  minWords: 250,
                  recommendedTime: 40,
                },
              },
        };

        setSectionData(sectionContent);
        setTaskStartTime(new Date());
      } catch {
        setError('Failed to connect to server');
      } finally {
        setIsLoading(false);
      }
    }

    startSection();
  }, [testId]);

  const countWords = useCallback((text: string) => {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  }, []);

  const handleTimeUp = useCallback(async () => {
    // Auto-submit when time is up - handleSubmit is intentionally not in deps
    // as we want to capture the current state at the time of timeout
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/mock-test/${testId}/section/writing/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: sectionData?.contentId || 'mock-test-writing',
          answers: {
            task1: {
              essay: task1Essay,
              wordCount: countWords(task1Essay),
              timeSpent: task1TimeSpent,
              promptId: sectionData?.content?.task1?.id,
              prompt: sectionData?.content?.task1?.prompt,
            },
            task2: {
              essay: task2Essay,
              wordCount: countWords(task2Essay),
              timeSpent: task2TimeSpent,
              promptId: sectionData?.content?.task2?.id,
              prompt: sectionData?.content?.task2?.prompt,
            },
          },
          timeSpent: task1TimeSpent + task2TimeSpent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isTestComplete) {
          router.push(`/mock-test/${testId}/results`);
        } else {
          setShowTransition(true);
        }
      }
    } catch {
      // Silently fail on auto-submit timeout
    } finally {
      setIsSubmitting(false);
    }
  }, [
    testId,
    sectionData?.contentId,
    sectionData?.content?.task1?.id,
    sectionData?.content?.task1?.prompt,
    sectionData?.content?.task2?.id,
    sectionData?.content?.task2?.prompt,
    task1Essay,
    task2Essay,
    task1TimeSpent,
    task2TimeSpent,
    countWords,
    router,
  ]);

  const handleSwitchTask = (task: 1 | 2) => {
    // Track time spent on current task before switching
    if (taskStartTime) {
      const timeSpent = Math.floor((Date.now() - taskStartTime.getTime()) / 1000);
      if (currentTask === 1) {
        setTask1TimeSpent((prev) => prev + timeSpent);
      } else {
        setTask2TimeSpent((prev) => prev + timeSpent);
      }
    }
    setCurrentTask(task);
    setTaskStartTime(new Date());
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (isSubmitting) return;

    // Update final time spent
    if (taskStartTime) {
      const timeSpent = Math.floor((Date.now() - taskStartTime.getTime()) / 1000);
      if (currentTask === 1) {
        setTask1TimeSpent((prev) => prev + timeSpent);
      } else {
        setTask2TimeSpent((prev) => prev + timeSpent);
      }
    }

    const task1Words = countWords(task1Essay);
    const task2Words = countWords(task2Essay);

    // Warn if not auto-submit and under word counts
    if (!autoSubmit) {
      if (task1Words < 150 && task1Essay.trim()) {
        const confirm = window.confirm(
          `Task 1 has only ${task1Words} words (minimum 150). Submit anyway?`
        );
        if (!confirm) return;
      }
      if (task2Words < 250 && task2Essay.trim()) {
        const confirm = window.confirm(
          `Task 2 has only ${task2Words} words (minimum 250). Submit anyway?`
        );
        if (!confirm) return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/mock-test/${testId}/section/writing/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: sectionData?.contentId || 'mock-test-writing',
          answers: {
            task1: {
              essay: task1Essay,
              wordCount: task1Words,
              timeSpent: task1TimeSpent,
              promptId: sectionData?.content?.task1?.id,
              prompt: sectionData?.content?.task1?.prompt,
            },
            task2: {
              essay: task2Essay,
              wordCount: task2Words,
              timeSpent: task2TimeSpent,
              promptId: sectionData?.content?.task2?.id,
              prompt: sectionData?.content?.task2?.prompt,
            },
          },
          timeSpent: task1TimeSpent + task2TimeSpent,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to submit');
        return;
      }

      const data = await response.json();

      if (data.isTestComplete) {
        router.push(`/mock-test/${testId}/results`);
      } else {
        // Show transition to speaking
        setShowTransition(true);
      }
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransitionComplete = () => {
    router.push(`/mock-test/${testId}/speaking`);
  };

  if (showTransition) {
    return (
      <SectionTransition
        fromSection="WRITING"
        toSection="SPEAKING"
        onCountdownComplete={handleTransitionComplete}
        onSkipCountdown={handleTransitionComplete}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          <p className="mt-4 text-slate-600">Loading writing section...</p>
        </div>
      </div>
    );
  }

  if (error && !sectionData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 text-4xl">❌</div>
          <h2 className="text-xl font-semibold text-slate-900">{error}</h2>
          <Link
            href={`/mock-test/${testId}`}
            className="mt-4 inline-block rounded-lg bg-purple-600 px-6 py-2 text-white hover:bg-purple-700"
          >
            Back to Test
          </Link>
        </div>
      </div>
    );
  }

  const task1Words = countWords(task1Essay);
  const task2Words = countWords(task2Essay);
  const currentEssay = currentTask === 1 ? task1Essay : task2Essay;
  const setCurrentEssay = currentTask === 1 ? setTask1Essay : setTask2Essay;
  const currentTaskData =
    currentTask === 1 ? sectionData?.content?.task1 : sectionData?.content?.task2;
  const currentWordCount = currentTask === 1 ? task1Words : task2Words;
  const minWords = currentTask === 1 ? 150 : 250;

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
              <span className="text-2xl">✍️</span>
              <h1 className="text-lg font-semibold text-slate-900">Writing</h1>
            </div>
          </div>
          <div>
            {sectionData?.timing && (
              <TestTimer
                deadline={new Date(sectionData.timing.deadline)}
                onTimeUp={handleTimeUp}
                showProgress
                totalDurationMinutes={sectionData.timing.durationMinutes}
              />
            )}
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
          <TestProgress
            currentSection="WRITING"
            completedSections={['LISTENING', 'READING']}
            compact
          />
        </div>
      </div>

      {/* Task Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex">
            <button
              onClick={() => handleSwitchTask(1)}
              className={`relative px-6 py-3 text-sm font-medium transition-colors ${
                currentTask === 1 ? 'text-purple-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Task 1<span className="ml-2 text-xs text-slate-400">({task1Words} words)</span>
              {currentTask === 1 && (
                <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-purple-600" />
              )}
            </button>
            <button
              onClick={() => handleSwitchTask(2)}
              className={`relative px-6 py-3 text-sm font-medium transition-colors ${
                currentTask === 2 ? 'text-purple-600' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Task 2<span className="ml-2 text-xs text-slate-400">({task2Words} words)</span>
              {currentTask === 2 && (
                <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-purple-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Task Prompt */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
              Task {currentTask}
            </span>
            <span className="text-xs text-slate-500">
              {currentTask === 1 ? '~20 minutes • 150+ words' : '~40 minutes • 250+ words'}
            </span>
          </div>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">{currentTaskData?.title}</h2>
          <p className="whitespace-pre-wrap text-slate-700">{currentTaskData?.prompt}</p>
        </div>

        {/* Essay Editor */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <textarea
            value={currentEssay}
            onChange={(e) => setCurrentEssay(e.target.value)}
            placeholder={`Start writing your Task ${currentTask} response here...`}
            className="min-h-[400px] w-full resize-y rounded-lg border border-slate-300 p-4 font-mono text-base leading-relaxed focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
            disabled={isSubmitting}
          />

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm">
              <span
                className={`font-bold ${
                  currentWordCount === 0
                    ? 'text-slate-400'
                    : currentWordCount < minWords
                      ? 'text-amber-600'
                      : 'text-green-600'
                }`}
              >
                {currentWordCount}
              </span>
              <span className="text-slate-500"> words</span>
              {currentWordCount > 0 && currentWordCount < minWords && (
                <span className="ml-2 text-amber-600">
                  (need {minWords - currentWordCount} more)
                </span>
              )}
              {currentWordCount >= minWords && (
                <span className="ml-2 text-green-600">✓ Minimum reached</span>
              )}
            </div>

            <div className="flex gap-3">
              {currentTask === 1 && (
                <button
                  onClick={() => handleSwitchTask(2)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Continue to Task 2 →
                </button>
              )}
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting || (task1Words === 0 && task2Words === 0)}
                className="rounded-lg bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Writing Section'}
              </button>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-slate-700">Progress</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={`rounded-lg p-3 ${task1Words >= 150 ? 'bg-green-50' : 'bg-slate-50'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Task 1</span>
                {task1Words >= 150 ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-xs text-slate-400">{task1Words}/150</span>
                )}
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full transition-all ${task1Words >= 150 ? 'bg-green-500' : 'bg-purple-500'}`}
                  style={{ width: `${Math.min(100, (task1Words / 150) * 100)}%` }}
                />
              </div>
            </div>
            <div className={`rounded-lg p-3 ${task2Words >= 250 ? 'bg-green-50' : 'bg-slate-50'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Task 2</span>
                {task2Words >= 250 ? (
                  <span className="text-green-600">✓</span>
                ) : (
                  <span className="text-xs text-slate-400">{task2Words}/250</span>
                )}
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full transition-all ${task2Words >= 250 ? 'bg-green-500' : 'bg-purple-500'}`}
                  style={{ width: `${Math.min(100, (task2Words / 250) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
