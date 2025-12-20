// IELTS Reading Passages (Academic)
// Each passage includes various question types

export interface ReadingQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false_ng' | 'matching' | 'short_answer';
  text: string;
  options?: string[];
  items?: string[];
  maxWords?: number;
}

export interface ReadingPassage {
  id: string;
  title: string;
  passage: string;
  questions: ReadingQuestion[];
  answers: Record<string, string | string[]>;
  difficultyBand: number;
}

export const readingPassages: ReadingPassage[] = [
  {
    id: 'reading-001',
    title: 'The History of Timekeeping',
    passage: `The measurement of time has been a fundamental concern of human civilizations throughout history. From the earliest sundials to modern atomic clocks, humanity's methods of tracking time have evolved dramatically, reflecting both technological advancement and changing social needs.

The ancient Egyptians were among the first to divide the day into smaller units. Around 1500 BCE, they developed the sundial, which used the shadow cast by a vertical stick or obelisk to indicate the time of day. However, sundials had obvious limitations: they were useless at night and on cloudy days. This led to the invention of water clocks, or clepsydrae, which measured time by the regulated flow of water from one container to another.

The mechanical clock, invented in medieval Europe around the 13th century, represented a revolutionary advancement. These early mechanical clocks used a system of weights and gears to track time, though they were notoriously inaccurate by modern standards. The introduction of the pendulum clock by Christiaan Huygens in 1656 dramatically improved accuracy, reducing timekeeping errors from approximately 15 minutes per day to just 15 seconds.

The development of portable timekeeping devices began with the spring-driven clock in the 15th century, eventually leading to the pocket watch and wristwatch. These personal timepieces transformed society by making punctuality possible for ordinary citizens, not just those with access to public clock towers.

The 20th century brought the quartz clock, which uses the regular vibrations of a quartz crystal to keep time. Quartz clocks are far more accurate than mechanical ones, typically losing or gaining less than a second per day. Today, atomic clocks, which measure time based on the vibrations of atoms, are so precise that they would take millions of years to gain or lose a single second.

The implications of accurate timekeeping extend far beyond simply knowing what hour it is. Modern technologies such as GPS navigation, telecommunications networks, and financial trading systems all depend on precisely synchronized time. The quest to measure time ever more accurately continues to drive scientific research and technological innovation.`,
    questions: [
      {
        id: 'r1-q1',
        type: 'multiple_choice',
        text: 'What was the main limitation of sundials?',
        options: [
          'A) They were too expensive to produce',
          'B) They could not function without sunlight',
          'C) They were not portable',
          'D) They were difficult to read',
        ],
      },
      {
        id: 'r1-q2',
        type: 'multiple_choice',
        text: 'According to the passage, who invented the pendulum clock?',
        options: [
          'A) The ancient Egyptians',
          'B) Medieval European monks',
          'C) Christiaan Huygens',
          'D) The passage does not say',
        ],
      },
      {
        id: 'r1-q3',
        type: 'true_false_ng',
        text: 'The ancient Egyptians invented the first mechanical clocks.',
      },
      {
        id: 'r1-q4',
        type: 'true_false_ng',
        text: 'Pendulum clocks were more accurate than earlier mechanical clocks.',
      },
      {
        id: 'r1-q5',
        type: 'true_false_ng',
        text: 'Quartz clocks were developed in the 19th century.',
      },
      {
        id: 'r1-q6',
        type: 'short_answer',
        text: 'What device did the ancient Egyptians use to measure time at night?',
        maxWords: 3,
      },
      {
        id: 'r1-q7',
        type: 'short_answer',
        text: 'How much time could early mechanical clocks lose or gain per day?',
        maxWords: 3,
      },
      {
        id: 'r1-q8',
        type: 'short_answer',
        text: 'Name one modern technology that depends on accurate timekeeping.',
        maxWords: 3,
      },
    ],
    answers: {
      'r1-q1': 'B',
      'r1-q2': 'C',
      'r1-q3': 'FALSE',
      'r1-q4': 'TRUE',
      'r1-q5': 'FALSE',
      'r1-q6': 'water clocks',
      'r1-q7': '15 minutes',
      'r1-q8': 'GPS navigation',
    },
    difficultyBand: 6.5,
  },
  {
    id: 'reading-002',
    title: 'Urban Vertical Farming',
    passage: `As the global population continues to grow and urbanization accelerates, traditional agriculture faces unprecedented challenges. Vertical farming—the practice of growing crops in vertically stacked layers, often in controlled indoor environments—has emerged as a potential solution to some of these pressures.

The concept of vertical farming was popularized by Dickson Despommier, a professor at Columbia University, in the early 2000s. Despommier envisioned entire skyscrapers dedicated to food production, capable of feeding tens of thousands of people while using a fraction of the water required by conventional farming. While full-scale vertical farm skyscrapers remain largely theoretical, smaller commercial vertical farms have become increasingly common.

Modern vertical farms typically use one of three growing systems: hydroponics, aeroponics, or aquaponics. Hydroponics involves growing plants in nutrient-rich water without soil. Aeroponics takes this further by suspending plant roots in air and misting them with nutrient solutions. Aquaponics combines fish farming with hydroponics, using fish waste to provide nutrients for plants while the plants filter water for the fish.

The advantages of vertical farming are numerous. Crops can be grown year-round regardless of weather conditions. Water usage can be reduced by up to 95% compared to traditional farming through recirculation systems. Pesticides become unnecessary in controlled environments, and transportation costs decrease when farms are located within cities, close to consumers.

However, vertical farming faces significant obstacles. The initial capital costs are substantial, often running into millions of dollars for a commercial-scale facility. Energy consumption, particularly for lighting, remains a major expense and environmental concern. Currently, vertical farms are economically viable primarily for high-value crops like leafy greens and herbs, rather than staple crops such as wheat or rice.

Despite these challenges, investment in vertical farming has surged in recent years. Companies in the sector raised over $1 billion in 2020 alone. As technology improves and energy costs decrease, vertical farming may play an increasingly important role in feeding the world's growing urban population.`,
    questions: [
      {
        id: 'r2-q1',
        type: 'multiple_choice',
        text: 'Who is credited with popularizing the concept of vertical farming?',
        options: [
          'A) A Japanese agricultural scientist',
          'B) Dickson Despommier',
          'C) Engineers at Columbia University',
          'D) The passage does not specify',
        ],
      },
      {
        id: 'r2-q2',
        type: 'multiple_choice',
        text: 'Which growing system uses fish waste to provide nutrients to plants?',
        options: ['A) Hydroponics', 'B) Aeroponics', 'C) Aquaponics', 'D) Traditional soil farming'],
      },
      {
        id: 'r2-q3',
        type: 'true_false_ng',
        text: 'Full-scale vertical farm skyscrapers are now common in major cities.',
      },
      {
        id: 'r2-q4',
        type: 'true_false_ng',
        text: 'Vertical farms can reduce water usage by up to 95%.',
      },
      {
        id: 'r2-q5',
        type: 'true_false_ng',
        text: 'Vertical farming is currently the most cost-effective way to grow wheat.',
      },
      {
        id: 'r2-q6',
        type: 'matching',
        text: 'Match each growing system with its description.',
        options: [
          'i. Plants grow in nutrient-rich water without soil',
          'ii. Plant roots are suspended in air and misted',
          'iii. Combines fish farming with plant growing',
        ],
        items: ['Hydroponics', 'Aeroponics', 'Aquaponics'],
      },
      {
        id: 'r2-q7',
        type: 'short_answer',
        text: 'How much money did vertical farming companies raise in 2020?',
        maxWords: 4,
      },
      {
        id: 'r2-q8',
        type: 'short_answer',
        text: 'What type of crops are currently most economically viable for vertical farming?',
        maxWords: 4,
      },
    ],
    answers: {
      'r2-q1': 'B',
      'r2-q2': 'C',
      'r2-q3': 'FALSE',
      'r2-q4': 'TRUE',
      'r2-q5': 'FALSE',
      'r2-q6': ['i', 'ii', 'iii'],
      'r2-q7': 'over $1 billion',
      'r2-q8': 'leafy greens and herbs',
    },
    difficultyBand: 7.0,
  },
  {
    id: 'reading-003',
    title: 'The Psychology of Color',
    passage: `Color influences human behavior and emotions in ways that are both subtle and profound. From the red of stop signs to the blue of corporate logos, colors shape our perceptions and decisions, often without our conscious awareness.

Research into color psychology has revealed fascinating patterns. Red, for instance, has been shown to increase heart rate and stimulate appetite, which explains its prevalence in fast-food restaurant branding. Studies have demonstrated that athletes wearing red are statistically more likely to win in combat sports, possibly because the color is associated with dominance and aggression.

Blue, by contrast, tends to have a calming effect. It is the most popular favorite color worldwide and is frequently used by technology companies and financial institutions to convey trustworthiness and stability. Research has shown that blue light can suppress melatonin production, which is why many devices now offer "night mode" settings that reduce blue light in the evening.

Green occupies a unique position in our perception. It is the color most associated with nature, health, and tranquility. Hospitals and schools often incorporate green into their environments for its supposed calming properties. Interestingly, green is also the color the human eye can distinguish the most shades of—an evolutionary adaptation that helped our ancestors identify ripe fruits and detect predators in natural environments.

Cultural context significantly influences color associations. In Western cultures, white typically symbolizes purity and is worn by brides, while in many Asian cultures, white is the color of mourning. Similarly, while red signifies luck and prosperity in China, it can represent danger or warning in Western contexts.

The commercial application of color psychology is a multi-billion dollar industry. Companies invest heavily in research to determine the optimal colors for packaging, advertising, and retail environments. One study found that up to 90% of snap judgments about products can be based on color alone, making color choice a critical factor in marketing success.`,
    questions: [
      {
        id: 'r3-q1',
        type: 'multiple_choice',
        text: 'According to the passage, why is red commonly used in fast-food branding?',
        options: [
          'A) It is the cheapest color to produce',
          'B) It stimulates appetite',
          'C) It is universally liked',
          'D) It appears brighter in artificial light',
        ],
      },
      {
        id: 'r3-q2',
        type: 'multiple_choice',
        text: 'Why do many devices now offer "night mode" settings?',
        options: [
          'A) To save battery power',
          'B) To reduce eye strain from bright screens',
          'C) To reduce blue light that suppresses melatonin',
          'D) To make text easier to read',
        ],
      },
      {
        id: 'r3-q3',
        type: 'true_false_ng',
        text: 'Athletes wearing red always win in combat sports.',
      },
      {
        id: 'r3-q4',
        type: 'true_false_ng',
        text: 'Green is the color the human eye can distinguish the most shades of.',
      },
      {
        id: 'r3-q5',
        type: 'true_false_ng',
        text: 'The meaning of colors is the same across all cultures.',
      },
      {
        id: 'r3-q6',
        type: 'true_false_ng',
        text: 'Blue is used by technology companies to convey trustworthiness.',
      },
      {
        id: 'r3-q7',
        type: 'short_answer',
        text: 'What percentage of snap judgments about products may be based on color?',
        maxWords: 3,
      },
      {
        id: 'r3-q8',
        type: 'short_answer',
        text: 'In which country does red signify luck and prosperity?',
        maxWords: 1,
      },
    ],
    answers: {
      'r3-q1': 'B',
      'r3-q2': 'C',
      'r3-q3': 'FALSE',
      'r3-q4': 'TRUE',
      'r3-q5': 'FALSE',
      'r3-q6': 'TRUE',
      'r3-q7': 'up to 90%',
      'r3-q8': 'China',
    },
    difficultyBand: 6.5,
  },
];
