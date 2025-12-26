'use client';

import { useState, useEffect } from 'react';

interface TrendDataPoint {
  date: string;
  overallBand: number;
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
  wordsPerMinute: number;
  fillerWordCount: number;
  uniqueVocabRatio: number;
  sentenceVarietyScore?: number;
}

interface TrendSummary {
  totalSessions: number;
  averageBand: number;
  bestBand: number;
  improvement: number | null;
  strongestCriterion: string | null;
  weakestCriterion: string | null;
  averageWPM: number;
  averageFillerWords: number;
}

interface TrendsData {
  trends: TrendDataPoint[];
  summary: TrendSummary | null;
  byPart: {
    part1: TrendDataPoint[];
    part2: TrendDataPoint[];
    part3: TrendDataPoint[];
  };
}

export function SpeakingTrends() {
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'overall' | 'criteria' | 'metrics'>('overall');

  useEffect(() => {
    async function fetchTrends() {
      try {
        const response = await fetch('/api/speaking/trends');
        if (!response.ok) throw new Error('Failed to fetch trends');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trends');
      } finally {
        setLoading(false);
      }
    }
    fetchTrends();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  if (!data || !data.summary || data.trends.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
        <div className="mb-4 text-4xl">📊</div>
        <h3 className="text-lg font-medium text-gray-900">No Speaking Data Yet</h3>
        <p className="mt-2 text-gray-600">
          Complete some speaking practice sessions to see your progress trends.
        </p>
      </div>
    );
  }

  const { trends, summary } = data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <SummaryCard title="Total Sessions" value={summary.totalSessions.toString()} icon="📝" />
        <SummaryCard
          title="Average Band"
          value={summary.averageBand.toFixed(1)}
          subtitle="Overall score"
          icon="⭐"
        />
        <SummaryCard
          title="Best Score"
          value={summary.bestBand.toFixed(1)}
          subtitle="Personal best"
          icon="🏆"
        />
        <SummaryCard
          title="Improvement"
          value={
            summary.improvement !== null
              ? `${summary.improvement > 0 ? '+' : ''}${summary.improvement.toFixed(1)}`
              : '-'
          }
          subtitle={
            summary.improvement !== null
              ? summary.improvement > 0
                ? 'Band increase'
                : summary.improvement < 0
                  ? 'Band decrease'
                  : 'No change'
              : 'Need more data'
          }
          icon={
            summary.improvement !== null && summary.improvement > 0
              ? '📈'
              : summary.improvement !== null && summary.improvement < 0
                ? '📉'
                : '📊'
          }
          highlight={summary.improvement !== null && summary.improvement > 0}
        />
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid gap-4 sm:grid-cols-2">
        {summary.strongestCriterion && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <span className="text-lg">💪</span>
              </div>
              <div>
                <h4 className="font-medium text-green-900">Strongest Area</h4>
                <p className="text-green-800">{summary.strongestCriterion}</p>
              </div>
            </div>
          </div>
        )}
        {summary.weakestCriterion && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-amber-100 p-2">
                <span className="text-lg">🎯</span>
              </div>
              <div>
                <h4 className="font-medium text-amber-900">Focus Area</h4>
                <p className="text-amber-800">{summary.weakestCriterion}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Selector */}
      <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
        {(['overall', 'criteria', 'metrics'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              selectedView === view
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {view === 'overall'
              ? 'Overall Progress'
              : view === 'criteria'
                ? 'Criteria Breakdown'
                : 'Speech Metrics'}
          </button>
        ))}
      </div>

      {/* Progress Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {selectedView === 'overall' && (
          <>
            <h3 className="mb-4 font-semibold text-gray-900">Band Score Progress</h3>
            <SimpleLineChart
              data={trends}
              dataKey="overallBand"
              color="#2563eb"
              minY={0}
              maxY={9}
            />
          </>
        )}

        {selectedView === 'criteria' && (
          <>
            <h3 className="mb-4 font-semibold text-gray-900">Criteria Progress</h3>
            <div className="space-y-4">
              <CriteriaRow
                label="Fluency & Coherence"
                data={trends}
                dataKey="fluencyCoherence"
                color="#3b82f6"
              />
              <CriteriaRow
                label="Lexical Resource"
                data={trends}
                dataKey="lexicalResource"
                color="#10b981"
              />
              <CriteriaRow
                label="Grammatical Range"
                data={trends}
                dataKey="grammaticalRange"
                color="#f59e0b"
              />
              <CriteriaRow
                label="Pronunciation"
                data={trends}
                dataKey="pronunciation"
                color="#8b5cf6"
              />
            </div>
          </>
        )}

        {selectedView === 'metrics' && (
          <>
            <h3 className="mb-4 font-semibold text-gray-900">Speech Metrics Over Time</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">Words Per Minute</h4>
                <SimpleLineChart
                  data={trends}
                  dataKey="wordsPerMinute"
                  color="#10b981"
                  minY={0}
                  maxY={200}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Avg: {summary.averageWPM} WPM (ideal: 120-150)
                </p>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">Filler Words</h4>
                <SimpleLineChart
                  data={trends}
                  dataKey="fillerWordCount"
                  color="#f59e0b"
                  minY={0}
                  maxY={Math.max(...trends.map((t) => t.fillerWordCount)) + 5}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Avg: {summary.averageFillerWords} per response (lower is better)
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Sessions */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 font-semibold text-gray-900">Recent Sessions</h3>
        <div className="space-y-2">
          {trends
            .slice(-5)
            .reverse()
            .map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"
              >
                <div>
                  <span className="text-sm text-gray-600">
                    {new Date(t.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{t.wordsPerMinute} WPM</span>
                  <span className={`font-semibold ${getBandColor(t.overallBand)}`}>
                    {t.overallBand.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  highlight = false,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="mb-2 text-2xl">{icon}</div>
      <div className={`text-2xl font-bold ${highlight ? 'text-green-700' : 'text-gray-900'}`}>
        {value}
      </div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtitle && <div className="text-xs text-gray-400">{subtitle}</div>}
    </div>
  );
}

function SimpleLineChart({
  data,
  dataKey,
  color,
  minY,
  maxY,
}: {
  data: TrendDataPoint[];
  dataKey: keyof TrendDataPoint;
  color: string;
  minY: number;
  maxY: number;
}) {
  if (data.length === 0) return null;

  const values = data.map((d) => (d[dataKey] as number) || 0);
  const range = maxY - minY;

  // Create SVG path
  const width = 100;
  const height = 60;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1 || 1)) * width;
    const y = height - ((v - minY) / range) * height;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;

  return (
    <div className="h-20">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
        {/* Grid lines */}
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="#e5e7eb"
          strokeWidth="0.5"
        />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {values.map((v, i) => {
          const x = (i / (values.length - 1 || 1)) * width;
          const y = height - ((v - minY) / range) * height;
          return <circle key={i} cx={x} cy={y} r="2" fill={color} />;
        })}
      </svg>
      <div className="mt-1 flex justify-between text-xs text-gray-400">
        <span>
          {new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <span>
          {new Date(data[data.length - 1].date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
}

function CriteriaRow({
  label,
  data,
  dataKey,
  color,
}: {
  label: string;
  data: TrendDataPoint[];
  dataKey: keyof TrendDataPoint;
  color: string;
}) {
  const values = data.map((d) => (d[dataKey] as number) || 0);
  const latest = values[values.length - 1] || 0;
  const first = values[0] || 0;
  const change = latest - first;

  return (
    <div className="flex items-center gap-4">
      <div className="w-32 text-sm text-gray-700">{label}</div>
      <div className="flex-1">
        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full transition-all"
            style={{ width: `${(latest / 9) * 100}%`, backgroundColor: color }}
          />
        </div>
      </div>
      <div className="w-12 text-right font-medium" style={{ color }}>
        {latest.toFixed(1)}
      </div>
      <div
        className={`w-16 text-right text-sm ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-400'}`}
      >
        {change > 0 ? '+' : ''}
        {change.toFixed(1)}
      </div>
    </div>
  );
}

function getBandColor(band: number): string {
  if (band >= 7) return 'text-green-600';
  if (band >= 6) return 'text-blue-600';
  if (band >= 5) return 'text-amber-600';
  return 'text-red-600';
}
