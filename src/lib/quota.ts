/**
 * Usage quota management for IELTSGo
 * Enforces evaluation limits for free tier users
 */

import { prisma } from '@/lib/prisma';
import { SubscriptionTier } from '@prisma/client';

// Quota limits by tier
const QUOTA_LIMITS = {
  FREE: {
    writingEvaluations: 3,
    speakingEvaluations: 0,
    explanations: 5,
  },
  PREMIUM: {
    writingEvaluations: Infinity,
    speakingEvaluations: Infinity,
    explanations: Infinity,
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
 * Get the current quota status for a user
 */
export async function getQuotaStatus(userId: string): Promise<QuotaStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const quota = await getOrCreateQuota(userId);
  const limits = QUOTA_LIMITS[user.subscriptionTier];

  const getRemaining = (used: number, limit: number) =>
    limit === Infinity ? null : Math.max(0, limit - used);

  return {
    tier: user.subscriptionTier,
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
