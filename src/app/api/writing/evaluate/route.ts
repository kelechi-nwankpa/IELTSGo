import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluateWriting } from '@/lib/ai/writing-evaluator';

interface ContentData {
  prompt: string;
  topic: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { promptId, essay, wordCount } = body;

    if (!promptId || !essay) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch the prompt
    const content = await prisma.content.findUnique({
      where: { id: promptId },
    });

    if (!content) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    const contentData = content.contentData as unknown as ContentData;

    // Evaluate with AI
    const { evaluation, tokensUsed } = await evaluateWriting({
      taskType: 'task2',
      testType: content.testType === 'GENERAL' ? 'general' : 'academic',
      questionPrompt: contentData.prompt,
      userResponse: essay,
    });

    // For now, we're not storing sessions without auth
    // In a full implementation, we'd create a practice session and evaluation record

    return NextResponse.json({
      evaluation,
      tokensUsed,
      wordCount: wordCount || evaluation.word_count,
    });
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to evaluate essay' },
      { status: 500 }
    );
  }
}
