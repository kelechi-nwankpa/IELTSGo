import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { diagnosticQuestions, getQuickDiagnosticSet } from '@/lib/diagnostic-questions';

export const dynamic = 'force-dynamic';

// GET - Get current diagnostic or start new one
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check for existing in-progress diagnostic
    const existingDiagnostic = await prisma.diagnosticAssessment.findFirst({
      where: {
        userId,
        status: { in: ['NOT_STARTED', 'IN_PROGRESS'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingDiagnostic) {
      return NextResponse.json({
        diagnostic: existingDiagnostic,
        questions: getQuickDiagnosticSet(),
        resumable: true,
      });
    }

    // Get most recent completed diagnostic
    const completedDiagnostic = await prisma.diagnosticAssessment.findFirst({
      where: {
        userId,
        status: 'COMPLETED',
      },
      orderBy: { completedAt: 'desc' },
    });

    return NextResponse.json({
      diagnostic: completedDiagnostic,
      questions: null,
      resumable: false,
    });
  } catch (error) {
    console.error('Diagnostic API error:', error);
    return NextResponse.json({ error: 'Failed to fetch diagnostic' }, { status: 500 });
  }
}

// POST - Start new diagnostic or update with manual bands
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { mode, manualBands } = body as {
      mode: 'start' | 'manual';
      manualBands?: {
        listening: number;
        reading: number;
        writing: number;
        speaking: number;
      };
    };

    if (mode === 'manual' && manualBands) {
      // User is skipping diagnostic and entering bands manually
      const overall =
        (manualBands.listening + manualBands.reading + manualBands.writing + manualBands.speaking) /
        4;

      const diagnostic = await prisma.diagnosticAssessment.create({
        data: {
          userId,
          status: 'COMPLETED',
          listeningBand: manualBands.listening,
          readingBand: manualBands.reading,
          writingBand: manualBands.writing,
          speakingBand: manualBands.speaking,
          overallBand: Math.round(overall * 2) / 2, // Round to nearest 0.5
          completedAt: new Date(),
          diagnosticData: { source: 'manual_input' },
        },
      });

      return NextResponse.json({
        diagnostic,
        message: 'Manual bands saved successfully',
      });
    }

    if (mode === 'start') {
      // Start a new diagnostic assessment
      const diagnostic = await prisma.diagnosticAssessment.create({
        data: {
          userId,
          status: 'IN_PROGRESS',
          diagnosticData: {
            responses: [],
            startedAt: new Date().toISOString(),
          },
        },
      });

      return NextResponse.json({
        diagnostic,
        questions: getQuickDiagnosticSet(),
      });
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (error) {
    console.error('Diagnostic API error:', error);
    return NextResponse.json({ error: 'Failed to create diagnostic' }, { status: 500 });
  }
}

// PUT - Update diagnostic progress
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { diagnosticId, responses, complete } = body as {
      diagnosticId: string;
      responses: Array<{
        questionId: string;
        answer: string | string[];
        timeSpent: number;
      }>;
      complete?: boolean;
    };

    // Verify diagnostic belongs to user
    const diagnostic = await prisma.diagnosticAssessment.findFirst({
      where: {
        id: diagnosticId,
        userId,
        status: 'IN_PROGRESS',
      },
    });

    if (!diagnostic) {
      return NextResponse.json({ error: 'Diagnostic not found' }, { status: 404 });
    }

    // Update diagnostic data
    const existingData = (diagnostic.diagnosticData as { responses?: Response[] }) || {};
    const updatedResponses: Response[] = [...(existingData.responses || []), ...responses];

    if (complete) {
      // Calculate band estimates based on responses
      const bandEstimates = calculateBandEstimates(updatedResponses);

      const updatedDiagnostic = await prisma.diagnosticAssessment.update({
        where: { id: diagnosticId },
        data: {
          status: 'COMPLETED',
          diagnosticData: {
            ...existingData,
            responses: updatedResponses as unknown as object[],
            completedAt: new Date().toISOString(),
          } as object,
          listeningBand: bandEstimates.listening,
          readingBand: bandEstimates.reading,
          writingBand: bandEstimates.writing,
          speakingBand: bandEstimates.speaking,
          overallBand: bandEstimates.overall,
          weakAreas: bandEstimates.weakAreas,
          completedAt: new Date(),
        },
      });

      return NextResponse.json({
        diagnostic: updatedDiagnostic,
        bandEstimates,
        message: 'Diagnostic completed',
      });
    }

    // Just save progress
    const updatedDiagnostic = await prisma.diagnosticAssessment.update({
      where: { id: diagnosticId },
      data: {
        diagnosticData: {
          ...existingData,
          responses: updatedResponses as unknown as object[],
        } as object,
      },
    });

    return NextResponse.json({
      diagnostic: updatedDiagnostic,
      message: 'Progress saved',
    });
  } catch (error) {
    console.error('Diagnostic API error:', error);
    return NextResponse.json({ error: 'Failed to update diagnostic' }, { status: 500 });
  }
}

