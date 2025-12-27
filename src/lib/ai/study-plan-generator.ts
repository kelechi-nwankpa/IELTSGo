import Anthropic from '@anthropic-ai/sdk';

// Timeout for AI requests (90 seconds for longer plan generation)
const AI_TIMEOUT_MS = 90000;

// Lazy-load Anthropic client
let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: AI_TIMEOUT_MS,
    });
  }
  return anthropicClient;
}

export interface StudyPlanInput {
  currentBands: {
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
  };
  targetBand: number;
  testType: 'academic' | 'general';
  testDate: Date | null;
  hoursPerDay: number;
  studyDaysPerWeek: number;
  weakAreas: string[];
  practiceSummary?: string;
}

export interface ModuleBreakdown {
  minutes: number;
  activities: string[];
}

export interface WeeklyPlan {
  week: number;
  theme: string;
  goals: string[];
  daily_breakdown: {
    listening: ModuleBreakdown;
    reading: ModuleBreakdown;
    writing: ModuleBreakdown;
    speaking: ModuleBreakdown;
  };
  milestone: string;
}

export interface SkillFocus {
  skill: string;
  current_issue: string;
  recommended_practice: string;
  success_indicator: string;
}

export interface Resource {
  resource: string;
  purpose: string;
  available_in_app: boolean;
}

export interface AdaptationTrigger {
  condition: string;
  adjustment: string;
}

export interface GeneratedStudyPlan {
  summary: {
    total_weeks: number;
    focus_areas: string[];
    expected_improvement: string;
    key_strategy: string;
  };
  weekly_plans: WeeklyPlan[];
  skill_building_focus: SkillFocus[];
  resources_needed: Resource[];
  test_day_tips: string[];
  adaptation_triggers: AdaptationTrigger[];
}

const STUDY_PLAN_SYSTEM_PROMPT = `You are an IELTS preparation expert and study coach. Your task is to generate a personalized study plan based on a student's diagnostic results, target band, and available time.

## Planning Principles

### 1. Prioritize Weakest Areas
- Focus more time on modules furthest from target
- But maintain some practice in all areas

### 2. Realistic Goals
- Band improvement typically takes time (0.5 band per 6-8 weeks of focused study)
- Don't promise unrealistic gains

### 3. Balanced Approach
- Mix skill-building and practice
- Include both timed and untimed practice
- Balance input (reading/listening) with output (writing/speaking)

### 4. Spaced Repetition
- Review previous mistakes
- Return to difficult topics
- Progressive difficulty increase

### 5. Test-Taking Strategy
- Include timing practice
- Teach question-type strategies
- Mock test practice closer to test date

## Band Gap Analysis

Calculate focus distribution based on gaps:
- Gap > 1.5 bands: High priority (40%+ of study time)
- Gap 1.0-1.5 bands: Medium-high priority (25-35%)
- Gap 0.5-1.0 bands: Medium priority (15-25%)
- Gap < 0.5 bands: Maintenance (10-15%)

## Activity Types to Include

### Listening
- Section-specific practice (1, 2, 3, 4)
- Question-type focus (form completion, matching, etc.)
- Speed listening (1.25x)
- Note-taking practice
- Vocabulary building from transcripts

### Reading
- Passage-type practice (Academic: journals, reports; General: notices, advertisements)
- Question-type focus (T/F/NG, matching headings, etc.)
- Timed practice (20 minutes per passage)
- Skimming and scanning drills
- Vocabulary building from passages

### Writing
- Task 1 practice (varied chart/letter types)
- Task 2 essay writing
- Planning practice (outlines)
- Paragraph structure exercises
- Grammar focus (common errors)
- Vocabulary building (academic word list)

### Speaking
- Part 1 Q&A practice
- Part 2 monologue practice
- Part 3 discussion practice
- Fluency exercises
- Pronunciation work
- Recording and self-review

## Important Guidelines

1. Be specific — "Practice IELTS Reading" is too vague; "Complete 2 T/F/NG passages focusing on keyword identification" is better
2. Include time estimates that fit within stated study hours
3. Account for test date if provided — compress plan if needed
4. If no test date, assume 8-12 week preparation
5. Include rest days or lighter days for sustainability
6. Make activities progressively harder
7. Include mock test recommendations (typically weeks before test)
8. Be encouraging but realistic about expected outcomes
9. Reference specific question types and skills from the weak areas provided`;

