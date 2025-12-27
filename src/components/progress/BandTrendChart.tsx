'use client';

import { useState, useEffect } from 'react';

interface BandDataPoint {
  date: string;
  listening: number | null;
  reading: number | null;
  writing: number | null;
  speaking: number | null;
  overall: number | null;
}

interface TrendResponse {
  dataPoints: BandDataPoint[];
  summary: {
    startBand: number | null;
    currentBand: number | null;
    improvement: number | null;
    projectedBand: number | null;
    weeksToTarget: number | null;
  };
  moduleProgress: {
    listening: { start: number | null; current: number | null; change: number | null };
    reading: { start: number | null; current: number | null; change: number | null };
    writing: { start: number | null; current: number | null; change: number | null };
    speaking: { start: number | null; current: number | null; change: number | null };
  };
}

type Period = '1month' | '3months' | '6months' | 'all';
type Module = 'overall' | 'listening' | 'reading' | 'writing' | 'speaking';

const MODULE_COLORS: Record<Module, string> = {
  overall: '#2563eb',
  listening: '#8b5cf6',
  reading: '#10b981',
  writing: '#f59e0b',
  speaking: '#ec4899',
};

const MODULE_LABELS: Record<Module, string> = {
  overall: 'Overall',
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
  speaking: 'Speaking',
};

export function BandTrendChart() {
  const [data, setData] = useState<TrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('3months');
  const [selectedModules, setSelectedModules] = useState<Module[]>(['overall']);

  useEffect(() => {
    async function fetchTrends() {
      try {
        setLoading(true);
        const response = await fetch(`/api/progress/trends?period=${period}`);
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
  }, [period]);

  const toggleModule = (module: Module) => {
    setSelectedModules((prev) =>
      prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
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

  if (!data || data.dataPoints.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mb-2 text-3xl">📈</div>
        <p className="text-gray-600">No trend data available yet.</p>
        <p className="text-sm text-gray-400">
          Complete some practice sessions to see your progress.
        </p>
      </div>
    );
  }

  const { dataPoints, summary, moduleProgress } = data;

  return (
    <div className="space-y-4">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {(['1month', '3months', '6months', 'all'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p === '1month' ? '1M' : p === '3months' ? '3M' : p === '6months' ? '6M' : 'All'}
            </button>
          ))}
        </div>

        {/* Summary badges */}
        {summary.improvement !== null && (
          <div
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
              summary.improvement > 0
                ? 'bg-green-100 text-green-700'
                : summary.improvement < 0
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            {summary.improvement > 0 ? '📈' : summary.improvement < 0 ? '📉' : '➡️'}
            {summary.improvement > 0 ? '+' : ''}
            {summary.improvement.toFixed(1)} bands
          </div>
        )}
      </div>

      {/* Module Toggles */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(MODULE_COLORS) as Module[]).map((module) => (
          <button
            key={module}
            onClick={() => toggleModule(module)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${
              selectedModules.includes(module)
                ? 'border-transparent text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
            }`}
            style={{
              backgroundColor: selectedModules.includes(module) ? MODULE_COLORS[module] : undefined,
            }}
          >
            {MODULE_LABELS[module]}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative h-64">
        <MultiLineChart dataPoints={dataPoints} selectedModules={selectedModules} />
      </div>

      {/* Module Progress Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        {(Object.keys(moduleProgress) as (keyof typeof moduleProgress)[]).map((module) => {
          const progress = moduleProgress[module];
          if (progress.current === null) return null;

          return (
            <div
              key={module}
              className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: MODULE_COLORS[module as Module] }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {MODULE_LABELS[module as Module]}
                </span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900">{progress.current.toFixed(1)}</span>
                {progress.change !== null && (
                  <span
                    className={`ml-1 text-xs ${
                      progress.change > 0
                        ? 'text-green-600'
                        : progress.change < 0
                          ? 'text-red-600'
                          : 'text-gray-400'
                    }`}
                  >
                    ({progress.change > 0 ? '+' : ''}
                    {progress.change.toFixed(1)})
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Projection */}
      {summary.projectedBand !== null && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-900">8-Week Projection</div>
              <div className="text-xs text-blue-600">Based on your current improvement rate</div>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {summary.projectedBand.toFixed(1)}
            </div>
          </div>
          {summary.weeksToTarget !== null && (
            <div className="mt-2 text-sm text-blue-700">
              At this rate, you&apos;ll reach your target in approximately{' '}
              <strong>{summary.weeksToTarget} weeks</strong>.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MultiLineChart({
  dataPoints,
  selectedModules,
}: {
  dataPoints: BandDataPoint[];
  selectedModules: Module[];
}) {
  if (dataPoints.length === 0) return null;

  const width = 100;
  const height = 100;
  const padding = { top: 10, right: 10, bottom: 20, left: 25 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minY = 3;
  const maxY = 9;
  const yRange = maxY - minY;

  const getY = (value: number | null) => {
    if (value === null) return null;
    return padding.top + chartHeight - ((value - minY) / yRange) * chartHeight;
  };

  const getX = (index: number) => {
    return padding.left + (index / Math.max(1, dataPoints.length - 1)) * chartWidth;
  };

  // Generate paths for each selected module
  const paths: Record<Module, string> = {
    overall: '',
    listening: '',
    reading: '',
    writing: '',
    speaking: '',
  };

  selectedModules.forEach((module) => {
    const points: string[] = [];
    dataPoints.forEach((point, index) => {
      const value = module === 'overall' ? point.overall : point[module];
      const y = getY(value);
      if (y !== null) {
        const x = getX(index);
        if (points.length === 0) {
          points.push(`M ${x},${y}`);
        } else {
          points.push(`L ${x},${y}`);
        }
      }
    });
    paths[module] = points.join(' ');
  });

  // Y-axis labels
  const yLabels = [3, 4.5, 6, 7.5, 9];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      {/* Grid lines */}
      {yLabels.map((y) => (
        <g key={y}>
          <line
            x1={padding.left}
            y1={getY(y)!}
            x2={width - padding.right}
            y2={getY(y)!}
            stroke="#e5e7eb"
            strokeWidth="0.3"
            strokeDasharray="2,2"
          />
          <text
            x={padding.left - 2}
            y={getY(y)!}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-gray-400"
            fontSize="3"
          >
            {y}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {dataPoints.length > 0 && (
        <>
          <text
            x={padding.left}
            y={height - 5}
            textAnchor="start"
            className="fill-gray-400"
            fontSize="3"
          >
            {formatDate(dataPoints[0].date)}
          </text>
          <text
            x={width - padding.right}
            y={height - 5}
            textAnchor="end"
            className="fill-gray-400"
            fontSize="3"
          >
            {formatDate(dataPoints[dataPoints.length - 1].date)}
          </text>
        </>
      )}

      {/* Lines */}
      {selectedModules.map((module) => (
        <path
          key={module}
          d={paths[module]}
          fill="none"
          stroke={MODULE_COLORS[module]}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* Points */}
      {selectedModules.map((module) =>
        dataPoints.map((point, index) => {
          const value = module === 'overall' ? point.overall : point[module];
          const y = getY(value);
          if (y === null) return null;
          return (
            <circle
              key={`${module}-${index}`}
              cx={getX(index)}
              cy={y}
              r="1.5"
              fill={MODULE_COLORS[module]}
            />
          );
        })
      )}
    </svg>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
