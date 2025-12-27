/**
 * Diagnostic Assessment Questions
 *
 * These questions are designed to quickly assess a user's current IELTS level
 * across all four modules. Each module has questions at different difficulty
 * levels (bands 4-8) to accurately estimate the user's band score.
 */

export interface DiagnosticQuestion {
  id: string;
  module: 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';
  difficulty: number; // Band level (4-8)
  type: string;
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  audioUrl?: string;
  passage?: string;
  timeLimit?: number; // in seconds
  rubric?: string;
}

// LISTENING DIAGNOSTIC QUESTIONS (15 questions)
export const listeningQuestions: DiagnosticQuestion[] = [
  // Band 4-5 (Easy)
  {
    id: 'list-1',
    module: 'LISTENING',
    difficulty: 4,
    type: 'fill-in-blank',
    question:
      'Listen to the recording about a library tour. Complete the sentence: The library opens at _____ on weekdays.',
    correctAnswer: '9 am',
    timeLimit: 30,
  },
  {
    id: 'list-2',
    module: 'LISTENING',
    difficulty: 4,
    type: 'multiple-choice',
    question: 'In the conversation, what does the student need help with?',
    options: [
      'Finding a book',
      'Printing documents',
      'Registering for a class',
      'Borrowing a laptop',
    ],
    correctAnswer: 'Finding a book',
    timeLimit: 30,
  },
  {
    id: 'list-3',
    module: 'LISTENING',
    difficulty: 5,
    type: 'fill-in-blank',
    question: 'The speaker mentions that the new policy will take effect from _____ next month.',
    correctAnswer: 'the first',
    timeLimit: 30,
  },
  // Band 5-6 (Medium)
  {
    id: 'list-4',
    module: 'LISTENING',
    difficulty: 5,
    type: 'multiple-choice',
    question: 'According to the lecture, what is the main cause of urban heat islands?',
    options: [
      'Industrial pollution',
      'Vehicle emissions',
      'Lack of vegetation',
      'Building materials',
    ],
    correctAnswer: 'Building materials',
    timeLimit: 45,
  },
  {
    id: 'list-5',
    module: 'LISTENING',
    difficulty: 5.5,
    type: 'matching',
    question: 'Match the speakers to their opinions about remote work.',
    options: ['Speaker A - Supportive', 'Speaker B - Neutral', 'Speaker C - Critical'],
    correctAnswer: ['Speaker A - Supportive', 'Speaker B - Critical', 'Speaker C - Neutral'],
    timeLimit: 60,
  },
  {
    id: 'list-6',
    module: 'LISTENING',
    difficulty: 6,
    type: 'fill-in-blank',
    question:
      "The researcher explains that the experiment's success rate was approximately _____ percent.",
    correctAnswer: '78',
    timeLimit: 30,
  },
  // Band 6-7 (Challenging)
  {
    id: 'list-7',
    module: 'LISTENING',
    difficulty: 6,
    type: 'multiple-choice',
    question: 'The professor implies that the previous study was flawed because:',
    options: [
      'Sample size was too small',
      'Methodology was outdated',
      'Results were not replicated',
      'Funding was insufficient',
    ],
    correctAnswer: 'Methodology was outdated',
    timeLimit: 45,
  },
  {
    id: 'list-8',
    module: 'LISTENING',
    difficulty: 6.5,
    type: 'true-false-ng',
    question:
      'The speaker believes that artificial intelligence will completely replace human workers.',
    options: ['True', 'False', 'Not Given'],
    correctAnswer: 'False',
    timeLimit: 30,
  },
  {
    id: 'list-9',
    module: 'LISTENING',
    difficulty: 6.5,
    type: 'summary-completion',
    question:
      'Complete the summary: The new recycling program requires residents to separate their waste into _____ categories.',
    correctAnswer: 'four',
    timeLimit: 30,
  },
  // Band 7-8 (Advanced)
  {
    id: 'list-10',
    module: 'LISTENING',
    difficulty: 7,
    type: 'multiple-choice',
    question:
      'What does the speaker mean when she says "we\'re essentially reinventing the wheel"?',
    options: [
      'Making something better',
      'Creating unnecessary work',
      'Starting from scratch',
      'Repeating past mistakes',
    ],
    correctAnswer: 'Creating unnecessary work',
    timeLimit: 45,
  },
  {
    id: 'list-11',
    module: 'LISTENING',
    difficulty: 7,
    type: 'sentence-completion',
    question:
      'The lecturer argues that sustainable development requires a balance between _____ and environmental protection.',
    correctAnswer: 'economic growth',
    timeLimit: 45,
  },
  {
    id: 'list-12',
    module: 'LISTENING',
    difficulty: 7.5,
    type: 'multiple-choice',
    question: "The speaker's main criticism of current educational policies is that they:",
    options: [
      'Focus too much on standardized testing',
      'Lack adequate funding',
      'Ignore cultural diversity',
      'Fail to prepare students for employment',
    ],
    correctAnswer: 'Focus too much on standardized testing',
    timeLimit: 45,
  },
  {
    id: 'list-13',
    module: 'LISTENING',
    difficulty: 7.5,
    type: 'diagram-labeling',
    question:
      'Label the diagram showing the water purification process. The first stage involves _____ to remove large particles.',
    correctAnswer: 'filtration',
    timeLimit: 45,
  },
  {
    id: 'list-14',
    module: 'LISTENING',
    difficulty: 8,
    type: 'note-completion',
    question:
      'According to the academic discussion, the paradox of technological progress is that increased efficiency often leads to higher overall _____.',
    correctAnswer: 'consumption',
    timeLimit: 45,
  },
  {
    id: 'list-15',
    module: 'LISTENING',
    difficulty: 8,
    type: 'multiple-choice',
    question:
      'The researchers conclude that the correlation between social media use and mental health is:',
    options: [
      'Strongly negative',
      'Weakly positive',
      'Statistically insignificant',
      'Context-dependent',
    ],
    correctAnswer: 'Context-dependent',
    timeLimit: 60,
  },
];

