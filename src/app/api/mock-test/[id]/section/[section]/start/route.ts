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

// Get content IDs used in user's recent mock tests (last 5 tests)
async function getRecentlyUsedContentIds(userId: string, module: string): Promise<Set<string>> {
  const recentTests = await prisma.mockTest.findMany({
    where: {
      userId,
      status: { in: ['COMPLETED', 'IN_PROGRESS'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      listeningSessionId: true,
      readingSessionId: true,
      writingSessionId: true,
    },
  });

  // Collect session IDs based on module
  const sessionIds: string[] = [];
  for (const test of recentTests) {
    if (module === 'LISTENING' && test.listeningSessionId) {
      sessionIds.push(test.listeningSessionId);
    }
    if (module === 'READING' && test.readingSessionId) {
      sessionIds.push(test.readingSessionId);
    }
    if (module === 'WRITING' && test.writingSessionId) {
      sessionIds.push(test.writingSessionId);
    }
  }

  if (sessionIds.length === 0) {
    return new Set<string>();
  }

  // Fetch the contentIds from practice sessions
  const sessions = await prisma.practiceSession.findMany({
    where: { id: { in: sessionIds } },
    select: { contentId: true },
  });

  const usedIds = new Set<string>();
  for (const session of sessions) {
    // For writing, contentId might store comma-separated task IDs
    const ids = session.contentId.split(',');
    ids.forEach((id: string) => usedIds.add(id.trim()));
  }

  return usedIds;
}

// Select a random item from an array, preferring items not in excludeIds
function selectRandomContent<T extends { id: string }>(
  items: T[],
  excludeIds: Set<string>
): T | null {
  if (items.length === 0) return null;

  // First try to find items not recently used
  const freshItems = items.filter((item) => !excludeIds.has(item.id));

  if (freshItems.length > 0) {
    // Return a random fresh item
    return freshItems[Math.floor(Math.random() * freshItems.length)];
  }

  // If all items were recently used, just pick randomly from all
  return items[Math.floor(Math.random() * items.length)];
}

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

    // Fetch content for this section with random selection
    const testType = mockTest.testType;
    let content = null;
    let writingContent: { task1: unknown; task2: unknown } | null = null;
    let speakingContent: { part1: unknown; part2: unknown; part3: unknown } | null = null;

    // Get recently used content IDs to avoid repeats
    const recentlyUsedIds = await getRecentlyUsedContentIds(userId, sectionUpper);

    if (sectionUpper === 'LISTENING') {
      const allListening = await prisma.content.findMany({
        where: {
          module: 'LISTENING',
          type: 'LISTENING_SECTION',
        },
      });
      content = selectRandomContent(allListening, recentlyUsedIds);
    } else if (sectionUpper === 'READING') {
      const allReading = await prisma.content.findMany({
        where: {
          module: 'READING',
          type: 'READING_PASSAGE',
          testType: testType,
        },
      });
      content = selectRandomContent(allReading, recentlyUsedIds);
    } else if (sectionUpper === 'WRITING') {
      // Fetch all Task 1 prompts based on test type
      const task1Type = testType === 'ACADEMIC' ? 'TASK1_ACADEMIC' : 'TASK1_GENERAL';
      const allTask1 = await prisma.content.findMany({
        where: {
          module: 'WRITING',
          type: task1Type,
        },
      });

      // Fetch all Task 2 prompts based on test type
      const allTask2 = await prisma.content.findMany({
        where: {
          module: 'WRITING',
          type: 'TASK2',
          testType: testType,
        },
      });

      const task1Content = selectRandomContent(allTask1, recentlyUsedIds);
      const task2Content = selectRandomContent(allTask2, recentlyUsedIds);

      if (task1Content && task2Content) {
        const task1Data = task1Content.contentData as Record<string, unknown>;
        const task2Data = task2Content.contentData as Record<string, unknown>;

        writingContent = {
          task1: {
            id: task1Content.id,
            taskNumber: 1,
            title: task1Content.title || 'Task 1',
            prompt: task1Data.prompt,
            topic: task1Data.topic,
            imageUrl: task1Data.imageUrl,
            imageDescription: task1Data.imageDescription,
            letterType: task1Data.letterType,
            minWords: 150,
            recommendedTime: 20,
          },
          task2: {
            id: task2Content.id,
            taskNumber: 2,
            title: task2Content.title || 'Task 2',
            prompt: task2Data.prompt,
            topic: task2Data.topic,
            minWords: 250,
            recommendedTime: 40,
          },
        };
      }
    } else if (sectionUpper === 'SPEAKING') {
      // Fetch speaking prompts from database
      const allPart1 = await prisma.content.findMany({
        where: { module: 'SPEAKING', type: 'SPEAKING_PART1' },
      });
      const allPart2 = await prisma.content.findMany({
        where: { module: 'SPEAKING', type: 'SPEAKING_PART2' },
      });
      const allPart3 = await prisma.content.findMany({
        where: { module: 'SPEAKING', type: 'SPEAKING_PART3' },
      });

      const part1Content = selectRandomContent(allPart1, recentlyUsedIds);
      const part2Content = selectRandomContent(allPart2, recentlyUsedIds);
      // Try to find a Part 3 that matches the Part 2 topic
      let part3Content = null;
      if (part2Content) {
        const relatedPart3 = allPart3.filter((p) => {
          const data = p.contentData as Record<string, unknown>;
          return data.relatedPart2Id === part2Content.id;
        });
        part3Content =
          relatedPart3.length > 0
            ? selectRandomContent(relatedPart3, recentlyUsedIds)
            : selectRandomContent(allPart3, recentlyUsedIds);
      } else {
        part3Content = selectRandomContent(allPart3, recentlyUsedIds);
      }

      if (part1Content && part2Content && part3Content) {
        const part1Data = part1Content.contentData as Record<string, unknown>;
        const part2Data = part2Content.contentData as Record<string, unknown>;
        const part3Data = part3Content.contentData as Record<string, unknown>;

        speakingContent = {
          part1: {
            id: part1Content.id,
            topic: part1Data.topic,
            questions: part1Data.questions,
          },
          part2: {
            id: part2Content.id,
            topic: part2Data.topic,
            cueCard: part2Data.cueCard,
            prepTime: part2Data.prepTime || 60,
            speakingTime: part2Data.speakingTime || 120,
            followUpQuestion: part2Data.followUpQuestion,
          },
          part3: {
            id: part3Content.id,
            topic: part3Data.topic,
            questions: part3Data.questions,
          },
        };
      }
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

    if (!writingContent && sectionUpper === 'WRITING') {
      return NextResponse.json(
        formatApiError(ErrorCode.CONTENT_NOT_FOUND, 'No writing prompts available'),
        { status: 404 }
      );
    }

    if (!speakingContent && sectionUpper === 'SPEAKING') {
      return NextResponse.json(
        formatApiError(ErrorCode.CONTENT_NOT_FOUND, 'No speaking prompts available'),
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

    // Build response content based on section type
    let responseContent: unknown = null;
    if (sectionUpper === 'WRITING') {
      responseContent = writingContent;
    } else if (sectionUpper === 'SPEAKING') {
      responseContent = speakingContent;
    } else if (contentData) {
      responseContent = {
        title: contentData.title || content?.title,
        ...(sectionUpper === 'LISTENING' && {
          audioUrl: contentData.audioUrl,
          transcript: contentData.transcript,
        }),
        ...(sectionUpper === 'READING' && {
          passage: contentData.passage,
        }),
        questions: contentData.questions,
      };
    }

    return NextResponse.json({
      section: sectionUpper,
      contentId: content?.id,
      content: responseContent,
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
