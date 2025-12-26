import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { transcribeAudio } from '@/lib/ai/transcription';
import { evaluateSpeaking } from '@/lib/ai/speaking-evaluator';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const formData = await request.formData();
    const audio = formData.get('audio') as Blob | null;
    const promptId = formData.get('promptId') as string | null;
    const part = formData.get('part') as string | null;
    const duration = formData.get('duration') as string | null;

    if (!audio || !promptId || !part || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields: audio, promptId, part, duration' },
        { status: 400 }
      );
    }

    const partNumber = parseInt(part, 10);
    if (![1, 2, 3].includes(partNumber)) {
      return NextResponse.json(
        { error: 'Invalid part number. Must be 1, 2, or 3.' },
        { status: 400 }
      );
    }

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

    // Step 2: Evaluate the speaking response
    const { evaluation, tokensUsed } = await evaluateSpeaking({
      part: partNumber as 1 | 2 | 3,
      prompt: {
        topic: contentData.topic as string,
        questions: contentData.questions as string[] | undefined,
        cueCard: contentData.cueCard as { mainTask: string; bulletPoints: string[] } | undefined,
      },
      transcription: transcription.text,
      duration: parseFloat(duration),
    });

    // Step 3: Create practice session
    const practiceSession = await prisma.practiceSession.create({
      data: {
        userId: session.user.id,
        module: 'SPEAKING',
        contentId: promptId,
        completedAt: new Date(),
        submissionData: {
          transcription: transcription.text,
          duration: parseFloat(duration),
          audioMimeType: audio.type,
        },
      },
    });

    // Step 4: Store evaluation
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