// READING DIAGNOSTIC QUESTIONS (15 questions)
export const readingQuestions: DiagnosticQuestion[] = [
  // Band 4-5 (Easy)
  {
    id: 'read-1',
    module: 'READING',
    difficulty: 4,
    type: 'true-false-ng',
    passage:
      'Coffee is one of the most popular beverages in the world. It is made from roasted coffee beans. Most coffee is grown in tropical regions.',
    question: 'Coffee beans are grown in cold climates.',
    options: ['True', 'False', 'Not Given'],
    correctAnswer: 'False',
    timeLimit: 60,
  },
  {
    id: 'read-2',
    module: 'READING',
    difficulty: 4,
    type: 'fill-in-blank',
    passage:
      'The museum is open from Tuesday to Sunday. It closes on Mondays for maintenance. Admission is free for children under 12.',
    question: 'The museum is closed on _____.',
    correctAnswer: 'Mondays',
    timeLimit: 45,
  },
  {
    id: 'read-3',
    module: 'READING',
    difficulty: 5,
    type: 'multiple-choice',
    passage:
      'Recycling helps reduce waste and conserve natural resources. By recycling paper, we can save trees and reduce energy consumption in manufacturing.',
    question: 'According to the passage, recycling paper helps to:',
    options: ['Create more jobs', 'Save trees', 'Increase production', 'Lower prices'],
    correctAnswer: 'Save trees',
    timeLimit: 60,
  },
  // Band 5-6 (Medium)
  {
    id: 'read-4',
    module: 'READING',
    difficulty: 5.5,
    type: 'matching-headings',
    passage:
      'Paragraph A: Scientists have discovered a new species of deep-sea fish. The fish lives at depths of over 3,000 meters. It has developed unique adaptations for survival in extreme conditions.\n\nParagraph B: Climate change is affecting marine ecosystems worldwide. Rising ocean temperatures are causing coral bleaching. Many species are migrating to cooler waters.',
    question:
      'Match the headings to paragraphs: i) Environmental impact on oceans  ii) Discovery of marine life',
    options: ['A-i, B-ii', 'A-ii, B-i'],
    correctAnswer: 'A-ii, B-i',
    timeLimit: 90,
  },
  {
    id: 'read-5',
    module: 'READING',
    difficulty: 5.5,
    type: 'true-false-ng',
    passage:
      'The Industrial Revolution began in Britain in the late 18th century. It transformed society from agrarian to industrial. Factories replaced traditional craftsmanship, and cities grew rapidly as workers migrated from rural areas.',
    question: 'The Industrial Revolution caused people to move from cities to farms.',
    options: ['True', 'False', 'Not Given'],
    correctAnswer: 'False',
    timeLimit: 60,
  },
  {
    id: 'read-6',
    module: 'READING',
    difficulty: 6,
    type: 'summary-completion',
    passage:
      'Renewable energy sources such as solar, wind, and hydropower are becoming increasingly important. Unlike fossil fuels, they do not deplete natural resources and produce minimal greenhouse gas emissions.',
    question: 'Renewable energy is important because it does not _____ natural resources.',
    correctAnswer: 'deplete',
    timeLimit: 60,
  },
  // Band 6-7 (Challenging)
  {
    id: 'read-7',
    module: 'READING',
    difficulty: 6,
    type: 'multiple-choice',
    passage:
      'The placebo effect demonstrates the powerful connection between mind and body. When patients believe they are receiving treatment, they often experience real physiological improvements, even when given an inactive substance. This phenomenon has significant implications for medical research and clinical practice.',
    question: 'The main purpose of this passage is to:',
    options: [
      'Criticize medical research methods',
      'Explain a psychological phenomenon',
      'Promote alternative medicine',
      'Discuss pharmaceutical development',
    ],
    correctAnswer: 'Explain a psychological phenomenon',
    timeLimit: 90,
  },
  {
    id: 'read-8',
    module: 'READING',
    difficulty: 6.5,
    type: 'matching-information',
    passage:
      "Dr. Smith's research focuses on urban planning and sustainability. She argues that cities must prioritize green spaces. In contrast, Professor Johnson emphasizes the importance of public transportation infrastructure. Meanwhile, Dr. Lee suggests that mixed-use development is the key to sustainable urban growth.",
    question: 'Which researcher advocates for improved transit systems?',
    options: ['Dr. Smith', 'Professor Johnson', 'Dr. Lee'],
    correctAnswer: 'Professor Johnson',
    timeLimit: 90,
  },
  {
    id: 'read-9',
    module: 'READING',
    difficulty: 6.5,
    type: 'sentence-completion',
    passage:
      'Artificial intelligence is revolutionizing various industries. In healthcare, AI algorithms can analyze medical images with remarkable accuracy. However, ethical concerns about privacy and decision-making transparency remain significant challenges that must be addressed.',
    question:
      'According to the passage, challenges with AI in healthcare include concerns about _____ and transparency.',
    correctAnswer: 'privacy',
    timeLimit: 60,
  },
  // Band 7-8 (Advanced)
  {
    id: 'read-10',
    module: 'READING',
    difficulty: 7,
    type: 'multiple-choice',
    passage:
      "The linguistic relativity hypothesis, also known as the Sapir-Whorf hypothesis, proposes that the structure of a language affects its speakers' cognition or world view. While the strong version of this theory—that language determines thought—has been largely discredited, weaker versions suggesting that language influences certain aspects of cognition continue to generate scholarly debate.",
    question: "The author's stance on the linguistic relativity hypothesis is:",
    options: [
      'Completely supportive',
      'Entirely dismissive',
      'Cautiously nuanced',
      'Deliberately ambiguous',
    ],
    correctAnswer: 'Cautiously nuanced',
    timeLimit: 120,
  },
  {
    id: 'read-11',
    module: 'READING',
    difficulty: 7,
    type: 'true-false-ng',
    passage:
      'Quantum computing represents a paradigm shift in computational capability. Unlike classical computers that use bits, quantum computers utilize qubits, which can exist in multiple states simultaneously through superposition. This allows them to solve certain problems exponentially faster than traditional systems.',
    question: 'Quantum computers are marginally faster than classical computers.',
    options: ['True', 'False', 'Not Given'],
    correctAnswer: 'False',
    timeLimit: 90,
  },
  {
    id: 'read-12',
    module: 'READING',
    difficulty: 7.5,
    type: 'matching-features',
    passage:
      "The Renaissance period produced numerous polymaths. Leonardo da Vinci combined artistic genius with scientific inquiry. Michelangelo revolutionized sculpture and architecture. Galileo's astronomical observations challenged prevailing geocentric views, while Machiavelli's political treatises influenced governance theory for centuries.",
    question: 'Which figure is associated with political philosophy?',
    options: ['Leonardo da Vinci', 'Michelangelo', 'Galileo', 'Machiavelli'],
    correctAnswer: 'Machiavelli',
    timeLimit: 90,
  },
  {
    id: 'read-13',
    module: 'READING',
    difficulty: 7.5,
    type: 'summary-completion',
    passage:
      "Neuroplasticity refers to the brain's ability to reorganize itself by forming new neural connections throughout life. This adaptability enables learning and recovery from brain injuries. Recent research suggests that cognitive exercises and environmental enrichment can enhance neuroplasticity at any age.",
    question:
      'The passage indicates that neuroplasticity can be improved through cognitive exercises and environmental _____.',
    correctAnswer: 'enrichment',
    timeLimit: 90,
  },
  {
    id: 'read-14',
    module: 'READING',
    difficulty: 8,
    type: 'multiple-choice',
    passage:
      'The concept of "degrowth" challenges the fundamental assumption of modern economics that perpetual growth is both possible and desirable. Proponents argue that in a world of finite resources, continuous expansion is ecologically unsustainable and that well-being should be decoupled from GDP growth. Critics counter that without growth, poverty reduction and technological advancement become significantly more difficult to achieve.',
    question: 'The passage presents degrowth as:',
    options: [
      'An economic inevitability',
      'A contentious alternative framework',
      'A proven solution to poverty',
      'An outdated theory',
    ],
    correctAnswer: 'A contentious alternative framework',
    timeLimit: 120,
  },
  {
    id: 'read-15',
    module: 'READING',
    difficulty: 8,
    type: 'identifying-writer-views',
    passage:
      'While proponents of genetic engineering emphasize its potential to eradicate hereditary diseases and enhance human capabilities, one must consider the profound ethical implications of fundamentally altering human biology. The distinction between therapeutic interventions and enhancement raises questions about equality, identity, and the very definition of what it means to be human.',
    question: "The writer's attitude toward genetic engineering is best described as:",
    options: [
      'Enthusiastically supportive',
      'Philosophically cautious',
      'Strongly opposed',
      'Scientifically neutral',
    ],
    correctAnswer: 'Philosophically cautious',
    timeLimit: 120,
  },
];

