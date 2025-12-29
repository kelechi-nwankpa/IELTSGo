import { getRedis } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';

/**
 * Token budget configuration by subscription tier
 */
export const TOKEN_BUDGETS = {
  FREE: {
    daily: 10_000, // 10K tokens per day
    monthly: 100_000, // 100K tokens per month
  },
  PREMIUM: {
    daily: 100_000, // 100K tokens per day
    monthly: 2_000_000, // 2M tokens per month
  },
} as const;

/**
 * Redis key prefixes for token tracking
 */
const TOKEN_KEYS = {
  daily: 'tokens:daily:',
  monthly: 'tokens:monthly:',
};

/**
 * Get the current date key for daily tracking (YYYY-MM-DD)
 */
function getDailyKey(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get the current month key for monthly tracking (YYYY-MM)
 */
function getMonthlyKey(): string {
  return new Date().toISOString().slice(0, 7);
}

export interface TokenBudgetStatus {
  dailyUsed: number;
  dailyLimit: number;
  dailyRemaining: number;
  monthlyUsed: number;
  monthlyLimit: number;
  monthlyRemaining: number;
  canProceed: boolean;
  reason?: string;
}

/**
 * Get user's subscription tier
 */
async function getUserTier(userId: string): Promise<'FREE' | 'PREMIUM'> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true, subscriptionStatus: true },
  });

  if (user?.subscriptionTier === 'PREMIUM' && user.subscriptionStatus === 'ACTIVE') {
    return 'PREMIUM';
  }
  return 'FREE';
}

/**
 * Get token usage from Redis or fallback to database
 */
async function getTokenUsage(userId: string): Promise<{
  daily: number;
  monthly: number;
}> {
  const redis = getRedis();

  if (redis) {
    const dailyKey = `${TOKEN_KEYS.daily}${userId}:${getDailyKey()}`;
    const monthlyKey = `${TOKEN_KEYS.monthly}${userId}:${getMonthlyKey()}`;

    const [daily, monthly] = await Promise.all([
      redis.get<number>(dailyKey),
      redis.get<number>(monthlyKey),
    ]);

    return {
      daily: daily || 0,
      monthly: monthly || 0,
    };
  }

  // Fallback to database if Redis is not available
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [dailyUsage, monthlyUsage] = await Promise.all([
    prisma.evaluation.aggregate({
      where: {
        userId,
        createdAt: { gte: today },
      },
      _sum: { tokensUsed: true },
    }),
    prisma.evaluation.aggregate({
      where: {
        userId,
        createdAt: { gte: monthStart },
      },
      _sum: { tokensUsed: true },
    }),
  ]);

  return {
    daily: dailyUsage._sum.tokensUsed || 0,
    monthly: monthlyUsage._sum.tokensUsed || 0,
  };
}

/**
 * Check if user can proceed with AI request based on token budget
 */
export async function checkTokenBudget(
  userId: string,
  estimatedTokens: number = 0
): Promise<TokenBudgetStatus> {
  const tier = await getUserTier(userId);
  const budget = TOKEN_BUDGETS[tier];
  const usage = await getTokenUsage(userId);

  const dailyRemaining = budget.daily - usage.daily;
  const monthlyRemaining = budget.monthly - usage.monthly;

  // Check if we can proceed
  let canProceed = true;
  let reason: string | undefined;

  if (usage.daily >= budget.daily) {
    canProceed = false;
    reason = `Daily token limit reached (${budget.daily.toLocaleString()} tokens). Resets at midnight UTC.`;
  } else if (usage.monthly >= budget.monthly) {
    canProceed = false;
    reason = `Monthly token limit reached (${budget.monthly.toLocaleString()} tokens). Resets on the 1st.`;
  } else if (estimatedTokens > 0) {
    // Check if estimated tokens would exceed budget
    if (usage.daily + estimatedTokens > budget.daily) {
      canProceed = false;
      reason = `Request would exceed daily token limit. ${dailyRemaining.toLocaleString()} tokens remaining.`;
    } else if (usage.monthly + estimatedTokens > budget.monthly) {
      canProceed = false;
      reason = `Request would exceed monthly token limit. ${monthlyRemaining.toLocaleString()} tokens remaining.`;
    }
  }

  return {
    dailyUsed: usage.daily,
    dailyLimit: budget.daily,
    dailyRemaining: Math.max(0, dailyRemaining),
    monthlyUsed: usage.monthly,
    monthlyLimit: budget.monthly,
    monthlyRemaining: Math.max(0, monthlyRemaining),
    canProceed,
    reason,
  };
}

/**
 * Record token usage after successful AI request
 */
export async function recordTokenUsage(userId: string, tokensUsed: number): Promise<void> {
  const redis = getRedis();

  if (redis) {
    const dailyKey = `${TOKEN_KEYS.daily}${userId}:${getDailyKey()}`;
    const monthlyKey = `${TOKEN_KEYS.monthly}${userId}:${getMonthlyKey()}`;

    // Use Redis pipeline for atomic increment
    await Promise.all([
      redis.incrby(dailyKey, tokensUsed).then(() =>
        // Set expiry to end of day (max 24 hours)
        redis.expire(dailyKey, 24 * 60 * 60)
      ),
      redis.incrby(monthlyKey, tokensUsed).then(() =>
        // Set expiry to ~32 days to cover any month
        redis.expire(monthlyKey, 32 * 24 * 60 * 60)
      ),
    ]);
  }

  // Token usage is also stored in the Evaluation table when creating records
  // This Redis tracking is for fast budget checking without DB queries
}

/**
 * Estimate tokens for a request based on input length
 * Rough estimate: ~4 characters per token for English text
 */
export function estimateTokens(text: string): number {
  const charCount = text.length;
  // Estimate tokens (4 chars per token) + overhead for prompt
  const estimated = Math.ceil(charCount / 4) + 500; // 500 token overhead
  return estimated;
}

/**
 * Get user's token budget status for display
 */
export async function getTokenBudgetDisplay(userId: string): Promise<{
  tier: 'FREE' | 'PREMIUM';
  daily: { used: number; limit: number; percentage: number };
  monthly: { used: number; limit: number; percentage: number };
}> {
  const tier = await getUserTier(userId);
  const budget = TOKEN_BUDGETS[tier];
  const usage = await getTokenUsage(userId);

  return {
    tier,
    daily: {
      used: usage.daily,
      limit: budget.daily,
      percentage: Math.min(100, Math.round((usage.daily / budget.daily) * 100)),
    },
    monthly: {
      used: usage.monthly,
      limit: budget.monthly,
      percentage: Math.min(100, Math.round((usage.monthly / budget.monthly) * 100)),
    },
  };
}

/**
 * Check token budget and throw if exceeded (convenience wrapper)
 */
export async function enforceTokenBudget(
  userId: string,
  estimatedTokens: number = 0
): Promise<void> {
  const status = await checkTokenBudget(userId, estimatedTokens);

  if (!status.canProceed) {
    const error = new Error(status.reason || 'Token budget exceeded');
    (error as Error & { code: string }).code = 'TOKEN_BUDGET_EXCEEDED';
    throw error;
  }
}
