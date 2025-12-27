import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { formatApiError, ErrorCode } from '@/lib/errors';

export const dynamic = 'force-dynamic';

// Section order for determining next section
const SECTION_ORDER = ['LISTENING', 'READING', 'WRITING', 'SPEAKING'] as const;

interface RouteContext {
  params: Promise<{ id: string; section: string }>;
}

// Band score calculation from percentage (same as reading/listening modules)
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

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(formatApiError(ErrorCode.UNAUTHORIZED), { status: 401 });
    }

    const { id, section } = await context.params;
    const userId = session.user.id;
    const body = await request.json();

    // Validate section
    const sectionUpper = section.toUpperCase();
    if (!['LISTENING', 'READING', 'WRITING', 'SPEAKING'].includes(sectionUpper)) {
      return NextResponse.json(formatApiError(ErrorCode.INVALID_INPUT, 'Invalid section'), {
        status: 400,
      });
    }

    const mockTest = await prisma.mockTest.findUnique({
      where: { id },
    });

    if (!mockTest) {
      return NextResponse.json(formatApiError(ErrorCode.CONTENT_NOT_FOUND, 'Mock test not found'), {
        status: 404,
      });
    }

    if (mockTest.userId !== userId) {
      return NextResponse.json(formatApiError(ErrorCode.UNAUTHORIZED), { status: 403 });
    }

    if (mockTest.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        {
          error: 'This mock test is not in progress.',
          code: 'INVALID_STATE',
          status: mockTest.status,
          retry: false,
        },
        { status: 400 }
      );
    }

    // Verify this is the correct section
    if (mockTest.currentSection !== sectionUpper) {
      return NextResponse.json(
        {
          error: `Cannot submit ${sectionUpper}. Current section is ${mockTest.currentSection}.`,
          code: 'WRONG_SECTION',
          currentSection: mockTest.currentSection,
          retry: false,
        },
        { status: 400 }
      );
    }

    const { contentId, answers, timeSpent } = body;
    const now = new Date();

    // Calculate score for auto-scored sections (Listening/Reading)
    let bandScore: number | null = null;
    let scoreDetails: Record<string, unknown> | null = null;

    if (sectionUpper === 'LISTENING' || sectionUpper === 'READING') {
      // Fetch content with answer key
      const content = await prisma.content.findUnique({
        where: { id: contentId },
      });

      if (content?.answers) {
        const answerKey = content.answers as Record<string, string | string[]>;
        let correct = 0;
        const total = Object.keys(answerKey).length;
        const results: Record<
          string,
          { correct: boolean; userAnswer: unknown; correctAnswer: unknown }
        > = {};

        for (const [questionId, correctAnswer] of Object.entries(answerKey)) {
          const userAnswer = answers[questionId];
          let isCorrect = false;

          if (Array.isArray(correctAnswer)) {
            isCorrect = Array.isArray(userAnswer)
              ? correctAnswer.every((a, i) => a.toLowerCase() === userAnswer[i]?.toLowerCase())
              : false;
          } else {
            isCorrect =
              String(userAnswer || '')
                .toLowerCase()
                .trim() === correctAnswer.toLowerCase().trim();
          }

          if (isCorrect) correct++;
          results[questionId] = { correct: isCorrect, userAnswer, correctAnswer };
        }

        const percentage = (correct / total) * 100;
        bandScore = calculateBandScore(percentage);
        scoreDetails = { correct, total, percentage, results };
      }
    }

    // Create practice session for this section
    const practiceSession = await prisma.practiceSession.create({
      data: {
        userId,
        module:
          sectionUpper === 'LISTENING'
            ? 'LISTENING'
            : sectionUpper === 'READING'
              ? 'READING'
              : sectionUpper === 'WRITING'
                ? 'WRITING'
                : 'SPEAKING',
        contentId: contentId || 'mock-test-content',
        startedAt: mockTest.currentSectionStartedAt || now,
        completedAt: now,
        score: bandScore,
        submissionData: JSON.parse(
          JSON.stringify({
            mockTestId: id,
            section: sectionUpper,
            answers,
            timeSpent,
            scoreDetails,
          })
        ),
      },
    });

    // Determine next section
    const currentIndex = SECTION_ORDER.indexOf(sectionUpper as (typeof SECTION_ORDER)[number]);
    const nextSection =
      currentIndex < SECTION_ORDER.length - 1 ? SECTION_ORDER[currentIndex + 1] : null;
    const isLastSection = nextSection === null;

    // Update section times
    type SectionTimeData = {
      startedAt?: string;
      deadline?: string;
      completedAt?: string;
      timeSpent?: number;
    };
    const existingSectionTimes = (mockTest.sectionTimes as Record<string, SectionTimeData>) || {};
    const sectionTimeData = existingSectionTimes[sectionUpper.toLowerCase()] || {};

    // Prepare update data
    const updateData: Record<string, unknown> = {
      sectionTimes: JSON.parse(
        JSON.stringify({
          ...existingSectionTimes,
          [sectionUpper.toLowerCase()]: {
            ...sectionTimeData,
            completedAt: now.toISOString(),
            timeSpent,
          },
        })
      ),
    };

    // Update section session ID
    if (sectionUpper === 'LISTENING') {
      updateData.listeningSessionId = practiceSession.id;
      updateData.listeningBand = bandScore;
    } else if (sectionUpper === 'READING') {
      updateData.readingSessionId = practiceSession.id;
      updateData.readingBand = bandScore;
    } else if (sectionUpper === 'WRITING') {
      updateData.writingSessionId = practiceSession.id;
      // Writing band will be set after AI evaluation
    } else if (sectionUpper === 'SPEAKING') {
      updateData.speakingSessionIds = [...(mockTest.speakingSessionIds || []), practiceSession.id];
      // Speaking band will be set after AI evaluation
    }

    if (isLastSection) {
      // Calculate overall band (average of available bands)
      const bands = [
        mockTest.listeningBand || bandScore,
        mockTest.readingBand || (sectionUpper === 'READING' ? bandScore : null),
        // Writing and Speaking require AI evaluation, will be updated later
      ].filter((b): b is number => b !== null);

      const overallBand =
        bands.length > 0
          ? Math.round((bands.reduce((a, b) => a + b, 0) / bands.length) * 2) / 2
          : null;

      updateData.status = 'COMPLETED';
      updateData.completedAt = now;
      updateData.currentSection = null;
      updateData.currentSectionStartedAt = null;
      updateData.currentSectionDeadline = null;
      updateData.overallBand = overallBand;
    } else {
      // Set up next section
      updateData.currentSection = nextSection;
      updateData.currentSectionStartedAt = null; // Will be set when section starts
      updateData.currentSectionDeadline = null;
    }

    const updatedMockTest = await prisma.mockTest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      section: sectionUpper,
      completed: true,
      score: bandScore
        ? {
            band: bandScore,
            ...scoreDetails,
          }
        : null,
      nextSection,
      isTestComplete: isLastSection,
      mockTestStatus: updatedMockTest.status,
    });
  } catch (error) {
    console.error('Section submit error:', error);
    return NextResponse.json(formatApiError(ErrorCode.UNKNOWN, 'Failed to submit section'), {
      status: 500,
    });
  }
}
