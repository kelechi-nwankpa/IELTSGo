// Speaking Prompts for IELTS Speaking Test Parts 1, 2, and 3
// Each part has different format:
// Part 1: Short questions about familiar topics (4-5 minutes)
// Part 2: Cue card with 1 minute prep, 2 minutes speaking
// Part 3: Discussion questions related to Part 2 topic (4-5 minutes)

export interface SpeakingPart1 {
  id: string;
  topic: string;
  questions: string[];
  suggestedTime: number; // seconds per question
}

export interface SpeakingPart2 {
  id: string;
  topic: string;
  cueCard: {
    mainTask: string;
    bulletPoints: string[];
    finalPrompt: string;
  };
  prepTime: number; // seconds
  speakingTime: number; // seconds
  followUpQuestion?: string;
}

export interface SpeakingPart3 {
  id: string;
  topic: string;
  relatedPart2Id: string;
  questions: {
    question: string;
    followUp?: string;
  }[];
  difficultyBand: number;
}

// Part 1 Prompts - Familiar Topics
export const speakingPart1Prompts: SpeakingPart1[] = [
  {
    id: 'part1-001',
    topic: 'Home & Accommodation',
    questions: [
      "Let's talk about where you live. Do you live in a house or an apartment?",
      'What do you like most about your home?',
      'Is there anything you would like to change about your home?',
      'How long have you lived there?',
      'Do you plan to live there for a long time?',
    ],
    suggestedTime: 30,
  },
  {
    id: 'part1-002',
    topic: 'Work & Studies',
    questions: [
      'Do you work or are you a student?',
      'What do you like about your work/studies?',
      'Is there anything you would like to change about your job/course?',
      'What are your plans for the future regarding your career?',
      'Do you think you will need to learn any new skills for your work in the future?',
    ],
    suggestedTime: 30,
  },
  {
    id: 'part1-003',
    topic: 'Daily Routine',
    questions: [
      'What time do you usually wake up?',
      'Do you have a morning routine?',
      'What do you usually do after work or school?',
      'Do you prefer to do things in the morning or in the evening?',
      'Has your daily routine changed much over the years?',
    ],
    suggestedTime: 30,
  },
  {
    id: 'part1-004',
    topic: 'Hobbies & Interests',
    questions: [
      'What do you enjoy doing in your free time?',
      'How did you become interested in this hobby?',
      'Do you spend a lot of time on your hobby?',
      'Would you like to try any new hobbies?',
      'Do you prefer to do activities alone or with others?',
    ],
    suggestedTime: 30,
  },
  {
    id: 'part1-005',
    topic: 'Reading',
    questions: [
      'Do you like reading?',
      'What kind of books do you enjoy reading?',
      'How often do you read?',
      'Do you prefer reading physical books or e-books?',
      'Did you read more as a child than you do now?',
    ],
    suggestedTime: 30,
  },
  {
    id: 'part1-006',
    topic: 'Music',
    questions: [
      'Do you like music?',
      'What kind of music do you enjoy listening to?',
      'Have you ever learned to play a musical instrument?',
      'Do you prefer listening to music alone or with others?',
      'Has your taste in music changed over the years?',
    ],
    suggestedTime: 30,
  },
  {
    id: 'part1-007',
    topic: 'Weather',
    questions: [
      "What's the weather like in your country?",
      'What kind of weather do you prefer?',
      'Does the weather affect your mood?',
      'Do you check the weather forecast regularly?',
      'What do you usually do on rainy days?',
    ],
    suggestedTime: 30,
  },
  {
    id: 'part1-008',
    topic: 'Food & Cooking',
    questions: [
      "What's your favorite food?",
      'Do you like cooking?',
      'Who usually cooks in your family?',
      'Have you ever tried cooking a dish from another country?',
      "Do you think it's important to eat together as a family?",
    ],
    suggestedTime: 30,
  },
  {
    id: 'part1-009',
    topic: 'Travel',
    questions: [
      'Do you like traveling?',
      "What's the best place you've ever visited?",
      'Do you prefer traveling alone or with others?',
      'How do you usually plan your trips?',
      'Is there a place you would really like to visit?',
    ],
    suggestedTime: 30,
  },
  {
    id: 'part1-010',
    topic: 'Technology',
    questions: [
      'What electronic devices do you use regularly?',
      'Do you think you spend too much time using technology?',
      'What technology do you find most useful?',
      'Do you keep up with the latest technology trends?',
      'Do you think technology has made life easier or more complicated?',
    ],
    suggestedTime: 30,
  },
];

