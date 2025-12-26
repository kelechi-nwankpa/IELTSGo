// IELTS Task 2 General Training Essay Prompts
// These prompts focus on practical, everyday topics relevant to general training candidates

export interface Task2GTPrompt {
  id: string;
  title: string;
  prompt: string;
  topic: string;
  difficultyBand: number;
}

export const task2GTPrompts: Task2GTPrompt[] = [
  // WORK AND EMPLOYMENT (8)
  {
    id: 'task2g-001',
    title: 'Working from Home',
    prompt: `More and more people are choosing to work from home rather than going to an office.

What are the advantages and disadvantages of working from home?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'work',
    difficultyBand: 6.0,
  },
  {
    id: 'task2g-002',
    title: 'Job Satisfaction',
    prompt: `Some people believe that having a high salary is the most important aspect of a job, while others think that job satisfaction is more important than money.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'work',
    difficultyBand: 6.5,
  },
  {
    id: 'task2g-003',
    title: 'Retirement Age',
    prompt: `In many countries, the retirement age is being raised. Some people think this is a positive development, while others disagree.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'work',
    difficultyBand: 6.5,
  },
  {
    id: 'task2g-004',
    title: 'Job Security vs Career Growth',
    prompt: `Some people prefer to stay in the same job for their entire career, while others believe that changing jobs frequently is beneficial.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'work',
    difficultyBand: 6.0,
  },
  {
    id: 'task2g-005',
    title: 'Unpaid Overtime',
    prompt: `Many employees are expected to work longer hours than their contracts state, often without extra pay.

Why is this happening? What can be done to address this issue?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'work',
    difficultyBand: 6.5,
  },
  {
    id: 'task2g-006',
    title: 'Women in Leadership',
    prompt: `Despite progress, women are still underrepresented in senior management and leadership positions in many organizations.

What are the reasons for this? What measures could be taken to increase the number of women in leadership roles?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'work',
    difficultyBand: 7.0,
  },
  {
    id: 'task2g-007',
    title: 'Employee Monitoring',
    prompt: `Some employers use technology to monitor their employees' work activities and communications.

Do you think this is a positive or negative development?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'work',
    difficultyBand: 6.5,
  },
  {
    id: 'task2g-008',
    title: 'Work-Life Balance',
    prompt: `Many people today struggle to maintain a healthy balance between their work and personal life.

What problems does this cause? What solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'work',
    difficultyBand: 6.0,
  },

  // FAMILY AND RELATIONSHIPS (6)
  {
    id: 'task2g-009',
    title: 'Elderly Care',
    prompt: `In many countries, elderly people are increasingly living alone or in care homes rather than with their families.

Is this a positive or negative development?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'family',
    difficultyBand: 6.5,
  },
  {
    id: 'task2g-010',
    title: 'Parenting Styles',
    prompt: `Some parents believe that children should be given strict rules and discipline, while others think children should be allowed more freedom to explore.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'family',
    difficultyBand: 6.0,
  },
  {
    id: 'task2g-011',
    title: 'Extended Family',
    prompt: `In the past, it was common for extended families (grandparents, aunts, uncles, cousins) to live together or near each other. Today, families are often spread across different cities or countries.

What are the advantages and disadvantages of this change?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'family',
    difficultyBand: 6.0,
  },
  {
    id: 'task2g-012',
    title: 'Children and Household Chores',
    prompt: `Some people think that children should be required to help with household tasks as soon as they are able to do so.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'family',
    difficultyBand: 6.0,
  },
  {
    id: 'task2g-013',
    title: 'Marriage Age',
    prompt: `In some cultures, people are getting married at an older age than in the past.

Why is this happening? Do you think this is a positive or negative development?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'family',
    difficultyBand: 6.5,
  },
  {
    id: 'task2g-014',
    title: 'Quality Time with Family',
    prompt: `Many people today are too busy with work to spend quality time with their families.

What are the causes of this? What effects does this have on families?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'family',
    difficultyBand: 6.0,
  },

  // HEALTH AND LIFESTYLE (6)
  {
    id: 'task2g-015',
    title: 'Fast Food and Health',
    prompt: `Fast food is becoming increasingly popular in many countries around the world.

What are the reasons for this? What can be done to encourage healthier eating habits?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'health',
    difficultyBand: 6.0,
  },
  {
    id: 'task2g-016',
    title: 'Exercise and Fitness',
    prompt: `Despite knowing the benefits of regular exercise, many people do not exercise enough.

Why is this the case? What can be done to encourage people to be more active?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'health',
    difficultyBand: 6.0,
  },
  {
    id: 'task2g-017',
    title: 'Mental Health Awareness',
    prompt: `Mental health problems are becoming more widely recognized and discussed in society today.

Why do you think this is happening? Is this a positive development?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'health',
    difficultyBand: 6.5,
  },
  {
    id: 'task2g-018',
    title: 'Smoking Ban',
    prompt: `Many countries have banned smoking in public places such as restaurants, bars, and offices.

Do you agree or disagree with this policy?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'health',
    difficultyBand: 6.0,
  },
  {
    id: 'task2g-019',
    title: 'Sleep Deprivation',
    prompt: `Many people today do not get enough sleep due to work, technology, or other factors.

What problems can this cause? What solutions can you suggest?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'health',
    difficultyBand: 6.0,
  },
  {
    id: 'task2g-020',
    title: 'Alternative Medicine',
    prompt: `Some people prefer to use alternative or traditional medicine instead of modern medicine.

Why do you think this is? Do you think the government should regulate alternative medicine?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'health',
    difficultyBand: 6.5,
  },

  // TRAVEL AND MIGRATION (4)
  {
    id: 'task2g-021',
    title: 'Living Abroad',
    prompt: `Many people dream of living and working in a foreign country.

What are the advantages and disadvantages of living abroad?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'travel',
    difficultyBand: 6.0,
  },
  {
    id: 'task2g-022',
    title: 'Tourism Impact',
    prompt: `Tourism brings many benefits to a country, but it can also cause problems.

What are the advantages and disadvantages of tourism for a country?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'travel',
    difficultyBand: 6.0,
  },
  {
    id: 'task2g-023',
    title: 'Package Tours vs Independent Travel',
    prompt: `Some people prefer to travel on organized tours, while others prefer to plan their own trips independently.

Discuss both approaches and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'travel',
    difficultyBand: 6.0,
  },
  {
    id: 'task2g-024',
    title: 'Air Travel and Environment',
    prompt: `Air travel has become more affordable and accessible, but it contributes significantly to environmental pollution.

Should people be encouraged to fly less? How can we reduce the environmental impact of air travel?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'travel',
    difficultyBand: 6.5,
  },

  // COMMUNITY AND SOCIAL ISSUES (6)
  {
    id: 'task2g-025',
    title: 'Volunteering',
    prompt: `Some people believe that everyone should do some form of voluntary work to help others in their community.

To what extent do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'community',
    difficultyBand: 6.0,
  },
  {
    id: 'task2g-026',
    title: 'Neighborhood Relations',
    prompt: `In many cities, people do not know their neighbors and there is a sense that community spirit is disappearing.

What are the causes of this? What can be done to improve relationships between neighbors?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'community',
    difficultyBand: 6.0,
  },
  {
    id: 'task2g-027',
    title: 'Crime Prevention',
    prompt: `Some people think that the best way to reduce crime is to have more police on the streets, while others believe there are better ways to prevent crime.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'community',
    difficultyBand: 6.5,
  },
  {
    id: 'task2g-028',
    title: 'Homelessness',
    prompt: `Homelessness is a growing problem in many cities around the world.

What are the main causes of homelessness? What can be done to address this issue?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'community',
    difficultyBand: 6.5,
  },
  {
    id: 'task2g-029',
    title: 'Public vs Private Services',
    prompt: `Some people believe that essential services like healthcare and education should be provided by the government, while others think private companies can offer better services.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'community',
    difficultyBand: 6.5,
  },
  {
    id: 'task2g-030',
    title: 'Charity and Aid',
    prompt: `Some people believe that individuals should give money to charity to help those in need, while others think governments should be responsible for helping the less fortunate.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'community',
    difficultyBand: 6.0,
  },

  // CONSUMER AND LIFESTYLE (4)
  {
    id: 'task2g-031',
    title: 'Online Shopping',
    prompt: `Online shopping has become increasingly popular in recent years.

What are the advantages and disadvantages of shopping online compared to shopping in traditional stores?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'consumer',
    difficultyBand: 6.0,
  },
  {
    id: 'task2g-032',
    title: 'Materialism',
    prompt: `In many countries, people are spending more money on material possessions than ever before.

Why is this happening? Is this a positive or negative development?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'consumer',
    difficultyBand: 6.5,
  },
  {
    id: 'task2g-033',
    title: 'Advertising Influence',
    prompt: `Advertisements are everywhere in modern life, influencing what people buy and how they live.

Do you think advertising has a positive or negative effect on society?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'consumer',
    difficultyBand: 6.0,
  },
  {
    id: 'task2g-034',
    title: 'Saving vs Spending',
    prompt: `Some people believe it is important to save money for the future, while others prefer to spend and enjoy life now.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topic: 'consumer',
    difficultyBand: 6.0,
  },
];
