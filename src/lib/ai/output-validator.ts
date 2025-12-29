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

// Filler word entry schema
const fillerWordEntrySchema = z.object({
  word: z.string(),
  count: z.number().int().min(0),
});

// Sample improvement schema
const sampleImprovementSchema = z.object({
  original: z.string().max(1000),
  improved: z.string().max(1000),
  explanation: z.string().max(1000),
});

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
    totalWords: z.number().int().min(0).max(10000),
    fillerWordCount: z.number().int().min(0).max(1000),
    fillerWords: z.array(fillerWordEntrySchema).max(50),
    uniqueVocabularyRatio: z.number().min(0).max(1),
    averageSentenceLength: z.number().min(0).max(200),
    longPausesInferred: z.number().int().min(0).max(100),
    // These may be added by local analysis after AI evaluation
    repeatedWords: z
      .array(
        z.object({
          word: z.string(),
          count: z.number(),
          percentage: z.number(),
        })
      )
      .optional(),
    sentenceVarietyScore: z.number().min(0).max(100).optional(),
    overusedWords: z.array(z.string()).optional(),
  }),
  overall_feedback: z.string().min(1).max(2000),
  sample_improvements: z.array(sampleImprovementSchema).max(10),
});

export type ValidatedSpeakingEvaluation = z.infer<typeof speakingEvaluationSchema>;

// ============================================
// Study Plan Schema
// ============================================

// Module breakdown schema (minutes + activities for each module)
const moduleBreakdownSchema = z.object({
  minutes: z.number().int().min(0).max(480),
  activities: z.array(z.string().max(200)).max(10),
});

// Weekly plan schema matching GeneratedStudyPlan.weekly_plans
const weeklyPlanSchema = z.object({
  week: z.number().int().min(1).max(52),
  theme: z.string().max(200),
  goals: z.array(z.string().max(500)).max(10),
  daily_breakdown: z.object({
    listening: moduleBreakdownSchema,
    reading: moduleBreakdownSchema,
    writing: moduleBreakdownSchema,
    speaking: moduleBreakdownSchema,
  }),
  milestone: z.string().max(500),
});

// Skill focus schema
const skillFocusSchema = z.object({
  skill: z.string().max(200),
  current_issue: z.string().max(500),
  recommended_practice: z.string().max(500),
  success_indicator: z.string().max(500),
});

// Resource schema
const resourceSchema = z.object({
  resource: z.string().max(200),
  purpose: z.string().max(500),
  available_in_app: z.boolean(),
});

// Adaptation trigger schema
const adaptationTriggerSchema = z.object({
  condition: z.string().max(500),
  adjustment: z.string().max(500),
});

export const studyPlanSchema = z.object({
  summary: z.object({
    total_weeks: z.number().int().min(1).max(52),
    focus_areas: z.array(z.string().max(100)).max(10),
    expected_improvement: z.string().max(500),
    key_strategy: z.string().max(1000),
  }),
  weekly_plans: z.array(weeklyPlanSchema).min(1).max(52),
  skill_building_focus: z.array(skillFocusSchema).max(20),
  resources_needed: z.array(resourceSchema).max(20),
  test_day_tips: z.array(z.string().max(500)).max(20),
  adaptation_triggers: z.array(adaptationTriggerSchema).max(10),
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