// WRITING DIAGNOSTIC PROMPTS (8 prompts - 4 Task 1, 4 Task 2)
export const writingQuestions: DiagnosticQuestion[] = [
  // Task 1 - Band 5-6
  {
    id: 'write-1',
    module: 'WRITING',
    difficulty: 5.5,
    type: 'task1',
    question:
      'The chart shows the percentage of household income spent on different items in two countries. Summarize the main features and make comparisons.',
    timeLimit: 1200, // 20 minutes
    rubric: 'Task Achievement, Coherence, Lexical Resource, Grammar',
  },
  // Task 1 - Band 6-7
  {
    id: 'write-2',
    module: 'WRITING',
    difficulty: 6.5,
    type: 'task1',
    question:
      'The diagram shows the process of recycling plastic bottles. Describe the stages involved in the process.',
    timeLimit: 1200,
    rubric: 'Task Achievement, Coherence, Lexical Resource, Grammar',
  },
  // Task 1 - Band 7-8
  {
    id: 'write-3',
    module: 'WRITING',
    difficulty: 7.5,
    type: 'task1',
    question:
      'The two maps show a coastal area before and after the construction of a tourist resort. Summarize the main changes and compare the key features.',
    timeLimit: 1200,
    rubric: 'Task Achievement, Coherence, Lexical Resource, Grammar',
  },
  // Task 1 General Training
  {
    id: 'write-4',
    module: 'WRITING',
    difficulty: 6,
    type: 'task1-letter',
    question:
      'You recently attended a training course at work that was not useful. Write a letter to your manager explaining why the course was unsatisfactory and suggesting improvements.',
    timeLimit: 1200,
    rubric: 'Task Achievement, Coherence, Lexical Resource, Grammar',
  },
  // Task 2 - Band 5-6
  {
    id: 'write-5',
    module: 'WRITING',
    difficulty: 5.5,
    type: 'task2',
    question:
      'Some people think that children should start learning a foreign language at primary school. Others believe that foreign language learning should begin at secondary school. Discuss both views and give your opinion.',
    timeLimit: 2400, // 40 minutes
    rubric: 'Task Response, Coherence, Lexical Resource, Grammar',
  },
  // Task 2 - Band 6-7
  {
    id: 'write-6',
    module: 'WRITING',
    difficulty: 6.5,
    type: 'task2',
    question:
      'In many countries, the gap between the rich and the poor is widening. What problems does this cause? What solutions can you suggest?',
    timeLimit: 2400,
    rubric: 'Task Response, Coherence, Lexical Resource, Grammar',
  },
  // Task 2 - Band 7-8
  {
    id: 'write-7',
    module: 'WRITING',
    difficulty: 7.5,
    type: 'task2',
    question:
      'Scientific research should be carried out and controlled by governments rather than private companies. To what extent do you agree or disagree?',
    timeLimit: 2400,
    rubric: 'Task Response, Coherence, Lexical Resource, Grammar',
  },
  // Task 2 - Advanced
  {
    id: 'write-8',
    module: 'WRITING',
    difficulty: 8,
    type: 'task2',
    question:
      'Some argue that increased automation and artificial intelligence will lead to mass unemployment, while others believe it will create new types of jobs and opportunities. Discuss both perspectives and provide your own assessment of the likely outcomes.',
    timeLimit: 2400,
    rubric: 'Task Response, Coherence, Lexical Resource, Grammar',
  },
];

