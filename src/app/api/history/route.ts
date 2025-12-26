import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { Module } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);

    // Parse query params
    const moduleFilter = searchParams.get('module') as Module | null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      userId: string;
      completedAt: { not: null };
      module?: Module;
    } = {
      userId,
      completedAt: { not: null },
    };

    if (moduleFilter && Object.values(Module).includes(moduleFilter)) {
      where.module = moduleFilter;
    }

    // Get total count for pagination
    const totalCount = await prisma.practiceSession.count({ where });

    // Get sessions with related data
    const sessions = await prisma.practiceSession.findMany({
      where,
      orderBy: { completedAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        module: true,
        score: true,
        submissionData: true,
        startedAt: true,
        completedAt: true,
        content: {
          select: {
            id: true,
            type: true,
            title: true,
            contentData: true,
            difficultyBand: true,
          },
        },
        evaluation: {
          select: {
            bandEstimate: true,
            aiResponse: true,
            inputText: true,
            createdAt: true,
          },
        },
      },
    });

    // Transform sessions for the response
    const transformedSessions = sessions.map((s) => {
      const baseData = {
        id: s.id,
        module: s.module,
        type: s.content.type,
        title: s.content.title || getDefaultTitle(s.content.type, s.module),
        difficultyBand: s.content.difficultyBand,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
      };

      // Module-specific data extraction
      switch (s.module) {
        case 'WRITING':
          return {
            ...baseData,
            bandScore: s.evaluation?.bandEstimate ?? null,
            prompt: getPromptPreview(s.content.contentData),
            submission: s.evaluation?.inputText ?? null,
            feedback: s.evaluation?.aiResponse ?? null,
            criteriaScores: extractCriteriaScores(s.evaluation?.aiResponse),
          };

        case 'SPEAKING':
          return {
            ...baseData,
            bandScore: s.evaluation?.bandEstimate ?? null,
            prompt: getSpeakingPrompt(s.content.contentData),
            transcription: s.evaluation?.inputText ?? null,
            feedback: s.evaluation?.aiResponse ?? null,
            metrics: extractSpeakingMetrics(s.evaluation?.aiResponse),
          };

        case 'READING':
        case 'LISTENING':
          const results = extractQuizResults(s.submissionData, s.score);
          return {
            ...baseData,
            bandScore: results?.bandEstimate ?? null,
            totalQuestions: results?.totalQuestions ?? 0,
            correctAnswers: results?.correctAnswers ?? 0,
            percentage: results?.percentage ?? 0,
            results: results?.details ?? [],
          };

        default:
          return baseData;
      }
    });

    // Get module counts for filters
    const moduleCounts = await prisma.practiceSession.groupBy({
      by: ['module'],
      where: {
        userId,
        completedAt: { not: null },
      },
      _count: true,
    });

    const counts = {
      all: totalCount,
      WRITING: 0,
      SPEAKING: 0,
      READING: 0,
      LISTENING: 0,
    };

    moduleCounts.forEach((m) => {
      counts[m.module] = m._count;
    });

    return NextResponse.json({
      sessions: transformedSessions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasMore: skip + sessions.length < totalCount,
      },
      counts,
    });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}

function getDefaultTitle(type: string, module: string): string {
  switch (module) {
    case 'READING':
      return 'Reading Practice';
    case 'LISTENING':
      return 'Listening Practice';
    case 'SPEAKING':
      if (type === 'SPEAKING_PART1') return 'Speaking Part 1';
      if (type === 'SPEAKING_PART2') return 'Speaking Part 2';
      if (type === 'SPEAKING_PART3') return 'Speaking Part 3';
      return 'Speaking Practice';
    case 'WRITING':
      if (type === 'TASK1_ACADEMIC') return 'Task 1 (Academic)';
      if (type === 'TASK1_GENERAL') return 'Task 1 (General)';
      if (type === 'TASK2') return 'Task 2 Essay';
      return 'Writing Practice';
    default:
      return 'Practice Session';
  }
}

function getPromptPreview(contentData: unknown): string {
  if (typeof contentData === 'object' && contentData !== null) {
    const data = contentData as Record<string, unknown>;
    if (typeof data.prompt === 'string') {
      return data.prompt;
    }
  }
  return '';
}

function getSpeakingPrompt(contentData: unknown): string {
  if (typeof contentData === 'object' && contentData !== null) {
    const data = contentData as Record<string, unknown>;
    // Part 1 has questions array
    if (Array.isArray(data.questions)) {
      return (data.questions as string[]).join(' | ');
    }
    // Part 2 has cueCard
    if (typeof data.cueCard === 'object' && data.cueCard !== null) {
      const cueCard = data.cueCard as Record<string, unknown>;
      return `${cueCard.topic || ''} - ${cueCard.task || ''}`;
    }
    // Part 3 has questions
    if (typeof data.topic === 'string') {
      return data.topic;
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

function extractSpeakingMetrics(
  aiResponse: unknown
): { wpm: number; fillerWords: number; uniqueVocabRatio: number } | null {
  if (typeof aiResponse === 'object' && aiResponse !== null) {
    const response = aiResponse as Record<string, unknown>;
    if (typeof response.metrics === 'object' && response.metrics !== null) {
      const metrics = response.metrics as Record<string, unknown>;
      // fillerWords in the AI response is an array of {word, count}, we want the total count
      let fillerWordsCount = 0;
      if (typeof metrics.fillerWordCount === 'number') {
        fillerWordsCount = metrics.fillerWordCount;
      } else if (Array.isArray(metrics.fillerWords)) {
        fillerWordsCount = (metrics.fillerWords as Array<{ count: number }>).reduce(
          (sum, fw) => sum + (fw.count || 0),
          0
        );
      }
      return {
        wpm: typeof metrics.wordsPerMinute === 'number' ? metrics.wordsPerMinute : 0,
        fillerWords: fillerWordsCount,
        uniqueVocabRatio:
          typeof metrics.uniqueVocabularyRatio === 'number' ? metrics.uniqueVocabularyRatio : 0,
      };
    }
  }
  return null;
}

function extractQuizResults(
  submissionData: unknown,
  score: number | null
): {
  bandEstimate: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  details: Array<{
    questionId: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
} | null {
  if (typeof submissionData !== 'object' || submissionData === null) {
    return null;
  }

  const data = submissionData as Record<string, unknown>;
  const results = data.results as
    | Array<{ questionId: string; userAnswer: string; correctAnswer: string; isCorrect: boolean }>
    | undefined;

  if (!results || !Array.isArray(results)) {
    return null;
  }

  const totalQuestions = results.length;
  const correctAnswers = score ?? results.filter((r) => r.isCorrect).length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const bandEstimate = calculateBandScore(percentage);

  return {
    bandEstimate,
    totalQuestions,
    correctAnswers,
    percentage,
    details: results,
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
