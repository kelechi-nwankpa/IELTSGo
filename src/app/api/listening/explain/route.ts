import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import Anthropic from '@anthropic-ai/sdk';

interface ExplainRequest {
  sectionId: string;
  sectionTitle: string;
  transcript: string;
  questionId: string;
  questionType: string;
  questionNumber: number;
  questionText: string;
  correctAnswer: string;
  studentAnswer: string;
  wasCorrect: boolean;
}

interface ExplanationResponse {
  explanation: string;
  transcript_reference: {
    speaker: string | null;
    key_text: string;
  };
  skill_tested: string;
  common_mistake: string | null;
  tip: string;
  why_incorrect?: string;
}

// Simple in-memory cache for explanations (in production, use Redis or similar)
const explanationCache = new Map<string, ExplanationResponse>();

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as ExplainRequest;
    const {
      sectionId,
      sectionTitle,
      transcript,
      questionId,
      questionType,
      questionNumber,
      questionText,
      correctAnswer,
      studentAnswer,
      wasCorrect,
    } = body;

    // Validate required fields
    if (!sectionId || !questionId || !questionText || !correctAnswer) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check cache first (explanation doesn't change based on student answer)
    const cacheKey = `explanation:listening:${sectionId}:${questionId}`;
    const cachedExplanation = explanationCache.get(cacheKey);

    if (cachedExplanation) {
      // If student was incorrect, add the why_incorrect field
      if (!wasCorrect && studentAnswer) {
        return NextResponse.json({
          ...cachedExplanation,
          why_incorrect: generateWhyIncorrect(cachedExplanation, studentAnswer, correctAnswer),
        });
      }
      return NextResponse.json(cachedExplanation);
    }

    // Generate explanation using Claude Haiku
    const anthropic = new Anthropic();

    const systemPrompt = `You are an IELTS Listening expert. Your task is to explain why a specific answer is correct (or incorrect) for an IELTS Listening question.

Your explanation should help the student understand:
1. Where in the audio transcript the answer is found
2. Why the correct answer is correct
3. The listening skill being tested

## Question Types and Strategies

### Multiple Choice
- Listen for paraphrasing between question and audio
- Eliminate answers that are not mentioned or contradict what was said
- Watch for distractors that use similar words but different meanings

### True / False / Not Given
- TRUE: The speaker explicitly states or strongly implies this
- FALSE: The speaker explicitly states the opposite
- NOT GIVEN: The audio does not provide enough information to determine

### Matching
- Information may come from different speakers
- Listen for specific names, roles, or categories
- Pay attention to context and qualifiers

### Short Answer
- Use exact words from the audio
- Respect word limits
- Listen for spelling clues (the speaker may spell out names/terms)

## Important Guidelines

1. Quote the exact text from the transcript that supports the answer
2. Explain the connection between the question and what was said
3. Note any paraphrasing or synonyms used
4. Be concise but thorough (2-3 sentences for explanation)
5. Use simple, clear language
6. Focus on teaching the listening skill, not just the answer

You MUST respond with valid JSON only, no other text.`;

    const userMessage = `## Context
- Section Title: ${sectionTitle}
- Question Type: ${formatQuestionType(questionType)}
- Question Number: ${questionNumber}
- Question Text: ${questionText}
- Correct Answer: ${correctAnswer}

## Audio Transcript

${transcript || 'Transcript not available'}

---

Respond with JSON in this exact format:
{
  "explanation": "<clear explanation of why the correct answer is correct>",
  "transcript_reference": {
    "speaker": "<speaker name or null if not identifiable>",
    "key_text": "<relevant quote from the transcript that supports the answer>"
  },
  "skill_tested": "<listening skill being assessed>",
  "common_mistake": "<why students often get this wrong, or null>",
  "tip": "<specific tip for this question type>"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-latest',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
      system: systemPrompt,
    });

    // Extract the text content
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI');
    }

    // Parse the JSON response
    let explanation: ExplanationResponse;
    try {
      explanation = JSON.parse(textContent.text);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = textContent.text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        explanation = JSON.parse(jsonMatch[1].trim());
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    // Cache the explanation
    explanationCache.set(cacheKey, explanation);

    // If student was incorrect, add the why_incorrect field
    if (!wasCorrect && studentAnswer) {
      return NextResponse.json({
        ...explanation,
        why_incorrect: `Your answer "${studentAnswer}" is incorrect. ${explanation.explanation}`,
      });
    }

    return NextResponse.json(explanation);
  } catch (error) {
    console.error('Error generating explanation:', error);
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 });
  }
}

function formatQuestionType(type: string): string {
  switch (type) {
    case 'multiple_choice':
      return 'Multiple Choice';
    case 'true_false_ng':
      return 'True/False/Not Given';
    case 'matching':
      return 'Matching';
    case 'short_answer':
      return 'Short Answer';
    default:
      return type;
  }
}

function generateWhyIncorrect(
  explanation: ExplanationResponse,
  studentAnswer: string,
  correctAnswer: string
): string {
  return `Your answer "${studentAnswer}" is incorrect. The correct answer is "${correctAnswer}". ${explanation.explanation}`;
}
