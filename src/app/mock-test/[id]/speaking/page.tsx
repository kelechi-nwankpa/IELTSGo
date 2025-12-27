'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AudioRecorder } from '@/components/speaking/AudioRecorder';
import { TestTimer, TestProgress } from '@/components/mock-test';

interface SpeakingPart {
  part: 1 | 2 | 3;
  title: string;
  description: string;
  questions: string[];
  prepTime?: number; // seconds (only for Part 2)
  speakingTime: number; // seconds
}

interface SectionData {
  section: string;
  timing: {
    startedAt: string;
    deadline: string;
    durationMinutes: number;
  };
}

interface RecordingData {
  blob: Blob;
  duration: number;
}

const SPEAKING_PARTS: SpeakingPart[] = [
  {
    part: 1,
    title: 'Part 1: Introduction & Interview',
    description: 'The examiner will ask general questions about yourself and familiar topics.',
    questions: [
      'Where are you from?',
      'Do you work or are you a student?',
      'What do you enjoy most about your work/studies?',
      'Do you prefer to spend your free time alone or with others?',
    ],
    speakingTime: 180, // 3 minutes
  },
  {
    part: 2,
    title: 'Part 2: Individual Long Turn',
    description:
      'You will be given a topic card. You have 1 minute to prepare, then speak for 1-2 minutes.',
    questions: [
      'Describe a memorable journey you have taken.',
      'You should say:',
      '• where you went',
      '• who you went with',
      '• what you did there',
      '• and explain why it was memorable.',
    ],
    prepTime: 60, // 1 minute prep
    speakingTime: 120, // 2 minutes
  },
  {
    part: 3,
    title: 'Part 3: Two-way Discussion',
    description: 'The examiner will ask deeper questions related to the Part 2 topic.',
    questions: [
      'How has travel changed in your country over the years?',
      'Do you think people travel more now than in the past?',
      'What are the benefits and drawbacks of tourism for local communities?',
    ],
    speakingTime: 300, // 5 minutes
  },
];

