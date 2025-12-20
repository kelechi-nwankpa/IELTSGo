import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user with quota
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
        targetBand: true,
        testDate: true,
        subscriptionTier: true,
        createdAt: true,
        quota: {
          select: {
            writingEvaluationsUsed: true,
            periodStart: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get recent practice sessions with evaluations
    const recentSessions = await prisma.practiceSession.findMany({
      where: {
        userId,
        completedAt: { not: null },
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        module: true,
        score: true,
        submissionData: true,
        startedAt: true,
        completedAt: true,
        content: {
          select: {
            type: true,
            title: true,
            contentData: true,
          },
        },
        evaluation: {
          select: {
            bandEstimate: true,
            aiResponse: true,
          },
        },
      },
    });

    // Calculate stats
    const allEvaluations = await prisma.evaluation.findMany({
      where: { userId },
      select: {
        bandEstimate: true,
        createdAt: true,
        aiResponse: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalEvaluations = allEvaluations.length;
    const averageBand =
      totalEvaluations > 0
        ? allEvaluations.reduce((sum, e) => sum + e.bandEstimate, 0) / totalEvaluations
        : null;

    // Calculate improvement (compare first 3 vs last 3 evaluations)
    let improvement = null;
    if (totalEvaluations >= 6) {
      const firstThree = allEvaluations.slice(0, 3);
      const lastThree = allEvaluations.slice(-3);
      const firstAvg = firstThree.reduce((sum, e) => sum + e.bandEstimate, 0) / 3;
      const lastAvg = lastThree.reduce((sum, e) => sum + e.bandEstimate, 0) / 3;
      improvement = lastAvg - firstAvg;
    }

    // Get best score
    const bestScore =
      totalEvaluations > 0 ? Math.max(...allEvaluations.map((e) => e.bandEstimate)) : null;

    // Calculate evaluations remaining (free tier = 3)
    const FREE_TIER_LIMIT = 3;
    const evaluationsUsed = user.quota?.writingEvaluationsUsed ?? 0;
    const evaluationsRemaining =
      user.subscriptionTier === 'FREE' ? Math.max(0, FREE_TIER_LIMIT - evaluationsUsed) : null;

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
        targetBand: user.targetBand,
        testDate: user.testDate,
        subscriptionTier: user.subscriptionTier,
        memberSince: user.createdAt,
      },
      stats: {
        totalEvaluations,
        averageBand: averageBand ? Math.round(averageBand * 2) / 2 : null,
        bestScore,
        improvement: improvement ? Math.round(improvement * 2) / 2 : null,
        evaluationsRemaining,
        evaluationsUsed,
      },
      recentSessions: recentSessions.map((s) => {
        // For reading sessions, extract band estimate from submissionData
        const isReading = s.module === 'READING';
        const readingData = isReading ? extractReadingData(s.submissionData, s.score) : null;

        return {
          id: s.id,
          module: s.module,
          type: s.content.type,
          title: s.content.title || getDefaultTitle(s.content.type, s.module),
          prompt: isReading
            ? (readingData?.description ?? '')
            : getPromptPreview(s.content.contentData),
          completedAt: s.completedAt,
          bandScore: isReading
            ? (readingData?.bandEstimate ?? null)
            : (s.evaluation?.bandEstimate ?? null),
          criteriaScores: extractCriteriaScores(s.evaluation?.aiResponse),
        };
      }),
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

function getDefaultTitle(type: string, module?: string): string {
  if (module === 'READING') {
    return 'Reading Practice';
  }
  switch (type) {
    case 'TASK1_ACADEMIC':
      return 'Task 1 (Academic)';
    case 'TASK1_GENERAL':
      return 'Task 1 (General)';
    case 'TASK2':
      return 'Task 2 Essay';
    case 'READING_PASSAGE':
      return 'Reading Practice';
    default:
      return 'Writing Practice';
  }
}

function getPromptPreview(contentData: unknown): string {
  if (typeof contentData === 'object' && contentData !== null) {
    const data = contentData as Record<string, unknown>;
    if (typeof data.prompt === 'string') {
      return data.prompt.length > 100 ? data.prompt.substring(0, 100) + '...' : data.prompt;
    }
  }
  return '';
}

function extractCriteriaScores(aiResponse: unknown): Record<string, number> | null {
  if (typeof aiResponse === 'object' && aiResponse !== null) {
    const response = aiResponse as Record<string, unknown>;
    if (typeof response.criteria === 'object' && response.criteria !== null) {
      return response.criteria as Record<string, number>;
    }
  }
  return null;
}

function extractReadingData(
  submissionData: unknown,
  score: number | null
): { bandEstimate: number; description: string } | null {
  if (typeof submissionData !== 'object' || submissionData === null) {
    return null;
  }

  const data = submissionData as Record<string, unknown>;
  const results = data.results as Array<{ isCorrect: boolean }> | undefined;

  if (!results || !Array.isArray(results)) {
    return null;
  }

  const totalQuestions = results.length;
  const correctAnswers = score ?? results.filter((r) => r.isCorrect).length;
  const percentage = (correctAnswers / totalQuestions) * 100;

  // Calculate band estimate using the same logic as the submit route
  const bandEstimate = calculateBandScore(percentage);

  return {
    bandEstimate,
    description: `${correctAnswers}/${totalQuestions} correct answers`,
  };
}

function calculateBandScore(percentage: number): number {
  if (percentage >= 95) return 9.0;
  if (percentage >= 87.5) return 8.5;
  if (percentage >= 80) return 8.0;
  if (percentage >= 72.5) return 7.5;
  if (percentage >= 65) return 7.0;
  if (percentage >= 57.5) return 6.5;
  if (percentage >= 50) return 6.0;
  if (percentage >= 42.5) return 5.5;
  if (percentage >= 35) return 5.0;
  if (percentage >= 27.5) return 4.5;
  if (percentage >= 20) return 4.0;
  if (percentage >= 12.5) return 3.5;
  return 3.0;
}
