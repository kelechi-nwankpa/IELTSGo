import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST - Skip a task
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: taskId } = await params;

    // Verify task belongs to user's study plan
    const task = await prisma.studyTask.findFirst({
      where: {
        id: taskId,
        studyPlan: {
          userId,
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Update task status
    const updatedTask = await prisma.studyTask.update({
      where: { id: taskId },
      data: {
        status: 'SKIPPED',
      },
    });

    return NextResponse.json({
      task: updatedTask,
      message: 'Task skipped',
    });
  } catch (error) {
    console.error('Task skip API error:', error);
    return NextResponse.json({ error: 'Failed to skip task' }, { status: 500 });
  }
}
