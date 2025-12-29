import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Zod schemas for study plan validation
const studyPlanCreateSchema = z.object({
  diagnosticId: z.string().min(1).optional(),
  targetBand: z
    .number()
    .min(5, 'Target band must be at least 5')
    .max(9, 'Target band cannot exceed 9'),
  testDate: z.string().datetime().optional(),
  hoursPerDay: z
    .number()
    .min(0.5, 'Hours per day must be at least 0.5')
    .max(8, 'Hours per day cannot exceed 8'),
  studyDaysPerWeek: z.number().int().min(1).max(7).optional().default(5),
});

const studyPlanUpdateSchema = z.object({
  studyPlanId: z.string().min(1, 'Study plan ID is required'),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED']).optional(),
  currentWeek: z.number().int().min(1).optional(),
});

export const dynamic = 'force-dynamic';

// GET - Get user's active study plan
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get active study plan with goals
    const studyPlan = await prisma.studyPlan.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'DRAFT'] },
      },
      include: {
        diagnostic: true,
        goals: {
          orderBy: { weekNumber: 'asc' },
        },
        tasks: {
          where: {
            scheduledDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          orderBy: { scheduledDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!studyPlan) {
      return NextResponse.json({
        studyPlan: null,
        hasCompletedDiagnostic: false,
      });
    }

    return NextResponse.json({
      studyPlan,
      hasCompletedDiagnostic: !!studyPlan.diagnosticId,
    });
  } catch (error) {
    console.error('Study plan API error:', error);
    return NextResponse.json({ error: 'Failed to fetch study plan' }, { status: 500 });
  }
}

// POST - Create new study plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate with Zod
    const parseResult = studyPlanCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: parseResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { diagnosticId, targetBand, testDate, hoursPerDay, studyDaysPerWeek } = parseResult.data;

    // Archive any existing active plans
    await prisma.studyPlan.updateMany({
      where: {
        userId,
        status: { in: ['ACTIVE', 'DRAFT'] },
      },
      data: {
        status: 'ARCHIVED',
      },
    });

    // Update user's target band and test date
    await prisma.user.update({
      where: { id: userId },
      data: {
        targetBand,
        testDate: testDate ? new Date(testDate) : null,
      },
    });

    // Create new study plan (will be populated by AI generation)
    const studyPlan = await prisma.studyPlan.create({
      data: {
        userId,
        diagnosticId: diagnosticId || null,
        targetBand,
        testDate: testDate ? new Date(testDate) : null,
        hoursPerDay,
        studyDaysPerWeek: studyDaysPerWeek || 5,
        status: 'DRAFT',
        planData: {},
        promptVersion: '1.0.0',
        tokensUsed: 0,
      },
      include: {
        diagnostic: true,
      },
    });

    return NextResponse.json({
      studyPlan,
      message: 'Study plan created. Generate plan to populate tasks.',
    });
  } catch (error) {
    console.error('Study plan API error:', error);
    return NextResponse.json({ error: 'Failed to create study plan' }, { status: 500 });
  }
}

// PUT - Update study plan status or settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate with Zod
    const parseResult = studyPlanUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: parseResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { studyPlanId, status, currentWeek } = parseResult.data;

    // Verify plan belongs to user
    const existingPlan = await prisma.studyPlan.findFirst({
      where: {
        id: studyPlanId,
        userId,
      },
    });

    if (!existingPlan) {
      return NextResponse.json({ error: 'Study plan not found' }, { status: 404 });
    }

    const updatedPlan = await prisma.studyPlan.update({
      where: { id: studyPlanId },
      data: {
        ...(status && { status }),
        ...(currentWeek !== undefined && { currentWeek }),
      },
    });

    return NextResponse.json({
      studyPlan: updatedPlan,
      message: 'Study plan updated',
    });
  } catch (error) {
    console.error('Study plan API error:', error);
    return NextResponse.json({ error: 'Failed to update study plan' }, { status: 500 });
  }
}
