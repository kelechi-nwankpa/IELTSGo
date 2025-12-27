'use client';

import { useState, useEffect } from 'react';
import { BandTrendChart } from './BandTrendChart';
import { ModuleProgressCard } from './ModuleProgressCard';
import { StreakWidget } from './StreakWidget';
import { TargetProgressBar } from './TargetProgressBar';

interface ModuleStats {
  totalSessions: number;
  averageBand: number | null;
  bestBand: number | null;
  lastPracticed: string | null;
  improvement: number | null;
}

interface SkillBreakdown {
  skillId: string;
  skillName: string;
  module: string;
  currentLevel: number;
  attempts: number;
  trend: 'improving' | 'stable' | 'declining' | null;
}

interface ProgressOverview {
  overall: {
    estimatedBand: number | null;
    targetBand: number | null;
    progressToTarget: number | null;
    totalPracticeSessions: number;
    totalStudyMinutes: number;
    daysUntilTest: number | null;
  };
  modules: {
    listening: ModuleStats;
    reading: ModuleStats;
    writing: ModuleStats;
    speaking: ModuleStats;
  };
  weakAreas: SkillBreakdown[];
  strongAreas: SkillBreakdown[];
  streak: {
    current: number;
    longest: number;
    lastStudyDate: string | null;
  };
  achievements: {
    total: number;
    recent: Array<{
      id: string;
      name: string;
      unlockedAt: string;
    }>;
  };
}

export function ProgressDashboard() {
  const [data, setData] = useState<ProgressOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const response = await fetch('/api/progress/overview');
        if (!response.ok) throw new Error('Failed to fetch progress');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load progress');
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
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

  if (!data) {
    return null;
  }

  const { overall, modules, weakAreas, strongAreas, streak, achievements } = data;

  return (
    <div className="space-y-6">
      {/* Top Section: Target Progress + Streak */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TargetProgressBar
            currentBand={overall.estimatedBand}
            targetBand={overall.targetBand}
            progressPercent={overall.progressToTarget}
            daysUntilTest={overall.daysUntilTest}
          />
        </div>
        <div>
          <StreakWidget
            currentStreak={streak.current}
            longestStreak={streak.longest}
            lastStudyDate={streak.lastStudyDate}
          />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard
          icon="📊"
          value={overall.estimatedBand?.toString() ?? '-'}
          label="Estimated Band"
          sublabel="Overall score"
          highlight={overall.estimatedBand !== null && overall.estimatedBand >= 7}
        />
        <StatCard
          icon="📝"
          value={overall.totalPracticeSessions.toString()}
          label="Practice Sessions"
          sublabel="Completed"
        />
        <StatCard
          icon="⏱️"
          value={formatStudyTime(overall.totalStudyMinutes)}
          label="Study Time"
          sublabel="Total"
        />
        <StatCard
          icon="🏆"
          value={achievements.total.toString()}
          label="Achievements"
          sublabel="Unlocked"
        />
      </div>

      {/* Band Trend Chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Band Score Trends</h2>
        <BandTrendChart />
      </div>

      {/* Module Progress */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Module Progress</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ModuleProgressCard module="listening" stats={modules.listening} icon="🎧" />
          <ModuleProgressCard module="reading" stats={modules.reading} icon="📖" />
          <ModuleProgressCard module="writing" stats={modules.writing} icon="✍️" />
          <ModuleProgressCard module="speaking" stats={modules.speaking} icon="🎤" />
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Strong Areas */}
        <div className="rounded-xl border border-green-200 bg-green-50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">💪</span>
            <h3 className="font-semibold text-green-900">Your Strengths</h3>
          </div>
          {strongAreas.length > 0 ? (
            <div className="space-y-3">
              {strongAreas.map((skill) => (
                <SkillRow key={skill.skillId} skill={skill} variant="strong" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-green-700">
              Complete more practice sessions to identify your strengths.
            </p>
          )}
        </div>

        {/* Weak Areas */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h3 className="font-semibold text-amber-900">Focus Areas</h3>
          </div>
          {weakAreas.length > 0 ? (
            <div className="space-y-3">
              {weakAreas.map((skill) => (
                <SkillRow key={skill.skillId} skill={skill} variant="weak" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-amber-700">
              Complete more practice sessions to identify areas for improvement.
            </p>
          )}
        </div>
      </div>

      {/* Recent Achievements */}
      {achievements.recent.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Achievements</h2>
          <div className="flex flex-wrap gap-3">
            {achievements.recent.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-4 py-2"
              >
                <span className="text-lg">{getAchievementIcon(achievement.id)}</span>
                <span className="text-sm font-medium text-yellow-900">{achievement.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  sublabel,
  highlight = false,
}: {
  icon: string;
  value: string;
  label: string;
  sublabel?: string;
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
      <div className="text-sm text-gray-600">{label}</div>
      {sublabel && <div className="text-xs text-gray-400">{sublabel}</div>}
    </div>
  );
}

function SkillRow({ skill, variant }: { skill: SkillBreakdown; variant: 'strong' | 'weak' }) {
  const isStrong = variant === 'strong';
  const bgColor = isStrong ? 'bg-green-100' : 'bg-amber-100';
  const textColor = isStrong ? 'text-green-800' : 'text-amber-800';
  const barColor = isStrong ? 'bg-green-500' : 'bg-amber-500';

  return (
    <div className={`rounded-lg ${bgColor} p-3`}>
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-sm font-medium ${textColor}`}>{skill.skillName}</div>
          <div className="text-xs text-gray-500">
            {skill.module.charAt(0) + skill.module.slice(1).toLowerCase()} • {skill.attempts}{' '}
            attempts
          </div>
        </div>
        <div className="flex items-center gap-2">
          {skill.trend && (
            <span className="text-sm">
              {skill.trend === 'improving' ? '📈' : skill.trend === 'declining' ? '📉' : '➡️'}
            </span>
          )}
          <span className={`font-semibold ${textColor}`}>{skill.currentLevel.toFixed(1)}</span>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/50">
        <div
          className={`h-full ${barColor}`}
          style={{ width: `${(skill.currentLevel / 9) * 100}%` }}
        />
      </div>
    </div>
  );
}

function formatStudyTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function getAchievementIcon(achievementId: string): string {
  const icons: Record<string, string> = {
    first_steps: '👣',
    '7_day_streak': '🔥',
    '30_day_streak': '💎',
    band_improver: '📈',
    target_crusher: '🎯',
    early_bird: '🌅',
    night_owl: '🦉',
    completionist: '✅',
  };
  return icons[achievementId] || '🏅';
}
