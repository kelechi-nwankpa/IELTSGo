import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface ModuleStats {
  totalSessions: number;
  averageBand: number | null;
  bestBand: number | null;
  lastPracticed: Date | null;
  improvement: number | null;
}

interface SkillBreakdown {
  skillId: string;
  skillName: string;
  module: string;
  currentLevel: number;
  attempts: number;
  trend: 'improving' | 'stable' | 'declining' | null;
}

interface ProgressOverview {
  overall: {
    estimatedBand: number | null;
    targetBand: number | null;
    progressToTarget: number | null;
    totalPracticeSessions: number;
    totalStudyMinutes: number;
    daysUntilTest: number | null;
  };
  modules: {
    listening: ModuleStats;
    reading: ModuleStats;
    writing: ModuleStats;
    speaking: ModuleStats;
  };
  weakAreas: SkillBreakdown[];
  strongAreas: SkillBreakdown[];
  streak: {
    current: number;
    longest: number;
    lastStudyDate: Date | null;
  };
  achievements: {
    total: number;
    recent: Array<{
      id: string;
      name: string;
      unlockedAt: Date;
    }>;
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user data with related progress info
    const [user, studyStreak, skillAssessments, achievements, sessions, evaluations] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            targetBand: true,
            testDate: true,
          },
        }),
        prisma.studyStreak.findUnique({
          where: { userId },
        }),
        prisma.skillAssessment.findMany({
          where: { userId },
          orderBy: { currentLevel: 'asc' },
        }),
        prisma.userAchievement.findMany({
          where: { userId },
          orderBy: { unlockedAt: 'desc' },
          take: 5,
        }),
        prisma.practiceSession.findMany({
          where: {
            userId,
            completedAt: { not: null },
          },
          select: {
            id: true,
            module: true,
            score: true,
            startedAt: true,
            completedAt: true,
            submissionData: true,
          },
          orderBy: { completedAt: 'desc' },
        }),
        prisma.evaluation.findMany({
          where: { userId },
          select: {
            module: true,
            bandEstimate: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        }),
      ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate module statistics
    const moduleStats = calculateModuleStats(sessions, evaluations);

    // Calculate overall estimated band (average of all modules with data)
    const moduleBands = [
      moduleStats.listening.averageBand,
      moduleStats.reading.averageBand,
      moduleStats.writing.averageBand,
      moduleStats.speaking.averageBand,
    ].filter((b): b is number => b !== null);

    const estimatedBand =
      moduleBands.length > 0
        ? Math.round((moduleBands.reduce((a, b) => a + b, 0) / moduleBands.length) * 2) / 2
        : null;

    // Calculate progress to target
    const progressToTarget =
      user.targetBand && estimatedBand
        ? Math.min(100, Math.round(((estimatedBand - 3) / (user.targetBand - 3)) * 100))
        : null;

    // Calculate days until test
    const daysUntilTest = user.testDate
      ? Math.max(0, Math.ceil((user.testDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

    // Calculate total study minutes (estimate based on sessions)
    const totalStudyMinutes = sessions.reduce((total, s) => {
      if (s.completedAt && s.startedAt) {
        const minutes = Math.round((s.completedAt.getTime() - s.startedAt.getTime()) / (1000 * 60));
        return total + Math.min(minutes, 120); // Cap at 2 hours per session
      }
      return total;
    }, 0);

    // Identify weak and strong areas from skill assessments
    const weakAreas = skillAssessments
      .filter((s) => s.currentLevel < 6.0)
      .slice(0, 5)
      .map((s) => ({
        skillId: s.skillId,
        skillName: s.skillName,
        module: s.module,
        currentLevel: s.currentLevel,
        attempts: s.attempts,
        trend: getTrendFromRate(s.improvementRate),
      }));

    const strongAreas = skillAssessments
      .filter((s) => s.currentLevel >= 6.5)
      .slice(-5)
      .reverse()
      .map((s) => ({
        skillId: s.skillId,
        skillName: s.skillName,
        module: s.module,
        currentLevel: s.currentLevel,
        attempts: s.attempts,
        trend: getTrendFromRate(s.improvementRate),
      }));

    // Get achievement names (this would normally come from a constants file)
    const achievementNames: Record<string, string> = {
      first_steps: 'First Steps',
      '7_day_streak': 'Week Warrior',
      '30_day_streak': 'Dedicated Learner',
      band_improver: 'Band Improver',
      target_crusher: 'Target Crusher',
      early_bird: 'Early Bird',
      night_owl: 'Night Owl',
      completionist: 'Completionist',
    };

    const overview: ProgressOverview = {
      overall: {
        estimatedBand,
        targetBand: user.targetBand,
        progressToTarget,
        totalPracticeSessions: sessions.length,
        totalStudyMinutes,
        daysUntilTest,
      },
      modules: moduleStats,
      weakAreas,
      strongAreas,
      streak: {
        current: studyStreak?.currentStreak ?? 0,
        longest: studyStreak?.longestStreak ?? 0,
        lastStudyDate: studyStreak?.lastStudyDate ?? null,
      },
      achievements: {
        total: achievements.length,
        recent: achievements.map((a) => ({
          id: a.achievementId,
          name: achievementNames[a.achievementId] || a.achievementId,
          unlockedAt: a.unlockedAt,
        })),
      },
    };

    return NextResponse.json(overview);
  } catch (error) {
    console.error('Progress overview API error:', error);
    return NextResponse.json({ error: 'Failed to fetch progress overview' }, { status: 500 });
  }
}

function calculateModuleStats(
  sessions: Array<{
    id: string;
    module: string;
    score: number | null;
    startedAt: Date;
    completedAt: Date | null;
    submissionData: unknown;
  }>,
  evaluations: Array<{
    module: string;
    bandEstimate: number;
    createdAt: Date;
  }>
): ProgressOverview['modules'] {
  const modules = ['LISTENING', 'READING', 'WRITING', 'SPEAKING'] as const;
  const result: Record<string, ModuleStats> = {};

  for (const mod of modules) {
    const moduleSessions = sessions.filter((s) => s.module === mod);
    const moduleEvaluations = evaluations.filter((e) => e.module === mod);

    // For Reading/Listening, calculate band from score
    const bands: number[] = [];

    if (mod === 'WRITING' || mod === 'SPEAKING') {
      bands.push(...moduleEvaluations.map((e) => e.bandEstimate));
    } else {
      // For Reading/Listening, calculate from session scores
      for (const session of moduleSessions) {
        if (session.score !== null) {
          const submissionData = session.submissionData as { results?: unknown[] } | null;
          const totalQuestions = submissionData?.results?.length ?? 40;
          const percentage = (session.score / totalQuestions) * 100;
          bands.push(calculateBandFromPercentage(percentage));
        }
      }
    }

    const averageBand =
      bands.length > 0
        ? Math.round((bands.reduce((a, b) => a + b, 0) / bands.length) * 2) / 2
        : null;

    const bestBand = bands.length > 0 ? Math.max(...bands) : null;

    const lastSession = moduleSessions[0];
    const lastPracticed = lastSession?.completedAt ?? null;

    // Calculate improvement (first 3 vs last 3)
    let improvement: number | null = null;
    if (bands.length >= 6) {
      const firstThree = bands.slice(0, 3);
      const lastThree = bands.slice(-3);
      const firstAvg = firstThree.reduce((a, b) => a + b, 0) / 3;
      const lastAvg = lastThree.reduce((a, b) => a + b, 0) / 3;
      improvement = Math.round((lastAvg - firstAvg) * 10) / 10;
    }

    result[mod.toLowerCase()] = {
      totalSessions: moduleSessions.length,
      averageBand,
      bestBand,
      lastPracticed,
      improvement,
    };
  }

  return result as ProgressOverview['modules'];
}

function calculateBandFromPercentage(percentage: number): number {
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

function getTrendFromRate(rate: number | null): 'improving' | 'stable' | 'declining' | null {
  if (rate === null) return null;
  if (rate > 0.1) return 'improving';
  if (rate < -0.1) return 'declining';
  return 'stable';
}