export default function MockTestSpeakingPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  const [sectionData, setSectionData] = useState<SectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Speaking state
  const [currentPart, setCurrentPart] = useState<1 | 2 | 3>(1);
  const [recordings, setRecordings] = useState<Record<number, RecordingData>>({});
  const [isPreparing, setIsPreparing] = useState(false);
  const [prepTimeLeft, setPrepTimeLeft] = useState(0);
  const [partStatus, setPartStatus] = useState<
    Record<number, 'pending' | 'recording' | 'completed'>
  >({
    1: 'pending',
    2: 'pending',
    3: 'pending',
  });

  // Fetch section content
  useEffect(() => {
    async function startSection() {
      try {
        const response = await fetch(`/api/mock-test/${testId}/section/speaking/start`, {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Failed to start speaking section');
          return;
        }

        const data = await response.json();
        setSectionData({
          section: data.section,
          timing: data.timing,
        });
      } catch {
        setError('Failed to connect to server');
      } finally {
        setIsLoading(false);
      }
    }

    startSection();
  }, [testId]);

  // Prep timer for Part 2
  useEffect(() => {
    if (!isPreparing || prepTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setPrepTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPreparing(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPreparing, prepTimeLeft]);

  const handleTimeUp = useCallback(async () => {
    // Auto-submit when time is up
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/mock-test/${testId}/section/speaking/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: 'mock-test-speaking',
          answers: {
            part1Recorded: !!recordings[1],
            part2Recorded: !!recordings[2],
            part3Recorded: !!recordings[3],
          },
          timeSpent: sectionData?.timing.durationMinutes
            ? sectionData.timing.durationMinutes * 60
            : 840,
        }),
      });

      if (response.ok) {
        router.push(`/mock-test/${testId}/results`);
      }
    } catch {
      // Silently fail on auto-submit timeout
    } finally {
      setIsSubmitting(false);
    }
  }, [testId, recordings, sectionData?.timing.durationMinutes, router]);

  const handleStartPart2Prep = () => {
    setIsPreparing(true);
    setPrepTimeLeft(SPEAKING_PARTS[1].prepTime || 60);
  };

  const handleRecordingComplete = (blob: Blob) => {
    const duration = 0; // Will be determined from the blob if needed
    setRecordings((prev) => ({
      ...prev,
      [currentPart]: { blob, duration },
    }));
    setPartStatus((prev) => ({
      ...prev,
      [currentPart]: 'completed',
    }));
  };

  const handleNextPart = () => {
    if (currentPart < 3) {
      setCurrentPart((prev) => (prev + 1) as 1 | 2 | 3);
      setPartStatus((prev) => ({
        ...prev,
        [currentPart + 1]: 'pending',
      }));
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (isSubmitting) return;

    // Check if any recordings exist
    const hasRecordings = Object.keys(recordings).length > 0;
    if (!autoSubmit && !hasRecordings) {
      const confirm = window.confirm('You have not recorded any responses. Submit anyway?');
      if (!confirm) return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create FormData with recordings
      const formData = new FormData();
      formData.append('contentId', 'mock-test-speaking');

      // Add recordings
      Object.entries(recordings).forEach(([part, data]) => {
        formData.append(`part${part}`, data.blob, `part${part}.webm`);
      });

      // For now, just submit basic data since we're not doing full transcription in mock test
      const response = await fetch(`/api/mock-test/${testId}/section/speaking/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: 'mock-test-speaking',
          answers: {
            part1Recorded: !!recordings[1],
            part2Recorded: !!recordings[2],
            part3Recorded: !!recordings[3],
          },
          timeSpent: sectionData?.timing.durationMinutes
            ? sectionData.timing.durationMinutes * 60
            : 840,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to submit');
        return;
      }

      const data = await response.json();

      if (data.isTestComplete) {
        router.push(`/mock-test/${testId}/results`);
      } else {
        // This shouldn't happen as speaking is the last section
        router.push(`/mock-test/${testId}/results`);
      }
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
          <p className="mt-4 text-slate-600">Loading speaking section...</p>
        </div>
      </div>
    );
  }

  if (error && !sectionData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 text-4xl">❌</div>
          <h2 className="text-xl font-semibold text-slate-900">{error}</h2>
          <Link
            href={`/mock-test/${testId}`}
            className="mt-4 inline-block rounded-lg bg-amber-600 px-6 py-2 text-white hover:bg-amber-700"
          >
            Back to Test
          </Link>
        </div>
      </div>
    );
  }

  const currentPartData = SPEAKING_PARTS[currentPart - 1];
  const completedParts = Object.entries(partStatus).filter(
    ([, status]) => status === 'completed'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link
              href={`/mock-test/${testId}`}
              className="flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-900"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span className="hidden sm:inline">Test Overview</span>
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎤</span>
              <h1 className="text-lg font-semibold text-slate-900">Speaking</h1>
            </div>
          </div>
          <div>
            {sectionData?.timing && (
              <TestTimer
                deadline={new Date(sectionData.timing.deadline)}
                onTimeUp={handleTimeUp}
                showProgress
                totalDurationMinutes={sectionData.timing.durationMinutes}
              />
            )}
          </div>
        </div>
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
          <TestProgress
            currentSection="SPEAKING"
            completedSections={['LISTENING', 'READING', 'WRITING']}
            compact
          />
        </div>
      </div>

      {/* Part Tabs */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex">
            {[1, 2, 3].map((part) => (
              <button
                key={part}
                onClick={() => setCurrentPart(part as 1 | 2 | 3)}
                className={`relative px-6 py-3 text-sm font-medium transition-colors ${
                  currentPart === part
                    ? 'text-amber-600'
                    : partStatus[part] === 'completed'
                      ? 'text-green-600'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Part {part}
                {partStatus[part] === 'completed' && <span className="ml-2 text-green-600">✓</span>}
                {currentPart === part && (
                  <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-amber-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Part Info */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              Part {currentPart}
            </span>
            <span className="text-xs text-slate-500">
              ~{Math.floor(currentPartData.speakingTime / 60)} minutes
            </span>
          </div>
          <h2 className="mb-2 text-lg font-semibold text-slate-900">{currentPartData.title}</h2>
          <p className="mb-4 text-slate-600">{currentPartData.description}</p>

          {/* Questions/Prompts */}
          <div className="rounded-lg bg-slate-50 p-4">
            <h3 className="mb-2 text-sm font-medium text-slate-700">
              {currentPart === 2 ? 'Topic Card:' : 'Sample Questions:'}
            </h3>
            <ul className="space-y-1">
              {currentPartData.questions.map((q, i) => (
                <li key={i} className="text-slate-700">
                  {currentPart === 2 ? q : `• ${q}`}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Part 2 Prep Timer */}
        {currentPart === 2 && !recordings[2] && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-6">
            {isPreparing ? (
              <div className="text-center">
                <p className="mb-2 text-sm text-amber-700">Preparation time remaining:</p>
                <div className="text-4xl font-bold text-amber-600">
                  {Math.floor(prepTimeLeft / 60)}:{(prepTimeLeft % 60).toString().padStart(2, '0')}
                </div>
                <p className="mt-2 text-sm text-amber-600">
                  Use this time to plan your response. Make notes if needed.
                </p>
              </div>
            ) : partStatus[2] !== 'completed' ? (
              <div className="text-center">
                <p className="mb-4 text-slate-700">You have 1 minute to prepare before speaking.</p>
                <button
                  onClick={handleStartPart2Prep}
                  className="rounded-lg bg-amber-600 px-6 py-2 font-medium text-white hover:bg-amber-700"
                >
                  Start 1-Minute Preparation
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Audio Recorder */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-medium text-slate-700">
            {recordings[currentPart] ? 'Recording Complete' : 'Record Your Response'}
          </h3>

          {currentPart === 2 &&
          !isPreparing &&
          prepTimeLeft === 0 &&
          !recordings[2] &&
          partStatus[2] !== 'completed' ? (
            <div className="text-center text-slate-500">
              <p>Click &quot;Start 1-Minute Preparation&quot; above first.</p>
            </div>
          ) : partStatus[currentPart] === 'completed' ? (
            <div className="text-center">
              <div className="mb-2 text-4xl">✅</div>
              <p className="text-green-600">Recording saved for Part {currentPart}</p>
              <button
                onClick={() => {
                  setRecordings((prev) => {
                    const newRecordings = { ...prev };
                    delete newRecordings[currentPart];
                    return newRecordings;
                  });
                  setPartStatus((prev) => ({
                    ...prev,
                    [currentPart]: 'pending',
                  }));
                }}
                className="mt-4 text-sm text-slate-600 underline hover:text-slate-900"
              >
                Re-record this part
              </button>
            </div>
          ) : (
            <AudioRecorder
              maxDuration={currentPartData.speakingTime}
              onRecordingComplete={handleRecordingComplete}
              disabled={isSubmitting || (currentPart === 2 && isPreparing)}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">{completedParts} of 3 parts recorded</div>

          <div className="flex gap-3">
            {currentPart < 3 && partStatus[currentPart] === 'completed' && (
              <button
                onClick={handleNextPart}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Continue to Part {currentPart + 1} →
              </button>
            )}
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="rounded-lg bg-amber-600 px-6 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Speaking Section'}
            </button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-medium text-slate-700">Progress</h3>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((part) => (
              <div
                key={part}
                className={`rounded-lg p-3 ${
                  partStatus[part] === 'completed' ? 'bg-green-50' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Part {part}</span>
                  {partStatus[part] === 'completed' ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-xs text-slate-400">Not recorded</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
