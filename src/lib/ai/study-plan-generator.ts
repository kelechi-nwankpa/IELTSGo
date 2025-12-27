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

const STUDY_PLAN_SYSTEM_PROMPT = `You are an IELTS preparation expert. Generate a CONCISE personalized study plan.

## CRITICAL CONSTRAINTS - FOLLOW EXACTLY:
- Generate ONLY 4-6 weekly_plans (NOT 8-12)
- Keep activity descriptions SHORT (5-10 words max)
- Limit to 2-3 activities per module per day
- Keep goals to 2-3 items per week
- Milestones must be ONE short sentence
- Total response must fit within 3500 tokens

## Planning Principles:
1. Prioritize modules furthest from target band
2. Realistic goals: ~0.5 band improvement per 6-8 weeks
3. Progressive difficulty increase
4. Include mock tests in final week

## Band Gap Priority:
- Gap > 1.5: High (40%+ time)
- Gap 1.0-1.5: Medium-high (25-35%)
- Gap 0.5-1.0: Medium (15-25%)
- Gap < 0.5: Maintenance (10-15%)

## Activity Examples (this length):
- "Section 2 form-filling practice"
- "T/F/NG passage - scanning drill"
- "Task 2 essay - opinion type"
- "Part 2 cue card practice"`;

const RESPONSE_FORMAT = `Respond with ONLY valid JSON (no markdown, no code blocks). Keep it COMPACT:

{"summary":{"total_weeks":4,"focus_areas":["Writing","Speaking"],"expected_improvement":"0.5 band in 4-6 weeks","key_strategy":"Focus on weakest areas"},"weekly_plans":[{"week":1,"theme":"Foundations","goals":["Build vocabulary","Practice timing"],"daily_breakdown":{"listening":{"minutes":30,"activities":["Section 1-2 practice"]},"reading":{"minutes":30,"activities":["Skimming drills"]},"writing":{"minutes":45,"activities":["Task 2 planning"]},"speaking":{"minutes":20,"activities":["Part 1 Q&A"]}},"milestone":"Complete baseline assessment"}],"skill_building_focus":[{"skill":"Coherence","current_issue":"Weak paragraph structure","recommended_practice":"Outline before writing","success_indicator":"Clear topic sentences"}],"resources_needed":[{"resource":"Practice tests","purpose":"Timed practice","available_in_app":true}],"test_day_tips":["Arrive early","Read instructions carefully"],"adaptation_triggers":[{"condition":"Scoring above target","adjustment":"Increase difficulty"}]}

Use this exact structure. Generate 4-6 weekly_plans with SHORT activity descriptions.`;

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
      max_tokens: 8192,
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
    let jsonText = textContent.text.trim();

    // Try to extract JSON if wrapped in markdown code blocks
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    // Try to find JSON object if there's extra text
    const jsonStart = jsonText.indexOf('{');
    const jsonEnd = jsonText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonStart < jsonEnd) {
      jsonText = jsonText.slice(jsonStart, jsonEnd + 1);
    }

    let plan: GeneratedStudyPlan;
    try {
      plan = JSON.parse(jsonText) as GeneratedStudyPlan;
    } catch {
      console.error('JSON parse error. Raw response:', textContent.text.substring(0, 500));
      throw new Error('AI response was not valid JSON. Please try again.');
    }

    // Validate required fields
    if (!plan.summary || !plan.weekly_plans || !Array.isArray(plan.weekly_plans)) {
      throw new Error('AI response missing required fields. Please try again.');
    }

    // Calculate tokens used
    const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    return {
      plan,
      tokensUsed,
    };
  } catch (error) {
    console.error('Study plan generation error:', error);
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
