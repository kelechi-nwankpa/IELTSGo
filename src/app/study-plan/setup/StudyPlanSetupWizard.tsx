'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Step = 'assessment' | 'target' | 'schedule' | 'review';

interface DiagnosticData {
  id?: string;
  listeningBand: number;
  readingBand: number;
  writingBand: number;
  speakingBand: number;
  source: 'diagnostic' | 'manual';
}

export function StudyPlanSetupWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('assessment');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [targetBand, setTargetBand] = useState<number>(7.0);
  const [testDate, setTestDate] = useState<string>('');
  const [hoursPerDay, setHoursPerDay] = useState<number>(2);
  const [studyDaysPerWeek, setStudyDaysPerWeek] = useState<number>(5);

  const steps: { key: Step; label: string }[] = [
    { key: 'assessment', label: 'Current Level' },
    { key: 'target', label: 'Target Band' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'review', label: 'Review' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  const handleManualBands = async (bands: Omit<DiagnosticData, 'source'>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'manual',
          manualBands: bands,
        }),
      });

      if (!response.ok) throw new Error('Failed to save bands');

      const data = await response.json();
      setDiagnosticData({
        id: data.diagnostic.id,
        ...bands,
        source: 'manual',
      });
      setCurrentStep('target');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bands');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create the study plan
      const createResponse = await fetch('/api/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagnosticId: diagnosticData?.id,
          targetBand,
          testDate: testDate || null,
          hoursPerDay,
          studyDaysPerWeek,
        }),
      });

      if (!createResponse.ok) throw new Error('Failed to create study plan');

      const { studyPlan } = await createResponse.json();

      // Generate the AI plan
      const generateResponse = await fetch('/api/study-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studyPlanId: studyPlan.id }),
      });

      if (!generateResponse.ok) throw new Error('Failed to generate study plan');

      // Redirect to study plan page
      router.push('/study-plan');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/study-plan" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
              <span className="text-lg font-bold text-white">G</span>
            </div>
            <span className="text-xl font-bold text-slate-900">IELTSGo</span>
          </Link>
          <Link
            href="/study-plan"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Cancel
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                    index < currentStepIndex
                      ? 'bg-green-500 text-white'
                      : index === currentStepIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {index < currentStepIndex ? '✓' : index + 1}
                </div>
                <span
                  className={`ml-2 hidden text-sm font-medium sm:block ${
                    index === currentStepIndex ? 'text-blue-600' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-4 h-0.5 w-12 sm:w-24 ${
                      index < currentStepIndex ? 'bg-green-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">{error}</div>}

        {/* Step Content */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          {currentStep === 'assessment' && (
            <AssessmentStep
              onManualInput={handleManualBands}
              onTakeDiagnostic={() => router.push('/study-plan/diagnostic')}
              loading={loading}
            />
          )}

          {currentStep === 'target' && (
            <TargetStep
              currentBands={diagnosticData}
              targetBand={targetBand}
              testDate={testDate}
              onTargetChange={setTargetBand}
              onTestDateChange={setTestDate}
              onBack={() => setCurrentStep('assessment')}
              onNext={() => setCurrentStep('schedule')}
            />
          )}

          {currentStep === 'schedule' && (
            <ScheduleStep
              hoursPerDay={hoursPerDay}
              studyDaysPerWeek={studyDaysPerWeek}
              onHoursChange={setHoursPerDay}
              onDaysChange={setStudyDaysPerWeek}
              onBack={() => setCurrentStep('target')}
              onNext={() => setCurrentStep('review')}
            />
          )}

          {currentStep === 'review' && (
            <ReviewStep
              diagnosticData={diagnosticData}
              targetBand={targetBand}
              testDate={testDate}
              hoursPerDay={hoursPerDay}
              studyDaysPerWeek={studyDaysPerWeek}
              onBack={() => setCurrentStep('schedule')}
              onSubmit={handleCreatePlan}
              loading={loading}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// Assessment Step Component
function AssessmentStep({
  onManualInput,
  onTakeDiagnostic,
  loading,
}: {
  onManualInput: (bands: Omit<DiagnosticData, 'source'>) => void;
  onTakeDiagnostic: () => void;
  loading: boolean;
}) {
  const [showManual, setShowManual] = useState(false);
  const [bands, setBands] = useState({
    listeningBand: 6.0,
    readingBand: 6.0,
    writingBand: 5.5,
    speakingBand: 5.5,
  });

  const bandOptions = [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

  if (showManual) {
    return (
      <div>
        <h2 className="mb-2 text-xl font-semibold text-slate-900">Enter Your Estimated Bands</h2>
        <p className="mb-6 text-slate-600">
          If you know your current IELTS band scores (or estimates), enter them below.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {(['listening', 'reading', 'writing', 'speaking'] as const).map((module) => (
            <div key={module}>
              <label className="mb-2 block text-sm font-medium text-slate-700 capitalize">
                {module}
              </label>
              <select
                value={bands[`${module}Band` as keyof typeof bands]}
                onChange={(e) =>
                  setBands((prev) => ({
                    ...prev,
                    [`${module}Band`]: parseFloat(e.target.value),
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                {bandOptions.map((band) => (
                  <option key={band} value={band}>
                    Band {band}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={() => setShowManual(false)}
            className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back
          </button>
          <button
            onClick={() => onManualInput(bands)}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-slate-900">How would you like to start?</h2>
      <p className="mb-8 text-slate-600">
        To create a personalized study plan, we need to know your current level.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={onTakeDiagnostic}
          className="group rounded-xl border-2 border-blue-200 bg-blue-50 p-6 text-left transition-all hover:border-blue-400 hover:shadow-lg"
        >
          <div className="mb-3 text-3xl">🎯</div>
          <h3 className="mb-1 font-semibold text-slate-900">Take Diagnostic Test</h3>
          <p className="text-sm text-slate-600">
            Get accurate band estimates across all modules (30-40 mins)
          </p>
          <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-600">
            Recommended
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>

        <button
          onClick={() => setShowManual(true)}
          className="group rounded-xl border-2 border-slate-200 bg-white p-6 text-left transition-all hover:border-slate-300 hover:shadow-lg"
        >
          <div className="mb-3 text-3xl">✏️</div>
          <h3 className="mb-1 font-semibold text-slate-900">Enter Manually</h3>
          <p className="text-sm text-slate-600">
            Already know your bands? Enter them directly (1 min)
          </p>
          <span className="mt-4 inline-flex items-center text-sm font-medium text-slate-600">
            Quick start
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}

// Target Step Component
function TargetStep({
  currentBands,
  targetBand,
  testDate,
  onTargetChange,
  onTestDateChange,
  onBack,
  onNext,
}: {
  currentBands: DiagnosticData | null;
  targetBand: number;
  testDate: string;
  onTargetChange: (band: number) => void;
  onTestDateChange: (date: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const bandOptions = [5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];
  const currentOverall = currentBands
    ? (currentBands.listeningBand +
        currentBands.readingBand +
        currentBands.writingBand +
        currentBands.speakingBand) /
      4
    : 5.5;

  // Calculate minimum date (2 weeks from now)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 14);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-slate-900">Set Your Target</h2>
      <p className="mb-8 text-slate-600">What band score are you aiming for?</p>

      {currentBands && (
        <div className="mb-6 rounded-lg bg-slate-50 p-4">
          <div className="mb-2 text-sm font-medium text-slate-500">Your current level</div>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-slate-900">{currentOverall.toFixed(1)}</span>
            <div className="flex gap-2 text-sm text-slate-600">
              <span>L: {currentBands.listeningBand}</span>
              <span>R: {currentBands.readingBand}</span>
              <span>W: {currentBands.writingBand}</span>
              <span>S: {currentBands.speakingBand}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <label className="mb-3 block text-sm font-medium text-slate-700">Target Band</label>
        <div className="flex flex-wrap gap-2">
          {bandOptions.map((band) => (
            <button
              key={band}
              onClick={() => onTargetChange(band)}
              className={`rounded-lg px-6 py-3 text-lg font-semibold transition-all ${
                targetBand === band
                  ? 'bg-blue-600 text-white shadow-lg'
                  : band <= currentOverall
                    ? 'bg-slate-100 text-slate-400'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300'
              }`}
            >
              {band}
            </button>
          ))}
        </div>
        {targetBand <= currentOverall && (
          <p className="mt-2 text-sm text-amber-600">
            Your target should be higher than your current level.
          </p>
        )}
      </div>

      <div className="mb-8">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Test Date (Optional)
        </label>
        <input
          type="date"
          value={testDate}
          onChange={(e) => onTestDateChange(e.target.value)}
          min={minDateStr}
          className="w-full max-w-xs rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
        />
        <p className="mt-1 text-sm text-slate-500">
          We&apos;ll customize your plan based on your test date.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={targetBand <= currentOverall}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// Schedule Step Component
function ScheduleStep({
  hoursPerDay,
  studyDaysPerWeek,
  onHoursChange,
  onDaysChange,
  onBack,
  onNext,
}: {
  hoursPerDay: number;
  studyDaysPerWeek: number;
  onHoursChange: (hours: number) => void;
  onDaysChange: (days: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const hoursOptions = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];
  const daysOptions = [3, 4, 5, 6, 7];

  const weeklyHours = hoursPerDay * studyDaysPerWeek;

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-slate-900">Your Study Schedule</h2>
      <p className="mb-8 text-slate-600">How much time can you dedicate to studying?</p>

      <div className="mb-8">
        <label className="mb-3 block text-sm font-medium text-slate-700">Hours per day</label>
        <div className="flex flex-wrap gap-2">
          {hoursOptions.map((hours) => (
            <button
              key={hours}
              onClick={() => onHoursChange(hours)}
              className={`rounded-lg px-5 py-3 text-sm font-medium transition-all ${
                hoursPerDay === hours
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300'
              }`}
            >
              {hours}h
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <label className="mb-3 block text-sm font-medium text-slate-700">Days per week</label>
        <div className="flex flex-wrap gap-2">
          {daysOptions.map((days) => (
            <button
              key={days}
              onClick={() => onDaysChange(days)}
              className={`rounded-lg px-5 py-3 text-sm font-medium transition-all ${
                studyDaysPerWeek === days
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-300'
              }`}
            >
              {days} days
            </button>
          ))}
        </div>
      </div>

      <div className="mb-8 rounded-lg bg-blue-50 p-4">
        <div className="text-sm text-blue-700">
          Weekly study time: <strong>{weeklyHours} hours</strong>
        </div>
        {weeklyHours < 7 && (
          <p className="mt-1 text-sm text-blue-600">
            For best results, we recommend at least 10 hours per week.
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// Review Step Component
function ReviewStep({
  diagnosticData,
  targetBand,
  testDate,
  hoursPerDay,
  studyDaysPerWeek,
  onBack,
  onSubmit,
  loading,
}: {
  diagnosticData: DiagnosticData | null;
  targetBand: number;
  testDate: string;
  hoursPerDay: number;
  studyDaysPerWeek: number;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  const currentOverall = diagnosticData
    ? (diagnosticData.listeningBand +
        diagnosticData.readingBand +
        diagnosticData.writingBand +
        diagnosticData.speakingBand) /
      4
    : 5.5;

  const bandGap = targetBand - currentOverall;
  const daysUntilTest = useMemo(() => {
    if (!testDate) return null;
    return Math.ceil((new Date(testDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  }, [testDate]);

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-slate-900">Review Your Plan</h2>
      <p className="mb-8 text-slate-600">
        Confirm your settings and generate your personalized study plan.
      </p>

      <div className="space-y-4">
        <div className="flex justify-between rounded-lg bg-slate-50 p-4">
          <span className="text-slate-600">Current Level</span>
          <span className="font-semibold text-slate-900">{currentOverall.toFixed(1)}</span>
        </div>

        <div className="flex justify-between rounded-lg bg-slate-50 p-4">
          <span className="text-slate-600">Target Band</span>
          <span className="font-semibold text-blue-600">{targetBand}</span>
        </div>

        <div className="flex justify-between rounded-lg bg-slate-50 p-4">
          <span className="text-slate-600">Band Gap</span>
          <span className={`font-semibold ${bandGap > 1.5 ? 'text-amber-600' : 'text-green-600'}`}>
            +{bandGap.toFixed(1)}
          </span>
        </div>

        {testDate && (
          <div className="flex justify-between rounded-lg bg-slate-50 p-4">
            <span className="text-slate-600">Test Date</span>
            <span className="font-semibold text-slate-900">
              {new Date(testDate).toLocaleDateString()} ({daysUntilTest} days)
            </span>
          </div>
        )}

        <div className="flex justify-between rounded-lg bg-slate-50 p-4">
          <span className="text-slate-600">Weekly Study Time</span>
          <span className="font-semibold text-slate-900">
            {hoursPerDay * studyDaysPerWeek} hours ({hoursPerDay}h x {studyDaysPerWeek} days)
          </span>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">✨</span>
          <div>
            <div className="font-medium text-blue-900">AI-Powered Personalization</div>
            <p className="mt-1 text-sm text-blue-700">
              We&apos;ll create a customized study plan with daily tasks, weekly goals, and
              skill-building exercises tailored to your needs.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={onBack}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating Plan...
            </>
          ) : (
            <>
              Generate My Study Plan
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