// SPEAKING DIAGNOSTIC PROMPTS (15 prompts across all parts)
export const speakingQuestions: DiagnosticQuestion[] = [
  // Part 1 - Introduction (Band 4-6)
  {
    id: 'speak-1',
    module: 'SPEAKING',
    difficulty: 4.5,
    type: 'part1',
    question: 'Do you work or are you a student?',
    timeLimit: 30,
    rubric: 'Fluency, Lexical Resource, Grammar, Pronunciation',
  },
  {
    id: 'speak-2',
    module: 'SPEAKING',
    difficulty: 5,
    type: 'part1',
    question: 'What do you usually do in your free time?',
    timeLimit: 30,
    rubric: 'Fluency, Lexical Resource, Grammar, Pronunciation',
  },
  {
    id: 'speak-3',
    module: 'SPEAKING',
    difficulty: 5.5,
    type: 'part1',
    question: 'How has technology changed the way people communicate in your country?',
    timeLimit: 45,
    rubric: 'Fluency, Lexical Resource, Grammar, Pronunciation',
  },
  {
    id: 'speak-4',
    module: 'SPEAKING',
    difficulty: 6,
    type: 'part1',
    question: 'What qualities do you think are important in a good friend?',
    timeLimit: 45,
    rubric: 'Fluency, Lexical Resource, Grammar, Pronunciation',
  },
  {
    id: 'speak-5',
    module: 'SPEAKING',
    difficulty: 6,
    type: 'part1',
    question: "Do you think it's important to follow the news? Why or why not?",
    timeLimit: 45,
    rubric: 'Fluency, Lexical Resource, Grammar, Pronunciation',
  },
  // Part 2 - Long Turn (Band 5-7)
  {
    id: 'speak-6',
    module: 'SPEAKING',
    difficulty: 5.5,
    type: 'part2',
    question:
      'Describe a book you have recently read. You should say:\n- What the book was about\n- Why you chose to read it\n- What you learned from it\n- And explain whether you would recommend it to others.',
    timeLimit: 120,
    rubric: 'Fluency, Lexical Resource, Grammar, Pronunciation',
  },
  {
    id: 'speak-7',
    module: 'SPEAKING',
    difficulty: 6,
    type: 'part2',
    question:
      'Describe an achievement you are proud of. You should say:\n- What you achieved\n- When this happened\n- How difficult it was\n- And explain why you are proud of this achievement.',
    timeLimit: 120,
    rubric: 'Fluency, Lexical Resource, Grammar, Pronunciation',
  },
  {
    id: 'speak-8',
    module: 'SPEAKING',
    difficulty: 6.5,
    type: 'part2',
    question:
      'Describe a time when you had to make a difficult decision. You should say:\n- What the decision was\n- What options you had\n- How you made the decision\n- And explain how you felt about the outcome.',
    timeLimit: 120,
    rubric: 'Fluency, Lexical Resource, Grammar, Pronunciation',
  },
  {
    id: 'speak-9',
    module: 'SPEAKING',
    difficulty: 7,
    type: 'part2',
    question:
      'Describe a historical event that interests you. You should say:\n- What the event was\n- When and where it happened\n- What the consequences were\n- And explain why this event is significant to you.',
    timeLimit: 120,
    rubric: 'Fluency, Lexical Resource, Grammar, Pronunciation',
  },
  {
    id: 'speak-10',
    module: 'SPEAKING',
    difficulty: 7.5,
    type: 'part2',
    question:
      'Describe a time when you changed your opinion about something. You should say:\n- What your original opinion was\n- What caused you to change your mind\n- How your perspective changed\n- And explain the impact this had on you.',
    timeLimit: 120,
    rubric: 'Fluency, Lexical Resource, Grammar, Pronunciation',
  },
  // Part 3 - Discussion (Band 6-8)
  {
    id: 'speak-11',
    module: 'SPEAKING',
    difficulty: 6.5,
    type: 'part3',
    question:
      'What are the advantages and disadvantages of online education compared to traditional classroom learning?',
    timeLimit: 120,
    rubric: 'Fluency, Lexical Resource, Grammar, Pronunciation',
  },
  {
    id: 'speak-12',
    module: 'SPEAKING',
    difficulty: 7,
    type: 'part3',
    question:
      'Some people believe that governments should prioritize economic development over environmental protection. What is your view on this issue?',
    timeLimit: 120,
    rubric: 'Fluency, Lexical Resource, Grammar, Pronunciation',
  },
  {
    id: 'speak-13',
    module: 'SPEAKING',
    difficulty: 7.5,
    type: 'part3',
    question:
      'How do you think the concept of work-life balance will evolve in the future, and what factors will influence this change?',
    timeLimit: 120,
    rubric: 'Fluency, Lexical Resource, Grammar, Pronunciation',
  },
  {
    id: 'speak-14',
    module: 'SPEAKING',
    difficulty: 8,
    type: 'part3',
    question:
      'To what extent do you think cultural globalization has been beneficial for local traditions and identities?',
    timeLimit: 120,
    rubric: 'Fluency, Lexical Resource, Grammar, Pronunciation',
  },
  {
    id: 'speak-15',
    module: 'SPEAKING',
    difficulty: 8,
    type: 'part3',
    question:
      'Some argue that artificial intelligence will fundamentally change what it means to be human. How would you respond to this perspective?',
    timeLimit: 120,
    rubric: 'Fluency, Lexical Resource, Grammar, Pronunciation',
  },
];

