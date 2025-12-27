import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { formatApiError, ErrorCode } from '@/lib/errors';

export const dynamic = 'force-dynamic';

// IELTS section timing in minutes
const SECTION_TIMING = {
  LISTENING: 40,
  READING: 60,
  WRITING: 60,
  SPEAKING: 14,
} as const;

// Section order for progress calculation
const SECTION_ORDER = ['LISTENING', 'READING', 'WRITING', 'SPEAKING'] as const;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(formatApiError(ErrorCode.UNAUTHORIZED), { status: 401 });
    }

    const { id } = await context.params;
    const userId = session.user.id;

    const mockTest = await prisma.mockTest.findUnique({
      where: { id },
    });

    if (!mockTest) {
      return NextResponse.json(formatApiError(ErrorCode.CONTENT_NOT_FOUND, 'Mock test not found'), {
        status: 404,
      });
    }

    // Verify ownership
    if (mockTest.userId !== userId) {
      return NextResponse.json(formatApiError(ErrorCode.UNAUTHORIZED), { status: 403 });
    }

    // Calculate time remaining for current section
    let timeRemaining: number | null = null;
    let isOvertime = false;

    if (mockTest.status === 'IN_PROGRESS' && mockTest.currentSectionDeadline) {
      const now = new Date();
      const deadline = new Date(mockTest.currentSectionDeadline);
      const remainingMs = deadline.getTime() - now.getTime();
      timeRemaining = Math.max(0, Math.floor(remainingMs / 1000)); // seconds
      isOvertime = remainingMs < 0;
    }

    // Calculate progress (which sections are completed)
    const completedSections: string[] = [];
    if (mockTest.listeningSessionId) completedSections.push('LISTENING');
    if (mockTest.readingSessionId) completedSections.push('READING');
    if (mockTest.writingSessionId) completedSections.push('WRITING');
    if (mockTest.speakingSessionIds && mockTest.speakingSessionIds.length > 0) {
      completedSections.push('SPEAKING');
    }

    const currentSectionIndex = mockTest.currentSection
      ? SECTION_ORDER.indexOf(mockTest.currentSection)
      : -1;

    return NextResponse.json({
      id: mockTest.id,
      testType: mockTest.testType,
      status: mockTest.status,
      currentSection: mockTest.currentSection,
      timing: {
        startedAt: mockTest.startedAt,
        completedAt: mockTest.completedAt,
        currentSectionStartedAt: mockTest.currentSectionStartedAt,
        currentSectionDeadline: mockTest.currentSectionDeadline,
        timeRemainingSeconds: timeRemaining,
        isOvertime,
        sectionDurations: SECTION_TIMING,
      },
      progress: {
        completedSections,
        currentSectionIndex,
        totalSections: SECTION_ORDER.length,
        percentComplete: Math.round((completedSections.length / SECTION_ORDER.length) * 100),
      },
      results:
        mockTest.status === 'COMPLETED'
          ? {
              listeningBand: mockTest.listeningBand,
              readingBand: mockTest.readingBand,
              writingBand: mockTest.writingBand,
              speakingBand: mockTest.speakingBand,
              overallBand: mockTest.overallBand,
            }
          : null,
    });
  } catch (error) {
    console.error('Mock test GET error:', error);
    return NextResponse.json(formatApiError(ErrorCode.UNKNOWN, 'Failed to fetch mock test'), {
      status: 500,
    });
  }
}
