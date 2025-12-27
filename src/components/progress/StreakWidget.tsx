'use client';

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
}

export function StreakWidget({ currentStreak, longestStreak, lastStudyDate }: StreakWidgetProps) {
  const isActiveToday = lastStudyDate ? isToday(lastStudyDate) : false;
  const missedYesterday = lastStudyDate && !isActiveToday && !isYesterday(lastStudyDate);

  return (
    <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-orange-900">Study Streak</h3>
        {currentStreak > 0 && <span className="text-2xl">{getStreakEmoji(currentStreak)}</span>}
      </div>

      {/* Main streak display */}
      <div className="mb-4 text-center">
        <div
          className={`text-5xl font-bold ${currentStreak > 0 ? 'text-orange-600' : 'text-gray-400'}`}
        >
          {currentStreak}
        </div>
        <div className="text-sm text-orange-700">
          {currentStreak === 1 ? 'day' : 'days'} in a row
        </div>
      </div>

      {/* Week visualization */}
      <div className="mb-4">
        <WeekStreak lastStudyDate={lastStudyDate} currentStreak={currentStreak} />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <div className="font-medium text-gray-900">{longestStreak}</div>
          <div className="text-xs text-gray-500">Longest streak</div>
        </div>
        <div className="text-right">
          {isActiveToday ? (
            <div className="flex items-center gap-1 text-green-600">
              <span>Today</span>
              <span>✓</span>
            </div>
          ) : missedYesterday ? (
            <div className="text-red-500">Streak lost!</div>
          ) : (
            <div className="text-amber-600">Study today!</div>
          )}
        </div>
      </div>

      {/* Motivational message */}
      {currentStreak > 0 && (
        <div className="mt-3 rounded-lg bg-white/50 p-2 text-center text-xs text-orange-800">
          {getMotivationalMessage(currentStreak)}
        </div>
      )}
    </div>
  );
}

function WeekStreak({
  lastStudyDate,
  currentStreak,
}: {
  lastStudyDate: string | null;
  currentStreak: number;
}) {
  const today = new Date();
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const todayIndex = today.getDay();

  // Calculate which days in the past week had study activity
  const studyDays = new Set<number>();
  if (lastStudyDate && currentStreak > 0) {
    let date = new Date(lastStudyDate);
    for (let i = 0; i < Math.min(currentStreak, 7); i++) {
      const dayOfWeek = date.getDay();
      studyDays.add(dayOfWeek);
      date = new Date(date.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  return (
    <div className="flex justify-between">
      {days.map((day, index) => {
        const isToday = index === todayIndex;
        const hasStudied = studyDays.has(index);
        const isFuture = index > todayIndex;

        return (
          <div key={index} className="flex flex-col items-center gap-1">
            <div className="text-xs text-gray-500">{day}</div>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                hasStudied
                  ? 'bg-orange-500 text-white'
                  : isToday
                    ? 'border-2 border-orange-300 bg-white text-orange-500'
                    : isFuture
                      ? 'bg-gray-100 text-gray-300'
                      : 'bg-gray-200 text-gray-400'
              }`}
            >
              {hasStudied ? '✓' : isToday ? '!' : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function isYesterday(dateString: string): boolean {
  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
}

function getStreakEmoji(streak: number): string {
  if (streak >= 365) return '💎';
  if (streak >= 100) return '🏆';
  if (streak >= 30) return '⭐';
  if (streak >= 7) return '🔥';
  if (streak >= 3) return '✨';
  return '🌱';
}

function getMotivationalMessage(streak: number): string {
  if (streak >= 100) return "You're a legend! 100+ day streak - incredible dedication!";
  if (streak >= 30) return 'One month strong! Your consistency is paying off.';
  if (streak >= 14) return 'Two weeks of daily practice! Keep this momentum going.';
  if (streak >= 7) return "A full week! You're building a solid habit.";
  if (streak >= 3) return "Nice streak! You're developing consistency.";
  return 'Great start! Keep studying daily to build your streak.';
}
