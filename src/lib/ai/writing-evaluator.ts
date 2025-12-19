import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface WritingEvaluationInput {
  taskType: 'task1_academic' | 'task1_general' | 'task2';
  testType: 'academic' | 'general';
  questionPrompt: string;
  userResponse: string;
}

export interface CriterionEvaluation {
  band: number;
  summary: string;
  strengths: string[];
  improvements: string[];
}

export interface WritingEvaluation {
  overall_band: number;
  criteria: {
    task_achievement: CriterionEvaluation;
    coherence_cohesion: CriterionEvaluation;
    lexical_resource: CriterionEvaluation;
    grammatical_range: CriterionEvaluation;
  };
  word_count: number;
  word_count_feedback: string | null;
  overall_feedback: string;
  rewritten_excerpt: {
    original: string;
    improved: string;
    explanation: string;
  };
}

const SYSTEM_PROMPT = `You are an expert IELTS Writing examiner. Your task is to evaluate an IELTS Writing response and provide detailed feedback aligned with official IELTS band descriptors.

## Evaluation Criteria

Evaluate the response against these four criteria, using the official IELTS band descriptors:

### 1. Task Achievement (Task 1) / Task Response (Task 2)
- Task 1: How well does the response describe/summarize the visual information? Is there a clear overview? Are key features highlighted?
- Task 2: Does the response address all parts of the question? Is there a clear position? Are ideas extended and supported?

### 2. Coherence and Cohesion
- Is there clear progression throughout? Are paragraphs used logically? Are cohesive devices used effectively without being mechanical?

### 3. Lexical Resource
- Range of vocabulary? Accuracy of word choice and spelling? Ability to paraphrase? Less common vocabulary used appropriately?

### 4. Grammatical Range and Accuracy
- Range of sentence structures? Accuracy? Punctuation control?

## Scoring Guidelines

Band scores should be given in 0.5 increments from 0 to 9.

Key band thresholds:
- Band 5: Partially addresses the task, limited coherence, limited vocabulary with noticeable errors, limited grammar range with frequent errors
- Band 6: Addresses the task adequately, generally coherent, adequate vocabulary with some errors, mix of sentence forms with some errors
- Band 7: Addresses all parts, clear progression, good vocabulary range with occasional errors, variety of complex structures with good control
- Band 8: Fully addresses all parts, sequences information skillfully, wide vocabulary range with rare errors, wide range of structures with rare errors

## Response Format

You MUST respond with valid JSON matching this exact structure (no markdown, no code blocks, just pure JSON):

{
  "overall_band": <number>,
  "criteria": {
    "task_achievement": {
      "band": <number>,
      "summary": "<1-2 sentence summary>",
      "strengths": ["<specific strength with quote>", ...],
      "improvements": ["<specific actionable improvement>", ...]
    },
    "coherence_cohesion": {
      "band": <number>,
      "summary": "<1-2 sentence summary>",
      "strengths": ["<specific strength with quote>", ...],
      "improvements": ["<specific actionable improvement>", ...]
    },
    "lexical_resource": {
      "band": <number>,
      "summary": "<1-2 sentence summary>",
      "strengths": ["<specific strength with quote>", ...],
      "improvements": ["<specific actionable improvement with example>", ...]
    },
    "grammatical_range": {
      "band": <number>,
      "summary": "<1-2 sentence summary>",
      "strengths": ["<specific strength with quote>", ...],
      "improvements": ["<specific actionable improvement with correction>", ...]
    }
  },
  "word_count": <number>,
  "word_count_feedback": "<feedback if under/over recommended length, or null>",
  "overall_feedback": "<2-3 sentences summarizing performance and priority areas>",
  "rewritten_excerpt": {
    "original": "<problematic excerpt from the essay>",
    "improved": "<rewritten version demonstrating improvements>",
    "explanation": "<brief explanation of changes>"
  }
}

## Important Guidelines

1. ALWAYS quote specific text from the response when giving feedback
2. Band scores should reflect the OVERALL quality, not just isolated examples
3. Be encouraging but honest — do not inflate scores
4. Improvements must be actionable and specific
5. The overall band is typically the average of the four criteria, rounded to nearest 0.5
6. For Task 1, expected length is 150+ words; for Task 2, 250+ words
7. Never claim certainty — use "estimated band" language in feedback text
8. If the response is off-topic or incomprehensible, assign appropriate low band with explanation`;

export async function evaluateWriting(input: WritingEvaluationInput): Promise<{
  evaluation: WritingEvaluation;
  tokensUsed: number;
}> {
  const userMessage = `## Task Context
- Task Type: ${input.taskType}
- Test Type: ${input.testType}
- Question/Prompt: ${input.questionPrompt}

## User Response to Evaluate

${input.userResponse}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
    system: SYSTEM_PROMPT,
  });

  const textContent = response.content.find((c) => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from AI');
  }

  // Parse the JSON response
  let evaluation: WritingEvaluation;
  try {
    evaluation = JSON.parse(textContent.text);
  } catch {
    // Try to extract JSON from potential markdown code blocks
    const jsonMatch = textContent.text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      evaluation = JSON.parse(jsonMatch[1]);
    } else {
      throw new Error('Failed to parse AI response as JSON');
    }
  }

  const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

  return { evaluation, tokensUsed };
}
