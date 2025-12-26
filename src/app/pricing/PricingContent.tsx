'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { STRIPE_CONFIG, formatPrice } from '@/lib/stripe/config';

interface CurrentSubscription {
  subscriptionTier: string;
  subscriptionPlan: string | null;
  subscriptionStatus: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

interface PricingContentProps {
  isLoggedIn: boolean;
  currentSubscription: CurrentSubscription | null;
}

export function PricingContent({ isLoggedIn, currentSubscription }: PricingContentProps) {
  const [loading, setLoading] = useState<'monthly' | 'annual' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const cancelled = searchParams.get('cancelled');

  const isPremium =
    currentSubscription?.subscriptionTier === 'PREMIUM' &&
    currentSubscription?.subscriptionStatus === 'ACTIVE';

  const handleCheckout = async (plan: 'monthly' | 'annual') => {
    if (!isLoggedIn) {
      window.location.href = '/auth/signin?callbackUrl=/pricing';
      return;
    }

    setLoading(plan);
    setError(null);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(null);
    }
  };

  const handleManageBilling = async () => {
    setLoading('monthly');
    setError(null);

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Choose the plan that works for you. Upgrade or cancel anytime.
          </p>
        </div>

        {/* Cancelled notice */}
        {cancelled && (
          <div className="mx-auto mt-8 max-w-md rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
            <p className="text-amber-800">Checkout was cancelled. No charges were made.</p>
          </div>
        )}

        {/* Error notice */}
        {error && (
          <div className="mx-auto mt-8 max-w-md rounded-lg border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Current subscription banner */}
        {isPremium && (
          <div className="mx-auto mt-8 max-w-md rounded-lg border border-green-200 bg-green-50 p-4 text-center">
            <p className="font-medium text-green-800">
              You&apos;re currently on the{' '}
              {currentSubscription?.subscriptionPlan === 'ANNUAL' ? 'Annual' : 'Monthly'} Premium
              plan
            </p>
            {currentSubscription?.cancelAtPeriodEnd && currentSubscription?.currentPeriodEnd && (
              <p className="mt-1 text-sm text-green-700">
                Your subscription will end on{' '}
                {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
            <button
              onClick={handleManageBilling}
              disabled={loading !== null}
              className="mt-3 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Manage Billing'}
            </button>
          </div>
        )}

        {/* Pricing cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {/* Free Plan */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h2 className="text-lg font-semibold text-gray-900">Free</h2>
            <p className="mt-2 text-sm text-gray-500">Get started with IELTS practice</p>
            <div className="mt-6">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-500">/month</span>
            </div>

            <ul className="mt-8 space-y-4">
              {STRIPE_CONFIG.plans.free.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
              {STRIPE_CONFIG.plans.free.limitations?.map((limitation, i) => (
                <li key={`lim-${i}`} className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="text-sm text-gray-400">{limitation}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Current Plan
                </Link>
              ) : (
                <Link
                  href="/auth/signup"
                  className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Get Started Free
                </Link>
              )}
            </div>
          </div>

          {/* Monthly Plan */}
          <div className="relative rounded-2xl border-2 border-blue-500 bg-white p-8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-blue-500 px-4 py-1 text-sm font-medium text-white">
                Most Popular
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {STRIPE_CONFIG.plans.monthly.name}
            </h2>
            <p className="mt-2 text-sm text-gray-500">Everything you need to succeed</p>
            <div className="mt-6">
              <span className="text-4xl font-bold text-gray-900">
                {formatPrice(STRIPE_CONFIG.plans.monthly.price)}
              </span>
              <span className="text-gray-500">/month</span>
            </div>

            <ul className="mt-8 space-y-4">
              {STRIPE_CONFIG.plans.monthly.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {isPremium ? (
                <button
                  onClick={handleManageBilling}
                  disabled={loading !== null}
                  className="block w-full rounded-lg bg-gray-100 px-4 py-3 text-center text-sm font-medium text-gray-600"
                >
                  {currentSubscription?.subscriptionPlan === 'MONTHLY'
                    ? 'Current Plan'
                    : 'Switch Plan'}
                </button>
              ) : (
                <button
                  onClick={() => handleCheckout('monthly')}
                  disabled={loading !== null}
                  className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {loading === 'monthly' ? 'Loading...' : 'Subscribe Monthly'}
                </button>
              )}
            </div>
          </div>

          {/* Annual Plan */}
          <div className="relative rounded-2xl border border-gray-200 bg-white p-8">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-green-500 px-4 py-1 text-sm font-medium text-white">
                Save {STRIPE_CONFIG.plans.annual.savings}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {STRIPE_CONFIG.plans.annual.name}
            </h2>
            <p className="mt-2 text-sm text-gray-500">Best value for serious learners</p>
            <div className="mt-6">
              <span className="text-4xl font-bold text-gray-900">
                {formatPrice(STRIPE_CONFIG.plans.annual.price)}
              </span>
              <span className="text-gray-500">/year</span>
            </div>
            <p className="mt-1 text-sm text-green-600">
              {formatPrice(STRIPE_CONFIG.plans.annual.monthlyEquivalent)}/month billed annually
            </p>

            <ul className="mt-8 space-y-4">
              {STRIPE_CONFIG.plans.annual.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {isPremium ? (
                <button
                  onClick={handleManageBilling}
                  disabled={loading !== null}
                  className="block w-full rounded-lg bg-gray-100 px-4 py-3 text-center text-sm font-medium text-gray-600"
                >
                  {currentSubscription?.subscriptionPlan === 'ANNUAL'
                    ? 'Current Plan'
                    : 'Switch Plan'}
                </button>
              ) : (
                <button
                  onClick={() => handleCheckout('annual')}
                  disabled={loading !== null}
                  className="block w-full rounded-lg bg-green-600 px-4 py-3 text-center text-sm font-medium text-white hover:bg-green-500 disabled:opacity-50"
                >
                  {loading === 'annual' ? 'Loading...' : 'Subscribe Annually'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold text-gray-900">Compare Plans</h2>
          <div className="mt-8 overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900">Free</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-blue-600">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <ComparisonRow feature="Writing Evaluations" free="3/month" premium="Unlimited" />
                <ComparisonRow feature="Speaking Evaluations" free="0" premium="Unlimited" />
                <ComparisonRow feature="AI Explanations" free="5/month" premium="Unlimited" />
                <ComparisonRow feature="Reading Practice" free="Yes" premium="Yes" check />
                <ComparisonRow feature="Listening Practice" free="Yes" premium="Yes" check />
                <ComparisonRow feature="Progress Tracking" free="Basic" premium="Advanced" />
                <ComparisonRow feature="Premium Content" free="No" premium="Yes" check />
                <ComparisonRow feature="Priority Support" free="No" premium="Yes" check />
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-6">
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit and debit cards through our secure payment provider, Stripe."
            />
            <FAQItem
              question="Is there a free trial?"
              answer="We offer 3 free writing evaluations so you can experience our AI feedback before subscribing."
            />
            <FAQItem
              question="Can I switch plans?"
              answer="Yes, you can upgrade or downgrade your plan at any time from the billing portal."
            />
          </div>
        </div>

        {/* Final CTA */}
        {!isPremium && (
          <div className="mt-20 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Ready to improve your IELTS score?</h2>
            <p className="mt-2 text-gray-600">
              Join thousands of students who have improved their scores with IELTSGo
            </p>
            <div className="mt-6 flex justify-center gap-4">
              {isLoggedIn ? (
                <button
                  onClick={() => handleCheckout('monthly')}
                  disabled={loading !== null}
                  className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Get Premium Access'}
                </button>
              ) : (
                <Link
                  href="/auth/signup"
                  className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-500"
                >
                  Start Free Trial
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ComparisonRow({
  feature,
  free,
  premium,
  check,
}: {
  feature: string;
  free: string;
  premium: string;
  check?: boolean;
}) {
  return (
    <tr>
      <td className="px-6 py-4 text-sm text-gray-900">{feature}</td>
      <td className="px-6 py-4 text-center text-sm text-gray-500">
        {free === 'Yes' ? (
          <CheckIcon className="mx-auto h-5 w-5 text-green-500" />
        ) : free === 'No' ? (
          <XIcon className="mx-auto h-5 w-5 text-gray-300" />
        ) : (
          free
        )}
      </td>
      <td className="px-6 py-4 text-center text-sm text-gray-900">
        {check || premium === 'Yes' ? (
          <CheckIcon className="mx-auto h-5 w-5 text-blue-500" />
        ) : premium === 'No' ? (
          <XIcon className="mx-auto h-5 w-5 text-gray-300" />
        ) : (
          <span className="font-medium text-blue-600">{premium}</span>
        )}
      </td>
    </tr>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="font-medium text-gray-900">{question}</h3>
      <p className="mt-2 text-sm text-gray-600">{answer}</p>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
