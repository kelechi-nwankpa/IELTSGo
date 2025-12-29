/**
 * Zod validation schemas for API request validation
 *
 * Centralizes all input validation to prevent injection attacks and ensure type safety.
 */

import { z } from 'zod';

// ==================== Common Schemas ====================

/**
 * Valid MongoDB-style ObjectId (24 hex characters)
 */
export const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/, 'Invalid ID format');

/**
 * UUID v4 schema (alternative ID format)
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Flexible ID schema that accepts either format
 */
export const idSchema = z.string().min(1, 'ID is required');

/**
 * Email validation with additional security checks
 */
export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(254, 'Email too long')
  .transform((email) => email.toLowerCase().trim());

/**
 * Password validation with security requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Basic password (less strict, for existing users)
 */
export const basicPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long');

/**
 * User name validation
 */
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s\-']+$/, 'Name contains invalid characters')
  .optional();

// ==================== Auth Schemas ====================

export const registerSchema = z.object({
  email: emailSchema,
  password: basicPasswordSchema,
  name: nameSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ==================== Writing Module Schemas ====================

/**
 * Essay validation with security limits
 */
export const essaySchema = z
  .string()
  .min(50, 'Essay too short (minimum 50 characters)')
  .max(10000, 'Essay too long (maximum 10000 characters)')
  .refine((text) => text.trim().length > 0, 'Essay cannot be empty');

export const writingEvaluateSchema = z.object({
  promptId: idSchema,
  essay: essaySchema,
  wordCount: z.number().int().positive().optional(),
});

export type WritingEvaluateInput = z.infer<typeof writingEvaluateSchema>;

// ==================== Speaking Module Schemas ====================

export const speakingPartSchema = z
  .enum(['1', '2', '3'])
  .transform((val) => parseInt(val, 10) as 1 | 2 | 3);

export const speakingDurationSchema = z
  .string()
  .transform((val) => parseFloat(val))
  .refine(
    (val) => !isNaN(val) && val > 0 && val <= 600,
    'Duration must be between 0 and 600 seconds'
  );

export const speakingEvaluateSchema = z.object({
  promptId: idSchema,
  part: speakingPartSchema,
  duration: speakingDurationSchema,
});

export type SpeakingEvaluateInput = z.infer<typeof speakingEvaluateSchema>;

// ==================== Reading Module Schemas ====================

export const readingAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.string().max(1000, 'Answer too long'),
});

export const readingSubmitSchema = z.object({
  passageId: idSchema,
  answers: z.array(readingAnswerSchema).min(1, 'At least one answer required'),
  timeSpent: z.number().int().nonnegative().optional(),
});

export type ReadingSubmitInput = z.infer<typeof readingSubmitSchema>;

export const readingExplainSchema = z.object({
  passageId: idSchema,
  questionId: z.string(),
  userAnswer: z.string().max(1000).optional(),
  correctAnswer: z.string().max(1000),
});

export type ReadingExplainInput = z.infer<typeof readingExplainSchema>;

// ==================== Listening Module Schemas ====================

export const listeningSubmitSchema = z.object({
  sectionId: idSchema,
  answers: z.array(readingAnswerSchema).min(1, 'At least one answer required'),
  timeSpent: z.number().int().nonnegative().optional(),
});

export type ListeningSubmitInput = z.infer<typeof listeningSubmitSchema>;

// ==================== Mock Test Schemas ====================

export const testTypeSchema = z.enum(['ACADEMIC', 'GENERAL']);

export const mockTestStartSchema = z.object({
  testType: testTypeSchema.optional().default('ACADEMIC'),
});

export type MockTestStartInput = z.infer<typeof mockTestStartSchema>;

export const mockTestSectionSubmitSchema = z.object({
  answers: z.record(z.string(), z.string().max(5000)),
  timeSpent: z.number().int().nonnegative().optional(),
});

export type MockTestSectionSubmitInput = z.infer<typeof mockTestSectionSubmitSchema>;

// ==================== Study Plan Schemas ====================

export const studyPlanGenerateSchema = z.object({
  targetBand: z
    .number()
    .min(4, 'Target band must be at least 4')
    .max(9, 'Target band cannot exceed 9')
    .refine((val) => val % 0.5 === 0, 'Band must be in 0.5 increments'),
  testDate: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  focusAreas: z.array(z.enum(['WRITING', 'SPEAKING', 'READING', 'LISTENING'])).optional(),
  hoursPerWeek: z.number().int().min(1).max(40).optional(),
});

export type StudyPlanGenerateInput = z.infer<typeof studyPlanGenerateSchema>;

// ==================== Admin Schemas ====================

export const adminContentSchema = z.object({
  title: z.string().min(1).max(500),
  module: z.enum(['WRITING', 'SPEAKING', 'READING', 'LISTENING']),
  type: z.string().max(100),
  testType: testTypeSchema,
  difficultyBand: z.number().min(1).max(9).optional(),
  contentData: z.record(z.unknown()),
  tags: z.array(z.string().max(50)).optional(),
});

export type AdminContentInput = z.infer<typeof adminContentSchema>;

// ==================== Stripe Schemas ====================

export const stripeCheckoutSchema = z.object({
  priceId: z.string().startsWith('price_', 'Invalid price ID format'),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export type StripeCheckoutInput = z.infer<typeof stripeCheckoutSchema>;

// ==================== Utility Functions ====================

/**
 * Validate request body with Zod schema
 * Returns parsed data or throws a formatted error
 */
export function validateBody<T extends z.ZodSchema>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    const error = new ValidationError('Validation failed', errors);
    throw error;
  }

  return result.data;
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  public readonly errors: { field: string; message: string }[];

  constructor(message: string, errors: { field: string; message: string }[]) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Format validation error for API response
 */
export function formatValidationError(error: ValidationError): {
  error: string;
  code: string;
  details: { field: string; message: string }[];
} {
  return {
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: error.errors,
  };
}
