import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { evaluateWriting } from '@/lib/ai/writing-evaluator';
import { ErrorCode, formatApiError, detectAnthropicError } from '@/lib/errors';
import { canUseWritingEvaluation, incrementWritingEvaluation, getQuotaStatus } from '@/lib/quota';
import { checkTokenBudget, recordTokenUsage, estimateTokens } from '@/lib/ai/token-budget';
import { evaluationLock } from '@/lib/locks/distributed-lock';
import {
  writingEvaluateSchema,
  validateBody,
  ValidationError,
  formatValidationError,
} from '@/lib/validation/schemas';

interface ContentData {
  prompt: string;
  topic: string;
  visualType?: string;
  imageUrl?: string;
  imageDescription?: string;
  letterType?: string;
}

type TaskType = 'task1_academic' | 'task1_general' | 'task2';

/**
 * Map content type to AI evaluator task type
 */
function getTaskType(contentType: string): TaskType {
  switch (contentType) {
    case 'TASK1_ACADEMIC':
      return 'task1_academic';
    case 'TASK1_GENERAL':
      return 'task1_general';
    case 'TASK2':
    default:
      return 'task2';
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(formatApiError(ErrorCode.UNAUTHORIZED), { status: 401 });
    }

    const userId = session.user.id;

    // Check quota before processing
    const canEvaluate = await canUseWritingEvaluation(userId);
    if (!canEvaluate) {
      const quotaStatus = await getQuotaStatus(userId);
      return NextResponse.json(
        {
          ...formatApiError(ErrorCode.USER_QUOTA_EXCEEDED),
          quota: quotaStatus.writing,
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Estimate tokens and check token budget
    const estimatedTokens = estimateTokens(body.essay || '');
    const tokenBudget = await checkTokenBudget(userId, estimatedTokens);
    if (!tokenBudget.canProceed) {
      return NextResponse.json(
        {
          error: tokenBudget.reason,
          code: 'TOKEN_BUDGET_EXCEEDED',
          tokenUsage: {
            dailyUsed: tokenBudget.dailyUsed,
            dailyLimit: tokenBudget.dailyLimit,
            monthlyUsed: tokenBudget.monthlyUsed,
            monthlyLimit: tokenBudget.monthlyLimit,
          },
        },
        { status: 429 }
      );
    }

    // Validate input with Zod schema
    const { promptId, essay, wordCount } = validateBody(writingEvaluateSchema, body);

    // Acquire distributed lock to prevent duplicate submissions
    const lock = await evaluationLock(userId, 'WRITING');
    if (!lock) {
      return NextResponse.json(
        { error: 'Evaluation already in progress', code: 'DUPLICATE_SUBMISSION' },
        { status: 409 }
      );
    }

    try {
      // Fetch the prompt
      const content = await prisma.content.findUnique({
        where: { id: promptId },
      });

      if (!content) {
        return NextResponse.json(formatApiError(ErrorCode.CONTENT_NOT_FOUND), { status: 404 });
      }

      const contentData = content.contentData as unknown as ContentData;

      // Determine task type from content
      const taskType = getTaskType(content.type);

      // Evaluate with AI
      const { evaluation, tokensUsed } = await evaluateWriting({
        taskType,
        testType: content.testType === 'GENERAL' ? 'general' : 'academic',
        questionPrompt: contentData.prompt,
        userResponse: essay,
      });

      // Create practice session and evaluation records
      const practiceSession = await prisma.practiceSession.create({
        data: {
          userId,
          module: 'WRITING',
          contentId: promptId,
          completedAt: new Date(),
          submissionData: { essay, wordCount: wordCount || evaluation.word_count },
        },
      });

      await prisma.evaluation.create({
        data: {
          userId,
          sessionId: practiceSession.id,
          module: 'WRITING',
          promptVersion: '1.0',
          inputText: essay,
          aiResponse: JSON.parse(JSON.stringify(evaluation)),
          bandEstimate: evaluation.overall_band,
          tokensUsed,
        },
      });

      // Increment quota after successful evaluation
      await incrementWritingEvaluation(userId);

      // Record token usage for budget tracking
      await recordTokenUsage(userId, tokensUsed);

      // Get updated quota status to return to client
      const updatedQuota = await getQuotaStatus(userId);

      return NextResponse.json({
        evaluation,
        tokensUsed,
        wordCount: wordCount || evaluation.word_count,
        quota: updatedQuota.writing,
      });
    } finally {
      await lock.release();
    }
  } catch (error) {
    // Handle validation errors
    if (error instanceof ValidationError) {
      return NextResponse.json(formatValidationError(error), { status: 400 });
    }

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
