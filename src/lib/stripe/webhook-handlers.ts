import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus, SubscriptionTier, SubscriptionPlan } from '@prisma/client';

// Extended subscription type to include fields that may be present in webhook events
// but are not in the SDK type definitions for newer API versions
interface SubscriptionWithPeriod extends Stripe.Subscription {
  current_period_start?: number;
  current_period_end?: number;
}

/**
 * Handle incoming Stripe webhook events
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(event.data.object as SubscriptionWithPeriod);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as SubscriptionWithPeriod);
      break;

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }

  const subscriptionId = session.subscription as string;
  const plan = session.metadata?.plan as 'monthly' | 'annual' | undefined;

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: subscriptionId,
      subscriptionTier: 'PREMIUM',
      subscriptionStatus: 'ACTIVE',
      subscriptionPlan: plan === 'annual' ? 'ANNUAL' : 'MONTHLY',
    },
  });

  console.log(`Checkout completed for user ${userId}, subscription ${subscriptionId}`);
}

/**
 * Handle subscription updates (created, updated)
 */
async function handleSubscriptionUpdate(subscription: SubscriptionWithPeriod): Promise<void> {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    // Try to find user by customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: subscription.customer as string },
    });
    if (!user) {
      console.error('Cannot find user for subscription update');
      return;
    }
    await updateUserSubscription(user.id, subscription);
  } else {
    await updateUserSubscription(userId, subscription);
  }
}

/**
 * Update user subscription data from Stripe subscription object
 */
async function updateUserSubscription(
  userId: string,
  subscription: SubscriptionWithPeriod
): Promise<void> {
  const status = mapStripeStatus(subscription.status);
  const priceItem = subscription.items.data[0];
  const interval = priceItem?.price.recurring?.interval;
  const plan: SubscriptionPlan = interval === 'year' ? 'ANNUAL' : 'MONTHLY';

  // Determine subscription tier based on status
  const tier: SubscriptionTier =
    status === 'ACTIVE' || status === 'TRIALING' || status === 'PAST_DUE' ? 'PREMIUM' : 'FREE';

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: status,
      subscriptionTier: tier,
      subscriptionPlan: plan,
      currentPeriodStart: subscription.current_period_start
        ? new Date(subscription.current_period_start * 1000)
        : new Date(),
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000)
        : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });

  console.log(`Subscription updated for user ${userId}: ${status}, ${tier}, ${plan}`);
}

/**
 * Handle subscription deletion/cancellation
 */
async function handleSubscriptionDeleted(subscription: SubscriptionWithPeriod): Promise<void> {
  const userId = subscription.metadata?.userId;

  // Find user by subscription ID or customer ID
  const user = userId
    ? await prisma.user.findUnique({ where: { id: userId } })
    : await prisma.user.findFirst({
        where: {
          OR: [
            { stripeSubscriptionId: subscription.id },
            { stripeCustomerId: subscription.customer as string },
          ],
        },
      });

  if (!user) {
    console.error('Cannot find user for subscription deletion');
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionTier: 'FREE',
      subscriptionStatus: 'CANCELLED',
      stripeSubscriptionId: null,
      subscriptionPlan: null,
      cancelAtPeriodEnd: false,
    },
  });

  // Reset quota for the cancelled user
  await prisma.usageQuota.upsert({
    where: { userId: user.id },
    update: {
      writingEvaluationsUsed: 0,
      speakingEvaluationsUsed: 0,
      explanationsUsed: 0,
      periodStart: new Date(),
    },
    create: {
      userId: user.id,
      periodStart: new Date(),
      writingEvaluationsUsed: 0,
      speakingEvaluationsUsed: 0,
      explanationsUsed: 0,
    },
  });

  console.log(`Subscription deleted for user ${user.id}, downgraded to FREE`);
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  if (!invoice.customer || !invoice.id) return;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: invoice.customer as string },
  });

  if (!user) {
    console.error('Cannot find user for invoice:', invoice.id);
    return;
  }

  // Store invoice record
  await prisma.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    update: {
      amountPaid: invoice.amount_paid,
      status: invoice.status || 'paid',
      invoicePdf: invoice.invoice_pdf,
    },
    create: {
      userId: user.id,
      stripeInvoiceId: invoice.id,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status || 'paid',
      invoicePdf: invoice.invoice_pdf,
    },
  });

  console.log(`Invoice ${invoice.id} recorded for user ${user.id}`);
}

/**
 * Handle failed invoice payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  if (!invoice.customer) return;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: invoice.customer as string },
  });

  if (!user) {
    console.error('Cannot find user for failed payment');
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { subscriptionStatus: 'PAST_DUE' },
  });

  console.log(`Payment failed for user ${user.id}, marked as PAST_DUE`);

  // TODO: Send email notification about payment failure
}

/**
 * Map Stripe subscription status to our enum
 */
function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELLED',
    trialing: 'TRIALING',
    unpaid: 'PAST_DUE',
    incomplete: 'INACTIVE',
    incomplete_expired: 'INACTIVE',
    paused: 'INACTIVE',
  };
  return statusMap[status] || 'INACTIVE';
}
