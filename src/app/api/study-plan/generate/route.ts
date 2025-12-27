import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { generateStudyPlan, StudyPlanInput } from '@/lib/ai/study-plan-generator';

export const dynamic = 'force-dynamic';

// POST - Generate AI study plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { studyPlanId } = body as { studyPlanId: string };

    // Get the study plan with diagnostic
    const studyPlan = await prisma.studyPlan.findFirst({
      where: {
        id: studyPlanId,
        userId,
      },
      include: {
        diagnostic: true,
      },
    });

    if (!studyPlan) {
      return NextResponse.json({ error: 'Study plan not found' }, { status: 404 });
    }

    // Get user's practice history for context
    const recentSessions = await prisma.practiceSession.findMany({
      where: {
        userId,
        completedAt: { not: null },
      },
      select: {
        module: true,
        score: true,
      },
      orderBy: { completedAt: 'desc' },
      take: 20,
    });

    const recentEvaluations = await prisma.evaluation.findMany({
      where: { userId },
      select: {
        module: true,
        bandEstimate: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Build practice summary
    const practiceCounts: Record<string, number> = {};
    const practiceScores: Record<string, number[]> = {};

    for (const session of recentSessions) {
      const modName = session.module.toLowerCase();
      practiceCounts[modName] = (practiceCounts[modName] || 0) + 1;
      if (session.score !== null) {
        practiceScores[modName] = practiceScores[modName] || [];
        practiceScores[modName].push(session.score);
      }
    }

    for (const evaluation of recentEvaluations) {
      const modName = evaluation.module.toLowerCase();
      practiceScores[modName] = practiceScores[modName] || [];
      practiceScores[modName].push(evaluation.bandEstimate);
    }

    const practiceSummary =
      Object.entries(practiceCounts)
        .map(([module, count]) => {
          const scores = practiceScores[module] || [];
          const avgScore =
            scores.length > 0
              ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
              : 'N/A';
          return `${module}: ${count} sessions (avg: ${avgScore})`;
        })
        .join(', ') || 'No previous practice data';

    // Get current bands from diagnostic or estimate from practice
    const currentBands = {
      listening: studyPlan.diagnostic?.listeningBand ?? 5.5,
      reading: studyPlan.diagnostic?.readingBand ?? 5.5,
      writing: studyPlan.diagnostic?.writingBand ?? 5.5,
      speaking: studyPlan.diagnostic?.speakingBand ?? 5.5,
    };

    // Get weak areas
    const weakAreas = (studyPlan.diagnostic?.weakAreas as string[]) || [];

    // Prepare input for AI generator
    const planInput: StudyPlanInput = {
      currentBands,
      targetBand: studyPlan.targetBand,
      testType: 'academic', // TODO: Get from user profile
      testDate: studyPlan.testDate,
      hoursPerDay: studyPlan.hoursPerDay,
      studyDaysPerWeek: studyPlan.studyDaysPerWeek,
      weakAreas,
      practiceSummary,
    };

    // Generate the plan
    const { plan, tokensUsed } = await generateStudyPlan(planInput);

    // Update the study plan with generated content
    const updatedPlan = await prisma.studyPlan.update({
      where: { id: studyPlanId },
      data: {
        planData: plan as object,
        tokensUsed,
        promptVersion: '1.0.0',
        status: 'ACTIVE',
        lastRegeneratedAt: new Date(),
      },
    });

    // Create weekly goals from the plan
    const weeklyGoalData = plan.weekly_plans.map((week) => ({
      studyPlanId,
      weekNumber: week.week,
      goals: week.goals.map((g, i) => ({
        module: ['listening', 'reading', 'writing', 'speaking'][i % 4],
        target: 1,
        description: g,
      })),
      theme: week.theme,
      milestone: week.milestone,
      totalTasks: Object.values(week.daily_breakdown).reduce(
        (sum, m) => sum + m.activities.length,
        0
      ),
    }));

    // Delete existing goals and create new ones
    await prisma.weeklyGoal.deleteMany({
      where: { studyPlanId },
    });

    await prisma.weeklyGoal.createMany({
      data: weeklyGoalData,
    });

    // Create study tasks for the first 2 weeks
    await createTasksForWeeks(studyPlanId, plan.weekly_plans.slice(0, 2), new Date());

    return NextResponse.json({
      studyPlan: updatedPlan,
      plan,
      tokensUsed,
      message: 'Study plan generated successfully',
    });
  } catch (error) {
    console.error('Study plan generation error:', error);
    return NextResponse.json({ error: 'Failed to generate study plan' }, { status: 500 });
  }
}

// Generate a helpful description based on activity and module
function generateTaskDescription(activity: string, module: string, duration: number): string {
  const moduleDescriptions: Record<string, Record<string, string>> = {
    LISTENING: {
      'section 1':
        'Practice everyday conversation scenarios - focus on names, numbers, and basic details.',
      'section 2': 'Listen to monologues about social situations - practice note-taking skills.',
      'section 3': 'Academic discussion practice - identify opinions and track multiple speakers.',
      'section 4': 'Academic lecture listening - practice following complex arguments.',
      'gap-fill': 'Fill in missing words while listening - builds spelling and prediction skills.',
      matching: 'Match speakers to opinions or information - improves tracking multiple voices.',
      'multiple choice': 'Answer comprehension questions - practice eliminating wrong options.',
      default:
        'Improve your ability to understand spoken English in academic and everyday contexts.',
    },
    READING: {
      skimming: 'Practice reading quickly to get the main idea - essential for time management.',
      scanning: 'Find specific information quickly - locate names, dates, and key terms.',
      't/f/ng': "True/False/Not Given practice - distinguish between what's stated vs. implied.",
      matching: 'Match headings, information, or features - understand paragraph organization.',
      fill: 'Complete sentences or summaries - builds vocabulary and comprehension.',
      'multiple choice': 'Practice selecting correct answers - improve detail comprehension.',
      default: 'Develop reading strategies for academic texts and improve comprehension speed.',
    },
    WRITING: {
      'task 1': 'Describe visual data (charts, graphs, diagrams) or write a letter clearly.',
      'task 2': 'Write a well-structured essay with clear arguments and examples.',
      planning: 'Practice outlining essays before writing - improves coherence and saves time.',
      structure: 'Focus on paragraph organization and linking ideas logically.',
      vocabulary: 'Build topic-specific vocabulary for more precise expression.',
      grammar: 'Practice complex sentence structures to improve grammatical range.',
      default: 'Develop clear, well-organized writing with appropriate style and vocabulary.',
    },
    SPEAKING: {
      'part 1':
        'Practice answering personal questions fluently - build confidence with common topics.',
      'part 2':
        'Prepare and deliver a 2-minute talk - practice organizing ideas under time pressure.',
      'part 3': 'Discuss abstract topics in depth - develop your ability to express complex ideas.',
      'cue card': 'Practice the long turn - organize thoughts quickly and speak for 2 minutes.',
      fluency: 'Work on speaking smoothly without long pauses or excessive hesitation.',
      vocabulary: 'Expand your range of expressions for discussing various topics.',
      default: 'Build confidence speaking English and develop natural fluency.',
    },
  };

  const activityLower = activity.toLowerCase();
  const moduleDesc = moduleDescriptions[module] || moduleDescriptions.LISTENING;

  // Find a matching description key
  let description = moduleDesc.default;
  for (const [key, desc] of Object.entries(moduleDesc)) {
    if (key !== 'default' && activityLower.includes(key)) {
      description = desc;
      break;
    }
  }

  // Add duration context
  const timeContext =
    duration <= 15
      ? 'Quick practice session - focus on quality over quantity.'
      : duration >= 45
        ? 'Extended practice - take short breaks if needed to maintain focus.'
        : '';

  return timeContext ? `${description} ${timeContext}` : description;
}

async function createTasksForWeeks(
  studyPlanId: string,
  weeks: Array<{
    week: number;
    theme: string;
    daily_breakdown: {
      listening: { minutes: number; activities: string[] };
      reading: { minutes: number; activities: string[] };
      writing: { minutes: number; activities: string[] };
      speaking: { minutes: number; activities: string[] };
    };
  }>,
  startDate: Date
) {
  const tasks: Array<{
    studyPlanId: string;
    module: 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';
    title: string;
    description: string;
    duration: number;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    scheduledDate: Date;
    weekNumber: number;
    dayOfWeek: number;
  }> = [];

  for (const week of weeks) {
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(weekStartDate.getDate() + (week.week - 1) * 7);

    for (let day = 0; day < 5; day++) {
      // 5 study days per week
      const taskDate = new Date(weekStartDate);
      taskDate.setDate(taskDate.getDate() + day);

      const modules = ['listening', 'reading', 'writing', 'speaking'] as const;
      const moduleEnums = ['LISTENING', 'READING', 'WRITING', 'SPEAKING'] as const;

      for (let i = 0; i < modules.length; i++) {
        const modKey = modules[i];
        const breakdown = week.daily_breakdown[modKey];

        if (breakdown.minutes > 0 && breakdown.activities.length > 0) {
          // Pick an activity for this day (rotate through activities)
          const activityIndex = day % breakdown.activities.length;
          const activity = breakdown.activities[activityIndex];
          const duration = Math.ceil(breakdown.minutes / breakdown.activities.length);

          // Generate a helpful description
          const description = generateTaskDescription(activity, moduleEnums[i], duration);

          tasks.push({
            studyPlanId,
            module: moduleEnums[i],
            title: activity.substring(0, 100),
            description,
            duration,
            priority: breakdown.minutes > 30 ? 'HIGH' : 'MEDIUM',
            scheduledDate: taskDate,
            weekNumber: week.week,
            dayOfWeek: day,
          });
        }
      }
    }
  }

  // Delete existing tasks for this plan
  await prisma.studyTask.deleteMany({
    where: { studyPlanId },
  });

  // Create new tasks
  if (tasks.length > 0) {
    await prisma.studyTask.createMany({
      data: tasks,
    });
  }
}
