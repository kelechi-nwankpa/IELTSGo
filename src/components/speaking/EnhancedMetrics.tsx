'use client';

interface EnhancedMetricsProps {
  metrics: {
    wordsPerMinute: number;
    totalWords: number;
    fillerWordCount: number;
    fillerWords: { word: string; count: number }[];
    uniqueVocabularyRatio: number;
    averageSentenceLength: number;
    longPausesInferred?: number;
    repeatedWords?: { word: string; count: number; percentage: number }[];
    sentenceVarietyScore?: number;
    overusedWords?: string[];
  };
}

export function EnhancedMetrics({ metrics }: EnhancedMetricsProps) {
  return (
    <div className="space-y-6">
      {/* Core Metrics */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="mb-4 font-semibold text-gray-900">Speaking Metrics</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          <MetricCard
            value={metrics.wordsPerMinute}
            label="Words/minute"
            description={getWPMDescription(metrics.wordsPerMinute)}
          />
          <MetricCard value={metrics.totalWords} label="Total words" />
          <MetricCard
            value={metrics.fillerWordCount}
            label="Filler words"
            description={getFillerDescription(metrics.fillerWordCount, metrics.totalWords)}
            warning={metrics.fillerWordCount > 10}
          />
          <MetricCard
            value={`${Math.round(metrics.uniqueVocabularyRatio * 100)}%`}
            label="Unique vocabulary"
            description={getVocabDescription(metrics.uniqueVocabularyRatio)}
          />
        </div>
      </div>

      {/* Sentence Variety */}
      {metrics.sentenceVarietyScore !== undefined && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Sentence Variety</h3>
            <span
              className={`text-lg font-bold ${getVarietyScoreColor(metrics.sentenceVarietyScore)}`}
            >
              {metrics.sentenceVarietyScore}/100
            </span>
          </div>
          <div className="mb-2 h-3 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all ${getVarietyBarColor(metrics.sentenceVarietyScore)}`}
              style={{ width: `${metrics.sentenceVarietyScore}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {getVarietyFeedback(metrics.sentenceVarietyScore, metrics.averageSentenceLength)}
          </p>
        </div>
      )}

      {/* Filler Words Detail */}
      {metrics.fillerWords && metrics.fillerWords.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Filler Words Used</h3>
          <div className="flex flex-wrap gap-2">
            {metrics.fillerWords.map((fw, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800"
              >
                &quot;{fw.word}&quot;
                <span className="ml-1 font-semibold">x{fw.count}</span>
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Reducing filler words improves fluency scores. Practice pausing silently instead.
          </p>
        </div>
      )}

      {/* Repeated/Overused Words */}
      {metrics.overusedWords && metrics.overusedWords.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="mb-3 font-semibold text-amber-900">Overused Words</h3>
          <div className="flex flex-wrap gap-2">
            {metrics.overusedWords.map((word, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full bg-amber-200 px-3 py-1 text-sm font-medium text-amber-900"
              >
                {word}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-amber-800">
            Try using synonyms or paraphrasing to improve lexical resource.
          </p>
        </div>
      )}

      {/* Repeated Words Detail */}
      {metrics.repeatedWords && metrics.repeatedWords.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-semibold text-gray-900">Word Frequency</h3>
          <div className="space-y-2">
            {metrics.repeatedWords.slice(0, 5).map((rw, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-gray-700">&quot;{rw.word}&quot;</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${Math.min(rw.percentage * 10, 100)}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-sm text-gray-500">
                    {rw.count}x ({rw.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pause Indicators */}
      {metrics.longPausesInferred !== undefined && metrics.longPausesInferred > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {metrics.longPausesInferred} Hesitation{metrics.longPausesInferred > 1 ? 's' : ''}{' '}
                Detected
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Based on repetitions, corrections, and incomplete phrases in your speech. Practice
                speaking more fluidly by preparing key phrases in advance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  value,
  label,
  description,
  warning = false,
}: {
  value: number | string;
  label: string;
  description?: string;
  warning?: boolean;
}) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${warning ? 'text-amber-600' : 'text-gray-900'}`}>
        {value}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
      {description && <div className="mt-1 text-xs text-gray-400">{description}</div>}
    </div>
  );
}

function getWPMDescription(wpm: number): string {
  if (wpm < 100) return 'Slow pace';
  if (wpm < 130) return 'Good pace';
  if (wpm < 160) return 'Natural pace';
  return 'Fast pace';
}

function getFillerDescription(fillerCount: number, totalWords: number): string {
  const ratio = totalWords > 0 ? (fillerCount / totalWords) * 100 : 0;
  if (ratio < 2) return 'Excellent';
  if (ratio < 5) return 'Good';
  if (ratio < 8) return 'Moderate';
  return 'Needs work';
}

function getVocabDescription(ratio: number): string {
  if (ratio >= 0.7) return 'Excellent';
  if (ratio >= 0.5) return 'Good';
  if (ratio >= 0.35) return 'Average';
  return 'Limited';
}

function getVarietyScoreColor(score: number): string {
  if (score >= 70) return 'text-green-600';
  if (score >= 50) return 'text-blue-600';
  if (score >= 30) return 'text-amber-600';
  return 'text-red-600';
}

function getVarietyBarColor(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 50) return 'bg-blue-500';
  if (score >= 30) return 'bg-amber-500';
  return 'bg-red-500';
}

function getVarietyFeedback(score: number, avgLength: number): string {
  if (score >= 70) {
    return `Excellent sentence variety! Your average sentence length of ${avgLength.toFixed(1)} words shows good control.`;
  }
  if (score >= 50) {
    return `Good sentence variety. Try mixing more short and long sentences for better flow.`;
  }
  if (score >= 30) {
    return `Consider varying your sentence structure more. Mix short punchy sentences with longer complex ones.`;
  }
  return `Your sentences are quite similar in structure. Practice using different sentence types and lengths.`;
}
