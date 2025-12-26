import { requireAdmin } from '@/lib/auth/admin';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // This will redirect if not admin
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-xl font-bold text-gray-900">
              IELTSGo Admin
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/content"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Content
              </Link>
            </nav>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
          >
            Back to App
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
