'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
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

interface Content {
  id: string;
  module: string;
  type: string;
  testType: string | null;
  title: string | null;
  difficultyBand: number | null;
  isPremium: boolean;
  contentData: object;
  answers: object | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    sessions: number;
  };
}

export default function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [module, setModule] = useState('READING');
  const [type, setType] = useState('READING_PASSAGE');
  const [title, setTitle] = useState('');
  const [difficultyBand, setDifficultyBand] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [contentDataJson, setContentDataJson] = useState('{}');
  const [answersJson, setAnswersJson] = useState('{}');

  useEffect(() => {
    fetchContent();
  }, [id]);

  const fetchContent = async () => {
    try {
      const response = await fetch(`/api/admin/content/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Content not found');
        }
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();
      const c = data.content;

      setContent(c);
      setModule(c.module);
      setType(c.type);
      setTitle(c.title || '');
      setDifficultyBand(c.difficultyBand?.toString() || '');
      setIsPremium(c.isPremium);
      setContentDataJson(JSON.stringify(c.contentData, null, 2));
      setAnswersJson(c.answers ? JSON.stringify(c.answers, null, 2) : '{}');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

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
        answers = answersJson.trim() && answersJson !== '{}' ? JSON.parse(answersJson) : null;
      } catch {
        throw new Error('Invalid JSON in Answers field');
      }

      const response = await fetch(`/api/admin/content/${id}`, {
        method: 'PATCH',
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
        throw new Error(data.error || 'Failed to update content');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content/${id}?force=true`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }

      router.push('/admin/content');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete content');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        {error}
        <Link href="/admin/content" className="ml-4 underline">
          Back to content list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Content</h1>
          <p className="mt-1 text-sm text-gray-500">
            ID: {id} | Sessions: {content?._count.sessions || 0}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            Delete
          </button>
          <Link
            href="/admin/content"
            className="text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Back
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-green-700">
          Content updated successfully!
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
          <textarea
            value={contentDataJson}
            onChange={(e) => setContentDataJson(e.target.value)}
            rows={16}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {(module === 'READING' || module === 'LISTENING') && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Answer Key (JSON)</h2>
            <textarea
              value={answersJson}
              onChange={(e) => setAnswersJson(e.target.value)}
              rows={10}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
