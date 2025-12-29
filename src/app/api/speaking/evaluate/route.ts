import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { transcribeAudio } from '@/lib/ai/transcription';
import { evaluateSpeaking } from '@/lib/ai/speaking-evaluator';
import { analyzeSpeech } from '@/lib/ai/speech-analysis';
import {
  speakingEvaluateSchema,
  validateBody,
  ValidationError,
  formatValidationError,
} from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const formData = await request.formData();
    const audio = formData.get('audio') as Blob | null;

    if (!audio) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    // Validate text fields with Zod schema
    const formFields = {
      promptId: formData.get('promptId') as string | null,
      part: formData.get('part') as string | null,
      duration: formData.get('duration') as string | null,
    };

    const {
      promptId,
      part: partNumber,
      duration,
    } = validateBody(speakingEvaluateSchema, formFields);

    // Fetch the prompt
    const promptContent = await prisma.content.findUnique({
      where: { id: promptId },
    });

    if (!promptContent) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    const contentData = promptContent.contentData as Record<string, unknown>;

    // Step 1: Transcribe the audio
    const transcription = await transcribeAudio(audio);

    if (!transcription.text || transcription.text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not transcribe audio. Please speak clearly and try again.' },
        { status: 400 }
      );
    }

    // Step 2: Run local speech analysis for enhanced metrics
    const speechAnalysis = analyzeSpeech(transcription.text);

    // Step 3: Evaluate the speaking response with AI
    const { evaluation, tokensUsed } = await evaluateSpeaking({
      part: partNumber as 1 | 2 | 3,
      prompt: {
        topic: contentData.topic as string,
        questions: contentData.questions as string[] | undefined,
        cueCard: contentData.cueCard as { mainTask: string; bulletPoints: string[] } | undefined,
      },
      transcription: transcription.text,
      duration,
    });

    // Enhance metrics with local analysis
    evaluation.metrics.repeatedWords = speechAnalysis.repeatedWords;
    evaluation.metrics.sentenceVarietyScore = speechAnalysis.sentenceVariety.score;
    evaluation.metrics.overusedWords = speechAnalysis.overusedWords;

    // Step 4: Create practice session
    const practiceSession = await prisma.practiceSession.create({
      data: {
        userId: session.user.id,
        module: 'SPEAKING',
        contentId: promptId,
        completedAt: new Date(),
        submissionData: {
          transcription: transcription.text,
          duration,
          audioMimeType: audio.type,
        },
      },
    });

    // Step 5: Store evaluation
    await prisma.evaluation.create({
      data: {
        userId: session.user.id,
        sessionId: practiceSession.id,
        module: 'SPEAKING',
        promptVersion: 'v1.0',
        inputText: transcription.text,
        aiResponse: evaluation as object,
        bandEstimate: evaluation.overall_band,
        tokensUsed,
      },
    });

    return NextResponse.json({
      success: true,
      transcription: transcription.text,
      evaluation,
      sessionId: practiceSession.id,
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof ValidationError) {
      return NextResponse.json(formatValidationError(error), { status: 400 });
    }

    console.error('Speaking evaluation error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Speech transcription service unavailable' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json({ error: 'Failed to evaluate speaking response' }, { status: 500 });
  }
}
