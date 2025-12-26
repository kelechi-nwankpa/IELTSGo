/**
 * Speech analysis utilities for detecting patterns in transcribed text
 * These run client-side for immediate feedback before AI evaluation
 */

export interface RepeatedWord {
  word: string;
  count: number;
  percentage: number;
}

export interface PauseIndicator {
  type: 'filler' | 'repetition' | 'incomplete' | 'correction';
  text: string;
  position: number;
}

export interface SentenceVariety {
  score: number; // 0-100
  averageLength: number;
  shortSentences: number;
  mediumSentences: number;
  longSentences: number;
  questionCount: number;
  compoundSentenceRatio: number;
  sentenceStartVariety: number; // How many different ways sentences start
}

export interface SpeechAnalysis {
  repeatedWords: RepeatedWord[];
  pauseIndicators: PauseIndicator[];
  sentenceVariety: SentenceVariety;
  overusedWords: string[];
}

// Common filler words to detect
const FILLER_WORDS = [
  'um',
  'uh',
  'er',
  'ah',
  'like',
  'you know',
  'basically',
  'actually',
  'literally',
  'sort of',
  'kind of',
  'i mean',
  'well',
  'so',
  'right',
  'okay',
];

// Common words to exclude from "overused" detection
const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'must',
  'shall',
  'can',
  'need',
  'to',
  'of',
  'in',
  'for',
  'on',
  'with',
  'at',
  'by',
  'from',
  'as',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'between',
  'under',
  'and',
  'but',
  'or',
  'nor',
  'so',
  'yet',
  'both',
  'either',
  'neither',
  'not',
  'only',
  'same',
  'than',
  'too',
  'very',
  'just',
  'also',
  'now',
  'here',
  'there',
  'when',
  'where',
  'why',
  'how',
  'all',
  'each',
  'every',
  'both',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'any',
  'i',
  'me',
  'my',
  'myself',
  'we',
  'our',
  'ours',
  'ourselves',
  'you',
  'your',
  'yours',
  'yourself',
  'he',
  'him',
  'his',
  'himself',
  'she',
  'her',
  'hers',
  'herself',
  'it',
  'its',
  'itself',
  'they',
  'them',
  'their',
  'theirs',
  'themselves',
  'what',
  'which',
  'who',
  'whom',
  'this',
  'that',
  'these',
  'those',
  'am',
  'if',
  'then',
  'because',
  'while',
  'although',
  'though',
  'unless',
  'until',
  'about',
  'think',
  'really',
  'get',
  'got',
  'going',
  'go',
  'went',
  'come',
  'came',
  'make',
  'made',
  'take',
  'took',
  'see',
  'saw',
  'know',
  'knew',
  'want',
  'wanted',
  'say',
  'said',
  'tell',
  'told',
  'give',
  'gave',
  'use',
  'used',
  'find',
  'found',
  'put',
  'try',
  'tried',
  'ask',
  'asked',
  'work',
  'seem',
  'feel',
  'felt',
  'become',
  'leave',
  'call',
  'keep',
  'let',
  'begin',
  'show',
  'hear',
  'play',
  'run',
  'move',
  'live',
  'believe',
]);

/**
 * Analyze speech transcription for patterns
 */
export function analyzeSpeech(transcription: string): SpeechAnalysis {
  const repeatedWords = detectRepeatedWords(transcription);
  const pauseIndicators = detectPauseIndicators(transcription);
  const sentenceVariety = analyzeSentenceVariety(transcription);
  const overusedWords = findOverusedWords(repeatedWords);

  return {
    repeatedWords,
    pauseIndicators,
    sentenceVariety,
    overusedWords,
  };
}

/**
 * Detect words that are repeated more than expected
 */
export function detectRepeatedWords(text: string): RepeatedWord[] {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  const totalWords = words.length;

  if (totalWords === 0) return [];

  const wordCounts = new Map<string, number>();

  for (const word of words) {
    if (!STOP_WORDS.has(word) && word.length > 2) {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
  }

  const repeated: RepeatedWord[] = [];

  for (const [word, count] of wordCounts) {
    if (count >= 3) {
      // Only flag if used 3+ times
      const percentage = (count / totalWords) * 100;
      if (percentage >= 1.5) {
        // And if it's more than 1.5% of speech
        repeated.push({ word, count, percentage: Math.round(percentage * 10) / 10 });
      }
    }
  }

  return repeated.sort((a, b) => b.count - a.count).slice(0, 10);
}

/**
 * Detect indicators of pauses/hesitation in transcription
 */
export function detectPauseIndicators(text: string): PauseIndicator[] {
  const indicators: PauseIndicator[] = [];
  const lowerText = text.toLowerCase();

  // Detect filler words
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    let match;
    while ((match = regex.exec(lowerText)) !== null) {
      indicators.push({
        type: 'filler',
        text: filler,
        position: match.index,
      });
    }
  }

  // Detect word repetitions (e.g., "I I think", "the the")
  const repetitionRegex = /\b(\w+)\s+\1\b/gi;
  let match;
  while ((match = repetitionRegex.exec(text)) !== null) {
    indicators.push({
      type: 'repetition',
      text: match[0],
      position: match.index,
    });
  }

  // Detect incomplete sentences (ending with "..." or mid-sentence breaks)
  const incompleteRegex = /\.\.\.|—|–/g;
  while ((match = incompleteRegex.exec(text)) !== null) {
    indicators.push({
      type: 'incomplete',
      text: match[0],
      position: match.index,
    });
  }

  // Detect self-corrections (e.g., "I mean", "I meant to say", "sorry,", "no wait")
  const correctionPatterns = [
    /\bi mean\b/gi,
    /\bi meant\b/gi,
    /\bsorry\b/gi,
    /\bno wait\b/gi,
    /\bactually no\b/gi,
    /\blet me rephrase\b/gi,
  ];

  for (const pattern of correctionPatterns) {
    while ((match = pattern.exec(text)) !== null) {
      indicators.push({
        type: 'correction',
        text: match[0],
        position: match.index,
      });
    }
  }

  return indicators.sort((a, b) => a.position - b.position);
}

