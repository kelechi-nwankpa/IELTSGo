import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { task2Prompts } from './task2-prompts';
import { readingPassages } from './reading-passages';
import { listeningSections } from './listening-sections';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Seed Task 2 prompts
  console.log('\nSeeding Task 2 prompts...');
  for (const prompt of task2Prompts) {
    await prisma.content.upsert({
      where: { id: prompt.id },
      update: {
        title: prompt.title,
        contentData: {
          prompt: prompt.prompt,
          topic: prompt.topic,
        },
        difficultyBand: prompt.difficultyBand,
      },
      create: {
        id: prompt.id,
        module: 'WRITING',
        type: 'TASK2',
        testType: 'ACADEMIC',
        title: prompt.title,
        contentData: {
          prompt: prompt.prompt,
          topic: prompt.topic,
        },
        difficultyBand: prompt.difficultyBand,
        isPremium: false,
      },
    });
    console.log(`  ✓ ${prompt.title}`);
  }
  console.log(`Seeded ${task2Prompts.length} Task 2 prompts`);

  // Seed Reading passages
  console.log('\nSeeding Reading passages...');
  for (const passage of readingPassages) {
    const contentData = JSON.parse(
      JSON.stringify({
        passage: passage.passage,
        title: passage.title,
        questions: passage.questions,
      })
    );
    const answers = JSON.parse(JSON.stringify(passage.answers));

    await prisma.content.upsert({
      where: { id: passage.id },
      update: {
        title: passage.title,
        contentData,
        answers,
        difficultyBand: passage.difficultyBand,
      },
      create: {
        id: passage.id,
        module: 'READING',
        type: 'READING_PASSAGE',
        testType: 'ACADEMIC',
        title: passage.title,
        contentData,
        answers,
        difficultyBand: passage.difficultyBand,
        isPremium: false,
      },
    });
    console.log(`  ✓ ${passage.title}`);
  }
  console.log(`Seeded ${readingPassages.length} Reading passages`);

  // Seed Listening sections
  console.log('\nSeeding Listening sections...');
  for (const section of listeningSections) {
    const contentData = JSON.parse(
      JSON.stringify({
        audioUrl: section.audioUrl,
        title: section.title,
        transcript: section.transcript,
        questions: section.questions,
        section: section.section,
      })
    );
    const answers = JSON.parse(JSON.stringify(section.answers));

    await prisma.content.upsert({
      where: { id: section.id },
      update: {
        title: section.title,
        contentData,
        answers,
        difficultyBand: section.difficultyBand,
      },
      create: {
        id: section.id,
        module: 'LISTENING',
        type: 'LISTENING_SECTION',
        testType: 'ACADEMIC',
        title: section.title,
        contentData,
        answers,
        difficultyBand: section.difficultyBand,
        isPremium: false,
      },
    });
    console.log(`  ✓ ${section.title}`);
  }
  console.log(`Seeded ${listeningSections.length} Listening sections`);

  console.log('\nSeeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
