'use client';

import { useState } from 'react';
import { EssayEditor, WritingPrompt, Timer } from '@/components/writing';

interface WritingPracticeProps {
  promptId: string;
  title: string;
  prompt: string;
  topic: string;
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

export function WritingPractice({ promptId, title, prompt, topic }: WritingPracticeProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        throw new Error(errorData.error || 'Failed to evaluate essay');
      }

      const result = await response.json();
      setEvaluation(result.evaluation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (evaluation) {
    return <EvaluationDisplay evaluation={evaluation} onTryAgain={() => setEvaluation(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">IELTS Writing Practice</h1>
          <Timer initialMinutes={40} />
        </div>

        <div className="space-y-6">
          <WritingPrompt title={title} prompt={prompt} topic={topic} taskType="Task 2" />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <EssayEditor onSubmit={handleSubmit} isSubmitting={isSubmitting} minWords={250} />
        </div>
      </div>
    </div>
  );
}

function EvaluationDisplay({
  evaluation,
  onTryAgain,
}: {
  evaluation: EvaluationResult;
  onTryAgain: () => void;
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Your Evaluation</h1>
          <button
            onClick={onTryAgain}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Try Another Essay
          </button>
        </div>

        {/* Overall Band Score */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Estimated Overall Band</p>
          <div
            className={`inline-block text-5xl font-bold px-6 py-3 rounded-lg border ${getBandColor(evaluation.overall_band)}`}
          >
            {evaluation.overall_band}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Word count: {evaluation.word_count}
            {evaluation.word_count_feedback && (
              <span className="text-amber-600 ml-2">{evaluation.word_count_feedback}</span>
            )}
          </p>
        </div>

        {/* Overall Feedback */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Overall Feedback</h2>
          <p className="text-gray-700">{evaluation.overall_feedback}</p>
        </div>

        {/* Criteria Breakdown */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          {Object.entries(evaluation.criteria).map(([key, criterion]) => (
            <div key={key} className="bg-white rounded-lg border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">
                  {criteriaLabels[key as keyof typeof criteriaLabels]}
                </h3>
                <span
                  className={`text-xl font-bold px-3 py-1 rounded border ${getBandColor(criterion.band)}`}
                >
                  {criterion.band}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-3">{criterion.summary}</p>

              {criterion.strengths.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-green-700 mb-1">Strengths:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
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
                  <p className="text-xs font-medium text-amber-700 mb-1">To Improve:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
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
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Sample Improvement</h2>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <p className="text-xs font-medium text-red-700 mb-2">Original:</p>
                <p className="text-gray-700 text-sm italic">
                  &quot;{evaluation.rewritten_excerpt.original}&quot;
                </p>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <p className="text-xs font-medium text-green-700 mb-2">Improved:</p>
                <p className="text-gray-700 text-sm italic">
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