const RESPONSE_FORMAT = `You MUST respond with valid JSON matching this exact structure (no markdown, no code blocks, just pure JSON):

{
  "summary": {
    "total_weeks": <number>,
    "focus_areas": ["<primary focus>", "<secondary focus>"],
    "expected_improvement": "<realistic expectation statement>",
    "key_strategy": "<main strategic approach>"
  },
  "weekly_plans": [
    {
      "week": <number>,
      "theme": "<week's focus theme>",
      "goals": ["<specific goal>", ...],
      "daily_breakdown": {
        "listening": {
          "minutes": <number>,
          "activities": ["<specific activity>", ...]
        },
        "reading": {
          "minutes": <number>,
          "activities": ["<specific activity>", ...]
        },
        "writing": {
          "minutes": <number>,
          "activities": ["<specific activity>", ...]
        },
        "speaking": {
          "minutes": <number>,
          "activities": ["<specific activity>", ...]
        }
      },
      "milestone": "<what student should achieve by end of week>"
    }
  ],
  "skill_building_focus": [
    {
      "skill": "<specific skill to develop>",
      "current_issue": "<what the diagnostic revealed>",
      "recommended_practice": "<how to improve>",
      "success_indicator": "<how to know improvement>"
    }
  ],
  "resources_needed": [
    {
      "resource": "<resource name>",
      "purpose": "<why it's needed>",
      "available_in_app": <boolean>
    }
  ],
  "test_day_tips": [
    "<practical tip for test day>"
  ],
  "adaptation_triggers": [
    {
      "condition": "<if this happens>",
      "adjustment": "<modify the plan this way>"
    }
  ]
}`;

export async function generateStudyPlan(input: StudyPlanInput): Promise<{
  plan: GeneratedStudyPlan;
  tokensUsed: number;
}> {
  const client = getAnthropicClient();

  // Calculate days until test
  const daysUntilTest = input.testDate
    ? Math.ceil((input.testDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const overallCurrent =
    (input.currentBands.listening +
      input.currentBands.reading +
      input.currentBands.writing +
      input.currentBands.speaking) /
    4;

  const userMessage = `## Student Profile
- Current Estimated Bands:
  - Listening: ${input.currentBands.listening}
  - Reading: ${input.currentBands.reading}
  - Writing: ${input.currentBands.writing}
  - Speaking: ${input.currentBands.speaking}
  - Overall: ${overallCurrent.toFixed(1)}
- Target Overall Band: ${input.targetBand}
- Test Type: ${input.testType}
- Test Date: ${input.testDate ? input.testDate.toISOString().split('T')[0] : 'Not set'}
- Days Until Test: ${daysUntilTest ?? 'Not specified (assume 8-12 weeks)'}
- Study Hours Per Day: ${input.hoursPerDay}
- Study Days Per Week: ${input.studyDaysPerWeek}
- Weak Areas Identified: ${input.weakAreas.length > 0 ? input.weakAreas.join(', ') : 'None specified'}
- Previous Practice History: ${input.practiceSummary || 'No previous practice data available'}

${RESPONSE_FORMAT}

Generate a personalized study plan for this student.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: STUDY_PLAN_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Extract the text content
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in AI response');
    }

    // Parse the JSON response
    const jsonText = textContent.text.trim();
    const plan = JSON.parse(jsonText) as GeneratedStudyPlan;

    // Calculate tokens used
    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    return {
      plan,
      tokensUsed,
    };
  } catch (error) {
    console.error('Study plan generation error:', error);

    // If JSON parsing failed, try to extract JSON from the response
    if (error instanceof SyntaxError) {
      throw new Error('AI response was not valid JSON. Please try again.');
    }

    throw error;
  }
}

// Lightweight function to check if plan needs adaptation
export async function checkPlanAdaptation(
  currentPlan: GeneratedStudyPlan,
  progressData: {
    currentWeek: number;
    completedTasks: number;
    totalTasks: number;
    recentScores: { module: string; band: number }[];
  }
): Promise<{
  shouldAdapt: boolean;
  reason?: string;
  suggestedChanges?: string[];
}> {
  // Note: client is available for future AI-powered adaptation logic
  // const client = getAnthropicClient();

  const completionRate =
    progressData.totalTasks > 0 ? progressData.completedTasks / progressData.totalTasks : 0;

  // Simple heuristics first
  if (completionRate < 0.5) {
    return {
      shouldAdapt: true,
      reason: 'Low task completion rate',
      suggestedChanges: [
        'Reduce daily time commitment',
        'Simplify task complexity',
        'Focus on fewer modules per day',
      ],
    };
  }

  // Check for significant improvement or decline
  const avgRecentScore =
    progressData.recentScores.length > 0
      ? progressData.recentScores.reduce((sum, s) => sum + s.band, 0) /
        progressData.recentScores.length
      : null;

  if (avgRecentScore !== null) {
    const expectedBand = currentPlan.weekly_plans[progressData.currentWeek - 1]?.milestone
      ? parseFloat(
          currentPlan.weekly_plans[progressData.currentWeek - 1].milestone.match(/\d\.\d/)?.[0] ||
            '0'
        )
      : null;

    if (expectedBand && avgRecentScore > expectedBand + 0.5) {
      return {
        shouldAdapt: true,
        reason: 'Exceeding expectations',
        suggestedChanges: [
          'Increase difficulty level',
          'Add more challenging content',
          'Consider accelerating timeline',
        ],
      };
    }
  }

  return { shouldAdapt: false };
}
