'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface AccountInfo {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  hasPassword: boolean;
  linkedProviders: string[];
}

function AccountSettingsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Password form state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Check for success message from linking
  useEffect(() => {
    if (searchParams.get('linked') === 'true') {
      setSuccess('Account linked successfully!');
      // Clear the query param
      router.replace('/settings/account');
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchAccount() {
      try {
        const res = await fetch('/api/account');
        if (!res.ok) throw new Error('Failed to fetch account');
        const data = await res.json();
        setAccount(data.user);
      } catch {
        setError('Failed to load account information');
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchAccount();
    }
  }, [session]);

  const handleLinkGoogle = async () => {
    try {
      // Use signIn with redirect to handle the OAuth flow
      // The callbackUrl will bring them back here
      await signIn('google', { callbackUrl: '/settings/account?linked=true' });
    } catch {
      setError('Failed to initiate Google linking');
    }
  };

  const handleUnlinkGoogle = async () => {
    if (!confirm('Are you sure you want to unlink your Google account?')) {
      return;
    }

    try {
      const res = await fetch('/api/account/unlink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to unlink account');
        return;
      }

      setSuccess('Google account unlinked successfully');
      // Refresh account data
      const accountRes = await fetch('/api/account');
      const accountData = await accountRes.json();
      setAccount(accountData.user);
    } catch {
      setError('Failed to unlink account');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: newPassword,
          currentPassword: account?.hasPassword ? currentPassword : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to set password');
        return;
      }

      setSuccess(data.message);
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Refresh account data
      const accountRes = await fetch('/api/account');
      const accountData = await accountRes.json();
      setAccount(accountData.user);
    } catch {
      setError('Failed to set password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-red-500">{error || 'Failed to load account'}</div>
      </div>
    );
  }

  const isGoogleLinked = account.linkedProviders.includes('google');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-500">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="mb-6 text-2xl font-bold text-gray-900">Account Settings</h1>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* Account Info */}
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Account Information</h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{account.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{account.name || 'Not set'}</dd>
                </div>
              </dl>
            </div>

            {/* Linked Accounts */}
            <div className="mb-8 border-t pt-6">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Linked Accounts</h2>
              <p className="mb-4 text-sm text-gray-500">
                Connect your accounts for easier sign-in options.
              </p>

              <div className="space-y-4">
                {/* Google */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center space-x-3">
                    <svg className="h-6 w-6" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Google</p>
                      <p className="text-sm text-gray-500">
                        {isGoogleLinked ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  {isGoogleLinked ? (
                    <button
                      onClick={handleUnlinkGoogle}
                      className="text-sm font-medium text-red-600 hover:text-red-500"
                      disabled={!account.hasPassword && account.linkedProviders.length === 1}
                      title={
                        !account.hasPassword && account.linkedProviders.length === 1
                          ? 'Set a password first before unlinking'
                          : ''
                      }
                    >
                      {!account.hasPassword && account.linkedProviders.length === 1
                        ? 'Set password to unlink'
                        : 'Unlink'}
                    </button>
                  ) : (
                    <button
                      onClick={handleLinkGoogle}
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Link
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t pt-6">
              <h2 className="mb-4 text-lg font-medium text-gray-900">Password</h2>

              {!showPasswordForm ? (
                <div>
                  <p className="mb-4 text-sm text-gray-500">
                    {account.hasPassword
                      ? 'You have a password set. You can change it below.'
                      : "You don't have a password set. Set one to enable email/password sign-in."}
                  </p>
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    {account.hasPassword ? 'Change Password' : 'Set Password'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
                  {account.hasPassword && (
                    <div>
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {account.hasPassword ? 'New Password' : 'Password'}
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:opacity-50"
                    >
                      {passwordLoading
                        ? 'Saving...'
                        : account.hasPassword
                          ? 'Update Password'
                          : 'Set Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setError(null);
                      }}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-gray-500">Loading...</div>
        </div>
      }
    >
      <AccountSettingsContent />
    </Suspense>
  );
}