// Part 2 Prompts - Cue Cards
export const speakingPart2Prompts: SpeakingPart2[] = [
  {
    id: 'part2-001',
    topic: 'A Person Who Has Influenced You',
    cueCard: {
      mainTask: 'Describe a person who has had a significant influence on your life.',
      bulletPoints: [
        'Who this person is',
        'How you know this person',
        'What this person has done that influenced you',
        'How you felt about this influence',
      ],
      finalPrompt: 'and explain why this person has had such an important influence on you.',
    },
    prepTime: 60,
    speakingTime: 120,
    followUpQuestion: 'Do you think you have influenced this person in any way?',
  },
  {
    id: 'part2-002',
    topic: 'A Memorable Journey',
    cueCard: {
      mainTask: 'Describe a journey you remember well.',
      bulletPoints: [
        'Where you went',
        'Who you went with',
        'What happened during the journey',
        'What you saw and did',
      ],
      finalPrompt: 'and explain why this journey was memorable for you.',
    },
    prepTime: 60,
    speakingTime: 120,
    followUpQuestion: 'Would you like to make this journey again?',
  },
  {
    id: 'part2-003',
    topic: 'A Skill You Would Like to Learn',
    cueCard: {
      mainTask: 'Describe a skill you would like to learn.',
      bulletPoints: [
        'What the skill is',
        'How you would learn it',
        'Who could help you learn it',
        'Whether it would be difficult to learn',
      ],
      finalPrompt: 'and explain why you would like to learn this skill.',
    },
    prepTime: 60,
    speakingTime: 120,
    followUpQuestion: 'Have you tried to learn this skill before?',
  },
  {
    id: 'part2-004',
    topic: 'A Book That Had an Impact on You',
    cueCard: {
      mainTask: 'Describe a book that has had a significant impact on you.',
      bulletPoints: [
        'What the book is called and who wrote it',
        'What the book is about',
        'When and why you read it',
        'What you learned from it',
      ],
      finalPrompt: 'and explain how this book has impacted your life or thinking.',
    },
    prepTime: 60,
    speakingTime: 120,
    followUpQuestion: 'Would you recommend this book to others?',
  },
  {
    id: 'part2-005',
    topic: 'A Place You Would Like to Visit',
    cueCard: {
      mainTask: 'Describe a place you would like to visit.',
      bulletPoints: [
        'Where this place is',
        'What you know about it',
        'How you learned about this place',
        'Who you would go with',
      ],
      finalPrompt: 'and explain why you would like to visit this place.',
    },
    prepTime: 60,
    speakingTime: 120,
    followUpQuestion: 'What would you do there?',
  },
  {
    id: 'part2-006',
    topic: 'An Important Decision You Made',
    cueCard: {
      mainTask: 'Describe an important decision you have made.',
      bulletPoints: [
        'What the decision was',
        'When you made it',
        'How you made the decision',
        'What the result was',
      ],
      finalPrompt: 'and explain why this decision was important to you.',
    },
    prepTime: 60,
    speakingTime: 120,
    followUpQuestion: 'Would you make the same decision if you could go back?',
  },
  {
    id: 'part2-007',
    topic: 'A Celebration You Enjoyed',
    cueCard: {
      mainTask: 'Describe a celebration or event you enjoyed.',
      bulletPoints: [
        'What the celebration was',
        'When and where it took place',
        'Who was there with you',
        'What happened during the celebration',
      ],
      finalPrompt: 'and explain why you enjoyed this celebration.',
    },
    prepTime: 60,
    speakingTime: 120,
    followUpQuestion: 'Do you celebrate this event every year?',
  },
  {
    id: 'part2-008',
    topic: 'Something You Own That Is Important',
    cueCard: {
      mainTask: 'Describe something you own that is important to you.',
      bulletPoints: [
        'What it is',
        'How long you have had it',
        'How you got it',
        'How often you use it',
      ],
      finalPrompt: 'and explain why it is important to you.',
    },
    prepTime: 60,
    speakingTime: 120,
    followUpQuestion: 'Would you give it away if someone asked?',
  },
  {
    id: 'part2-009',
    topic: 'A Time You Helped Someone',
    cueCard: {
      mainTask: 'Describe a time when you helped someone.',
      bulletPoints: [
        'Who you helped',
        'What kind of help they needed',
        'How you helped them',
        'What the result was',
      ],
      finalPrompt: 'and explain how you felt about helping this person.',
    },
    prepTime: 60,
    speakingTime: 120,
    followUpQuestion: 'Do you often help others?',
  },
  {
    id: 'part2-010',
    topic: 'A Goal You Want to Achieve',
    cueCard: {
      mainTask: 'Describe a goal you want to achieve in the future.',
      bulletPoints: [
        'What the goal is',
        'When you first had this goal',
        'What you need to do to achieve it',
        'Whether it will be difficult to achieve',
      ],
      finalPrompt: 'and explain why this goal is important to you.',
    },
    prepTime: 60,
    speakingTime: 120,
    followUpQuestion: 'What will you do once you achieve this goal?',
  },
];

