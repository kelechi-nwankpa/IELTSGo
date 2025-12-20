import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluateWriting } from '@/lib/ai/writing-evaluator';
import { ErrorCode, formatApiError, detectAnthropicError } from '@/lib/errors';

interface ContentData {
  prompt: string;
  topic: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { promptId, essay, wordCount } = body;

    // Validate required fields
    if (!promptId || !essay) {
      return NextResponse.json(formatApiError(ErrorCode.MISSING_FIELDS), { status: 400 });
    }

    // Validate essay is not empty or just whitespace
    if (typeof essay !== 'string' || essay.trim().length === 0) {
      return NextResponse.json(
        formatApiError(ErrorCode.INVALID_INPUT, 'Essay content cannot be empty'),
        { status: 400 }
      );
    }

    // Fetch the prompt
    const content = await prisma.content.findUnique({
      where: { id: promptId },
    });

    if (!content) {
      return NextResponse.json(formatApiError(ErrorCode.CONTENT_NOT_FOUND), { status: 404 });
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

    // Detect specific error type
    const errorCode = detectAnthropicError(error);
    const statusCode = getHttpStatusForError(errorCode);

    return NextResponse.json(
      formatApiError(errorCode, error instanceof Error ? error.message : undefined),
      { status: statusCode }
    );
  }
}

/**
 * Map error codes to appropriate HTTP status codes
 */
function getHttpStatusForError(code: ErrorCode): number {
  switch (code) {
    case ErrorCode.MISSING_FIELDS:
    case ErrorCode.INVALID_INPUT:
      return 400;
    case ErrorCode.AI_AUTHENTICATION_FAILED:
      return 401;
    case ErrorCode.CONTENT_NOT_FOUND:
      return 404;
    case ErrorCode.AI_RATE_LIMITED:
      return 429;
    case ErrorCode.AI_SERVICE_UNAVAILABLE:
      return 503;
    case ErrorCode.TIMEOUT:
      return 504;
    default:
      return 500;
  }
}
