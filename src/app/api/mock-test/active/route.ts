import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { formatApiError, ErrorCode } from '@/lib/errors';
import { getQuotaStatus } from '@/lib/quota';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(formatApiError(ErrorCode.UNAUTHORIZED), { status: 401 });
    }

    const userId = session.user.id;

    // Check for existing in-progress mock test
    const activeMockTest = await prisma.mockTest.findFirst({
      where: {
        userId,
        status: 'IN_PROGRESS',
      },
      orderBy: { startedAt: 'desc' },
    });

    // Get quota status
    const quotaStatus = await getQuotaStatus(userId);

    // Calculate time remaining if there's an active test
    let timeRemaining: number | null = null;
    if (activeMockTest?.currentSectionDeadline) {
      const now = new Date();
      const deadline = new Date(activeMockTest.currentSectionDeadline);
      timeRemaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000));
    }

    return NextResponse.json({
      mockTest: activeMockTest
        ? {
            id: activeMockTest.id,
            testType: activeMockTest.testType,
            status: activeMockTest.status,
            currentSection: activeMockTest.currentSection,
            startedAt: activeMockTest.startedAt,
            timing: {
              timeRemainingSeconds: timeRemaining,
              currentSectionDeadline: activeMockTest.currentSectionDeadline,
            },
          }
        : null,
      quota: {
        used: quotaStatus.mockTests.used,
        limit: quotaStatus.mockTests.limit,
        remaining: quotaStatus.mockTests.remaining,
        tier: quotaStatus.tier,
      },
    });
  } catch (error) {
    console.error('Active mock test check error:', error);
    return NextResponse.json(
      formatApiError(ErrorCode.UNKNOWN, 'Failed to check for active mock test'),
      { status: 500 }
    );
  }
}
