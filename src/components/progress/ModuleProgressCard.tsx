'use client';

import Link from 'next/link';

interface ModuleStats {
  totalSessions: number;
  averageBand: number | null;
  bestBand: number | null;
  lastPracticed: string | null;
  improvement: number | null;
}

interface ModuleProgressCardProps {
  module: 'listening' | 'reading' | 'writing' | 'speaking';
  stats: ModuleStats;
  icon: string;
}

const MODULE_LINKS: Record<string, string> = {
  listening: '/listening',
  reading: '/reading',
  writing: '/writing',
  speaking: '/speaking',
};

const MODULE_COLORS: Record<string, { bg: string; border: string; progress: string }> = {
  listening: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    progress: 'bg-purple-500',
  },
  reading: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    progress: 'bg-green-500',
  },
  writing: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    progress: 'bg-amber-500',
  },
  speaking: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    progress: 'bg-pink-500',
  },
};

export function ModuleProgressCard({ module, stats, icon }: ModuleProgressCardProps) {
  const colors = MODULE_COLORS[module];
  const hasData = stats.totalSessions > 0;

  return (
    <Link
      href={MODULE_LINKS[module]}
      className={`block rounded-xl border ${colors.border} ${colors.bg} p-4 transition-all hover:shadow-md`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-gray-500 capitalize">{module}</span>
      </div>

      {hasData ? (
        <>
          {/* Average Band */}
          <div className="mb-2">
            <div className="text-2xl font-bold text-gray-900">
              {stats.averageBand?.toFixed(1) ?? '-'}
            </div>
            <div className="text-xs text-gray-500">Average Band</div>
          </div>

          {/* Progress bar */}
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/50">
            <div
              className={`h-full ${colors.progress}`}
              style={{ width: `${((stats.averageBand ?? 0) / 9) * 100}%` }}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="font-medium text-gray-900">{stats.totalSessions}</div>
              <div className="text-xs text-gray-500">Sessions</div>
            </div>
            <div>
              <div className="font-medium text-gray-900">{stats.bestBand?.toFixed(1) ?? '-'}</div>
              <div className="text-xs text-gray-500">Best</div>
            </div>
          </div>

          {/* Improvement indicator */}
          {stats.improvement !== null && (
            <div className="mt-3 border-t border-white/50 pt-2">
              <div
                className={`text-sm font-medium ${
                  stats.improvement > 0
                    ? 'text-green-700'
                    : stats.improvement < 0
                      ? 'text-red-600'
                      : 'text-gray-500'
                }`}
              >
                {stats.improvement > 0 ? '↑' : stats.improvement < 0 ? '↓' : '→'}{' '}
                {stats.improvement > 0 ? '+' : ''}
                {stats.improvement.toFixed(1)} bands
              </div>
            </div>
          )}

          {/* Last practiced */}
          {stats.lastPracticed && (
            <div className="mt-2 text-xs text-gray-400">
              Last: {formatRelativeTime(stats.lastPracticed)}
            </div>
          )}
        </>
      ) : (
        <div className="py-4 text-center">
          <div className="mb-2 text-3xl opacity-50">{icon}</div>
          <div className="text-sm text-gray-500">No sessions yet</div>
          <div className="mt-2 text-xs text-gray-400">Click to start practicing</div>
        </div>
      )}
    </Link>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
