import Anthropic from '@anthropic-ai/sdk';

const AI_TIMEOUT_MS = 60000;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: AI_TIMEOUT_MS,
});

export interface SpeakingEvaluationInput {
  part: 1 | 2 | 3;
  prompt: {
    topic: string;
    questions?: string[];
    cueCard?: {
      mainTask: string;
      bulletPoints: string[];
    };
  };
  transcription: string;
  duration: number; // in seconds
}

export interface SpeakingCriterionEvaluation {
  band: number;
  summary: string;
  strengths: string[];
  improvements: string[];
}

export interface SpeakingMetrics {
  wordsPerMinute: number;
  totalWords: number;
  fillerWordCount: number;
  fillerWords: { word: string; count: number }[];
  uniqueVocabularyRatio: number;
  averageSentenceLength: number;
  longPausesInferred: number;
}

export interface SpeakingEvaluation {
  overall_band: number;
  criteria: {
    fluency_coherence: SpeakingCriterionEvaluation;
    lexical_resource: SpeakingCriterionEvaluation;
    grammatical_range: SpeakingCriterionEvaluation;
    pronunciation: SpeakingCriterionEvaluation;
  };
  metrics: SpeakingMetrics;
  overall_feedback: string;
  sample_improvements: {
    original: string;
    improved: string;
    explanation: string;
  }[];
}

const SYSTEM_PROMPT = `You are an expert IELTS Speaking examiner. Your task is to evaluate an IELTS Speaking response based on the transcription provided.

## Evaluation Criteria

Evaluate against these four criteria using official IELTS band descriptors:

### 1. Fluency and Coherence
- Flow of speech: smooth with occasional hesitation?
- Logical organization of ideas
- Use of discourse markers
- Ability to speak at length without unnatural pauses

### 2. Lexical Resource
- Range of vocabulary
- Ability to paraphrase
- Use of idiomatic expressions
- Precision of word choice

### 3. Grammatical Range and Accuracy
- Variety of sentence structures
- Accurate use of complex grammar
- Consistency of grammatical control

### 4. Pronunciation (Note: Limited assessment from transcription)
- Based on transcription, infer clarity from:
  - Self-corrections that suggest pronunciation uncertainty
  - Word choices that avoid difficult pronunciations
  - Note: Acknowledge limitations in pronunciation assessment from text

## Important Notes for Transcription-Based Assessment

Since you only have the transcription, not the audio:
1. Pronunciation assessment is limited - note this clearly
2. Fluency can be partially assessed from:
   - Filler words (um, uh, like, you know)
   - Repetitions and self-corrections
   - Sentence completion patterns
3. Be conservative with pronunciation band scores
4. Focus strengths on vocabulary and grammar where transcription provides clear evidence

## Speaking Part Context

- Part 1: Short questions about familiar topics (30-60 seconds per answer expected)
- Part 2: Long turn with cue card (1.5-2 minutes expected)
- Part 3: Discussion questions (more complex, 60-90 seconds per answer)

## Response Format

Respond with valid JSON matching this exact structure:

{
  "overall_band": <number>,
  "criteria": {
    "fluency_coherence": {
      "band": <number>,
      "summary": "<1-2 sentence summary>",
      "strengths": ["<specific strength with quote>", ...],
      "improvements": ["<specific actionable improvement>", ...]
    },
    "lexical_resource": {
      "band": <number>,
      "summary": "<1-2 sentence summary>",
      "strengths": ["<specific strength with quote>", ...],
      "improvements": ["<specific actionable improvement>", ...]
    },
    "grammatical_range": {
      "band": <number>,
      "summary": "<1-2 sentence summary>",
      "strengths": ["<specific strength with quote>", ...],
      "improvements": ["<specific actionable improvement>", ...]
    },
    "pronunciation": {
      "band": <number>,
      "summary": "<1-2 sentences, note limitation of text-based assessment>",
      "strengths": ["<inferred strength>", ...],
      "improvements": ["<general pronunciation advice>", ...]
    }
  },
  "metrics": {
    "wordsPerMinute": <number>,
    "totalWords": <number>,
    "fillerWordCount": <number>,
    "fillerWords": [{"word": "<word>", "count": <number>}, ...],
    "uniqueVocabularyRatio": <number between 0-1>,
    "averageSentenceLength": <number>,
    "longPausesInferred": <number, based on incomplete sentences/corrections>
  },
  "overall_feedback": "<2-3 sentences summarizing performance and priorities>",
  "sample_improvements": [
    {
      "original": "<quote from transcription>",
      "improved": "<enhanced version>",
      "explanation": "<brief explanation>"
    }
  ]
}

## Guidelines

1. ALWAYS quote specific text when giving feedback
2. Be encouraging but honest
3. Note that pronunciation score is estimated from transcription only
4. The overall band is typically the average of the four criteria
5. Consider the speaking part when evaluating appropriateness of response length
6. Filler words are normal to some extent - excessive use impacts fluency score`;

export async function evaluateSpeaking(input: SpeakingEvaluationInput): Promise<{
  evaluation: SpeakingEvaluation;
  tokensUsed: number;
}> {
  const promptContext =
    input.part === 2
      ? `Cue Card:\n${input.prompt.cueCard?.mainTask}\n- ${input.prompt.cueCard?.bulletPoints.join('\n- ')}`
      : input.prompt.questions
        ? `Questions:\n${input.prompt.questions.join('\n')}`
        : `Topic: ${input.prompt.topic}`;

  const userMessage = `## Speaking Part ${input.part}

## Prompt/Topic
${input.prompt.topic}

${promptContext}

## Response Duration
${input.duration} seconds (${Math.round((input.duration / 60) * 10) / 10} minutes)

## Transcription

${input.transcription}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2500,
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

  const evaluation = parseEvaluationResponse(textContent.text);
  const tokensUsed = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

  return { evaluation, tokensUsed };
}

function parseEvaluationResponse(text: string): SpeakingEvaluation {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[1]);
      } catch {
        throw new Error('Failed to parse AI response as JSON');
      }
    } else {
      throw new Error('Failed to parse AI response as JSON');
    }
  }

  if (!isValidEvaluation(parsed)) {
    throw new Error('AI response is missing required fields');
  }

  return parsed;
}

function isValidEvaluation(obj: unknown): obj is SpeakingEvaluation {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const evaluation = obj as Record<string, unknown>;

  if (typeof evaluation.overall_band !== 'number') return false;
  if (typeof evaluation.overall_feedback !== 'string') return false;
  if (typeof evaluation.criteria !== 'object' || evaluation.criteria === null) return false;
  if (typeof evaluation.metrics !== 'object' || evaluation.metrics === null) return false;

  const criteria = evaluation.criteria as Record<string, unknown>;
  const requiredCriteria = [
    'fluency_coherence',
    'lexical_resource',
    'grammatical_range',
    'pronunciation',
  ];

  for (const key of requiredCriteria) {
    if (!criteria[key] || typeof criteria[key] !== 'object') return false;
    const criterion = criteria[key] as Record<string, unknown>;
    if (typeof criterion.band !== 'number') return false;
    if (typeof criterion.summary !== 'string') return false;
    if (!Array.isArray(criterion.strengths)) return false;
    if (!Array.isArray(criterion.improvements)) return false;
  }

  return true;
}
