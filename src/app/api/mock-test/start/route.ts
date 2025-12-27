import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { canUseMockTest, incrementMockTest, getQuotaStatus } from '@/lib/quota';
import { formatApiError, ErrorCode } from '@/lib/errors';
import { TestType } from '@prisma/client';

export const dynamic = 'force-dynamic';

// IELTS section timing in minutes
const SECTION_TIMING = {
  LISTENING: 40, // 30 min audio + 10 min transfer time
  READING: 60,
  WRITING: 60, // 20 min Task 1 + 40 min Task 2
  SPEAKING: 14, // 11-14 min, we use max
} as const;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(formatApiError(ErrorCode.UNAUTHORIZED), { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { testType } = body as { testType?: string };

    // Validate test type
    if (!testType || !['ACADEMIC', 'GENERAL'].includes(testType)) {
      return NextResponse.json(
        formatApiError(ErrorCode.INVALID_INPUT, 'Invalid test type. Must be ACADEMIC or GENERAL.'),
        { status: 400 }
      );
    }

    // Check if user has an in-progress mock test
    const existingTest = await prisma.mockTest.findFirst({
      where: {
        userId,
        status: 'IN_PROGRESS',
      },
    });

    if (existingTest) {
      return NextResponse.json(
        {
          error: 'You already have a mock test in progress.',
          code: 'MOCK_TEST_IN_PROGRESS',
          existingTestId: existingTest.id,
          retry: false,
        },
        { status: 400 }
      );
    }

    // Check quota
    const canStart = await canUseMockTest(userId);
    if (!canStart) {
      const quotaStatus = await getQuotaStatus(userId);

      if (quotaStatus.tier === 'FREE') {
        return NextResponse.json(
          {
            error: 'Mock tests are available for Premium members only.',
            code: 'PREMIUM_REQUIRED',
            retry: false,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          error: `You've used all ${quotaStatus.mockTests.limit} mock tests for this month. Your quota resets next month.`,
          code: 'MOCK_TEST_QUOTA_EXCEEDED',
          used: quotaStatus.mockTests.used,
          limit: quotaStatus.mockTests.limit,
          retry: false,
        },
        { status: 403 }
      );
    }

    // Calculate first section deadline (Listening starts immediately)
    const now = new Date();
    const listeningDeadline = new Date(now.getTime() + SECTION_TIMING.LISTENING * 60 * 1000);

    // Create the mock test
    const mockTest = await prisma.mockTest.create({
      data: {
        userId,
        testType: testType as TestType,
        status: 'IN_PROGRESS',
        startedAt: now,
        currentSection: 'LISTENING',
        currentSectionStartedAt: now,
        currentSectionDeadline: listeningDeadline,
        sectionTimes: {
          listening: { startedAt: now.toISOString(), deadline: listeningDeadline.toISOString() },
        },
      },
    });

    // Increment quota usage
    await incrementMockTest(userId);

    // Get updated quota status
    const updatedQuota = await getQuotaStatus(userId);

    return NextResponse.json({
      mockTestId: mockTest.id,
      testType: mockTest.testType,
      status: mockTest.status,
      currentSection: mockTest.currentSection,
      timing: {
        startedAt: mockTest.startedAt,
        currentSectionDeadline: mockTest.currentSectionDeadline,
        sectionDurations: SECTION_TIMING,
      },
      quota: {
        used: updatedQuota.mockTests.used,
        limit: updatedQuota.mockTests.limit,
        remaining: updatedQuota.mockTests.remaining,
      },
    });
  } catch (error) {
    console.error('Mock test start error:', error);
    return NextResponse.json(formatApiError(ErrorCode.UNKNOWN, 'Failed to start mock test'), {
      status: 500,
    });
  }
}
