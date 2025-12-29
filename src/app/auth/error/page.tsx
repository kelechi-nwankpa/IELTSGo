'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface ErrorInfo {
  message: string;
  description?: string;
  showLinkingInstructions?: boolean;
}

const errorMessages: Record<string, ErrorInfo> = {
  Configuration: {
    message: 'There is a problem with the server configuration.',
  },
  AccessDenied: {
    message: 'You do not have permission to sign in.',
  },
  Verification: {
    message: 'The verification link may have expired or already been used.',
  },
  OAuthSignin: {
    message: 'Error in the OAuth sign in process.',
  },
  OAuthCallback: {
    message: 'Error in the OAuth callback process.',
  },
  OAuthCreateAccount: {
    message: 'Could not create an account using this OAuth provider.',
  },
  EmailCreateAccount: {
    message: 'Could not create an account using this email.',
  },
  Callback: {
    message: 'Error in the callback process.',
  },
  OAuthAccountNotLinked: {
    message: 'An account with this email already exists',
    description:
      'For security, we cannot automatically link accounts. Please sign in with your existing method first, then link your Google account in settings.',
    showLinkingInstructions: true,
  },
  EmailSignin: {
    message: 'Error sending the verification email.',
  },
  CredentialsSignin: {
    message: 'Invalid email or password.',
  },
  SessionRequired: {
    message: 'Please sign in to access this page.',
  },
  Default: {
    message: 'An error occurred during authentication.',
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';

  const errorInfo = errorMessages[error] || errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">IELTSGo</h1>
          <div className="mt-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">{errorInfo.message}</h2>
            {errorInfo.description && (
              <p className="mt-2 text-sm text-gray-600">{errorInfo.description}</p>
            )}
          </div>
        </div>

        {errorInfo.showLinkingInstructions && (
          <div className="rounded-lg bg-blue-50 p-4 text-left">
            <h3 className="text-sm font-medium text-blue-800">How to link your accounts:</h3>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-blue-700">
              <li>Sign in with your email and password</li>
              <li>Go to Account Settings</li>
              <li>Click &quot;Link Google Account&quot;</li>
            </ol>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            {errorInfo.showLinkingInstructions
              ? 'Sign in with email & password'
              : 'Try signing in again'}
          </Link>
          <Link
            href="/"
            className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            Go to home page
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-gray-500">Loading...</div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
