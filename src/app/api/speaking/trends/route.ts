import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface TrendDataPoint {
  date: string;
  overallBand: number;
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
  wordsPerMinute: number;
  fillerWordCount: number;
  uniqueVocabRatio: number;
  sentenceVarietyScore?: number;
}

interface TrendSummary {
  totalSessions: number;
  averageBand: number;
  bestBand: number;
  improvement: number | null;
  strongestCriterion: string | null;
  weakestCriterion: string | null;
  averageWPM: number;
  averageFillerWords: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Fetch all completed speaking sessions with evaluations
    const sessions = await prisma.practiceSession.findMany({
      where: {
        userId: session.user.id,
        module: 'SPEAKING',
        completedAt: { not: null },
      },
      include: {
        evaluation: true,
        content: {
          select: { type: true },
        },
      },
      orderBy: { completedAt: 'asc' },
    });

    if (sessions.length === 0) {
      return NextResponse.json({
        trends: [],
        summary: null,
        byPart: { part1: [], part2: [], part3: [] },
      });
    }

    // Transform sessions into trend data points
    const trends: TrendDataPoint[] = [];
    const criteriaScores = {
      fluency_coherence: [] as number[],
      lexical_resource: [] as number[],
      grammatical_range: [] as number[],
      pronunciation: [] as number[],
    };
    let totalWPM = 0;
    let totalFillerWords = 0;

    for (const s of sessions) {
      if (!s.evaluation?.aiResponse) continue;

      const aiResponse = s.evaluation.aiResponse as Record<string, unknown>;
      const criteria = aiResponse.criteria as Record<string, { band: number }> | undefined;
      const metrics = aiResponse.metrics as Record<string, unknown> | undefined;

      if (!criteria || !metrics) continue;

      const dataPoint: TrendDataPoint = {
        date: s.completedAt!.toISOString(),
        overallBand: s.evaluation.bandEstimate,
        fluencyCoherence: criteria.fluency_coherence?.band || 0,
        lexicalResource: criteria.lexical_resource?.band || 0,
        grammaticalRange: criteria.grammatical_range?.band || 0,
        pronunciation: criteria.pronunciation?.band || 0,
        wordsPerMinute: (metrics.wordsPerMinute as number) || 0,
        fillerWordCount: (metrics.fillerWordCount as number) || 0,
        uniqueVocabRatio: (metrics.uniqueVocabularyRatio as number) || 0,
        sentenceVarietyScore: metrics.sentenceVarietyScore as number | undefined,
      };

      trends.push(dataPoint);

      // Accumulate for averages
      criteriaScores.fluency_coherence.push(dataPoint.fluencyCoherence);
      criteriaScores.lexical_resource.push(dataPoint.lexicalResource);
      criteriaScores.grammatical_range.push(dataPoint.grammaticalRange);
      criteriaScores.pronunciation.push(dataPoint.pronunciation);
      totalWPM += dataPoint.wordsPerMinute;
      totalFillerWords += dataPoint.fillerWordCount;
    }

    // Calculate summary statistics
    const allBands = trends.map((t) => t.overallBand);
    const averageBand = allBands.reduce((a, b) => a + b, 0) / allBands.length;
    const bestBand = Math.max(...allBands);

    // Calculate improvement (compare first 3 vs last 3)
    let improvement: number | null = null;
    if (trends.length >= 6) {
      const firstThree = trends.slice(0, 3);
      const lastThree = trends.slice(-3);
      const firstAvg = firstThree.reduce((a, b) => a + b.overallBand, 0) / 3;
      const lastAvg = lastThree.reduce((a, b) => a + b.overallBand, 0) / 3;
      improvement = Math.round((lastAvg - firstAvg) * 10) / 10;
    }

    // Find strongest and weakest criteria
    const avgCriteria = {
      'Fluency & Coherence': avg(criteriaScores.fluency_coherence),
      'Lexical Resource': avg(criteriaScores.lexical_resource),
      'Grammatical Range': avg(criteriaScores.grammatical_range),
      Pronunciation: avg(criteriaScores.pronunciation),
    };

    const sortedCriteria = Object.entries(avgCriteria).sort((a, b) => b[1] - a[1]);
    const strongestCriterion = sortedCriteria[0]?.[0] || null;
    const weakestCriterion = sortedCriteria[sortedCriteria.length - 1]?.[0] || null;

    const summary: TrendSummary = {
      totalSessions: trends.length,
      averageBand: Math.round(averageBand * 10) / 10,
      bestBand,
      improvement,
      strongestCriterion,
      weakestCriterion,
      averageWPM: Math.round(totalWPM / trends.length),
      averageFillerWords: Math.round((totalFillerWords / trends.length) * 10) / 10,
    };

    // Group by part
    const byPart = {
      part1: [] as TrendDataPoint[],
      part2: [] as TrendDataPoint[],
      part3: [] as TrendDataPoint[],
    };

    sessions.forEach((s, i) => {
      if (trends[i]) {
        if (s.content.type === 'SPEAKING_PART1') byPart.part1.push(trends[i]);
        else if (s.content.type === 'SPEAKING_PART2') byPart.part2.push(trends[i]);
        else if (s.content.type === 'SPEAKING_PART3') byPart.part3.push(trends[i]);
      }
    });

    return NextResponse.json({
      trends,
      summary,
      byPart,
    });
  } catch (error) {
    console.error('Speaking trends error:', error);
    return NextResponse.json({ error: 'Failed to fetch speaking trends' }, { status: 500 });
  }
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
