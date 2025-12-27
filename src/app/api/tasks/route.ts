import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Get tasks (today or week)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const view = searchParams.get('view') || 'today'; // today, week, all

    // Get active study plan
    const studyPlan = await prisma.studyPlan.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
      select: { id: true },
    });

    if (!studyPlan) {
      return NextResponse.json({
        tasks: [],
        summary: null,
        message: 'No active study plan',
      });
    }

    // Calculate date range
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    let dateFilter: { gte?: Date; lt?: Date } = {};
    if (view === 'today') {
      dateFilter = { gte: todayStart, lt: todayEnd };
    } else if (view === 'week') {
      dateFilter = { gte: weekStart, lt: weekEnd };
    }

    const tasks = await prisma.studyTask.findMany({
      where: {
        studyPlanId: studyPlan.id,
        ...(Object.keys(dateFilter).length > 0 && { scheduledDate: dateFilter }),
      },
      orderBy: [{ scheduledDate: 'asc' }, { priority: 'desc' }],
    });

    // Calculate summary
    const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
    const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
    const totalMinutes = tasks.reduce((sum, t) => sum + t.duration, 0);
    const completedMinutes = tasks
      .filter((t) => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.duration, 0);

    const summary = {
      total: tasks.length,
      completed: completedCount,
      pending: pendingCount,
      skipped: tasks.filter((t) => t.status === 'SKIPPED').length,
      completionRate: tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0,
      totalMinutes,
      completedMinutes,
      byModule: {
        listening: tasks.filter((t) => t.module === 'LISTENING').length,
        reading: tasks.filter((t) => t.module === 'READING').length,
        writing: tasks.filter((t) => t.module === 'WRITING').length,
        speaking: tasks.filter((t) => t.module === 'SPEAKING').length,
      },
    };

    return NextResponse.json({
      tasks,
      summary,
    });
  } catch (error) {
    console.error('Tasks API error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
