/**
 * Stripe pricing configuration
 */
export const STRIPE_CONFIG = {
  prices: {
    monthly: process.env.STRIPE_PRICE_ID_MONTHLY || '',
    annual: process.env.STRIPE_PRICE_ID_ANNUAL || '',
  },
  plans: {
    free: {
      name: 'Free',
      price: 0,
      interval: null,
      features: [
        '3 writing evaluations per month',
        '5 AI explanations per month',
        'Basic progress tracking',
        'Access to sample content',
      ],
      limitations: [
        'No speaking evaluations',
        'Limited content library',
      ],
    },
    monthly: {
      name: 'Premium Monthly',
      price: 999, // in cents ($9.99)
      interval: 'month' as const,
      features: [
        'Unlimited writing evaluations',
        'Unlimited speaking evaluations',
        'Unlimited AI explanations',
        'Full content library access',
        'Priority support',
        'Progress analytics',
        'Cancel anytime',
      ],
    },
    annual: {
      name: 'Premium Annual',
      price: 7999, // in cents ($79.99)
      interval: 'year' as const,
      savings: '33%',
      monthlyEquivalent: 667, // ~$6.67/month
      features: [
        'Everything in Monthly',
        'Save 33% compared to monthly',
        'Priority feature access',
        'Extended practice history',
      ],
    },
  },
} as const;

export type PlanType = 'free' | 'monthly' | 'annual';

/**
 * Format price for display
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

/**
 * Get plan display info
 */
export function getPlanInfo(plan: PlanType) {
  return STRIPE_CONFIG.plans[plan];
}