// Part 3 Prompts - Discussion Questions
export const speakingPart3Prompts: SpeakingPart3[] = [
  {
    id: 'part3-001',
    topic: 'Influence and Role Models',
    relatedPart2Id: 'part2-001',
    questions: [
      {
        question: 'In what ways can parents be role models for their children?',
        followUp: 'Do you think this has changed over generations?',
      },
      {
        question: 'Why do young people often choose celebrities as their role models?',
        followUp: 'Is this positive or negative in your opinion?',
      },
      {
        question: 'Do you think teachers have as much influence on students as parents do?',
        followUp: 'How has the role of teachers changed?',
      },
      {
        question: 'How has social media changed the way people are influenced?',
        followUp: 'Do you think this is a positive development?',
      },
    ],
    difficultyBand: 7.0,
  },
  {
    id: 'part3-002',
    topic: 'Travel and Tourism',
    relatedPart2Id: 'part2-002',
    questions: [
      {
        question: 'Why do you think people enjoy traveling?',
        followUp: 'Are the reasons different for different age groups?',
      },
      {
        question: 'What are the advantages and disadvantages of tourism for local communities?',
        followUp: 'How can the disadvantages be minimized?',
      },
      {
        question: 'Do you think mass tourism is damaging to the environment?',
        followUp: 'What can be done about this?',
      },
      {
        question: 'How has technology changed the way people travel?',
        followUp: 'Do you think this has improved the travel experience?',
      },
    ],
    difficultyBand: 7.0,
  },
  {
    id: 'part3-003',
    topic: 'Skills and Education',
    relatedPart2Id: 'part2-003',
    questions: [
      {
        question: 'What skills do you think are essential for young people today?',
        followUp: 'How have these changed compared to previous generations?',
      },
      {
        question: 'Do you think schools should focus more on practical skills?',
        followUp: 'What practical skills would be most useful?',
      },
      {
        question: 'Is it more important to learn skills at school or through life experience?',
        followUp: 'Can you give examples?',
      },
      {
        question: 'How has technology affected the way people learn new skills?',
        followUp: 'Is online learning as effective as traditional methods?',
      },
    ],
    difficultyBand: 7.0,
  },
  {
    id: 'part3-004',
    topic: 'Reading and Media',
    relatedPart2Id: 'part2-004',
    questions: [
      {
        question: 'Do you think people read less nowadays compared to the past?',
        followUp: 'What might be the reasons for this?',
      },
      {
        question: 'How do books compete with other forms of entertainment?',
        followUp: 'Will books become obsolete in the future?',
      },
      {
        question: 'What are the advantages of reading compared to watching films?',
        followUp: 'Which do you prefer and why?',
      },
      {
        question: 'Should children be encouraged to read more? How can this be done?',
        followUp: 'What role should parents play in this?',
      },
    ],
    difficultyBand: 6.5,
  },
  {
    id: 'part3-005',
    topic: 'Places and Tourism',
    relatedPart2Id: 'part2-005',
    questions: [
      {
        question: 'What makes a place attractive to tourists?',
        followUp: 'How important is marketing in promoting tourism?',
      },
      {
        question: 'Do you think people prefer natural attractions or man-made ones?',
        followUp: 'Why might this be?',
      },
      {
        question: 'How can countries balance tourism development with environmental protection?',
        followUp: 'Can you give any examples of this being done well?',
      },
      {
        question: 'Do you think virtual tourism could replace real travel in the future?',
        followUp: 'What would be lost if this happened?',
      },
    ],
    difficultyBand: 7.0,
  },
  {
    id: 'part3-006',
    topic: 'Decision Making',
    relatedPart2Id: 'part2-006',
    questions: [
      {
        question: 'Why do some people find it difficult to make decisions?',
        followUp: 'What can help people make better decisions?',
      },
      {
        question:
          'Do you think young people today make more independent decisions than in the past?',
        followUp: 'Is this a positive change?',
      },
      {
        question: 'How do cultural factors influence the decisions people make?',
        followUp: 'Can you give specific examples?',
      },
      {
        question: 'Is it better to make quick decisions or to think carefully about things?',
        followUp: 'Does it depend on the situation?',
      },
    ],
    difficultyBand: 7.5,
  },
  {
    id: 'part3-007',
    topic: 'Celebrations and Traditions',
    relatedPart2Id: 'part2-007',
    questions: [
      {
        question: 'Why are celebrations important in society?',
        followUp: 'Have celebrations changed over time?',
      },
      {
        question: 'Do you think traditional celebrations are becoming less popular?',
        followUp: 'Why might this be happening?',
      },
      {
        question: 'How do celebrations differ between generations?',
        followUp: 'Is this a problem?',
      },
      {
        question: 'Should businesses be closed on national holidays?',
        followUp: 'What are the advantages and disadvantages?',
      },
    ],
    difficultyBand: 6.5,
  },
  {
    id: 'part3-008',
    topic: 'Possessions and Consumerism',
    relatedPart2Id: 'part2-008',
    questions: [
      {
        question: 'Why do people become attached to material possessions?',
        followUp: 'Is this natural or influenced by society?',
      },
      {
        question: 'Do you think people today own too many things?',
        followUp: 'What are the consequences of this?',
      },
      {
        question: 'How has consumerism changed in your country over recent decades?',
        followUp: 'Is this change positive or negative?',
      },
      {
        question: 'Do you think minimalism is becoming more popular? Why?',
        followUp: 'Would you consider adopting a minimalist lifestyle?',
      },
    ],
    difficultyBand: 7.0,
  },
  {
    id: 'part3-009',
    topic: 'Helping Others',
    relatedPart2Id: 'part2-009',
    questions: [
      {
        question: 'Why is it important for people to help each other?',
        followUp: 'Has the sense of community changed in modern society?',
      },
      {
        question: 'Do you think people help others less than they used to?',
        followUp: 'What might explain this trend?',
      },
      {
        question: 'Should helping others be taught in schools?',
        followUp: 'How could this be implemented?',
      },
      {
        question: 'What motivates people to do volunteer work?',
        followUp: 'Should volunteering be compulsory?',
      },
    ],
    difficultyBand: 6.5,
  },
  {
    id: 'part3-010',
    topic: 'Goals and Ambitions',
    relatedPart2Id: 'part2-010',
    questions: [
      {
        question: 'Why is it important for people to have goals?',
        followUp: 'What happens when people achieve their goals?',
      },
      {
        question: "Do you think people's goals have changed compared to previous generations?",
        followUp: 'What might have caused these changes?',
      },
      {
        question: 'Is it better to have realistic goals or ambitious ones?',
        followUp: 'Can ambitious goals be harmful?',
      },
      {
        question: 'How can society help young people achieve their goals?',
        followUp: 'What role should education play in this?',
      },
    ],
    difficultyBand: 7.0,
  },
];

export const allSpeakingPrompts = {
  part1: speakingPart1Prompts,
  part2: speakingPart2Prompts,
  part3: speakingPart3Prompts,
};
