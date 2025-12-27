import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { formatApiError, ErrorCode } from '@/lib/errors';

export const dynamic = 'force-dynamic';

// Section timing in minutes
const SECTION_TIMING: Record<string, number> = {
  LISTENING: 40,
  READING: 60,
  WRITING: 60,
  SPEAKING: 14,
};

interface RouteContext {
  params: Promise<{ id: string; section: string }>;
}

export async function POST(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(formatApiError(ErrorCode.UNAUTHORIZED), { status: 401 });
    }

    const { id, section } = await context.params;
    const userId = session.user.id;

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

    // Verify this is the correct section to start
    if (mockTest.currentSection !== sectionUpper) {
      return NextResponse.json(
        {
          error: `Cannot start ${sectionUpper}. Current section is ${mockTest.currentSection}.`,
          code: 'WRONG_SECTION',
          currentSection: mockTest.currentSection,
          retry: false,
        },
        { status: 400 }
      );
    }

    // Fetch content for this section
    const testType = mockTest.testType;
    let content = null;

    if (sectionUpper === 'LISTENING') {
      content = await prisma.content.findFirst({
        where: {
          module: 'LISTENING',
          type: 'LISTENING_SECTION',
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (sectionUpper === 'READING') {
      content = await prisma.content.findFirst({
        where: {
          module: 'READING',
          type: 'READING_PASSAGE',
          testType: testType,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!content && (sectionUpper === 'LISTENING' || sectionUpper === 'READING')) {
      return NextResponse.json(
        formatApiError(
          ErrorCode.CONTENT_NOT_FOUND,
          `No ${sectionUpper.toLowerCase()} content available`
        ),
        { status: 404 }
      );
    }

    // Calculate section deadline
    const now = new Date();
    const durationMinutes = SECTION_TIMING[sectionUpper];
    const deadline = new Date(now.getTime() + durationMinutes * 60 * 1000);

    // Update mock test with section start time
    const existingSectionTimes =
      (mockTest.sectionTimes as Record<
        string,
        { startedAt?: string; deadline?: string; completedAt?: string; timeSpent?: number }
      >) || {};

    await prisma.mockTest.update({
      where: { id },
      data: {
        currentSectionStartedAt: now,
        currentSectionDeadline: deadline,
        sectionTimes: JSON.parse(
          JSON.stringify({
            ...existingSectionTimes,
            [sectionUpper.toLowerCase()]: {
              startedAt: now.toISOString(),
              deadline: deadline.toISOString(),
            },
          })
        ),
      },
    });

    // Format content data
    const contentData = content?.contentData as Record<string, unknown> | null;

    return NextResponse.json({
      section: sectionUpper,
      contentId: content?.id,
      content: contentData
        ? {
            title: contentData.title || content?.title,
            ...(sectionUpper === 'LISTENING' && {
              audioUrl: contentData.audioUrl,
              transcript: contentData.transcript,
            }),
            ...(sectionUpper === 'READING' && {
              passage: contentData.passage,
            }),
            questions: contentData.questions,
          }
        : null,
      timing: {
        startedAt: now.toISOString(),
        deadline: deadline.toISOString(),
        durationMinutes,
      },
    });
  } catch (error) {
    console.error('Section start error:', error);
    return NextResponse.json(formatApiError(ErrorCode.UNKNOWN, 'Failed to start section'), {
      status: 500,
    });
  }
}
