import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { ErrorCode, formatApiError } from '@/lib/errors';

interface AnswerKey {
  [questionId: string]: string | string[];
}

interface SubmissionData {
  sectionId: string;
  answers: Record<string, string | string[]>;
  timeSpent: number; // in seconds
}

interface QuestionResult {
  questionId: string;
  userAnswer: string | string[] | null;
  correctAnswer: string | string[];
  isCorrect: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(formatApiError(ErrorCode.UNAUTHORIZED), { status: 401 });
    }

    const userId = session.user.id;
    const body: SubmissionData = await request.json();
    const { sectionId, answers, timeSpent } = body;

    // Validate required fields
    if (!sectionId || !answers) {
      return NextResponse.json(formatApiError(ErrorCode.MISSING_FIELDS), { status: 400 });
    }

    // Fetch the listening section with answers
    const content = await prisma.content.findUnique({
      where: { id: sectionId },
      select: {
        id: true,
        title: true,
        answers: true,
        contentData: true,
        difficultyBand: true,
      },
    });

    if (!content) {
      return NextResponse.json(formatApiError(ErrorCode.CONTENT_NOT_FOUND), { status: 404 });
    }

    const answerKey = content.answers as AnswerKey;
    if (!answerKey) {
      return NextResponse.json(
        { error: 'No answer key available for this section' },
        { status: 500 }
      );
    }

    // Score the answers
    const results: QuestionResult[] = [];
    let correctCount = 0;
    const totalQuestions = Object.keys(answerKey).length;

    for (const [questionId, correctAnswer] of Object.entries(answerKey)) {
      const userAnswer = answers[questionId] ?? null;
      const isCorrect = checkAnswer(userAnswer, correctAnswer);

      if (isCorrect) {
        correctCount++;
      }

      results.push({
        questionId,
        userAnswer,
        correctAnswer,
        isCorrect,
      });
    }

    // Calculate band score estimate (approximate IELTS conversion)
    const percentage = (correctCount / totalQuestions) * 100;
    const bandScore = calculateBandScore(percentage);

    // Create practice session record
    const practiceSession = await prisma.practiceSession.create({
      data: {
        userId,
        module: 'LISTENING',
        contentId: sectionId,
        completedAt: new Date(),
        score: correctCount,
        submissionData: JSON.parse(
          JSON.stringify({
            answers,
            timeSpent,
            results,
          })
        ),
      },
    });

    return NextResponse.json({
      sessionId: practiceSession.id,
      score: {
        correct: correctCount,
        total: totalQuestions,
        percentage: Math.round(percentage),
        bandEstimate: bandScore,
      },
      results,
      sectionTitle: content.title,
    });
  } catch (error) {
    console.error('Listening submission error:', error);
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 });
  }
}

/**
 * Check if user's answer matches the correct answer
 * Handles different answer types (string, array) and normalizes for comparison
 */
function checkAnswer(
  userAnswer: string | string[] | null,
  correctAnswer: string | string[]
): boolean {
  if (userAnswer === null || userAnswer === undefined) {
    return false;
  }

  // Handle array answers (matching questions)
  if (Array.isArray(correctAnswer)) {
    if (!Array.isArray(userAnswer)) {
      return false;
    }
    // Check if arrays match exactly (order matters for matching)
    if (userAnswer.length !== correctAnswer.length) {
      return false;
    }
    return userAnswer.every(
      (answer, index) => normalizeAnswer(answer) === normalizeAnswer(correctAnswer[index])
    );
  }

  // Handle string answers
  if (Array.isArray(userAnswer)) {
    return false;
  }

  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
}

/**
 * Normalize answer for comparison
 * - Trim whitespace
 * - Convert to lowercase
 * - Handle common variations
 */
function normalizeAnswer(answer: string): string {
  const normalized = answer.trim().toLowerCase();

  // Normalize TRUE/FALSE/NOT GIVEN variations
  if (normalized === 't' || normalized === 'true' || normalized === 'yes') {
    return 'true';
  }
  if (normalized === 'f' || normalized === 'false' || normalized === 'no') {
    return 'false';
  }
  if (
    normalized === 'ng' ||
    normalized === 'not given' ||
    normalized === 'notgiven' ||
    normalized === 'n/g'
  ) {
    return 'not given';
  }

  // Normalize common number variations for listening
  // Handle spelled out numbers and digits
  const numberMap: Record<string, string> = {
    one: '1',
    two: '2',
    three: '3',
    four: '4',
    five: '5',
    six: '6',
    seven: '7',
    eight: '8',
    nine: '9',
    ten: '10',
    eleven: '11',
    twelve: '12',
    fifteen: '15',
    twenty: '20',
    thirty: '30',
    forty: '40',
    fifty: '50',
    sixty: '60',
    ninety: '90',
    hundred: '100',
  };

  // Check if answer is a spelled out number
  if (numberMap[normalized]) {
    return numberMap[normalized];
  }

  return normalized;
}

/**
 * Convert percentage score to IELTS band score estimate
 * Based on approximate IELTS Listening band score conversion
 */
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
