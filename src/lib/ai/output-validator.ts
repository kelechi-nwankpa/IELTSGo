import { z } from 'zod';

/**
 * AI Output Validation
 *
 * Strict Zod schemas for validating AI responses to ensure:
 * 1. Response structure matches expected format
 * 2. Values are within valid ranges (band scores 0-9)
 * 3. Unexpected fields are stripped (defense in depth)
 * 4. Validation failures are logged for monitoring
 */

// Common band score validation (0-9, in 0.5 increments)
const bandScoreSchema = z
  .number()
  .min(0)
  .max(9)
  .refine((val) => val * 2 === Math.floor(val * 2), {
    message: 'Band score must be in 0.5 increments',
  });

// Common criterion evaluation schema
const criterionEvaluationSchema = z.object({
  band: bandScoreSchema,
  summary: z.string().min(1).max(500),
  strengths: z.array(z.string().max(500)).max(10),
  improvements: z.array(z.string().max(500)).max(10),
});

// ============================================
// Writing Evaluation Schema
// ============================================

export const writingEvaluationSchema = z.object({
  overall_band: bandScoreSchema,
  criteria: z.object({
    task_achievement: criterionEvaluationSchema,
    coherence_cohesion: criterionEvaluationSchema,
    lexical_resource: criterionEvaluationSchema,
    grammatical_range: criterionEvaluationSchema,
  }),
  word_count: z.number().int().min(0).max(10000),
  word_count_feedback: z.string().max(500).nullable(),
  overall_feedback: z.string().min(1).max(2000),
  rewritten_excerpt: z.object({
    original: z.string().max(1000),
    improved: z.string().max(1000),
    explanation: z.string().max(1000),
  }),
});

export type ValidatedWritingEvaluation = z.infer<typeof writingEvaluationSchema>;

// ============================================
// Speaking Evaluation Schema
// ============================================

export const speakingEvaluationSchema = z.object({
  overall_band: bandScoreSchema,
  criteria: z.object({
    fluency_coherence: criterionEvaluationSchema,
    lexical_resource: criterionEvaluationSchema,
    grammatical_range: criterionEvaluationSchema,
    pronunciation: criterionEvaluationSchema,
  }),
  metrics: z.object({
    wordsPerMinute: z.number().min(0).max(500),
    fillerWordCount: z.number().int().min(0).max(1000),
    fillerWordPercentage: z.number().min(0).max(100),
    repetitionRatio: z.number().min(0).max(1),
    averageSentenceLength: z.number().min(0).max(200),
    vocabularyDiversity: z.number().min(0).max(1),
    uniqueWordCount: z.number().int().min(0).max(10000),
    // These may be added by local analysis
    repeatedWords: z.array(z.string()).optional(),
    sentenceVarietyScore: z.number().min(0).max(100).optional(),
    overusedWords: z.array(z.string()).optional(),
  }),
  overall_feedback: z.string().min(1).max(2000),
  improvement_tips: z.array(z.string().max(500)).max(10),
});

export type ValidatedSpeakingEvaluation = z.infer<typeof speakingEvaluationSchema>;

// ============================================
// Study Plan Schema
// ============================================

const studyTaskSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  module: z.enum(['WRITING', 'SPEAKING', 'READING', 'LISTENING']),
  duration: z.number().int().min(1).max(480), // minutes
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  skillFocus: z.array(z.string().max(100)).max(10),
});

const weekPlanSchema = z.object({
  weekNumber: z.number().int().min(1).max(52),
  focusAreas: z.array(z.string().max(100)).max(10),
  tasks: z.array(studyTaskSchema).max(30),
  weeklyGoal: z.string().max(500),
});

export const studyPlanSchema = z.object({
  totalWeeks: z.number().int().min(1).max(52),
  weeklyHours: z.number().min(1).max(40),
  targetBand: bandScoreSchema,
  currentEstimatedBand: bandScoreSchema,
  weeks: z.array(weekPlanSchema).max(52),
  overallStrategy: z.string().max(2000),
  keyPriorities: z.array(z.string().max(500)).max(10),
});

export type ValidatedStudyPlan = z.infer<typeof studyPlanSchema>;

// ============================================
// Validation Functions
// ============================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  rawInput?: unknown;
}

/**
 * Log validation failures for monitoring
 */
function logValidationFailure(
  schemaName: string,
  error: z.ZodError<unknown>,
  rawInput: unknown
): void {
  console.error(`[AI Output Validation] ${schemaName} validation failed:`, {
    errors: error.issues.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
      code: e.code,
    })),
    // Don't log full input in production to avoid leaking user data
    inputType: typeof rawInput,
    inputKeys:
      typeof rawInput === 'object' && rawInput !== null ? Object.keys(rawInput) : undefined,
  });
}

/**
 * Validate writing evaluation output
 */
export function validateWritingEvaluation(
  input: unknown
): ValidationResult<ValidatedWritingEvaluation> {
  const result = writingEvaluationSchema.safeParse(input);

  if (!result.success) {
    logValidationFailure('WritingEvaluation', result.error, input);
    return {
      success: false,
      error: `Invalid writing evaluation: ${result.error.issues[0]?.message || 'Unknown error'}`,
      rawInput: input,
    };
  }

  return { success: true, data: result.data };
}

/**
 * Validate speaking evaluation output
 */
export function validateSpeakingEvaluation(
  input: unknown
): ValidationResult<ValidatedSpeakingEvaluation> {
  const result = speakingEvaluationSchema.safeParse(input);

  if (!result.success) {
    logValidationFailure('SpeakingEvaluation', result.error, input);
    return {
      success: false,
      error: `Invalid speaking evaluation: ${result.error.issues[0]?.message || 'Unknown error'}`,
      rawInput: input,
    };
  }

  return { success: true, data: result.data };
}

/**
 * Validate study plan output
 */
export function validateStudyPlan(input: unknown): ValidationResult<ValidatedStudyPlan> {
  const result = studyPlanSchema.safeParse(input);

  if (!result.success) {
    logValidationFailure('StudyPlan', result.error, input);
    return {
      success: false,
      error: `Invalid study plan: ${result.error.issues[0]?.message || 'Unknown error'}`,
      rawInput: input,
    };
  }

  return { success: true, data: result.data };
}

/**
 * Parse JSON and validate against schema
 * Handles markdown code blocks and various JSON formats
 */
export function parseAndValidate<T>(
  text: string,
  validator: (input: unknown) => ValidationResult<T>
): ValidationResult<T> {
  let parsed: unknown;

  try {
    // Try direct JSON parse first
    parsed = JSON.parse(text);
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[1]);
      } catch {
        return {
          success: false,
          error: 'Failed to parse AI response as JSON',
        };
      }
    } else {
      // Try to find JSON object in text
      const objectMatch = text.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        try {
          parsed = JSON.parse(objectMatch[0]);
        } catch {
          return {
            success: false,
            error: 'Failed to parse AI response as JSON',
          };
        }
      } else {
        return {
          success: false,
          error: 'No JSON found in AI response',
        };
      }
    }
  }

  return validator(parsed);
}

/**
 * Sanitize AI output to remove unexpected fields (defense in depth)
 * This is automatically done by Zod's parse, but this function
 * can be used when you want to keep the raw data but strip extras
 */
export function sanitizeAIOutput<T extends z.ZodType>(
  schema: T,
  input: unknown
): z.infer<T> | null {
  const result = schema.safeParse(input);
  return result.success ? result.data : null;
}
