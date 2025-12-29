import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { formatApiError, ErrorCode } from '@/lib/errors';
import { evaluateWriting, WritingEvaluation } from '@/lib/ai/writing-evaluator';
import { evaluateSpeaking, SpeakingEvaluation } from '@/lib/ai/speaking-evaluator';
import { transcribeAudio } from '@/lib/ai/transcription';
import { z } from 'zod';

// Zod schema for JSON section submission (listening/reading/writing)
const sectionSubmitJsonSchema = z.object({
  contentId: z.string().min(1).optional(),
  answers: z.record(z.string(), z.unknown()).optional().default({}),
  timeSpent: z.number().int().nonnegative().optional(),
});

export const dynamic = 'force-dynamic';

// Section order for determining next section
const SECTION_ORDER = ['LISTENING', 'READING', 'WRITING', 'SPEAKING'] as const;

interface RouteContext {
  params: Promise<{ id: string; section: string }>;
}

// Band score calculation from percentage (same as reading/listening modules)
function calculateBandScore(percentage: number): number {
  if (percentage >= 95) return 9.0;
  if (percentage >= 87.5) return 8.5;
  if (percentage >= 80) return 8.0;
  if (percentage >= 72.5) return 7.5;
  if (percentage >= 65) return 7.0;
  if (percentage >= 57.5) return 6.5;
  if (percentage >= 50) return 6.0;
  if (percentage >= 42.5) return 5.5;
  if (percentage >= 35) return 5.0;
  if (percentage >= 27.5) return 4.5;
  if (percentage >= 20) return 4.0;
  if (percentage >= 12.5) return 3.5;
  return 3.0;
}

