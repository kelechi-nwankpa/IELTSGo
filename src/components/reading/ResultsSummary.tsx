'use client';

interface Score {
  correct: number;
  total: number;
  percentage: number;
  bandEstimate: number;
}

interface ResultsSummaryProps {
  score: Score;
  passageTitle: string;
  onTryAnother: () => void;
}

export function ResultsSummary({ score, passageTitle, onTryAnother }: ResultsSummaryProps) {
  const getBandColor = (band: number) => {
    if (band >= 7) return 'text-green-600 bg-green-50 border-green-200';
    if (band >= 6) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (band >= 5) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 50) return 'text-blue-600';
    if (percentage >= 30) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Results</h2>
        <p className="mt-1 text-gray-500">{passageTitle}</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {/* Score */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Score</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {score.correct}/{score.total}
          </p>
        </div>

        {/* Percentage */}
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-sm font-medium text-gray-500">Percentage</p>
          <p className={`mt-1 text-3xl font-bold ${getPercentageColor(score.percentage)}`}>
            {score.percentage}%
          </p>
        </div>

        {/* Band Estimate */}
        <div className={`rounded-xl border p-4 text-center ${getBandColor(score.bandEstimate)}`}>
          <p className="text-sm font-medium opacity-80">Band Estimate</p>
          <p className="mt-1 text-3xl font-bold">{score.bandEstimate}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-500">Progress</span>
          <span className="font-medium text-gray-700">{score.correct} correct answers</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full rounded-full transition-all ${
              score.percentage >= 70
                ? 'bg-green-500'
                : score.percentage >= 50
                  ? 'bg-blue-500'
                  : score.percentage >= 30
                    ? 'bg-amber-500'
                    : 'bg-red-500'
            }`}
            style={{ width: `${score.percentage}%` }}
          />
        </div>
      </div>

      {/* Band score guide */}
      <div className="mb-6 rounded-lg border border-gray-100 bg-gray-50 p-4">
        <p className="mb-2 text-sm font-medium text-gray-700">IELTS Reading Band Guide</p>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-center">
            <div className="font-medium text-red-600">4.0-5.0</div>
            <div className="text-gray-500">20-35%</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-amber-600">5.5-6.0</div>
            <div className="text-gray-500">40-50%</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-blue-600">6.5-7.0</div>
            <div className="text-gray-500">55-70%</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-green-600">7.5-9.0</div>
            <div className="text-gray-500">75-100%</div>
          </div>
        </div>
      </div>

      <button
        onClick={onTryAnother}
        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
      >
        Try Another Passage
      </button>
    </div>
  );
}