/**
 * Analyze sentence variety and structure
 */
export function analyzeSentenceVariety(text: string): SentenceVariety {
  // Split into sentences (handle common sentence endings)
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length === 0) {
    return {
      score: 0,
      averageLength: 0,
      shortSentences: 0,
      mediumSentences: 0,
      longSentences: 0,
      questionCount: 0,
      compoundSentenceRatio: 0,
      sentenceStartVariety: 0,
    };
  }

  // Count sentence lengths
  let shortSentences = 0;
  let mediumSentences = 0;
  let longSentences = 0;
  let totalWords = 0;
  const sentenceStarts = new Set<string>();
  let compoundSentences = 0;

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).filter((w) => w.length > 0);
    const wordCount = words.length;
    totalWords += wordCount;

    // Categorize by length
    if (wordCount <= 8) {
      shortSentences++;
    } else if (wordCount <= 18) {
      mediumSentences++;
    } else {
      longSentences++;
    }

    // Track sentence starts (first 2 words)
    if (words.length >= 2) {
      sentenceStarts.add(words.slice(0, 2).join(' ').toLowerCase());
    }

    // Check for compound sentences (contains coordinating conjunctions)
    if (/\b(and|but|or|so|yet|for|nor)\b/i.test(sentence) && wordCount > 10) {
      compoundSentences++;
    }
  }

  // Count questions in original text
  const questionCount = (text.match(/\?/g) || []).length;

  // Calculate variety score (0-100)
  const averageLength = totalWords / sentences.length;
  const lengthVariety = calculateLengthVariety(shortSentences, mediumSentences, longSentences);
  const startVariety = Math.min(sentenceStarts.size / sentences.length, 1);
  const compoundRatio = compoundSentences / sentences.length;

  // Weighted score
  const score = Math.round(
    lengthVariety * 40 + // 40% for length variety
      startVariety * 100 * 30 + // 30% for start variety (convert to 0-100 scale)
      Math.min(compoundRatio * 100, 30) + // Up to 30% for compound sentences
      (questionCount > 0 ? 10 : 0) // 10% bonus for rhetorical questions
  );

  return {
    score: Math.min(score, 100),
    averageLength: Math.round(averageLength * 10) / 10,
    shortSentences,
    mediumSentences,
    longSentences,
    questionCount,
    compoundSentenceRatio: Math.round(compoundRatio * 100) / 100,
    sentenceStartVariety: sentenceStarts.size,
  };
}

/**
 * Calculate variety score based on distribution of sentence lengths
 * Best score when there's a good mix of short, medium, and long
 */
function calculateLengthVariety(short: number, medium: number, long: number): number {
  const total = short + medium + long;
  if (total === 0) return 0;

  // Ideal distribution: ~20% short, ~60% medium, ~20% long
  const shortRatio = short / total;
  const mediumRatio = medium / total;
  const longRatio = long / total;

  // Calculate deviation from ideal
  const shortDev = Math.abs(shortRatio - 0.2);
  const mediumDev = Math.abs(mediumRatio - 0.6);
  const longDev = Math.abs(longRatio - 0.2);

  const avgDeviation = (shortDev + mediumDev + longDev) / 3;

  // Convert deviation to score (0 deviation = 100, max deviation = 0)
  return Math.max(0, 100 - avgDeviation * 200);
}

/**
 * Find words that are overused (appear too frequently)
 */
function findOverusedWords(repeatedWords: RepeatedWord[]): string[] {
  return repeatedWords.filter((rw) => rw.percentage >= 2.5 || rw.count >= 5).map((rw) => rw.word);
}

/**
 * Calculate inferred pause count from transcription
 */
export function inferPauseCount(text: string): number {
  const indicators = detectPauseIndicators(text);

  // Weight different types of pause indicators
  let pauseScore = 0;
  for (const indicator of indicators) {
    switch (indicator.type) {
      case 'filler':
        pauseScore += 0.5; // Fillers might indicate pauses
        break;
      case 'repetition':
        pauseScore += 1; // Repetitions strongly suggest hesitation
        break;
      case 'incomplete':
        pauseScore += 1.5; // Incomplete sentences suggest longer pauses
        break;
      case 'correction':
        pauseScore += 1; // Corrections suggest thinking pauses
        break;
    }
  }

  return Math.round(pauseScore);
}
