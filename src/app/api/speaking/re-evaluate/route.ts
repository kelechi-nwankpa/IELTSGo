import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { evaluateSpeaking } from '@/lib/ai/speaking-evaluator';
import { analyzeSpeech } from '@/lib/ai/speech-analysis';
import { z } from 'zod';

// Zod schema for speaking re-evaluation
const speakingReEvaluateSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  editedTranscription: z
    .string()
    .min(1, 'Transcription cannot be empty')
    .max(50000, 'Transcription too long'),
});

/**
 * Re-evaluate a speaking response with edited transcription
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();

    // Validate with Zod
    const parseResult = speakingReEvaluateSchema.safeParse(body);
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

    const { sessionId, editedTranscription } = parseResult.data;

    // Fetch the original practice session
    const practiceSession = await prisma.practiceSession.findUnique({
      where: { id: sessionId },
      include: {
        content: true,
        evaluation: true,
      },
    });

    if (!practiceSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (practiceSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const contentData = practiceSession.content.contentData as Record<string, unknown>;
    const submissionData = practiceSession.submissionData as Record<string, unknown>;
    const duration = (submissionData?.duration as number) || 120;

    // Determine the part number from content type
    let partNumber: 1 | 2 | 3 = 1;
    if (practiceSession.content.type === 'SPEAKING_PART2') partNumber = 2;
    if (practiceSession.content.type === 'SPEAKING_PART3') partNumber = 3;

    // Run local speech analysis
    const speechAnalysis = analyzeSpeech(editedTranscription);

    // Re-evaluate with AI
    const { evaluation, tokensUsed } = await evaluateSpeaking({
      part: partNumber,
      prompt: {
        topic: contentData.topic as string,
        questions: contentData.questions as string[] | undefined,
        cueCard: contentData.cueCard as { mainTask: string; bulletPoints: string[] } | undefined,
      },
      transcription: editedTranscription,
      duration,
    });

    // Enhance metrics with local analysis
    evaluation.metrics.repeatedWords = speechAnalysis.repeatedWords;
    evaluation.metrics.sentenceVarietyScore = speechAnalysis.sentenceVariety.score;
    evaluation.metrics.overusedWords = speechAnalysis.overusedWords;

    // Update the practice session with edited transcription
    await prisma.practiceSession.update({
      where: { id: sessionId },
      data: {
        submissionData: {
          ...(submissionData as object),
          transcription: editedTranscription,
          originalTranscription: submissionData?.transcription || editedTranscription,
          editedAt: new Date().toISOString(),
        },
      },
    });

    // Update or create evaluation
    if (practiceSession.evaluation) {
      await prisma.evaluation.update({
        where: { id: practiceSession.evaluation.id },
        data: {
          inputText: editedTranscription,
          aiResponse: evaluation as object,
          bandEstimate: evaluation.overall_band,
          tokensUsed: practiceSession.evaluation.tokensUsed + tokensUsed,
        },
      });
    } else {
      await prisma.evaluation.create({
        data: {
          userId: session.user.id,
          sessionId: practiceSession.id,
          module: 'SPEAKING',
          promptVersion: 'v1.0',
          inputText: editedTranscription,
          aiResponse: evaluation as object,
          bandEstimate: evaluation.overall_band,
          tokensUsed,
        },
      });
    }

    return NextResponse.json({
      success: true,
      transcription: editedTranscription,
      evaluation,
    });
  } catch (error) {
    console.error('Speaking re-evaluation error:', error);
    return NextResponse.json({ error: 'Failed to re-evaluate speaking response' }, { status: 500 });
  }
}
