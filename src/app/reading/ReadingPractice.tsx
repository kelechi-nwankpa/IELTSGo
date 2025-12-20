'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ReadingPassage, QuestionList, ResultsSummary } from '@/components/reading';
import { Timer } from '@/components/writing';

interface ReadingQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false_ng' | 'matching' | 'short_answer';
  text: string;
  options?: string[];
  items?: string[];
  maxWords?: number;
}

interface QuestionResult {
  questionId: string;
  userAnswer: string | string[] | null;
  correctAnswer: string | string[];
  isCorrect: boolean;
}

interface Score {
  correct: number;
  total: number;
  percentage: number;
  bandEstimate: number;
}

interface ReadingPracticeProps {
  passageId: string;
  title: string;
  passage: string;
  questions: ReadingQuestion[];
}

interface ErrorState {
  message: string;
  canRetry: boolean;
}

export function ReadingPractice({ passageId, title, passage, questions }: ReadingPracticeProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ErrorState | null>(null);
  const [results, setResults] = useState<{
    score: Score;
    questionResults: QuestionResult[];
  } | null>(null);

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/reading/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passageId,
          answers,
          timeSpent: 0, // TODO: Track actual time spent
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError({
          message: errorData.error || 'Unable to submit your answers. Please try again.',
          canRetry: true,
        });
        return;
      }

      const result = await response.json();
      setResults({
        score: result.score,
        questionResults: result.results,
      });
    } catch (err) {
      const isNetworkError = err instanceof TypeError && err.message.includes('fetch');
      setError({
        message: isNetworkError
          ? 'Unable to connect to the server. Please check your internet connection.'
          : 'Something went wrong. Please try again.',
        canRetry: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTryAnother = () => {
    // Reload the page to get a new passage
    window.location.reload();
  };

  const answeredCount = Object.keys(answers).filter(
    (key) => answers[key] !== undefined && answers[key] !== '' &&
    (Array.isArray(answers[key]) ? (answers[key] as string[]).some(a => a !== '') : true)
  ).length;

  // Show results if submitted
  if (results) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </div>

          <ResultsSummary
            score={results.score}
            passageTitle={title}
            onTryAnother={handleTryAnother}
          />

          {/* Question results breakdown */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Answer Review</h3>
            <QuestionList
              questions={questions}
              answers={answers}
              onAnswerChange={() => {}}
              results={results.questionResults}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <div className="h-6 w-px bg-gray-200" />
            <h1 className="text-lg font-semibold text-gray-900">Reading Practice</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {answeredCount}/{questions.length} answered
            </div>
            <Timer initialMinutes={60} />
          </div>
        </div>
      </div>

      {/* Main content - split view */}
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row">
          {/* Passage - left side */}
          <div className="lg:w-1/2 lg:border-r lg:border-gray-200">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4 lg:p-6">
              <ReadingPassage title={title} passage={passage} />
            </div>
          </div>

          {/* Questions - right side */}
          <div className="lg:w-1/2">
            <div className="p-4 lg:p-6">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-red-700">{error.message}</p>
                      {error.canRetry && (
                        <p className="mt-1 text-sm text-red-600">
                          Click &quot;Submit Answers&quot; to try again.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <QuestionList
                questions={questions}
                answers={answers}
                onAnswerChange={handleAnswerChange}
              />

              {/* Submit button */}
              <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-gray-700">
                    {answeredCount} of {questions.length} questions answered
                  </span>
                </div>
                <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || answeredCount === 0}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Answers'
                  )}
                </button>
                {answeredCount < questions.length && answeredCount > 0 && (
                  <p className="mt-2 text-center text-sm text-amber-600">
                    You have {questions.length - answeredCount} unanswered question
                    {questions.length - answeredCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
