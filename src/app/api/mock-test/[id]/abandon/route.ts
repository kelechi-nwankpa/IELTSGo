import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { formatApiError, ErrorCode } from '@/lib/errors';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
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

    // Can only abandon tests that are in progress
    if (mockTest.status !== 'IN_PROGRESS' && mockTest.status !== 'NOT_STARTED') {
      return NextResponse.json(
        {
          error: 'This mock test cannot be abandoned.',
          code: 'INVALID_STATE',
          currentStatus: mockTest.status,
          retry: false,
        },
        { status: 400 }
      );
    }

    // Update the mock test to abandoned
    const now = new Date();
    const updatedTest = await prisma.mockTest.update({
      where: { id },
      data: {
        status: 'ABANDONED',
        completedAt: now,
        // Record time spent in sectionTimes
        sectionTimes: {
          ...((mockTest.sectionTimes as object) || {}),
          abandonedAt: now.toISOString(),
          abandonedDuringSection: mockTest.currentSection,
        },
      },
    });

    return NextResponse.json({
      id: updatedTest.id,
      status: updatedTest.status,
      abandonedAt: updatedTest.completedAt,
      message: 'Mock test abandoned. You can start a new test if you have remaining quota.',
    });
  } catch (error) {
    console.error('Mock test abandon error:', error);
    return NextResponse.json(formatApiError(ErrorCode.UNKNOWN, 'Failed to abandon mock test'), {
      status: 500,
    });
  }
}
