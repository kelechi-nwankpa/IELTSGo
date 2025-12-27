'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StudyTask {
  id: string;
  module: string;
  title: string;
  description: string;
  duration: number;
  priority: string;
  scheduledDate: string;
  weekNumber: number;
  dayOfWeek: number;
  status: string;
  completedAt: string | null;
}

interface TasksData {
  todaysTasks: StudyTask[];
  weekTasks: StudyTask[];
  completedThisWeek: number;
  totalThisWeek: number;
  currentStreak: number;
  hasStudyPlan: boolean;
}

export default function TasksPage() {
  const [data, setData] = useState<TasksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // Fetch today's tasks and week's tasks in parallel
      const [todayRes, weekRes, streakRes] = await Promise.all([
        fetch('/api/tasks?view=today'),
        fetch('/api/tasks?view=week'),
        fetch('/api/progress/overview'),
      ]);

      if (!todayRes.ok || !weekRes.ok) {
        throw new Error('Failed to load tasks');
      }

      const todayData = await todayRes.json();
      const weekData = await weekRes.json();
      const progressData = streakRes.ok ? await streakRes.json() : null;

      // Check if there's no study plan
      if (todayData.message === 'No active study plan') {
        setData({
          todaysTasks: [],
          weekTasks: [],
          completedThisWeek: 0,
          totalThisWeek: 0,
          currentStreak: progressData?.streak?.currentStreak || 0,
          hasStudyPlan: false,
        });
        setLoading(false);
        return;
      }

      const weekTasks = weekData.tasks || [];
      const completedThisWeek = weekTasks.filter((t: StudyTask) => t.status === 'COMPLETED').length;

      setData({
        todaysTasks: todayData.tasks || [],
        weekTasks: weekTasks,
        completedThisWeek,
        totalThisWeek: weekTasks.length,
        currentStreak: progressData?.streak?.currentStreak || 0,
        hasStudyPlan: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    setUpdatingTask(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to complete task');
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete task');
    } finally {
      setUpdatingTask(null);
    }
  };

  const skipTask = async (taskId: string) => {
    setUpdatingTask(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}/skip`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to skip task');
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to skip task');
    } finally {
      setUpdatingTask(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-4xl px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded bg-slate-200" />
            <div className="h-64 rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.hasStudyPlan) {
    return (
      <div className="min-h-screen bg-slate-50 py-8">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-4">
            <Link
              href="/study-plan"
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Study Plan
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <svg
                className="h-8 w-8 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">No Study Plan Yet</h2>
            <p className="mb-6 text-slate-600">
              Create a personalized study plan to get daily task recommendations.
            </p>
            <Link
              href="/study-plan/setup"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500"
            >
              Create Study Plan
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/study-plan"
              className="mb-2 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Study Plan
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Today&apos;s Tasks</h1>
          </div>
          {data.currentStreak > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-orange-100 px-4 py-2">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="font-bold text-orange-700">{data.currentStreak} day streak</div>
                <div className="text-xs text-orange-600">Keep it going!</div>
              </div>
            </div>
          )}
        </div>

        {error && <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}

        {/* Weekly Progress */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">This Week&apos;s Progress</h2>
            <span className="text-sm text-slate-500">
              {data.completedThisWeek} of {data.totalThisWeek} tasks completed
            </span>
          </div>
          <div className="h-3 rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-green-500 transition-all"
              style={{
                width: `${data.totalThisWeek > 0 ? (data.completedThisWeek / data.totalThisWeek) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Today (
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
            )
          </h2>
          {data.todaysTasks.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-slate-900">All done for today!</h3>
              <p className="text-sm text-slate-500">
                Great work! Come back tomorrow for more tasks.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.todaysTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={completeTask}
                  onSkip={skipTask}
                  updating={updatingTask === task.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* This Week's Tasks */}
        {data.weekTasks.filter((t) => t.status === 'PENDING').length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Upcoming This Week</h2>
            <div className="space-y-3">
              {data.weekTasks
                .filter((t) => t.status === 'PENDING')
                .slice(0, 5)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={completeTask}
                    onSkip={skipTask}
                    updating={updatingTask === task.id}
                    upcoming
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Generate practice URL based on module and task title
function getPracticeUrl(module: string, title: string): string {
  const titleLower = title.toLowerCase();

  switch (module) {
    case 'WRITING':
      if (titleLower.includes('task 1')) {
        return '/writing/task1';
      } else if (titleLower.includes('task 2')) {
        return '/writing/task2';
      }
      return '/writing';

    case 'SPEAKING':
      if (titleLower.includes('part 1') || titleLower.includes('part1')) {
        return '/speaking/part1';
      } else if (titleLower.includes('part 2') || titleLower.includes('part2') || titleLower.includes('cue card')) {
        return '/speaking/part2';
      } else if (titleLower.includes('part 3') || titleLower.includes('part3')) {
        return '/speaking/part3';
      }
      return '/speaking';

    case 'READING':
      return '/reading';

    case 'LISTENING':
      return '/listening';

    default:
      return '/dashboard';
  }
}

function TaskCard({
  task,
  onComplete,
  onSkip,
  updating,
  upcoming = false,
}: {
  task: StudyTask;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  updating: boolean;
  upcoming?: boolean;
}) {
  const moduleColors: Record<string, string> = {
    LISTENING: 'bg-purple-100 text-purple-700',
    READING: 'bg-green-100 text-green-700',
    WRITING: 'bg-blue-100 text-blue-700',
    SPEAKING: 'bg-indigo-100 text-indigo-700',
  };

  const priorityColors: Record<string, string> = {
    HIGH: 'text-red-600',
    MEDIUM: 'text-amber-600',
    LOW: 'text-slate-500',
  };

  const isCompleted = task.status === 'COMPLETED';
  const isSkipped = task.status === 'SKIPPED';
  const practiceUrl = getPracticeUrl(task.module, task.title);
  const canStartPractice = !isCompleted && !isSkipped && !upcoming;

  return (
    <div
      className={`rounded-xl border bg-white p-4 transition-all ${
        isCompleted || isSkipped
          ? 'border-slate-100 opacity-60'
          : upcoming
            ? 'border-slate-200'
            : 'border-slate-200 hover:border-blue-200 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {!upcoming && !isCompleted && !isSkipped && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(task.id);
              }}
              disabled={updating}
              className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-slate-300 transition-colors hover:border-green-500 hover:bg-green-50"
              title="Mark as complete"
            >
              {updating && (
                <svg
                  className="h-3 w-3 animate-spin text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
            </button>
          )}
          {isCompleted && (
            <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-green-500">
              <svg
                className="h-3 w-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${moduleColors[task.module] || 'bg-slate-100 text-slate-600'}`}
              >
                {task.module}
              </span>
              <span
                className={`text-xs font-medium ${priorityColors[task.priority] || 'text-slate-500'}`}
              >
                {task.priority === 'HIGH' && '⚡'} {task.priority}
              </span>
            </div>
            <h3
              className={`mt-1 font-medium ${isCompleted || isSkipped ? 'text-slate-400 line-through' : 'text-slate-900'}`}
            >
              {task.title}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">{task.description}</p>
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {task.duration} min
              </span>
              {upcoming && (
                <span>
                  {new Date(task.scheduledDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {canStartPractice && (
            <Link
              href={practiceUrl}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500"
            >
              Start
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          )}
          {!isCompleted && !isSkipped && !upcoming && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSkip(task.id);
              }}
              disabled={updating}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
