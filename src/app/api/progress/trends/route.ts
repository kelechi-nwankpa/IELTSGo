import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface BandDataPoint {
  date: string;
  listening: number | null;
  reading: number | null;
  writing: number | null;
  speaking: number | null;
  overall: number | null;
}

interface TrendResponse {
  dataPoints: BandDataPoint[];
  summary: {
    startBand: number | null;
    currentBand: number | null;
    improvement: number | null;
    projectedBand: number | null;
    weeksToTarget: number | null;
  };
  moduleProgress: {
    listening: { start: number | null; current: number | null; change: number | null };
    reading: { start: number | null; current: number | null; change: number | null };
    writing: { start: number | null; current: number | null; change: number | null };
    speaking: { start: number | null; current: number | null; change: number | null };
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '3months'; // 1month, 3months, 6months, all

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '1month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '6months':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date(0);
        break;
      case '3months':
      default:
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    // Fetch progress snapshots
    const snapshots = await prisma.progressSnapshot.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // If no snapshots, calculate from raw data
    if (snapshots.length === 0) {
      const rawTrends = await calculateTrendsFromRawData(userId, startDate);
      return NextResponse.json(rawTrends);
    }

    // Transform snapshots to data points
    const dataPoints: BandDataPoint[] = snapshots.map((s) => ({
      date: s.createdAt.toISOString(),
      listening: s.listeningBand,
      reading: s.readingBand,
      writing: s.writingBand,
      speaking: s.speakingBand,
      overall: s.overallBand,
    }));

    // Calculate summary statistics
    const firstSnapshot = snapshots[0];
    const lastSnapshot = snapshots[snapshots.length - 1];

    const startBand = firstSnapshot?.overallBand ?? null;
    const currentBand = lastSnapshot?.overallBand ?? null;
    const improvement = startBand && currentBand ? currentBand - startBand : null;

    // Get user's target band for projection
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { targetBand: true },
    });

    // Project future band based on improvement rate
    let projectedBand: number | null = null;
    let weeksToTarget: number | null = null;

    if (snapshots.length >= 2 && currentBand && improvement !== null) {
      const weeksBetween = Math.max(
        1,
        (lastSnapshot.createdAt.getTime() - firstSnapshot.createdAt.getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      );
      const weeklyImprovement = improvement / weeksBetween;

      // Project 8 weeks ahead
      projectedBand = Math.round((currentBand + weeklyImprovement * 8) * 2) / 2;
      projectedBand = Math.min(9, Math.max(0, projectedBand)); // Clamp to valid band range

      // Calculate weeks to target
      if (user?.targetBand && weeklyImprovement > 0 && currentBand < user.targetBand) {
        weeksToTarget = Math.ceil((user.targetBand - currentBand) / weeklyImprovement);
      }
    }

    // Calculate module-specific progress
    const moduleProgress = {
      listening: {
        start: firstSnapshot?.listeningBand ?? null,
        current: lastSnapshot?.listeningBand ?? null,
        change:
          firstSnapshot?.listeningBand && lastSnapshot?.listeningBand
            ? lastSnapshot.listeningBand - firstSnapshot.listeningBand
            : null,
      },
      reading: {
        start: firstSnapshot?.readingBand ?? null,
        current: lastSnapshot?.readingBand ?? null,
        change:
          firstSnapshot?.readingBand && lastSnapshot?.readingBand
            ? lastSnapshot.readingBand - firstSnapshot.readingBand
            : null,
      },
      writing: {
        start: firstSnapshot?.writingBand ?? null,
        current: lastSnapshot?.writingBand ?? null,
        change:
          firstSnapshot?.writingBand && lastSnapshot?.writingBand
            ? lastSnapshot.writingBand - firstSnapshot.writingBand
            : null,
      },
      speaking: {
        start: firstSnapshot?.speakingBand ?? null,
        current: lastSnapshot?.speakingBand ?? null,
        change:
          firstSnapshot?.speakingBand && lastSnapshot?.speakingBand
            ? lastSnapshot.speakingBand - firstSnapshot.speakingBand
            : null,
      },
    };

    const response: TrendResponse = {
      dataPoints,
      summary: {
        startBand,
        currentBand,
        improvement,
        projectedBand,
        weeksToTarget,
      },
      moduleProgress,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Progress trends API error:', error);
    return NextResponse.json({ error: 'Failed to fetch progress trends' }, { status: 500 });
  }
}

