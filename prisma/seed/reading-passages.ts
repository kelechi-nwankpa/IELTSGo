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
        options: [
          'A) Hydroponics',
          'B) Aeroponics',
          'C) Aquaponics',
          'D) Traditional soil farming',
        ],
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
  {
    id: 'reading-004',
    title: 'The Science of Sleep',
    passage: `Sleep is a fundamental biological process that remains partially mysterious to scientists. While we spend roughly one-third of our lives sleeping, researchers are still uncovering the mechanisms and purposes behind this essential activity.

The sleep cycle consists of two main types: rapid eye movement (REM) sleep and non-REM sleep, which is further divided into three stages. Non-REM sleep begins with light sleep in stage one, progresses to deeper sleep in stage two, and reaches its deepest point in stage three, also known as slow-wave sleep. A complete sleep cycle lasts approximately 90 minutes, and most adults experience four to six cycles per night.

During REM sleep, the brain becomes highly active, exhibiting patterns similar to wakefulness. This is when most vivid dreaming occurs. Interestingly, the body becomes temporarily paralyzed during REM sleep, a phenomenon called atonia, which prevents us from acting out our dreams. This paralysis affects most voluntary muscles but spares the diaphragm, allowing breathing to continue.

Sleep serves multiple crucial functions. The glymphatic system, discovered in 2012, becomes highly active during sleep, clearing toxic waste products from the brain, including beta-amyloid proteins associated with Alzheimer's disease. Sleep also plays a vital role in memory consolidation, transferring information from short-term to long-term storage and strengthening neural connections.

The consequences of sleep deprivation are severe and far-reaching. Studies show that going without sleep for 17 hours impairs cognitive function as much as having a blood alcohol level of 0.05%. Chronic sleep deprivation has been linked to increased risks of obesity, diabetes, cardiovascular disease, and weakened immune function.

Modern lifestyles present numerous challenges to healthy sleep. Artificial lighting, particularly blue light from screens, can suppress melatonin production and delay sleep onset. The average adult now sleeps approximately one hour less per night than people did a century ago, raising concerns about long-term public health implications.`,
    questions: [
      {
        id: 'r4-q1',
        type: 'multiple_choice',
        text: 'How long does a complete sleep cycle typically last?',
        options: ['A) 45 minutes', 'B) 60 minutes', 'C) 90 minutes', 'D) 120 minutes'],
      },
      {
        id: 'r4-q2',
        type: 'multiple_choice',
        text: 'What prevents people from acting out their dreams during REM sleep?',
        options: [
          'A) Deep unconsciousness',
          'B) Temporary muscle paralysis called atonia',
          'C) Reduced brain activity',
          'D) Slow breathing patterns',
        ],
      },
      {
        id: 'r4-q3',
        type: 'true_false_ng',
        text: 'The glymphatic system was discovered in the early 2000s.',
      },
      {
        id: 'r4-q4',
        type: 'true_false_ng',
        text: 'Sleep helps transfer information from short-term to long-term memory.',
      },
      {
        id: 'r4-q5',
        type: 'true_false_ng',
        text: 'Modern adults sleep more than people did a century ago.',
      },
      {
        id: 'r4-q6',
        type: 'short_answer',
        text: "What toxic protein associated with Alzheimer's is cleared from the brain during sleep?",
        maxWords: 2,
      },
      {
        id: 'r4-q7',
        type: 'short_answer',
        text: 'How many sleep cycles do most adults experience per night?',
        maxWords: 3,
      },
      {
        id: 'r4-q8',
        type: 'short_answer',
        text: 'What type of light from screens can suppress melatonin production?',
        maxWords: 2,
      },
    ],
    answers: {
      'r4-q1': 'C',
      'r4-q2': 'B',
      'r4-q3': 'FALSE',
      'r4-q4': 'TRUE',
      'r4-q5': 'FALSE',
      'r4-q6': 'beta-amyloid',
      'r4-q7': 'four to six',
      'r4-q8': 'blue light',
    },
    difficultyBand: 6.5,
  },
  {
    id: 'reading-005',
    title: 'Renewable Energy Innovations',
    passage: `The transition to renewable energy sources represents one of the most significant technological and economic shifts in human history. As concerns about climate change intensify and fossil fuel reserves diminish, innovations in solar, wind, and other renewable technologies are accelerating at an unprecedented pace.

Solar photovoltaic technology has experienced remarkable cost reductions over the past decade. The price of solar panels has fallen by approximately 90% since 2010, making solar power cost-competitive with traditional energy sources in many regions. Advances in perovskite solar cells, which can be manufactured at lower temperatures and potentially achieve higher efficiencies than silicon cells, promise to further reduce costs.

Wind power has similarly transformed. Modern wind turbines are significantly larger and more efficient than their predecessors. Offshore wind farms, which can harness stronger and more consistent winds over the ocean, are expanding rapidly. The world's largest offshore wind turbines now feature blades spanning over 100 meters, capable of generating enough electricity to power thousands of homes.

Energy storage remains a critical challenge for renewable energy adoption. Lithium-ion batteries have dominated the market, but their cost and limited lifespan present obstacles. Emerging technologies such as solid-state batteries, flow batteries, and hydrogen storage systems offer potential solutions. Some researchers are exploring gravity-based storage systems that lift heavy weights when energy is abundant and lower them to generate electricity when needed.

Grid integration presents another significant hurdle. Renewable energy sources are inherently variable—the sun does not always shine, and the wind does not always blow. Smart grid technologies that can balance supply and demand in real-time are essential for managing this variability. Artificial intelligence and machine learning are increasingly being deployed to predict renewable energy production and optimize grid operations.

Despite challenges, the growth of renewable energy has exceeded most predictions. In 2020, renewables accounted for approximately 90% of new electricity generation capacity worldwide, signaling a fundamental shift in how humanity produces energy.`,
    questions: [
      {
        id: 'r5-q1',
        type: 'multiple_choice',
        text: 'By how much have solar panel prices fallen since 2010?',
        options: [
          'A) Approximately 50%',
          'B) Approximately 70%',
          'C) Approximately 90%',
          'D) Approximately 95%',
        ],
      },
      {
        id: 'r5-q2',
        type: 'multiple_choice',
        text: 'What technology is being used to predict renewable energy production?',
        options: [
          'A) Quantum computing',
          'B) Artificial intelligence and machine learning',
          'C) Blockchain',
          'D) Nuclear fusion',
        ],
      },
      {
        id: 'r5-q3',
        type: 'true_false_ng',
        text: 'Perovskite solar cells require higher manufacturing temperatures than silicon cells.',
      },
      {
        id: 'r5-q4',
        type: 'true_false_ng',
        text: 'Offshore wind farms can access stronger and more consistent winds.',
      },
      {
        id: 'r5-q5',
        type: 'true_false_ng',
        text: 'Lithium-ion batteries have no limitations for renewable energy storage.',
      },
      {
        id: 'r5-q6',
        type: 'short_answer',
        text: 'What percentage of new electricity generation capacity was renewable in 2020?',
        maxWords: 3,
      },
      {
        id: 'r5-q7',
        type: 'short_answer',
        text: "How long can the blades of the world's largest offshore wind turbines span?",
        maxWords: 3,
      },
      {
        id: 'r5-q8',
        type: 'short_answer',
        text: 'What type of storage system lifts heavy weights when energy is abundant?',
        maxWords: 3,
      },
    ],
    answers: {
      'r5-q1': 'C',
      'r5-q2': 'B',
      'r5-q3': 'FALSE',
      'r5-q4': 'TRUE',
      'r5-q5': 'FALSE',
      'r5-q6': 'approximately 90%',
      'r5-q7': 'over 100 meters',
      'r5-q8': 'gravity-based storage',
    },
    difficultyBand: 7.0,
  },
  {
    id: 'reading-006',
    title: 'The Evolution of Language',
    passage: `Human language stands as one of evolution's most remarkable achievements. Unlike the communication systems of other species, human language possesses unique properties that enable infinite expressiveness from a finite set of elements—a quality linguists call "discrete infinity."

The origins of human language remain hotly debated among scientists. Some researchers argue for a gradual evolution stretching back millions of years, while others propose that language emerged relatively suddenly, perhaps as recently as 100,000 years ago. The discovery of the FOXP2 gene, sometimes called the "language gene," has provided insights, though its role in language development is now understood to be more complex than initially thought.

All human languages share fundamental structural properties, leading linguist Noam Chomsky to propose the existence of a "Universal Grammar"—an innate biological capacity for language that all humans possess. This theory suggests that children are born with an unconscious knowledge of the basic principles underlying all languages, which explains the remarkable speed and uniformity with which children acquire language.

Languages are not static entities but evolve continuously. Sound changes, grammatical shifts, and vocabulary expansion occur across generations. English, for instance, has transformed dramatically from its Old English origins, when it more closely resembled modern German. The Great Vowel Shift, occurring between roughly 1400 and 1700, fundamentally altered English pronunciation and explains many of the irregularities in modern English spelling.

Language death represents a significant concern for linguists. It is estimated that of the approximately 7,000 languages currently spoken worldwide, nearly half may disappear by the end of this century. When a language dies, humanity loses not just a means of communication but also unique perspectives on human experience encoded in that language's structure and vocabulary.

Technology is both threatening and preserving linguistic diversity. While global communication platforms tend to favor dominant languages like English and Mandarin, digital tools are also being developed to document and teach endangered languages, potentially slowing or even reversing their decline.`,
    questions: [
      {
        id: 'r6-q1',
        type: 'multiple_choice',
        text: 'What term describes the ability to create infinite expressions from finite elements?',
        options: [
          'A) Universal Grammar',
          'B) Discrete infinity',
          'C) Language acquisition',
          'D) Structural linguistics',
        ],
      },
      {
        id: 'r6-q2',
        type: 'multiple_choice',
        text: 'When did the Great Vowel Shift occur?',
        options: ['A) 1000-1200', 'B) 1200-1400', 'C) 1400-1700', 'D) 1700-1900'],
      },
      {
        id: 'r6-q3',
        type: 'true_false_ng',
        text: 'All scientists agree that language evolved gradually over millions of years.',
      },
      {
        id: 'r6-q4',
        type: 'true_false_ng',
        text: 'Noam Chomsky proposed the theory of Universal Grammar.',
      },
      {
        id: 'r6-q5',
        type: 'true_false_ng',
        text: 'Technology can only accelerate the decline of endangered languages.',
      },
      {
        id: 'r6-q6',
        type: 'short_answer',
        text: 'What gene is sometimes called the "language gene"?',
        maxWords: 1,
      },
      {
        id: 'r6-q7',
        type: 'short_answer',
        text: 'How many languages are currently spoken worldwide?',
        maxWords: 3,
      },
      {
        id: 'r6-q8',
        type: 'short_answer',
        text: 'What language did Old English more closely resemble?',
        maxWords: 2,
      },
    ],
    answers: {
      'r6-q1': 'B',
      'r6-q2': 'C',
      'r6-q3': 'FALSE',
      'r6-q4': 'TRUE',
      'r6-q5': 'FALSE',
      'r6-q6': 'FOXP2',
      'r6-q7': 'approximately 7,000',
      'r6-q8': 'modern German',
    },
    difficultyBand: 7.0,
  },
  {
    id: 'reading-007',
    title: 'Coral Reef Ecosystems',
    passage: `Coral reefs are among the most biodiverse ecosystems on Earth, often called the "rainforests of the sea." Although they cover less than one percent of the ocean floor, coral reefs support an estimated 25 percent of all marine species, making them crucial to the health of our oceans.

Coral reefs are built by tiny animals called coral polyps, which secrete calcium carbonate to form hard external skeletons. These polyps have a symbiotic relationship with microscopic algae called zooxanthellae, which live within the coral tissue. The algae provide the coral with food through photosynthesis and give reefs their vibrant colors, while the coral provides the algae with shelter and access to sunlight.

The economic value of coral reefs is substantial. They provide food security for approximately 500 million people worldwide who depend on reef fish for protein. Coral reefs also protect coastlines from storms and erosion, a service valued at billions of dollars annually. Additionally, many pharmaceutical compounds have been developed from reef organisms, including treatments for cancer, HIV, and cardiovascular disease.

Climate change poses the greatest threat to coral reefs. Rising ocean temperatures cause coral bleaching, a stress response in which corals expel their symbiotic algae. Without the algae, corals turn white and can die if temperatures remain elevated. The Great Barrier Reef has experienced several mass bleaching events in recent years, with the 2016 and 2017 events affecting approximately 50 percent of the reef.

Ocean acidification, caused by the absorption of carbon dioxide from the atmosphere, further threatens coral survival. As seawater becomes more acidic, it becomes harder for corals to build and maintain their calcium carbonate skeletons. Scientists predict that by 2050, most coral reefs will experience severe annual bleaching under current emission trajectories.

Conservation efforts are underway worldwide. Marine protected areas, coral nurseries, and assisted gene flow programs aim to enhance coral resilience. Some researchers are exploring "super corals" that can withstand higher temperatures, while others are developing techniques to restore damaged reefs through coral transplantation.`,
    questions: [
      {
        id: 'r7-q1',
        type: 'multiple_choice',
        text: 'What percentage of marine species do coral reefs support?',
        options: [
          'A) Approximately 10%',
          'B) Approximately 25%',
          'C) Approximately 40%',
          'D) Approximately 50%',
        ],
      },
      {
        id: 'r7-q2',
        type: 'multiple_choice',
        text: 'What is the name of the microscopic algae living within coral tissue?',
        options: ['A) Zooplankton', 'B) Phytoplankton', 'C) Zooxanthellae', 'D) Cyanobacteria'],
      },
      {
        id: 'r7-q3',
        type: 'true_false_ng',
        text: 'Coral reefs cover approximately 10% of the ocean floor.',
      },
      {
        id: 'r7-q4',
        type: 'true_false_ng',
        text: 'Coral bleaching occurs when corals expel their symbiotic algae.',
      },
      {
        id: 'r7-q5',
        type: 'true_false_ng',
        text: 'Ocean acidification makes it easier for corals to build their skeletons.',
      },
      {
        id: 'r7-q6',
        type: 'short_answer',
        text: 'How many people depend on reef fish for protein?',
        maxWords: 4,
      },
      {
        id: 'r7-q7',
        type: 'short_answer',
        text: 'What substance do coral polyps secrete to build their skeletons?',
        maxWords: 2,
      },
      {
        id: 'r7-q8',
        type: 'short_answer',
        text: 'What percentage of the Great Barrier Reef was affected by bleaching in 2016-2017?',
        maxWords: 3,
      },
    ],
    answers: {
      'r7-q1': 'B',
      'r7-q2': 'C',
      'r7-q3': 'FALSE',
      'r7-q4': 'TRUE',
      'r7-q5': 'FALSE',
      'r7-q6': 'approximately 500 million',
      'r7-q7': 'calcium carbonate',
      'r7-q8': 'approximately 50 percent',
    },
    difficultyBand: 6.5,
  },
  {
    id: 'reading-008',
    title: 'Artificial Intelligence in Medicine',
    passage: `Artificial intelligence is transforming healthcare in ways that seemed like science fiction just a decade ago. From diagnosing diseases to developing new drugs, AI systems are increasingly augmenting—and in some cases outperforming—human medical expertise.

Medical imaging represents one of AI's most successful healthcare applications. Deep learning algorithms can now detect certain cancers, eye diseases, and cardiovascular conditions from medical images with accuracy matching or exceeding that of specialist physicians. In 2020, an AI system developed by Google Health demonstrated the ability to detect breast cancer from mammograms more accurately than expert radiologists, reducing both false positives and false negatives.

Drug discovery, traditionally a process lasting 10-15 years and costing billions of dollars, is being accelerated by AI. Machine learning algorithms can analyze vast databases of molecular structures and biological data to identify promising drug candidates. In 2020, an AI system called AlphaFold, developed by DeepMind, solved a 50-year-old problem in biology by accurately predicting protein structures, a breakthrough with enormous implications for drug development.

Personalized medicine is another frontier where AI shows promise. By analyzing an individual's genetic data, medical history, and lifestyle factors, AI systems can help predict disease risk and recommend tailored prevention strategies. Some hospitals now use AI to predict which patients in emergency departments are most likely to deteriorate, enabling earlier intervention.

However, the integration of AI into healthcare faces significant challenges. Questions about data privacy, algorithmic bias, and medical liability remain unresolved. AI systems trained predominantly on data from certain populations may perform less accurately for underrepresented groups. Additionally, the "black box" nature of some AI algorithms makes it difficult for physicians to understand and explain their recommendations.

The future likely involves AI working alongside human clinicians rather than replacing them entirely. While AI excels at pattern recognition and processing large datasets, human physicians bring empathy, ethical judgment, and the ability to consider contextual factors that may not be captured in data.`,
    questions: [
      {
        id: 'r8-q1',
        type: 'multiple_choice',
        text: 'How long does traditional drug discovery typically take?',
        options: ['A) 2-5 years', 'B) 5-10 years', 'C) 10-15 years', 'D) 15-20 years'],
      },
      {
        id: 'r8-q2',
        type: 'multiple_choice',
        text: 'What problem did AlphaFold solve in 2020?',
        options: [
          'A) Gene sequencing',
          'B) Protein structure prediction',
          'C) Cancer detection',
          'D) Drug interaction analysis',
        ],
      },
      {
        id: 'r8-q3',
        type: 'true_false_ng',
        text: 'AI systems always perform equally well across all population groups.',
      },
      {
        id: 'r8-q4',
        type: 'true_false_ng',
        text: "Google Health's AI system detected breast cancer more accurately than expert radiologists.",
      },
      {
        id: 'r8-q5',
        type: 'true_false_ng',
        text: 'AI is expected to completely replace human physicians in the near future.',
      },
      {
        id: 'r8-q6',
        type: 'short_answer',
        text: 'What company developed AlphaFold?',
        maxWords: 1,
      },
      {
        id: 'r8-q7',
        type: 'short_answer',
        text: 'What type of medical imaging technology is mentioned in relation to breast cancer detection?',
        maxWords: 1,
      },
      {
        id: 'r8-q8',
        type: 'short_answer',
        text: 'What term describes the difficulty of understanding how some AI algorithms reach their conclusions?',
        maxWords: 2,
      },
    ],
    answers: {
      'r8-q1': 'C',
      'r8-q2': 'B',
      'r8-q3': 'FALSE',
      'r8-q4': 'TRUE',
      'r8-q5': 'FALSE',
      'r8-q6': 'DeepMind',
      'r8-q7': 'mammograms',
      'r8-q8': 'black box',
    },
    difficultyBand: 7.5,
  },
  {
    id: 'reading-009',
    title: 'Ancient Trade Routes',
    passage: `The ancient trade routes that crisscrossed continents were far more than commercial arteries—they were conduits for cultural exchange, technological transfer, and the spread of ideas that shaped civilizations. The most famous of these, the Silk Road, connected East and West for nearly two millennia.

The Silk Road was not a single route but a complex network of land and sea passages linking China to the Mediterranean. Named by German geographer Ferdinand von Richthofen in 1877, these routes carried not only silk but also spices, precious metals, glassware, and countless other goods. Perhaps more importantly, they facilitated the exchange of religions, languages, and knowledge.

Buddhism spread from India to China along these routes, while Islam later traveled in both directions. Paper-making technology, invented in China around 105 CE, reached the Arab world by the 8th century and Europe by the 11th century, revolutionizing knowledge preservation and dissemination. Gunpowder, the compass, and printing technology similarly traveled westward along these ancient highways.

The maritime equivalent of the Silk Road was equally significant. The Indian Ocean trade network connected East Africa, the Arabian Peninsula, the Indian subcontinent, and Southeast Asia. Monsoon winds enabled predictable sailing patterns, and port cities like Kilwa, Aden, Calicut, and Malacca became wealthy centers of commerce and cultural fusion.

These trade routes also had darker consequences. The Black Death, which killed an estimated 30-60 percent of Europe's population in the 14th century, is believed to have traveled along Silk Road trade routes from Central Asia. Disease exchange would later become even more devastating when European colonization connected the Eastern and Western hemispheres.

The legacy of ancient trade routes persists today. China's Belt and Road Initiative, announced in 2013, explicitly evokes the Silk Road in its name and ambition, seeking to recreate these ancient connections through modern infrastructure. The patterns of cultural exchange established millennia ago continue to influence our interconnected world.`,
    questions: [
      {
        id: 'r9-q1',
        type: 'multiple_choice',
        text: 'Who coined the term "Silk Road"?',
        options: [
          'A) Marco Polo',
          'B) Ferdinand von Richthofen',
          'C) A Chinese emperor',
          'D) An Arab merchant',
        ],
      },
      {
        id: 'r9-q2',
        type: 'multiple_choice',
        text: 'When did paper-making technology reach Europe?',
        options: [
          'A) The 8th century',
          'B) The 9th century',
          'C) The 10th century',
          'D) The 11th century',
        ],
      },
      {
        id: 'r9-q3',
        type: 'true_false_ng',
        text: 'The Silk Road was a single, well-defined route.',
      },
      {
        id: 'r9-q4',
        type: 'true_false_ng',
        text: 'Buddhism spread from India to China along the Silk Road.',
      },
      {
        id: 'r9-q5',
        type: 'true_false_ng',
        text: 'The Black Death originated in Europe.',
      },
      {
        id: 'r9-q6',
        type: 'short_answer',
        text: "What percentage of Europe's population is estimated to have died from the Black Death?",
        maxWords: 3,
      },
      {
        id: 'r9-q7',
        type: 'short_answer',
        text: "When was China's Belt and Road Initiative announced?",
        maxWords: 1,
      },
      {
        id: 'r9-q8',
        type: 'short_answer',
        text: 'What natural phenomenon enabled predictable sailing patterns in the Indian Ocean?',
        maxWords: 2,
      },
    ],
    answers: {
      'r9-q1': 'B',
      'r9-q2': 'D',
      'r9-q3': 'FALSE',
      'r9-q4': 'TRUE',
      'r9-q5': 'FALSE',
      'r9-q6': '30-60 percent',
      'r9-q7': '2013',
      'r9-q8': 'monsoon winds',
    },
    difficultyBand: 6.5,
  },
  {
    id: 'reading-010',
    title: 'The Psychology of Decision Making',
    passage: `Human decision-making is far less rational than we often assume. Decades of research in behavioral economics and cognitive psychology have revealed systematic biases and shortcuts that influence our choices, frequently leading us away from optimal outcomes.

Daniel Kahneman and Amos Tversky pioneered much of this research, introducing the concept of cognitive heuristics—mental shortcuts that help us make quick decisions but can lead to predictable errors. Their work, which earned Kahneman a Nobel Prize in 2002, fundamentally changed our understanding of human judgment and choice.

One of the most influential findings is the distinction between two modes of thinking: System 1 and System 2. System 1 operates automatically and quickly, with little effort and no sense of voluntary control. System 2 allocates attention to effortful mental activities, including complex computations. While System 2 is capable of logical reasoning, it is also lazy and often accepts the intuitive suggestions of System 1 without careful scrutiny.

Loss aversion represents another crucial discovery. Research consistently shows that losses feel approximately twice as powerful as equivalent gains. This asymmetry explains why people often reject favorable gambles and why the threat of losing something motivates behavior more strongly than the prospect of gaining something of equal value.

The framing effect demonstrates how the presentation of information influences decisions. People react differently to identical choices depending on whether they are framed as gains or losses. Medical treatments with a "90 percent survival rate" are more favorably viewed than those with a "10 percent mortality rate," despite describing the same outcome.

Understanding these biases has practical implications. Behavioral insights are now used in public policy through "nudge" interventions that structure choices to guide people toward better outcomes without restricting their freedom. Businesses apply these principles to marketing and product design, while individuals can use awareness of their biases to make more deliberate decisions.`,
    questions: [
      {
        id: 'r10-q1',
        type: 'multiple_choice',
        text: 'Who won a Nobel Prize for work on cognitive biases in 2002?',
        options: [
          'A) Amos Tversky',
          'B) Daniel Kahneman',
          'C) Both Kahneman and Tversky',
          'D) Richard Thaler',
        ],
      },
      {
        id: 'r10-q2',
        type: 'multiple_choice',
        text: 'According to the passage, how powerful do losses feel compared to equivalent gains?',
        options: [
          'A) Equally powerful',
          'B) 1.5 times as powerful',
          'C) Approximately twice as powerful',
          'D) Three times as powerful',
        ],
      },
      {
        id: 'r10-q3',
        type: 'true_false_ng',
        text: 'System 2 thinking operates automatically with little effort.',
      },
      {
        id: 'r10-q4',
        type: 'true_false_ng',
        text: 'The framing effect shows that presentation of information can influence decisions.',
      },
      {
        id: 'r10-q5',
        type: 'true_false_ng',
        text: "Nudge interventions restrict people's freedom of choice.",
      },
      {
        id: 'r10-q6',
        type: 'short_answer',
        text: 'What term describes the mental shortcuts that help us make quick decisions?',
        maxWords: 2,
      },
      {
        id: 'r10-q7',
        type: 'short_answer',
        text: 'Which system of thinking is described as "lazy" in the passage?',
        maxWords: 2,
      },
      {
        id: 'r10-q8',
        type: 'short_answer',
        text: 'What field of study is mentioned alongside cognitive psychology in the first paragraph?',
        maxWords: 2,
      },
    ],
    answers: {
      'r10-q1': 'B',
      'r10-q2': 'C',
      'r10-q3': 'FALSE',
      'r10-q4': 'TRUE',
      'r10-q5': 'FALSE',
      'r10-q6': 'cognitive heuristics',
      'r10-q7': 'System 2',
      'r10-q8': 'behavioral economics',
    },
    difficultyBand: 7.0,
  },
];
