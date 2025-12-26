'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AudioRecorder } from '@/components/speaking/AudioRecorder';

interface Part1Prompt {
  id: string;
  title: string;
  contentData: {
    topic: string;
    questions: string[];
    suggestedTime: number;
  };
}

type SessionState = 'select' | 'practice' | 'evaluating' | 'results';

interface EvaluationResult {
  transcription: string;
  evaluation: {
    overall_band: number;
    criteria: {
      fluency_coherence: {
        band: number;
        summary: string;
        strengths: string[];
        improvements: string[];
      };
      lexical_resource: {
        band: number;
        summary: string;
        strengths: string[];
        improvements: string[];
      };
      grammatical_range: {
        band: number;
        summary: string;
        strengths: string[];
        improvements: string[];
      };
      pronunciation: { band: number; summary: string; strengths: string[]; improvements: string[] };
    };
    metrics: {
      wordsPerMinute: number;
      totalWords: number;
      fillerWordCount: number;
      fillerWords: { word: string; count: number }[];
      uniqueVocabularyRatio: number;
      averageSentenceLength: number;
    };
    overall_feedback: string;
    sample_improvements: { original: string; improved: string; explanation: string }[];
  };
}

export default function SpeakingPart1Page() {
  const [prompts, setPrompts] = useState<Part1Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<Part1Prompt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionState, setSessionState] = useState<SessionState>('select');
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrompts() {
      try {
        const response = await fetch('/api/speaking/prompts?part=1');
        const data = await response.json();
        setPrompts(data.prompts);
      } catch (err) {
        console.error('Failed to fetch prompts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPrompts();
  }, []);

  const handleSelectPrompt = (prompt: Part1Prompt) => {
    setSelectedPrompt(prompt);
    setCurrentQuestionIndex(0);
    setSessionState('practice');
    setError(null);
    setEvaluationResult(null);
  };

  const handleRecordingComplete = async (blob: Blob) => {
    if (!selectedPrompt) return;

    setSessionState('evaluating');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', blob);
      formData.append('promptId', selectedPrompt.id);
      formData.append('part', '1');
      formData.append(
        'duration',
        String(selectedPrompt.contentData.suggestedTime * (currentQuestionIndex + 1))
      );

      const response = await fetch('/api/speaking/evaluate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to evaluate');
      }

      const result = await response.json();
      setEvaluationResult(result);
      setSessionState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSessionState('practice');
    }
  };

  const handleNextQuestion = () => {
    if (selectedPrompt && currentQuestionIndex < selectedPrompt.contentData.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setSelectedPrompt(null);
    setCurrentQuestionIndex(0);
    setSessionState('select');
    setEvaluationResult(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/speaking"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Speaking
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Part 1: Introduction & Interview</h1>
          <p className="mt-1 text-gray-600">
            Answer questions about familiar topics. Aim for 20-30 seconds per answer.
          </p>
        </div>

        {/* Topic Selection */}
        {sessionState === 'select' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Select a Topic</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handleSelectPrompt(prompt)}
                  className="rounded-xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <h3 className="font-medium text-gray-900">{prompt.contentData.topic}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {prompt.contentData.questions.length} questions
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Practice Mode */}
        {sessionState === 'practice' && selectedPrompt && (
          <div className="space-y-6">
            {/* Progress */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-900">
                  Topic: {selectedPrompt.contentData.topic}
                </span>
                <span className="text-gray-500">
                  Question {currentQuestionIndex + 1} of{' '}
                  {selectedPrompt.contentData.questions.length}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full bg-blue-600 transition-all"
                  style={{
                    width: `${((currentQuestionIndex + 1) / selectedPrompt.contentData.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Current Question */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
              <div className="mb-2 text-sm font-medium text-blue-600">
                Question {currentQuestionIndex + 1}
              </div>
              <p className="text-lg font-medium text-gray-900">
                {selectedPrompt.contentData.questions[currentQuestionIndex]}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Previous
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === selectedPrompt.contentData.questions.length - 1}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Next
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {error && <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}

            {/* Audio Recorder */}
            <AudioRecorder maxDuration={180} onRecordingComplete={handleRecordingComplete} />

            <div className="flex justify-center">
              <button onClick={handleReset} className="text-sm text-gray-500 hover:text-gray-700">
                Choose different topic
              </button>
            </div>
          </div>
        )}

        {/* Evaluating State */}
        {sessionState === 'evaluating' && (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <h2 className="text-lg font-semibold text-gray-900">Evaluating your response...</h2>
            <p className="mt-2 text-gray-600">Transcribing audio and analyzing your speaking</p>
          </div>
        )}

        {/* Results */}
        {sessionState === 'results' && evaluationResult && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Your Estimated Band Score</h2>
                  <p className="text-sm text-gray-500">Based on transcription analysis</p>
                </div>
                <div className="text-4xl font-bold text-blue-600">
                  {evaluationResult.evaluation.overall_band.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Criteria Scores */}
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(evaluationResult.evaluation.criteria).map(([key, criterion]) => {
                const labels: Record<string, string> = {
                  fluency_coherence: 'Fluency & Coherence',
                  lexical_resource: 'Lexical Resource',
                  grammatical_range: 'Grammatical Range',
                  pronunciation: 'Pronunciation',
                };
                return (
                  <div key={key} className="rounded-xl border border-gray-200 bg-white p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-gray-900">{labels[key]}</span>
                      <span className="text-lg font-semibold text-blue-600">
                        {criterion.band.toFixed(1)}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-gray-600">{criterion.summary}</p>
                    {criterion.strengths.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs font-medium text-green-600">Strengths:</span>
                        <ul className="mt-1 space-y-1">
                          {criterion.strengths.slice(0, 2).map((s, i) => (
                            <li key={i} className="text-xs text-gray-600">
                              • {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {criterion.improvements.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-amber-600">To improve:</span>
                        <ul className="mt-1 space-y-1">
                          {criterion.improvements.slice(0, 2).map((s, i) => (
                            <li key={i} className="text-xs text-gray-600">
                              • {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Metrics */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-gray-900">Speaking Metrics</h3>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {evaluationResult.evaluation.metrics.wordsPerMinute}
                  </div>
                  <div className="text-sm text-gray-500">Words/minute</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {evaluationResult.evaluation.metrics.totalWords}
                  </div>
                  <div className="text-sm text-gray-500">Total words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {evaluationResult.evaluation.metrics.fillerWordCount}
                  </div>
                  <div className="text-sm text-gray-500">Filler words</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(evaluationResult.evaluation.metrics.uniqueVocabularyRatio * 100)}%
                  </div>
                  <div className="text-sm text-gray-500">Unique vocabulary</div>
                </div>
              </div>
            </div>

            {/* Transcription */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-gray-900">Your Transcription</h3>
              <p className="whitespace-pre-wrap text-gray-700">{evaluationResult.transcription}</p>
            </div>

            {/* Overall Feedback */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-gray-900">Overall Feedback</h3>
              <p className="text-gray-700">{evaluationResult.evaluation.overall_feedback}</p>
            </div>

            {/* Sample Improvements */}
            {evaluationResult.evaluation.sample_improvements.length > 0 && (
              <div className="rounded-xl border border-gray-200 bg-white p-6">
                <h3 className="mb-4 font-semibold text-gray-900">How to Improve</h3>
                <div className="space-y-4">
                  {evaluationResult.evaluation.sample_improvements.map((improvement, index) => (
                    <div key={index} className="rounded-lg bg-gray-50 p-4">
                      <div className="mb-2">
                        <span className="text-xs font-medium text-red-600">Original:</span>
                        <p className="text-sm text-gray-600">&quot;{improvement.original}&quot;</p>
                      </div>
                      <div className="mb-2">
                        <span className="text-xs font-medium text-green-600">Improved:</span>
                        <p className="text-sm text-gray-600">&quot;{improvement.improved}&quot;</p>
                      </div>
                      <p className="text-xs text-gray-500">{improvement.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Practice Another Topic
              </button>
              <Link
                href="/speaking"
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-blue-500"
              >
                Back to Speaking
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
