'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const MODULE_OPTIONS = [
  { value: 'READING', label: 'Reading' },
  { value: 'LISTENING', label: 'Listening' },
  { value: 'WRITING', label: 'Writing' },
  { value: 'SPEAKING', label: 'Speaking' },
];

const TYPE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  READING: [{ value: 'READING_PASSAGE', label: 'Reading Passage' }],
  LISTENING: [{ value: 'LISTENING_SECTION', label: 'Listening Section' }],
  WRITING: [
    { value: 'TASK1_ACADEMIC', label: 'Task 1 Academic' },
    { value: 'TASK1_GENERAL', label: 'Task 1 General' },
    { value: 'TASK2', label: 'Task 2 Essay' },
  ],
  SPEAKING: [
    { value: 'SPEAKING_PART1', label: 'Part 1' },
    { value: 'SPEAKING_PART2', label: 'Part 2' },
    { value: 'SPEAKING_PART3', label: 'Part 3' },
  ],
};

function NewContentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [module, setModule] = useState(searchParams.get('module') || 'READING');
  const [type, setType] = useState(searchParams.get('type') || 'READING_PASSAGE');
  const [title, setTitle] = useState('');
  const [difficultyBand, setDifficultyBand] = useState('6.5');
  const [isPremium, setIsPremium] = useState(false);
  const [contentDataJson, setContentDataJson] = useState('{\n  \n}');
  const [answersJson, setAnswersJson] = useState('{\n  \n}');

  // Update type when module changes
  useEffect(() => {
    const types = TYPE_OPTIONS[module];
    if (types && types.length > 0) {
      setType(types[0].value);
    }
  }, [module]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Parse JSON fields
      let contentData;
      let answers;

      try {
        contentData = JSON.parse(contentDataJson);
      } catch {
        throw new Error('Invalid JSON in Content Data field');
      }

      try {
        answers = answersJson.trim() ? JSON.parse(answersJson) : null;
      } catch {
        throw new Error('Invalid JSON in Answers field');
      }

      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module,
          type,
          title: title || null,
          difficultyBand: difficultyBand ? parseFloat(difficultyBand) : null,
          isPremium,
          contentData,
          answers,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create content');
      }

      const data = await response.json();
      router.push(`/admin/content/${data.content.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Content</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new reading passage, listening section, or writing prompt.
          </p>
        </div>
        <Link
          href="/admin/content"
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Cancel
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Basic Information</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="module" className="mb-1 block text-sm font-medium text-gray-700">
                Module
              </label>
              <select
                id="module"
                value={module}
                onChange={(e) => setModule(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {MODULE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="type" className="mb-1 block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {(TYPE_OPTIONS[module] || []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., The History of Timekeeping"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="difficulty" className="mb-1 block text-sm font-medium text-gray-700">
                Difficulty Band
              </label>
              <select
                id="difficulty"
                value={difficultyBand}
                onChange={(e) => setDifficultyBand(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">No difficulty set</option>
                <option value="5.0">Band 5.0</option>
                <option value="5.5">Band 5.5</option>
                <option value="6.0">Band 6.0</option>
                <option value="6.5">Band 6.5</option>
                <option value="7.0">Band 7.0</option>
                <option value="7.5">Band 7.5</option>
                <option value="8.0">Band 8.0</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="premium"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="premium" className="text-sm font-medium text-gray-700">
                Premium content
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Content Data (JSON)</h2>
          <p className="mb-2 text-sm text-gray-500">
            {module === 'READING' && 'Include: passage (text), title, questions array'}
            {module === 'LISTENING' && 'Include: audioUrl, title, transcript, questions array, accent'}
            {module === 'WRITING' && 'Include: prompt (text), topic'}
          </p>
          <textarea
            value={contentDataJson}
            onChange={(e) => setContentDataJson(e.target.value)}
            rows={12}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder='{\n  "passage": "...",\n  "questions": []\n}'
          />
        </div>

        {(module === 'READING' || module === 'LISTENING') && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Answer Key (JSON)</h2>
            <p className="mb-2 text-sm text-gray-500">
              Map question IDs to correct answers. Leave empty if not applicable.
            </p>
            <textarea
              value={answersJson}
              onChange={(e) => setAnswersJson(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder='{\n  "q1": "B",\n  "q2": "TRUE"\n}'
            />
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/content"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Content'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewContentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewContentForm />
    </Suspense>
  );
}
