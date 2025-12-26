'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type Module = 'WRITING' | 'SPEAKING' | 'READING' | 'LISTENING';

interface HistorySession {
  id: string;
  module: Module;
  type: string;
  title: string;
  difficultyBand: number | null;
  startedAt: string;
  completedAt: string;
  bandScore: number | null;
  // Writing specific
  prompt?: string;
  submission?: string;
  feedback?: unknown;
  criteriaScores?: Record<string, number> | null;
  // Speaking specific
  transcription?: string;
  metrics?: { wpm: number; fillerWords: number; uniqueVocabRatio: number } | null;
  // Reading/Listening specific
  totalQuestions?: number;
  correctAnswers?: number;
  percentage?: number;
  results?: Array<{
    questionId: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
}

interface HistoryResponse {
  sessions: HistorySession[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
  counts: {
    all: number;
    WRITING: number;
    SPEAKING: number;
    READING: number;
    LISTENING: number;
  };
}

const moduleColors: Record<Module, { bg: string; text: string; border: string }> = {
  WRITING: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  SPEAKING: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  READING: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  LISTENING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

const moduleIcons: Record<Module, string> = {
  WRITING: '✍️',
  SPEAKING: '🎤',
  READING: '📖',
  LISTENING: '🎧',
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [counts, setCounts] = useState({
    all: 0,
    WRITING: 0,
    SPEAKING: 0,
    READING: 0,
    LISTENING: 0,
  });
  const [selectedModule, setSelectedModule] = useState<Module | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const fetchHistory = useCallback(async (module: Module | 'all', page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (module !== 'all') params.set('module', module);
      params.set('page', page.toString());
      params.set('limit', '20');

      const response = await fetch(`/api/history?${params}`);
      if (!response.ok) throw new Error('Failed to fetch history');

      const data: HistoryResponse = await response.json();
      setSessions(data.sessions);
      setPagination(data.pagination);
      setCounts(data.counts);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(selectedModule, 1);
  }, [selectedModule, fetchHistory]);

  const handleModuleChange = (module: Module | 'all') => {
    setSelectedModule(module);
    setExpandedSession(null);
  };

  const handlePageChange = (newPage: number) => {
    fetchHistory(selectedModule, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatBandScore = (score: number | null) => {
    if (score === null) return '—';
    return score.toFixed(1);
  };

  const getBandColor = (score: number | null) => {
    if (score === null) return 'text-gray-400';
    if (score >= 7) return 'text-emerald-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 5) return 'text-amber-600';
    return 'text-red-600';
  };

  const renderSessionDetails = (session: HistorySession) => {
    switch (session.module) {
      case 'WRITING':
        return (
          <div className="space-y-4">
            {session.prompt && (
              <div>
                <h4 className="mb-1 text-sm font-medium text-gray-700">Prompt</h4>
                <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{session.prompt}</p>
              </div>
            )}
            {session.submission && (
              <div>
                <h4 className="mb-1 text-sm font-medium text-gray-700">Your Response</h4>
                <p className="max-h-48 overflow-y-auto rounded-lg bg-gray-50 p-3 text-sm whitespace-pre-wrap text-gray-600">
                  {session.submission}
                </p>
              </div>
            )}
            {session.criteriaScores && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">Criteria Scores</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(session.criteriaScores).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded bg-gray-50 p-2"
                    >
                      <span className="text-xs text-gray-600">{formatCriteriaName(key)}</span>
                      <span className={`text-sm font-medium ${getBandColor(value)}`}>
                        {value.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'SPEAKING':
        return (
          <div className="space-y-4">
            {session.prompt && (
              <div>
                <h4 className="mb-1 text-sm font-medium text-gray-700">Topic</h4>
                <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{session.prompt}</p>
              </div>
            )}
            {session.transcription && (
              <div>
                <h4 className="mb-1 text-sm font-medium text-gray-700">Your Transcription</h4>
                <p className="max-h-48 overflow-y-auto rounded-lg bg-gray-50 p-3 text-sm whitespace-pre-wrap text-gray-600">
                  {session.transcription}
                </p>
              </div>
            )}
            {session.metrics && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">Speech Metrics</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded bg-gray-50 p-2 text-center">
                    <div className="text-lg font-semibold text-gray-800">{session.metrics.wpm}</div>
                    <div className="text-xs text-gray-500">Words/min</div>
                  </div>
                  <div className="rounded bg-gray-50 p-2 text-center">
                    <div className="text-lg font-semibold text-gray-800">
                      {session.metrics.fillerWords}
                    </div>
                    <div className="text-xs text-gray-500">Filler Words</div>
                  </div>
                  <div className="rounded bg-gray-50 p-2 text-center">
                    <div className="text-lg font-semibold text-gray-800">
                      {Math.round(session.metrics.uniqueVocabRatio * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">Vocab Diversity</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'READING':
      case 'LISTENING':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-2xl font-bold text-gray-800">
                  {session.correctAnswers}/{session.totalQuestions}
                </div>
                <div className="text-xs text-gray-500">Correct Answers</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-2xl font-bold text-gray-800">{session.percentage}%</div>
                <div className="text-xs text-gray-500">Accuracy</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className={`text-2xl font-bold ${getBandColor(session.bandScore)}`}>
                  {formatBandScore(session.bandScore)}
                </div>
                <div className="text-xs text-gray-500">Band Score</div>
              </div>
            </div>
            {session.results && session.results.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">Question Results</h4>
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {session.results.map((result, idx) => (
                    <div
                      key={result.questionId}
                      className={`flex items-center justify-between rounded p-2 text-sm ${
                        result.isCorrect ? 'bg-emerald-50' : 'bg-red-50'
                      }`}
                    >
                      <span className="text-gray-600">Q{idx + 1}</span>
                      <span className={result.isCorrect ? 'text-emerald-700' : 'text-red-700'}>
                        {result.userAnswer || '(no answer)'}
                        {!result.isCorrect && (
                          <span className="ml-2 text-gray-500">→ {result.correctAnswer}</span>
                        )}
                      </span>
                      <span>{result.isCorrect ? '✓' : '✗'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const formatCriteriaName = (key: string): string => {
    const names: Record<string, string> = {
      taskAchievement: 'Task Achievement',
      coherenceAndCohesion: 'Coherence & Cohesion',
      lexicalResource: 'Lexical Resource',
      grammaticalRange: 'Grammatical Range',
      fluencyAndCoherence: 'Fluency & Coherence',
      pronunciation: 'Pronunciation',
    };
    return names[key] || key;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Practice History</h1>
            <p className="mt-1 text-gray-600">Review your past practice sessions</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Dashboard
          </Link>
        </div>

        {/* Module Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => handleModuleChange('all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedModule === 'all'
                ? 'bg-gray-900 text-white'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All ({counts.all})
          </button>
          {(['WRITING', 'SPEAKING', 'READING', 'LISTENING'] as Module[]).map((mod) => (
            <button
              key={mod}
              onClick={() => handleModuleChange(mod)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedModule === mod
                  ? `${moduleColors[mod].bg} ${moduleColors[mod].text} ${moduleColors[mod].border} border`
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {moduleIcons[mod]} {mod.charAt(0) + mod.slice(1).toLowerCase()} ({counts[mod]})
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
          </div>
        ) : sessions.length === 0 ? (
          /* Empty State */
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <div className="mb-4 text-4xl">📝</div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">No practice sessions yet</h3>
            <p className="mb-6 text-gray-600">
              {selectedModule === 'all'
                ? 'Start practicing to see your history here'
                : `No ${selectedModule.toLowerCase()} sessions found`}
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800"
            >
              Start Practicing
            </Link>
          </div>
        ) : (
          <>
            {/* Sessions List */}
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
                >
                  {/* Session Header */}
                  <button
                    onClick={() =>
                      setExpandedSession(expandedSession === session.id ? null : session.id)
                    }
                    className="flex w-full items-center justify-between px-4 py-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${moduleColors[session.module].bg}`}
                      >
                        {moduleIcons[session.module]}
                      </span>
                      <div>
                        <h3 className="font-medium text-gray-900">{session.title}</h3>
                        <p className="text-sm text-gray-500">{formatDate(session.completedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {session.difficultyBand && (
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                          Difficulty: {session.difficultyBand}
                        </span>
                      )}
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getBandColor(session.bandScore)}`}>
                          {formatBandScore(session.bandScore)}
                        </div>
                        <div className="text-xs text-gray-500">Band</div>
                      </div>
                      <svg
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          expandedSession === session.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedSession === session.id && (
                    <div className="border-t border-gray-100 px-4 pb-4">
                      <div className="pt-4">{renderSessionDetails(session)}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasMore}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
