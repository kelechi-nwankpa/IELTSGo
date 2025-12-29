'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AudioRecorder } from '@/components/speaking/AudioRecorder';
import { SafeText } from '@/components/ui/SafeText';

interface Part2Prompt {
  id: string;
  title: string;
  contentData: {
    topic: string;
    cueCard: {
      mainTask: string;
      bulletPoints: string[];
      finalPrompt: string;
    };
    prepTime: number;
    speakingTime: number;
    followUpQuestion?: string;
  };
}

type SessionState = 'select' | 'prep' | 'speak' | 'followup' | 'evaluating' | 'results';

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

export default function SpeakingPart2Page() {
  const [prompts, setPrompts] = useState<Part2Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<Part2Prompt | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>('select');
  const [prepTimeLeft, setPrepTimeLeft] = useState(60);
  const [notes, setNotes] = useState('');
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrompts() {
      try {
        const response = await fetch('/api/speaking/prompts?part=2');
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

  const startSpeaking = useCallback(() => {
    setSessionState('speak');
  }, []);

  // Prep timer countdown
  useEffect(() => {
    if (sessionState !== 'prep') return;

    const timer = setInterval(() => {
      setPrepTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          startSpeaking();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionState, startSpeaking]);

  const handleSelectPrompt = (prompt: Part2Prompt) => {
    setSelectedPrompt(prompt);
    setPrepTimeLeft(prompt.contentData.prepTime);
    setNotes('');
    setSessionState('prep');
    setError(null);
    setEvaluationResult(null);
  };

  const handleSkipPrep = () => {
    startSpeaking();
  };

  const handleRecordingComplete = async (blob: Blob) => {
    if (!selectedPrompt) return;

    setSessionState('evaluating');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', blob);
      formData.append('promptId', selectedPrompt.id);
      formData.append('part', '2');
      formData.append('duration', String(selectedPrompt.contentData.speakingTime));

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
      setSessionState('speak');
    }
  };

  const handleReset = () => {
    setSelectedPrompt(null);
    setSessionState('select');
    setEvaluationResult(null);
    setError(null);
    setNotes('');
    setPrepTimeLeft(60);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
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
          <h1 className="text-2xl font-bold text-gray-900">Part 2: Long Turn (Cue Card)</h1>
          <p className="mt-1 text-gray-600">
            You have 1 minute to prepare, then speak for 1-2 minutes on the topic.
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
                  className="rounded-xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-indigo-300 hover:shadow-md"
                >
                  <h3 className="font-medium text-gray-900">{prompt.contentData.topic}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                    {prompt.contentData.cueCard.mainTask}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Preparation Mode */}
        {sessionState === 'prep' && selectedPrompt && (
          <div className="space-y-6">
            {/* Timer */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 text-center">
              <div className="mb-2 text-sm font-medium text-indigo-600">Preparation Time</div>
              <div
                className={`text-5xl font-bold ${prepTimeLeft <= 10 ? 'text-red-600' : 'text-indigo-600'}`}
              >
                {formatTime(prepTimeLeft)}
              </div>
              <p className="mt-2 text-sm text-indigo-700">Use this time to plan your answer</p>
            </div>

            {/* Cue Card */}
            <div className="rounded-xl border-2 border-indigo-300 bg-white p-6 shadow-lg">
              <div className="mb-4 text-center">
                <span className="rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-700">
                  Cue Card
                </span>
              </div>

              <p className="mb-4 text-lg font-medium text-gray-900">
                {selectedPrompt.contentData.cueCard.mainTask}
              </p>

              <p className="mb-3 text-sm text-gray-600">You should say:</p>
              <ul className="mb-4 space-y-2">
                {selectedPrompt.contentData.cueCard.bulletPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-500" />
                    {point}
                  </li>
                ))}
              </ul>

              <p className="text-gray-700 italic">
                {selectedPrompt.contentData.cueCard.finalPrompt}
              </p>
            </div>

            {/* Notes Area */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Quick Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down key points to help you remember..."
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Choose Different Topic
              </button>
              <button
                onClick={handleSkipPrep}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Start Speaking Now
              </button>
            </div>
          </div>
        )}

        {/* Speaking Mode */}
        {sessionState === 'speak' && selectedPrompt && (
          <div className="space-y-6">
            {/* Cue Card Reference */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-2 font-medium text-gray-900">{selectedPrompt.contentData.topic}</h3>
              <p className="text-sm text-gray-600">{selectedPrompt.contentData.cueCard.mainTask}</p>
              <ul className="mt-2 text-sm text-gray-500">
                {selectedPrompt.contentData.cueCard.bulletPoints.map((point, index) => (
                  <li key={index}>• {point}</li>
                ))}
              </ul>
            </div>

            {/* Notes Reference */}
            {notes && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="text-xs font-medium text-amber-700">Your notes:</div>
                <p className="text-sm text-amber-800">{notes}</p>
              </div>
            )}

            {error && <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}

            {/* Audio Recorder */}
            <AudioRecorder
              maxDuration={selectedPrompt.contentData.speakingTime}
              onRecordingComplete={handleRecordingComplete}
            />

            <p className="text-center text-sm text-gray-500">
              Aim to speak for 1-2 minutes. The examiner will stop you after 2 minutes.
            </p>
          </div>
        )}

        {/* Evaluating State */}
        {sessionState === 'evaluating' && (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
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
                <div className="text-4xl font-bold text-indigo-600">
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
                      <span className="text-lg font-semibold text-indigo-600">
                        {criterion.band.toFixed(1)}
                      </span>
                    </div>
                    <SafeText as="p" className="mb-3 text-sm text-gray-600">{criterion.summary}</SafeText>
                    {criterion.strengths.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs font-medium text-green-600">Strengths:</span>
                        <ul className="mt-1 space-y-1">
                          {criterion.strengths.slice(0, 2).map((s, i) => (
                            <li key={i} className="text-xs text-gray-600">
                              • <SafeText>{s}</SafeText>
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
                              • <SafeText>{s}</SafeText>
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
              <SafeText as="p" className="text-gray-700">{evaluationResult.evaluation.overall_feedback}</SafeText>
            </div>

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
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-center font-medium text-white transition-colors hover:bg-indigo-500"
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
