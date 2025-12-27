/**
 * Usage quota management for IELTSGo
 * Enforces evaluation limits for free tier users
 * Premium users have unlimited access while their subscription is active
 */

import { prisma } from '@/lib/prisma';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

// Quota limits by tier
const QUOTA_LIMITS = {
  FREE: {
    writingEvaluations: 3,
    speakingEvaluations: 0,
    explanations: 5,
    mockTests: 0, // Mock tests are premium-only
  },
  PREMIUM: {
    writingEvaluations: Infinity,
    speakingEvaluations: Infinity,
    explanations: Infinity,
    mockTests: 2, // 2 mock tests per month
  },
} as const;

export interface QuotaStatus {
  tier: SubscriptionTier;
  writing: {
    used: number;
    limit: number | null; // null = unlimited
    remaining: number | null;
  };
  speaking: {
    used: number;
    limit: number | null;
    remaining: number | null;
  };
  explanations: {
    used: number;
    limit: number | null;
    remaining: number | null;
  };
  mockTests: {
    used: number;
    limit: number;
    remaining: number;
  };
}

/**
 * Get or create quota record for a user
 */
async function getOrCreateQuota(userId: string) {
  let quota = await prisma.usageQuota.findUnique({
    where: { userId },
  });

  if (!quota) {
    quota = await prisma.usageQuota.create({
      data: {
        userId,
        periodStart: new Date(),
        writingEvaluationsUsed: 0,
        speakingEvaluationsUsed: 0,
        explanationsUsed: 0,
      },
    });
  }

  return quota;
}

/**
 * Determine effective subscription tier based on status and period
 * Premium is only active if subscription is ACTIVE and within period
 */
function getEffectiveTier(
  tier: SubscriptionTier,
  status: SubscriptionStatus,
  periodEnd: Date | null
): SubscriptionTier {
  // If not premium, always free
  if (tier !== 'PREMIUM') {
    return 'FREE';
  }

  // Premium requires active subscription
  if (status !== 'ACTIVE' && status !== 'TRIALING' && status !== 'PAST_DUE') {
    return 'FREE';
  }

  // Check if subscription period has expired
  if (periodEnd && periodEnd < new Date()) {
    return 'FREE';
  }

  return 'PREMIUM';
}

/**
 * Get the current quota status for a user
 */
export async function getQuotaStatus(userId: string): Promise<QuotaStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true,
      subscriptionStatus: true,
      currentPeriodEnd: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Determine effective tier based on subscription validity
  const effectiveTier = getEffectiveTier(
    user.subscriptionTier,
    user.subscriptionStatus,
    user.currentPeriodEnd
  );

  const quota = await getOrCreateQuota(userId);
  const limits = QUOTA_LIMITS[effectiveTier];

  const getRemaining = (used: number, limit: number) =>
    limit === Infinity ? null : Math.max(0, limit - used);

  return {
    tier: effectiveTier,
    writing: {
      used: quota.writingEvaluationsUsed,
      limit: limits.writingEvaluations === Infinity ? null : limits.writingEvaluations,
      remaining: getRemaining(quota.writingEvaluationsUsed, limits.writingEvaluations),
    },
    speaking: {
      used: quota.speakingEvaluationsUsed,
      limit: limits.speakingEvaluations === Infinity ? null : limits.speakingEvaluations,
      remaining: getRemaining(quota.speakingEvaluationsUsed, limits.speakingEvaluations),
    },
    explanations: {
      used: quota.explanationsUsed,
      limit: limits.explanations === Infinity ? null : limits.explanations,
      remaining: getRemaining(quota.explanationsUsed, limits.explanations),
    },
    mockTests: {
      used: quota.mockTestsUsed,
      limit: limits.mockTests,
      remaining: Math.max(0, limits.mockTests - quota.mockTestsUsed),
    },
  };
}

/**
 * Check if a user can use a writing evaluation
 */
export async function canUseWritingEvaluation(userId: string): Promise<boolean> {
  const status = await getQuotaStatus(userId);

  // Unlimited for premium
  if (status.writing.limit === null) {
    return true;
  }

  return status.writing.remaining !== null && status.writing.remaining > 0;
}

/**
 * Increment the writing evaluation count for a user
 * Call this AFTER a successful evaluation
 */
export async function incrementWritingEvaluation(userId: string): Promise<void> {
  await prisma.usageQuota.upsert({
    where: { userId },
    update: {
      writingEvaluationsUsed: { increment: 1 },
    },
    create: {
      userId,
      periodStart: new Date(),
      writingEvaluationsUsed: 1,
      speakingEvaluationsUsed: 0,
      explanationsUsed: 0,
    },
  });
}

/**
 * Check if a user can use a speaking evaluation
 */
export async function canUseSpeakingEvaluation(userId: string): Promise<boolean> {
  const status = await getQuotaStatus(userId);

  if (status.speaking.limit === null) {
    return true;
  }

  return status.speaking.remaining !== null && status.speaking.remaining > 0;
}

/**
 * Increment the speaking evaluation count for a user
 */
export async function incrementSpeakingEvaluation(userId: string): Promise<void> {
  await prisma.usageQuota.upsert({
    where: { userId },
    update: {
      speakingEvaluationsUsed: { increment: 1 },
    },
    create: {
      userId,
      periodStart: new Date(),
      writingEvaluationsUsed: 0,
      speakingEvaluationsUsed: 1,
      explanationsUsed: 0,
    },
  });
}

/**
 * Check if a user can use an explanation
 */
export async function canUseExplanation(userId: string): Promise<boolean> {
  const status = await getQuotaStatus(userId);

  if (status.explanations.limit === null) {
    return true;
  }

  return status.explanations.remaining !== null && status.explanations.remaining > 0;
}

/**
 * Increment the explanation count for a user
 */
export async function incrementExplanation(userId: string): Promise<void> {
  await prisma.usageQuota.upsert({
    where: { userId },
    update: {
      explanationsUsed: { increment: 1 },
    },
    create: {
      userId,
      periodStart: new Date(),
      writingEvaluationsUsed: 0,
      speakingEvaluationsUsed: 0,
      explanationsUsed: 1,
    },
  });
}

/**
 * Check if a user can start a mock test
 * Mock tests are premium-only with a monthly limit
 */
export async function canUseMockTest(userId: string): Promise<boolean> {
  const status = await getQuotaStatus(userId);

  // Free tier cannot use mock tests
  if (status.tier === 'FREE') {
    return false;
  }

  return status.mockTests.remaining > 0;
}

/**
 * Increment the mock test count for a user
 * Call this when a mock test is started (not completed)
 */
export async function incrementMockTest(userId: string): Promise<void> {
  await prisma.usageQuota.upsert({
    where: { userId },
    update: {
      mockTestsUsed: { increment: 1 },
    },
    create: {
      userId,
      periodStart: new Date(),
      writingEvaluationsUsed: 0,
      speakingEvaluationsUsed: 0,
      explanationsUsed: 0,
      mockTestsUsed: 1,
    },
  });
}