async function calculateTrendsFromRawData(userId: string, startDate: Date): Promise<TrendResponse> {
  // Fetch all evaluations and sessions
  const [evaluations, sessions] = await Promise.all([
    prisma.evaluation.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.practiceSession.findMany({
      where: {
        userId,
        completedAt: { gte: startDate },
        module: { in: ['READING', 'LISTENING'] },
      },
      orderBy: { completedAt: 'asc' },
    }),
  ]);

  // Group by week
  const weeklyData = new Map<
    string,
    { listening: number[]; reading: number[]; writing: number[]; speaking: number[] }
  >();

  const getWeekKey = (date: Date) => {
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    return weekStart.toISOString().split('T')[0];
  };

  // Process evaluations (writing/speaking)
  for (const evaluation of evaluations) {
    const weekKey = getWeekKey(evaluation.createdAt);
    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, { listening: [], reading: [], writing: [], speaking: [] });
    }
    const week = weeklyData.get(weekKey)!;
    if (evaluation.module === 'WRITING') {
      week.writing.push(evaluation.bandEstimate);
    } else if (evaluation.module === 'SPEAKING') {
      week.speaking.push(evaluation.bandEstimate);
    }
  }

  // Process sessions (reading/listening)
  for (const session of sessions) {
    if (!session.completedAt || session.score === null) continue;

    const weekKey = getWeekKey(session.completedAt);
    if (!weeklyData.has(weekKey)) {
      weeklyData.set(weekKey, { listening: [], reading: [], writing: [], speaking: [] });
    }
    const week = weeklyData.get(weekKey)!;

    const submissionData = session.submissionData as { results?: unknown[] } | null;
    const totalQuestions = submissionData?.results?.length ?? 40;
    const percentage = (session.score / totalQuestions) * 100;
    const band = calculateBandFromPercentage(percentage);

    if (session.module === 'READING') {
      week.reading.push(band);
    } else if (session.module === 'LISTENING') {
      week.listening.push(band);
    }
  }

  // Convert to data points
  const sortedWeeks = Array.from(weeklyData.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  const dataPoints: BandDataPoint[] = sortedWeeks.map(([weekKey, data]) => {
    const listening = data.listening.length > 0 ? avg(data.listening) : null;
    const reading = data.reading.length > 0 ? avg(data.reading) : null;
    const writing = data.writing.length > 0 ? avg(data.writing) : null;
    const speaking = data.speaking.length > 0 ? avg(data.speaking) : null;

    const bands = [listening, reading, writing, speaking].filter((b): b is number => b !== null);
    const overall = bands.length > 0 ? Math.round(avg(bands) * 2) / 2 : null;

    return {
      date: new Date(weekKey).toISOString(),
      listening: listening ? Math.round(listening * 2) / 2 : null,
      reading: reading ? Math.round(reading * 2) / 2 : null,
      writing: writing ? Math.round(writing * 2) / 2 : null,
      speaking: speaking ? Math.round(speaking * 2) / 2 : null,
      overall,
    };
  });

  // Calculate summary
  const firstPoint = dataPoints[0];
  const lastPoint = dataPoints[dataPoints.length - 1];

  return {
    dataPoints,
    summary: {
      startBand: firstPoint?.overall ?? null,
      currentBand: lastPoint?.overall ?? null,
      improvement:
        firstPoint?.overall && lastPoint?.overall ? lastPoint.overall - firstPoint.overall : null,
      projectedBand: null,
      weeksToTarget: null,
    },
    moduleProgress: {
      listening: {
        start: firstPoint?.listening ?? null,
        current: lastPoint?.listening ?? null,
        change:
          firstPoint?.listening && lastPoint?.listening
            ? lastPoint.listening - firstPoint.listening
            : null,
      },
      reading: {
        start: firstPoint?.reading ?? null,
        current: lastPoint?.reading ?? null,
        change:
          firstPoint?.reading && lastPoint?.reading ? lastPoint.reading - firstPoint.reading : null,
      },
      writing: {
        start: firstPoint?.writing ?? null,
        current: lastPoint?.writing ?? null,
        change:
          firstPoint?.writing && lastPoint?.writing ? lastPoint.writing - firstPoint.writing : null,
      },
      speaking: {
        start: firstPoint?.speaking ?? null,
        current: lastPoint?.speaking ?? null,
        change:
          firstPoint?.speaking && lastPoint?.speaking
            ? lastPoint.speaking - firstPoint.speaking
            : null,
      },
    },
  };
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

function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
