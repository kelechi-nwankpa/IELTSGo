'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SpeakingTrends } from '@/components/speaking/SpeakingTrends';

interface SpeakingPrompt {
  id: string;
  type: string;
  title: string;
  difficultyBand: number | null;
}

export default function SpeakingPage() {
  const [prompts, setPrompts] = useState<{
    part1: SpeakingPrompt[];
    part2: SpeakingPrompt[];
    part3: SpeakingPrompt[];
  }>({
    part1: [],
    part2: [],
    part3: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrompts() {
      try {
        const response = await fetch('/api/speaking/prompts');
        const data = await response.json();

        const grouped = {
          part1: data.prompts.filter((p: SpeakingPrompt) => p.type === 'SPEAKING_PART1'),
          part2: data.prompts.filter((p: SpeakingPrompt) => p.type === 'SPEAKING_PART2'),
          part3: data.prompts.filter((p: SpeakingPrompt) => p.type === 'SPEAKING_PART3'),
        };

        setPrompts(grouped);
      } catch (error) {
        console.error('Failed to fetch prompts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPrompts();
  }, []);

  const partInfo = [
    {
      part: 1,
      title: 'Part 1: Introduction & Interview',
      description:
        'Answer questions about yourself, your home, work, studies, and other familiar topics.',
      duration: '4-5 minutes',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      color: 'blue',
      prompts: prompts.part1,
    },
    {
      part: 2,
      title: 'Part 2: Long Turn',
      description:
        'Speak for 1-2 minutes on a topic given on a cue card. You have 1 minute to prepare.',
      duration: '3-4 minutes (including prep)',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      color: 'indigo',
      prompts: prompts.part2,
    },
    {
      part: 3,
      title: 'Part 3: Discussion',
      description: 'Discuss more abstract ideas and issues related to the Part 2 topic.',
      duration: '4-5 minutes',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
          />
        </svg>
      ),
      color: 'purple',
      prompts: prompts.part3,
    },
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'bg-blue-100 text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-500',
      badge: 'bg-blue-100 text-blue-700',
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      icon: 'bg-indigo-100 text-indigo-600',
      button: 'bg-indigo-600 hover:bg-indigo-500',
      badge: 'bg-indigo-100 text-indigo-700',
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'bg-purple-100 text-purple-600',
      button: 'bg-purple-600 hover:bg-purple-500',
      badge: 'bg-purple-100 text-purple-700',
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
              <svg
                className="h-6 w-6 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">IELTS Speaking Practice</h1>
              <p className="text-gray-600">Practice all three parts of the IELTS Speaking test</p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-5 w-5 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-medium text-amber-800">How it works</h3>
              <p className="mt-1 text-sm text-amber-700">
                Record your spoken response using your microphone. Your audio will be transcribed
                using AI, then evaluated against IELTS Speaking criteria. You&apos;ll receive
                detailed feedback on fluency, vocabulary, grammar, and pronunciation.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {partInfo.map((part) => {
              const colors = colorClasses[part.color as keyof typeof colorClasses];
              return (
                <div
                  key={part.part}
                  className={`rounded-xl border ${colors.border} ${colors.bg} p-6`}
                >
                  <div className={`mb-4 inline-flex rounded-lg p-3 ${colors.icon}`}>
                    {part.icon}
                  </div>

                  <h2 className="mb-2 text-lg font-semibold text-gray-900">{part.title}</h2>
                  <p className="mb-4 text-sm text-gray-600">{part.description}</p>

                  <div className="mb-4 flex items-center gap-2">
                    <svg
                      className="h-4 w-4 text-gray-400"
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
                    <span className="text-sm text-gray-500">{part.duration}</span>
                  </div>

                  <div className="mb-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${colors.badge}`}
                    >
                      {part.prompts.length} topics available
                    </span>
                  </div>

                  <Link
                    href={`/speaking/part${part.part}`}
                    className={`block w-full rounded-lg ${colors.button} px-4 py-2.5 text-center text-sm font-medium text-white transition-colors`}
                  >
                    Start Part {part.part}
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Speaking Test Tips</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Speak naturally</h3>
                <p className="text-sm text-gray-600">
                  Don&apos;t memorize answers. Examiners can tell.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Extend your answers</h3>
                <p className="text-sm text-gray-600">
                  Give reasons, examples, and personal experiences.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Use linking words</h3>
                <p className="text-sm text-gray-600">
                  Connect ideas with however, moreover, although.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
                4
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Stay calm</h3>
                <p className="text-sm text-gray-600">It&apos;s okay to pause briefly to think.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Trends */}
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Your Speaking Progress</h2>
          <SpeakingTrends />
        </div>
      </div>
    </div>
  );
}