// Export all questions grouped by module
export const diagnosticQuestions = {
  listening: listeningQuestions,
  reading: readingQuestions,
  writing: writingQuestions,
  speaking: speakingQuestions,
};

// Get questions for a specific module and difficulty range
export function getQuestionsByDifficulty(
  module: 'listening' | 'reading' | 'writing' | 'speaking',
  minBand: number = 4,
  maxBand: number = 8
): DiagnosticQuestion[] {
  const questions = diagnosticQuestions[module];
  return questions.filter((q) => q.difficulty >= minBand && q.difficulty <= maxBand);
}

// Get a balanced set of questions for quick diagnostic
export function getQuickDiagnosticSet(): {
  listening: DiagnosticQuestion[];
  reading: DiagnosticQuestion[];
  writing: DiagnosticQuestion[];
  speaking: DiagnosticQuestion[];
} {
  return {
    listening: [
      listeningQuestions[0], // Band 4
      listeningQuestions[5], // Band 6
      listeningQuestions[9], // Band 7
    ],
    reading: [
      readingQuestions[2], // Band 5
      readingQuestions[6], // Band 6
      readingQuestions[10], // Band 7
    ],
    writing: [
      writingQuestions[4], // Task 2 Band 5.5
    ],
    speaking: [
      speakingQuestions[1], // Part 1
      speakingQuestions[6], // Part 2
      speakingQuestions[11], // Part 3
    ],
  };
}

// Total questions: 15 + 15 + 8 + 15 = 53 questions
// Writing uses prompts that are evaluated by AI, so fewer questions are needed
