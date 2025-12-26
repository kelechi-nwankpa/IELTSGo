'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EssayEditor, WritingPrompt, Timer } from '@/components/writing';

interface Task1PracticeProps {
  promptId: string;
  title: string;
  prompt: string;
  topic: string;
  isAcademic: boolean;
  imageUrl?: string;
  imageDescription?: string;
  letterType?: 'formal' | 'semi-formal' | 'informal';
}

interface EvaluationResult {
  overall_band: number;
  criteria: {
    task_achievement: CriterionEvaluation;
    coherence_cohesion: CriterionEvaluation;
    lexical_resource: CriterionEvaluation;
    grammatical_range: CriterionEvaluation;
  };
  word_count: number;
  word_count_feedback: string | null;
  overall_feedback: string;
  rewritten_excerpt: {
    original: string;
    improved: string;
    explanation: string;
  };
}

interface CriterionEvaluation {
  band: number;
  summary: string;
  strengths: string[];
  improvements: string[];
}

interface ErrorState {
  message: string;
  canRetry: boolean;
  isQuotaExceeded?: boolean;
}

export function Task1Practice({
  promptId,
  title,
  prompt,
  topic,
  isAcademic,
  imageUrl,
  imageDescription,
  letterType,
}: Task1PracticeProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);

  const taskTypeLabel = isAcademic ? 'Task 1 Academic' : 'Task 1 General';
  const otherTypeUrl = isAcademic ? '/writing/task1?type=general' : '/writing/task1?type=academic';
  const otherTypeLabel = isAcademic ? 'Switch to General Training' : 'Switch to Academic';

  const handleSubmit = async (content: string, wordCount: number) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/writing/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId,
          essay: content,
          wordCount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError({
          message: errorData.error || 'Unable to evaluate your response. Please try again.',
          canRetry: errorData.retry ?? true,
          isQuotaExceeded: errorData.code === 'USER_QUOTA_EXCEEDED',
        });
        return;
      }

      const result = await response.json();
      setEvaluation(result.evaluation);
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

  const handleTryAgain = () => {
    setEvaluation(null);
    // Reload the page to get a new prompt
    window.location.reload();
  };

  if (evaluation) {
    return (
      <EvaluationDisplay
        evaluation={evaluation}
        onTryAgain={handleTryAgain}
        taskType={taskTypeLabel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">IELTS Writing Practice</h1>
            <p className="text-sm text-gray-500">
              {isAcademic
                ? 'Describe the visual information in at least 150 words'
                : 'Write a letter of at least 150 words'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={otherTypeUrl}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
            >
              {otherTypeLabel}
            </Link>
            <Timer initialMinutes={20} />
          </div>
        </div>

        <div className="space-y-6">
          <WritingPrompt
            title={title}
            prompt={prompt}
            topic={topic}
            taskType={taskTypeLabel}
            imageUrl={imageUrl}
            imageDescription={imageDescription}
            letterType={letterType}
          />

          {error && (
            <div
              className={`rounded-lg border px-4 py-3 ${
                error.isQuotaExceeded ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <svg
                  className={`mt-0.5 h-5 w-5 shrink-0 ${
                    error.isQuotaExceeded ? 'text-amber-500' : 'text-red-500'
                  }`}
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
                <div className="flex-1">
                  <p className={error.isQuotaExceeded ? 'text-amber-700' : 'text-red-700'}>
                    {error.message}
                  </p>
                  {error.isQuotaExceeded ? (
                    <div className="mt-3">
                      <Link
                        href="/pricing"
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-blue-500 hover:to-indigo-500"
                      >
                        Upgrade to Premium
                        <svg
                          className="h-4 w-4"
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
                    </div>
                  ) : (
                    error.canRetry && (
                      <p className="mt-1 text-sm text-red-600">
                        Click &quot;Submit for Evaluation&quot; to try again.
                      </p>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          <EssayEditor
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            minWords={150}
            maxWords={200}
          />
        </div>
      </div>
    </div>
  );
}

function EvaluationDisplay({
  evaluation,
  onTryAgain,
  taskType,
}: {
  evaluation: EvaluationResult;
  onTryAgain: () => void;
  taskType: string;
}) {
  const criteriaLabels = {
    task_achievement: 'Task Achievement',
    coherence_cohesion: 'Coherence & Cohesion',
    lexical_resource: 'Lexical Resource',
    grammatical_range: 'Grammatical Range & Accuracy',
  };

  const getBandColor = (band: number) => {
    if (band >= 7) return 'text-green-600 bg-green-50 border-green-200';
    if (band >= 6) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (band >= 5) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Your Evaluation</h1>
            <p className="text-sm text-gray-500">{taskType}</p>
          </div>
          <button
            onClick={onTryAgain}
            className="rounded-lg px-4 py-2 text-blue-600 transition-colors hover:bg-blue-50"
          >
            Try Another Prompt
          </button>
        </div>

        {/* Overall Band Score */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 text-center">
          <p className="mb-1 text-sm text-gray-500">Estimated Overall Band</p>
          <div
            className={`inline-block rounded-lg border px-6 py-3 text-5xl font-bold ${getBandColor(evaluation.overall_band)}`}
          >
            {evaluation.overall_band}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Word count: {evaluation.word_count}
            {evaluation.word_count_feedback && (
              <span className="ml-2 text-amber-600">{evaluation.word_count_feedback}</span>
            )}
          </p>
        </div>

        {/* Overall Feedback */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-800">Overall Feedback</h2>
          <p className="text-gray-700">{evaluation.overall_feedback}</p>
        </div>

        {/* Criteria Breakdown */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          {Object.entries(evaluation.criteria).map(([key, criterion]) => (
            <div key={key} className="rounded-lg border border-gray-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                  {criteriaLabels[key as keyof typeof criteriaLabels]}
                </h3>
                <span
                  className={`rounded border px-3 py-1 text-xl font-bold ${getBandColor(criterion.band)}`}
                >
                  {criterion.band}
                </span>
              </div>
              <p className="mb-3 text-sm text-gray-600">{criterion.summary}</p>

              {criterion.strengths.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1 text-xs font-medium text-green-700">Strengths:</p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {criterion.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-green-500">+</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {criterion.improvements.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-medium text-amber-700">To Improve:</p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {criterion.improvements.map((s, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-amber-500">!</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Rewritten Excerpt */}
        {evaluation.rewritten_excerpt && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">Sample Improvement</h2>

            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                <p className="mb-2 text-xs font-medium text-red-700">Original:</p>
                <p className="text-sm text-gray-700 italic">
                  &quot;{evaluation.rewritten_excerpt.original}&quot;
                </p>
              </div>

              <div className="rounded-lg border border-green-100 bg-green-50 p-4">
                <p className="mb-2 text-xs font-medium text-green-700">Improved:</p>
                <p className="text-sm text-gray-700 italic">
                  &quot;{evaluation.rewritten_excerpt.improved}&quot;
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              <span className="font-medium">Explanation:</span>{' '}
              {evaluation.rewritten_excerpt.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
