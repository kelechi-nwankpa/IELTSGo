'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Content {
  id: string;
  module: string;
  type: string;
  testType: string | null;
  title: string | null;
  difficultyBand: number | null;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    sessions: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ContentListPage() {
  const [content, setContent] = useState<Content[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [moduleFilter, setModuleFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchContent();
  }, [moduleFilter, currentPage]);

  const fetchContent = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (moduleFilter) params.set('module', moduleFilter);
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', currentPage.toString());
      params.set('limit', '20');

      const response = await fetch(`/api/admin/content?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();
      setContent(data.content);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchContent();
  };

  const handleDelete = async (id: string, title: string | null) => {
    if (!confirm(`Are you sure you want to delete "${title || 'this content'}"?`)) {
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

      // Refresh the list
      fetchContent();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete content');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage reading passages, listening sections, and writing prompts.
          </p>
        </div>
        <Link
          href="/admin/content/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Add New Content
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <label htmlFor="module" className="sr-only">
            Filter by module
          </label>
          <select
            id="module"
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Modules</option>
            <option value="READING">Reading</option>
            <option value="LISTENING">Listening</option>
            <option value="WRITING">Writing</option>
            <option value="SPEAKING">Speaking</option>
          </select>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            Search
          </button>
        </form>

        {pagination && (
          <div className="ml-auto text-sm text-gray-500">
            Showing {content.length} of {pagination.total} items
          </div>
        )}
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      ) : content.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-500">No content found.</p>
          <Link
            href="/admin/content/new"
            className="mt-2 inline-block text-indigo-600 hover:text-indigo-700"
          >
            Add your first content
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 font-medium text-gray-500">Module</th>
                <th className="px-4 py-3 font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 font-medium text-gray-500">Difficulty</th>
                <th className="px-4 py-3 font-medium text-gray-500">Sessions</th>
                <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {content.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {item.title || 'Untitled'}
                    </div>
                    <div className="text-xs text-gray-500">{item.id.slice(0, 8)}...</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getModuleColor(item.module)}`}
                    >
                      {item.module}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{formatType(item.type)}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {item.difficultyBand ? `Band ${item.difficultyBand}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{item._count.sessions}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/content/${item.id}`}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={currentPage === pagination.totalPages}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function getModuleColor(module: string): string {
  switch (module) {
    case 'READING':
      return 'bg-green-100 text-green-700';
    case 'LISTENING':
      return 'bg-purple-100 text-purple-700';
    case 'WRITING':
      return 'bg-blue-100 text-blue-700';
    case 'SPEAKING':
      return 'bg-orange-100 text-orange-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}

function formatType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}