export async function POST(request: NextRequest, context: RouteContext) {
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

    // Verify this is the correct section
    if (mockTest.currentSection !== sectionUpper) {
      return NextResponse.json(
        {
          error: `Cannot submit ${sectionUpper}. Current section is ${mockTest.currentSection}.`,
          code: 'WRONG_SECTION',
          currentSection: mockTest.currentSection,
          retry: false,
        },
        { status: 400 }
      );
    }

    // Parse request body - handle FormData for speaking (with audio) or JSON for other sections
    let contentId: string | undefined;
    let answers: Record<string, unknown> = {};
    let timeSpent: number | undefined;
    const speakingAudioParts: { part: number; audio: Blob; questions: string[] }[] = [];

    const contentType = request.headers.get('content-type') || '';

    if (sectionUpper === 'SPEAKING' && contentType.includes('multipart/form-data')) {
      // Handle FormData for speaking with audio files
      const formData = await request.formData();
      contentId = (formData.get('contentId') as string) || undefined;
      timeSpent = parseInt(formData.get('timeSpent') as string, 10) || undefined;

      // Extract audio files for each part
      for (let part = 1; part <= 3; part++) {
        const audioFile = formData.get(`part${part}`) as Blob | null;
        const questionsJson = formData.get(`part${part}Questions`) as string | null;
        if (audioFile) {
          speakingAudioParts.push({
            part,
            audio: audioFile,
            questions: questionsJson ? JSON.parse(questionsJson) : [],
          });
        }
      }

      // Also check for transcriptions (if client-side transcription was done)
      const transcriptionsJson = formData.get('transcriptions') as string | null;
      if (transcriptionsJson) {
        answers = JSON.parse(transcriptionsJson);
      }
    } else {
      // Handle JSON for other sections
      const body = await request.json();

      // Validate with Zod
      const parseResult = sectionSubmitJsonSchema.safeParse(body);
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

      contentId = parseResult.data.contentId;
      answers = parseResult.data.answers;
      timeSpent = parseResult.data.timeSpent;
    }

    const now = new Date();

    // Calculate score for auto-scored sections (Listening/Reading)
    let bandScore: number | null = null;
    let scoreDetails: Record<string, unknown> | null = null;
    let writingEvaluations: {
      task1?: WritingEvaluation;
      task2?: WritingEvaluation;
      combinedBand?: number;
    } | null = null;

    if (sectionUpper === 'LISTENING' || sectionUpper === 'READING') {
      // Fetch content with answer key
      const content = await prisma.content.findUnique({
        where: { id: contentId },
      });

      if (content?.answers) {
        const answerKey = content.answers as Record<string, string | string[]>;
        let correct = 0;
        const total = Object.keys(answerKey).length;
        const results: Record<
          string,
          { correct: boolean; userAnswer: unknown; correctAnswer: unknown }
        > = {};

        for (const [questionId, correctAnswer] of Object.entries(answerKey)) {
          const userAnswer = answers[questionId];
          let isCorrect = false;

          if (Array.isArray(correctAnswer)) {
            isCorrect = Array.isArray(userAnswer)
              ? correctAnswer.every((a, i) => a.toLowerCase() === userAnswer[i]?.toLowerCase())
              : false;
          } else {
            isCorrect =
              String(userAnswer || '')
                .toLowerCase()
                .trim() === correctAnswer.toLowerCase().trim();
          }

          if (isCorrect) correct++;
          results[questionId] = { correct: isCorrect, userAnswer, correctAnswer };
        }

        const percentage = (correct / total) * 100;
        bandScore = calculateBandScore(percentage);
        scoreDetails = { correct, total, percentage, results };
      }
    } else if (sectionUpper === 'WRITING') {
      // Evaluate writing with AI
      const writingAnswers = answers as {
        task1?: { essay: string; wordCount: number; promptId?: string; prompt?: string };
        task2?: { essay: string; wordCount: number; promptId?: string; prompt?: string };
      };

      writingEvaluations = {};

      // Evaluate Task 1 if submitted
      if (writingAnswers.task1?.essay && writingAnswers.task1.essay.trim().length > 0) {
        try {
          // Determine task type based on test type
          const task1Type =
            mockTest.testType === 'ACADEMIC' ? 'task1_academic' : ('task1_general' as const);

          const { evaluation: task1Eval } = await evaluateWriting({
            taskType: task1Type,
            testType: mockTest.testType === 'ACADEMIC' ? 'academic' : 'general',
            questionPrompt: writingAnswers.task1.prompt || 'Task 1 writing prompt',
            userResponse: writingAnswers.task1.essay,
          });

          writingEvaluations.task1 = task1Eval;
        } catch (error) {
          console.error('Task 1 evaluation error:', error);
          // Continue even if Task 1 evaluation fails
        }
      }

      // Evaluate Task 2 if submitted
      if (writingAnswers.task2?.essay && writingAnswers.task2.essay.trim().length > 0) {
        try {
          const { evaluation: task2Eval } = await evaluateWriting({
            taskType: 'task2',
            testType: mockTest.testType === 'ACADEMIC' ? 'academic' : 'general',
            questionPrompt: writingAnswers.task2.prompt || 'Task 2 writing prompt',
            userResponse: writingAnswers.task2.essay,
          });

          writingEvaluations.task2 = task2Eval;
        } catch (error) {
          console.error('Task 2 evaluation error:', error);
          // Continue even if Task 2 evaluation fails
        }
      }

      // Calculate combined writing band
      // IELTS Writing: Task 2 is worth twice as much as Task 1
      // Formula: (Task1 + Task2 * 2) / 3
      if (writingEvaluations.task1 || writingEvaluations.task2) {
        const task1Band = writingEvaluations.task1?.overall_band;
        const task2Band = writingEvaluations.task2?.overall_band;

        if (task1Band && task2Band) {
          // Both tasks evaluated - use weighted average
          const weightedBand = (task1Band + task2Band * 2) / 3;
          writingEvaluations.combinedBand = Math.round(weightedBand * 2) / 2; // Round to 0.5
        } else if (task2Band) {
          // Only Task 2 evaluated
          writingEvaluations.combinedBand = task2Band;
        } else if (task1Band) {
          // Only Task 1 evaluated
          writingEvaluations.combinedBand = task1Band;
        }

        bandScore = writingEvaluations.combinedBand || null;
        scoreDetails = {
          task1: writingEvaluations.task1,
          task2: writingEvaluations.task2,
          combinedBand: writingEvaluations.combinedBand,
        };
      }
    } else if (sectionUpper === 'SPEAKING') {
      // Evaluate speaking with AI - requires transcription from audio
      const speakingEvaluations: {
        part1?: SpeakingEvaluation;
        part2?: SpeakingEvaluation;
        part3?: SpeakingEvaluation;
        transcriptions?: Record<number, string>;
        combinedBand?: number;
      } = { transcriptions: {} };

      // Process audio files - transcribe and evaluate each part
      for (const { part, audio, questions } of speakingAudioParts) {
        try {
          // Step 1: Transcribe audio to text
          const transcription = await transcribeAudio(audio);

          if (transcription.text && transcription.text.trim().length > 0) {
            speakingEvaluations.transcriptions![part] = transcription.text;

            // Step 2: Evaluate the transcription
            const { evaluation } = await evaluateSpeaking({
              part: part as 1 | 2 | 3,
              prompt: {
                topic: `Speaking Part ${part}`,
                questions: questions,
              },
              transcription: transcription.text,
              duration: transcription.duration || 60,
            });

            if (part === 1) speakingEvaluations.part1 = evaluation;
            else if (part === 2) speakingEvaluations.part2 = evaluation;
            else if (part === 3) speakingEvaluations.part3 = evaluation;
          }
        } catch (error) {
          console.error(`Speaking part ${part} evaluation error:`, error);
          // Continue even if one part fails
        }
      }

      // Calculate combined speaking band (average of all evaluated parts)
      const partBands = [
        speakingEvaluations.part1?.overall_band,
        speakingEvaluations.part2?.overall_band,
        speakingEvaluations.part3?.overall_band,
      ].filter((b): b is number => b !== undefined && b !== null);

      if (partBands.length > 0) {
        const averageBand = partBands.reduce((a, b) => a + b, 0) / partBands.length;
        speakingEvaluations.combinedBand = Math.round(averageBand * 2) / 2; // Round to 0.5
        bandScore = speakingEvaluations.combinedBand;
      }

      scoreDetails = {
        part1: speakingEvaluations.part1,
        part2: speakingEvaluations.part2,
        part3: speakingEvaluations.part3,
        transcriptions: speakingEvaluations.transcriptions,
        combinedBand: speakingEvaluations.combinedBand,
      };
    }

    // Create practice session for this section
    const practiceSession = await prisma.practiceSession.create({
      data: {
        userId,
        module:
          sectionUpper === 'LISTENING'
            ? 'LISTENING'
            : sectionUpper === 'READING'
              ? 'READING'
              : sectionUpper === 'WRITING'
                ? 'WRITING'
                : 'SPEAKING',
        contentId: contentId || 'mock-test-content',
        startedAt: mockTest.currentSectionStartedAt || now,
        completedAt: now,
        score: bandScore,
        submissionData: JSON.parse(
          JSON.stringify({
            mockTestId: id,
            section: sectionUpper,
            answers,
            timeSpent,
            scoreDetails,
          })
        ),
      },
    });

    // Determine next section
    const currentIndex = SECTION_ORDER.indexOf(sectionUpper as (typeof SECTION_ORDER)[number]);
    const nextSection =
      currentIndex < SECTION_ORDER.length - 1 ? SECTION_ORDER[currentIndex + 1] : null;
    const isLastSection = nextSection === null;

    // Update section times
    type SectionTimeData = {
      startedAt?: string;
      deadline?: string;
      completedAt?: string;
      timeSpent?: number;
    };
    const existingSectionTimes = (mockTest.sectionTimes as Record<string, SectionTimeData>) || {};
    const sectionTimeData = existingSectionTimes[sectionUpper.toLowerCase()] || {};

    // Prepare update data
    const updateData: Record<string, unknown> = {
      sectionTimes: JSON.parse(
        JSON.stringify({
          ...existingSectionTimes,
          [sectionUpper.toLowerCase()]: {
            ...sectionTimeData,
            completedAt: now.toISOString(),
            timeSpent,
          },
        })
      ),
    };

    // Update section session ID
    if (sectionUpper === 'LISTENING') {
      updateData.listeningSessionId = practiceSession.id;
      updateData.listeningBand = bandScore;
    } else if (sectionUpper === 'READING') {
      updateData.readingSessionId = practiceSession.id;
      updateData.readingBand = bandScore;
    } else if (sectionUpper === 'WRITING') {
      updateData.writingSessionId = practiceSession.id;
      if (bandScore !== null) {
        updateData.writingBand = bandScore;
      }
    } else if (sectionUpper === 'SPEAKING') {
      updateData.speakingSessionIds = [...(mockTest.speakingSessionIds || []), practiceSession.id];
      if (bandScore !== null) {
        updateData.speakingBand = bandScore;
      }
    }

    if (isLastSection) {
      // Calculate overall band (average of all 4 modules)
      const bands = [
        mockTest.listeningBand,
        mockTest.readingBand,
        mockTest.writingBand || (sectionUpper === 'WRITING' ? bandScore : null),
        bandScore, // Speaking band from current submission
      ].filter((b): b is number => b !== null);

      const overallBand =
        bands.length > 0
          ? Math.round((bands.reduce((a, b) => a + b, 0) / bands.length) * 2) / 2
          : null;

      updateData.status = 'COMPLETED';
      updateData.completedAt = now;
      updateData.currentSection = null;
      updateData.currentSectionStartedAt = null;
      updateData.currentSectionDeadline = null;
      updateData.overallBand = overallBand;
    } else {
      // Set up next section
      updateData.currentSection = nextSection;
      updateData.currentSectionStartedAt = null; // Will be set when section starts
      updateData.currentSectionDeadline = null;
    }

    const updatedMockTest = await prisma.mockTest.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      section: sectionUpper,
      completed: true,
      score: bandScore
        ? {
            band: bandScore,
            ...scoreDetails,
          }
        : null,
      nextSection,
      isTestComplete: isLastSection,
      mockTestStatus: updatedMockTest.status,
    });
  } catch (error) {
    console.error('Section submit error:', error);
    return NextResponse.json(formatApiError(ErrorCode.UNKNOWN, 'Failed to submit section'), {
      status: 500,
    });
  }
}