interface Response {
  questionId: string;
  answer: string | string[];
  timeSpent: number;
}

interface BandEstimates {
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  overall: number;
  weakAreas: string[];
}

function calculateBandEstimates(responses: Response[]): BandEstimates {
  const moduleScores: Record<string, { correct: number; total: number; difficultySum: number }> = {
    listening: { correct: 0, total: 0, difficultySum: 0 },
    reading: { correct: 0, total: 0, difficultySum: 0 },
    writing: { correct: 0, total: 0, difficultySum: 0 },
    speaking: { correct: 0, total: 0, difficultySum: 0 },
  };

  // All questions from diagnosticQuestions
  const allQuestions = [
    ...diagnosticQuestions.listening,
    ...diagnosticQuestions.reading,
    ...diagnosticQuestions.writing,
    ...diagnosticQuestions.speaking,
  ];

  for (const response of responses) {
    const question = allQuestions.find((q) => q.id === response.questionId);
    if (!question) continue;

    const moduleKey = question.module.toLowerCase();
    moduleScores[moduleKey].total++;
    moduleScores[moduleKey].difficultySum += question.difficulty;

    // Check if answer is correct (for objective questions)
    if (question.correctAnswer) {
      const isCorrect = Array.isArray(question.correctAnswer)
        ? JSON.stringify(question.correctAnswer) === JSON.stringify(response.answer)
        : question.correctAnswer.toLowerCase() === String(response.answer).toLowerCase();

      if (isCorrect) {
        moduleScores[moduleKey].correct++;
      }
    } else {
      // For subjective questions (writing/speaking), assume average performance
      moduleScores[moduleKey].correct += 0.6; // 60% average
    }
  }

  // Calculate band estimates
  const calculateBand = (scores: { correct: number; total: number; difficultySum: number }) => {
    if (scores.total === 0) return 5.5; // Default if no questions

    const accuracy = scores.correct / scores.total;
    const avgDifficulty = scores.difficultySum / scores.total;

    // Estimate band: base on accuracy and question difficulty
    let estimatedBand = avgDifficulty * accuracy + (1 - accuracy) * 4;
    estimatedBand = Math.round(estimatedBand * 2) / 2; // Round to nearest 0.5
    return Math.max(4, Math.min(9, estimatedBand)); // Clamp between 4-9
  };

  const listening = calculateBand(moduleScores.listening);
  const reading = calculateBand(moduleScores.reading);
  const writing = calculateBand(moduleScores.writing);
  const speaking = calculateBand(moduleScores.speaking);
  const overall = Math.round(((listening + reading + writing + speaking) / 4) * 2) / 2;

  // Identify weak areas (below 6.0)
  const weakAreas: string[] = [];
  if (listening < 6) weakAreas.push('listening');
  if (reading < 6) weakAreas.push('reading');
  if (writing < 6) weakAreas.push('writing');
  if (speaking < 6) weakAreas.push('speaking');

  return {
    listening,
    reading,
    writing,
    speaking,
    overall,
    weakAreas,
  };
}
