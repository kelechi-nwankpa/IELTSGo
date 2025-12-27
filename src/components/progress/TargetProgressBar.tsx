'use client';

interface TargetProgressBarProps {
  currentBand: number | null;
  targetBand: number | null;
  progressPercent: number | null;
  daysUntilTest: number | null;
}

export function TargetProgressBar({
  currentBand,
  targetBand,
  progressPercent,
  daysUntilTest,
}: TargetProgressBarProps) {
  // Calculate readiness status
  const readinessStatus = getReadinessStatus(progressPercent, daysUntilTest);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Progress to Target</h2>
        {daysUntilTest !== null && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-900">{daysUntilTest}</div>
              <div className="text-xs text-gray-500">days to test</div>
            </div>
          </div>
        )}
      </div>

      {targetBand !== null ? (
        <>
          {/* Progress visualization */}
          <div className="relative mb-6">
            {/* Background bar */}
            <div className="h-4 rounded-full bg-gray-200">
              {/* Progress fill */}
              <div
                className={`h-full rounded-full transition-all duration-500 ${readinessStatus.color}`}
                style={{ width: `${progressPercent ?? 0}%` }}
              />
            </div>

            {/* Current band marker */}
            {currentBand !== null && (
              <div
                className="absolute -top-1 h-6 w-6 rounded-full border-2 border-white bg-blue-600 shadow-md"
                style={{
                  left: `calc(${Math.min(100, ((currentBand - 3) / (targetBand - 3)) * 100)}% - 12px)`,
                }}
              >
                <span className="sr-only">Current: {currentBand}</span>
              </div>
            )}

            {/* Target marker */}
            <div className="absolute -top-1 right-0 h-6 w-6 rounded-full border-2 border-white bg-green-500 shadow-md">
              <span className="sr-only">Target: {targetBand}</span>
            </div>
          </div>

          {/* Band scale */}
          <div className="mb-6 flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {currentBand?.toFixed(1) ?? '-'}
              </div>
              <div className="text-xs text-gray-500">Current</div>
            </div>

            <div className="flex-1 px-4">
              <div className="h-0.5 w-full bg-gradient-to-r from-blue-200 via-amber-200 to-green-200" />
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{targetBand.toFixed(1)}</div>
              <div className="text-xs text-gray-500">Target</div>
            </div>
          </div>

          {/* Readiness indicator */}
          <div className={`rounded-lg ${readinessStatus.bg} p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{readinessStatus.icon}</span>
                <div>
                  <div className={`font-semibold ${readinessStatus.textColor}`}>
                    {readinessStatus.label}
                  </div>
                  <div className={`text-sm ${readinessStatus.textColorLight}`}>
                    {readinessStatus.message}
                  </div>
                </div>
              </div>
              {progressPercent !== null && (
                <div className={`text-3xl font-bold ${readinessStatus.textColor}`}>
                  {progressPercent}%
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="py-8 text-center">
          <div className="mb-2 text-4xl">🎯</div>
          <h3 className="mb-1 text-lg font-medium text-gray-900">Set Your Target</h3>
          <p className="text-sm text-gray-500">
            Set a target band score to track your progress towards your goal.
          </p>
          <button className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Set Target Band
          </button>
        </div>
      )}
    </div>
  );
}

interface ReadinessStatus {
  label: string;
  message: string;
  icon: string;
  color: string;
  bg: string;
  textColor: string;
  textColorLight: string;
}

function getReadinessStatus(
  progressPercent: number | null,
  daysUntilTest: number | null
): ReadinessStatus {
  const progress = progressPercent ?? 0;

  // Calculate expected progress based on days until test
  let expectedProgress = 100;
  if (daysUntilTest !== null && daysUntilTest > 0) {
    // Assume user needs to reach 100% by test date
    // If test is in 60 days and they've been preparing for 30 days,
    // expected progress would be 50%
    expectedProgress = Math.min(100, 100 - (daysUntilTest / 90) * 100);
  }

  // On track: actual progress >= expected progress
  // Behind: actual progress < expected - 10%
  // At risk: actual progress < expected - 25%

  if (progress >= 90) {
    return {
      label: 'Ready!',
      message: "You're well-prepared for your target score.",
      icon: '🏆',
      color: 'bg-green-500',
      bg: 'bg-green-50',
      textColor: 'text-green-700',
      textColorLight: 'text-green-600',
    };
  }

  if (progress >= expectedProgress - 10) {
    return {
      label: 'On Track',
      message: "You're progressing well. Keep up the good work!",
      icon: '✅',
      color: 'bg-green-500',
      bg: 'bg-green-50',
      textColor: 'text-green-700',
      textColorLight: 'text-green-600',
    };
  }

  if (progress >= expectedProgress - 25) {
    return {
      label: 'Slightly Behind',
      message: 'Consider increasing your study time to stay on track.',
      icon: '⚠️',
      color: 'bg-amber-500',
      bg: 'bg-amber-50',
      textColor: 'text-amber-700',
      textColorLight: 'text-amber-600',
    };
  }

  return {
    label: 'Needs Attention',
    message: 'Focus on your weak areas to accelerate progress.',
    icon: '🚨',
    color: 'bg-red-500',
    bg: 'bg-red-50',
    textColor: 'text-red-700',
    textColorLight: 'text-red-600',
  };
}
