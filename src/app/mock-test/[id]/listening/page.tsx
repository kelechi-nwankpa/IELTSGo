'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AudioPlayer } from '@/components/listening';
import { QuestionList } from '@/components/reading';
import { TestTimer, TestProgress, SectionTransition } from '@/components/mock-test';

interface ListeningQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false_ng' | 'matching' | 'short_answer';
  text: string;
  options?: string[];
  items?: string[];
  maxWords?: number;
}

interface SectionData {
  section: string;
  contentId: string;
  content: {
    title: string;
    audioUrl: string;
    transcript?: string;
    questions: ListeningQuestion[];
  };
  timing: {
    startedAt: string;
    deadline: string;
    durationMinutes: number;
  };
}

export default function MockTestListeningPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  const [sectionData, setSectionData] = useState<SectionData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTransition, setShowTransition] = useState(false);
  const [nextSection, setNextSection] = useState<string | null>(null);

  const startSection = useCallback(async () => {
    try {
      const response = await fetch(`/api/mock-test/${testId}/section/listening/start`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to start listening section');
        return;
      }

      const data = await response.json();
      setSectionData(data);
    } catch {
      setError('Failed to start section');
    } finally {
      setIsLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    startSection();
  }, [startSection]);

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!sectionData) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/mock-test/${testId}/section/listening/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: sectionData.contentId,
          answers,
          timeSpent: sectionData.timing.durationMinutes * 60,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to submit answers');
        return;
      }

      const result = await response.json();

      if (result.isTestComplete) {
        router.push(`/mock-test/${testId}/results`);
      } else if (result.nextSection) {
        setNextSection(result.nextSection);
        setShowTransition(true);
      }
    } catch {
      setError('Failed to submit answers');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    // Auto-submit when time is up
    handleSubmit();
  };

  const handleTransitionComplete = () => {
    if (nextSection) {
      router.push(`/mock-test/${testId}/${nextSection.toLowerCase()}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-slate-600">Loading listening section...</p>
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
            className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Back to Test
          </Link>
        </div>
      </div>
    );
  }

  if (showTransition && nextSection) {
    return (
      <SectionTransition
        fromSection="LISTENING"
        toSection={nextSection}
        onCountdownComplete={handleTransitionComplete}
        onSkipCountdown={handleTransitionComplete}
      />
    );
  }

  if (!sectionData) return null;

  const answeredCount = Object.keys(answers).filter(
    (key) =>
      answers[key] !== undefined &&
      answers[key] !== '' &&
      (Array.isArray(answers[key]) ? (answers[key] as string[]).some((a) => a !== '') : true)
  ).length;

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
              <span className="text-2xl">🎧</span>
              <h1 className="text-lg font-semibold text-slate-900">Listening</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500">
              {answeredCount}/{sectionData.content.questions.length} answered
            </div>
            <TestTimer
              deadline={new Date(sectionData.timing.deadline)}
              onTimeUp={handleTimeUp}
              showProgress
              totalDurationMinutes={sectionData.timing.durationMinutes}
            />
          </div>
        </div>
        {/* Progress bar */}
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
          <TestProgress currentSection="LISTENING" completedSections={[]} compact />
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Audio Player */}
        <div className="mb-6">
          <AudioPlayer src={sectionData.content.audioUrl} title={sectionData.content.title} />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Questions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <QuestionList
            questions={sectionData.content.questions}
            answers={answers}
            onAnswerChange={handleAnswerChange}
          />

          {/* Submit button */}
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-slate-500">Progress</span>
              <span className="font-medium text-slate-700">
                {answeredCount} of {sectionData.content.questions.length} questions answered
              </span>
            </div>
            <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{
                  width: `${(answeredCount / sectionData.content.questions.length) * 100}%`,
                }}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </span>
              ) : (
                'Submit & Continue to Reading'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
