import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Zod schema for task completion
const taskCompleteSchema = z.object({
  sessionId: z.string().min(1).optional(),
});

export const dynamic = 'force-dynamic';

// POST - Mark task as complete
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: taskId } = await params;
    const body = await request.json().catch(() => ({}));

    // Validate with Zod
    const parseResult = taskCompleteSchema.safeParse(body);
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

    const { sessionId } = parseResult.data;

    // Verify task belongs to user's study plan
    const task = await prisma.studyTask.findFirst({
      where: {
        id: taskId,
        studyPlan: {
          userId,
        },
      },
      include: {
        studyPlan: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update task
    const updatedTask = await prisma.studyTask.update({
      where: { id: taskId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        sessionId: sessionId || null,
      },
    });

    // Update weekly goal completed count
    await prisma.weeklyGoal.updateMany({
      where: {
        studyPlanId: task.studyPlanId,
        weekNumber: task.weekNumber,
      },
      data: {
        completedTasks: { increment: 1 },
      },
    });

    // Update study streak
    await updateStudyStreak(userId);

    // Check for achievements
    await checkAndUnlockAchievements(userId);

    return NextResponse.json({
      task: updatedTask,
      message: 'Task completed',
    });
  } catch (error) {
    console.error('Task complete API error:', error);
    return NextResponse.json({ error: 'Failed to complete task' }, { status: 500 });
  }
}

async function updateStudyStreak(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const existingStreak = await prisma.studyStreak.findUnique({
    where: { userId },
  });

  if (existingStreak) {
    const lastStudy = existingStreak.lastStudyDate ? new Date(existingStreak.lastStudyDate) : null;

    if (lastStudy) {
      lastStudy.setHours(0, 0, 0, 0);

      // Already studied today
      if (lastStudy.getTime() === today.getTime()) {
        return;
      }

      // Studied yesterday - continue streak
      if (lastStudy.getTime() === yesterday.getTime()) {
        const newStreak = existingStreak.currentStreak + 1;
        await prisma.studyStreak.update({
          where: { userId },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(existingStreak.longestStreak, newStreak),
            lastStudyDate: new Date(),
            totalStudyDays: { increment: 1 },
          },
        });
        return;
      }
    }

    // Streak broken - reset to 1
    await prisma.studyStreak.update({
      where: { userId },
      data: {
        currentStreak: 1,
        lastStudyDate: new Date(),
        totalStudyDays: { increment: 1 },
      },
    });
  } else {
    // Create new streak
    await prisma.studyStreak.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastStudyDate: new Date(),
        totalStudyDays: 1,
      },
    });
  }
}

async function checkAndUnlockAchievements(userId: string) {
  const [streak, taskCount, sessionCount] = await Promise.all([
    prisma.studyStreak.findUnique({ where: { userId } }),
    prisma.studyTask.count({
      where: {
        studyPlan: { userId },
        status: 'COMPLETED',
      },
    }),
    prisma.practiceSession.count({
      where: { userId, completedAt: { not: null } },
    }),
  ]);

  const achievementsToCheck: Array<{ id: string; condition: boolean; metadata?: object }> = [
    {
      id: 'first_steps',
      condition: sessionCount >= 1 || taskCount >= 1,
      metadata: { type: 'first_completion' },
    },
    {
      id: '7_day_streak',
      condition: (streak?.currentStreak ?? 0) >= 7,
      metadata: { streak: streak?.currentStreak },
    },
    {
      id: '30_day_streak',
      condition: (streak?.currentStreak ?? 0) >= 30,
      metadata: { streak: streak?.currentStreak },
    },
    {
      id: '10_tasks',
      condition: taskCount >= 10,
      metadata: { tasks: taskCount },
    },
    {
      id: '50_tasks',
      condition: taskCount >= 50,
      metadata: { tasks: taskCount },
    },
  ];

  // Check current hour for early bird / night owl
  const hour = new Date().getHours();
  if (hour < 8) {
    achievementsToCheck.push({
      id: 'early_bird',
      condition: true,
      metadata: { time: new Date().toISOString() },
    });
  }
  if (hour >= 22) {
    achievementsToCheck.push({
      id: 'night_owl',
      condition: true,
      metadata: { time: new Date().toISOString() },
    });
  }

  for (const achievement of achievementsToCheck) {
    if (!achievement.condition) continue;

    // Check if already unlocked
    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id,
        },
      },
    });

    if (!existing) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          metadata: (achievement.metadata as object) || undefined,
        },
      });
    }
  }
}
