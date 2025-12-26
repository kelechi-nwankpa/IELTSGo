import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminDashboard() {
  // Get content counts by module
  const [readingCount, listeningCount, writingCount, totalSessions] = await Promise.all([
    prisma.content.count({ where: { module: 'READING' } }),
    prisma.content.count({ where: { module: 'LISTENING' } }),
    prisma.content.count({ where: { module: 'WRITING' } }),
    prisma.practiceSession.count(),
  ]);

  // Get recent sessions
  const recentSessions = await prisma.practiceSession.findMany({
    take: 5,
    orderBy: { startedAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      content: { select: { title: true, module: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Manage content and monitor usage.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Reading Passages" value={readingCount} color="green" />
        <StatCard title="Listening Sections" value={listeningCount} color="purple" />
        <StatCard title="Writing Prompts" value={writingCount} color="blue" />
        <StatCard title="Total Sessions" value={totalSessions} color="gray" />
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/content/new?module=READING&type=READING_PASSAGE"
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
          >
            Add Reading Passage
          </Link>
          <Link
            href="/admin/content/new?module=LISTENING&type=LISTENING_SECTION"
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
          >
            Add Listening Section
          </Link>
          <Link
            href="/admin/content/new?module=WRITING&type=TASK2"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Add Writing Prompt
          </Link>
          <Link
            href="/admin/content"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            View All Content
          </Link>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Recent Practice Sessions</h2>
        {recentSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-2 font-medium text-gray-500">User</th>
                  <th className="pb-2 font-medium text-gray-500">Module</th>
                  <th className="pb-2 font-medium text-gray-500">Content</th>
                  <th className="pb-2 font-medium text-gray-500">Score</th>
                  <th className="pb-2 font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentSessions.map((session) => (
                  <tr key={session.id}>
                    <td className="py-2">
                      <div>
                        <div className="font-medium text-gray-900">
                          {session.user.name || 'Anonymous'}
                        </div>
                        <div className="text-gray-500">{session.user.email}</div>
                      </div>
                    </td>
                    <td className="py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${getModuleColor(session.module)}`}
                      >
                        {session.module}
                      </span>
                    </td>
                    <td className="py-2 text-gray-700">
                      {session.content.title || 'Untitled'}
                    </td>
                    <td className="py-2 text-gray-700">
                      {session.score !== null ? `${(session.score * 100).toFixed(0)}%` : '-'}
                    </td>
                    <td className="py-2 text-gray-500">
                      {new Date(session.startedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No practice sessions yet.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: 'green' | 'purple' | 'blue' | 'gray';
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    blue: 'bg-blue-50 text-blue-700',
    gray: 'bg-gray-50 text-gray-700',
  };

  return (
    <div className={`rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="text-sm font-medium opacity-80">{title}</div>
      <div className="mt-1 text-3xl font-bold">{value}</div>
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
