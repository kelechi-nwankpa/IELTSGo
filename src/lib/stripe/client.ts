import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

/**
 * Get Stripe client instance (lazy-loaded to avoid build-time errors)
 */
export function getStripe(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-04-30.basil',
      typescript: true,
    });
  }
  return stripeClient;
}
