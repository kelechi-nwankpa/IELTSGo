import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { task2Prompts } from './task2-prompts';
import { task1AcademicPrompts } from './task1-academic-prompts';
import { task1GTPrompts } from './task1-gt-prompts';
import { task2GTPrompts } from './task2-gt-prompts';
import { readingPassages } from './reading-passages';
import { listeningSections } from './listening-sections';
import {
  speakingPart1Prompts,
  speakingPart2Prompts,
  speakingPart3Prompts,
} from './speaking-prompts';

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
  console.log(`Seeded ${task2Prompts.length} Task 2 Academic prompts`);

  // Seed Task 1 Academic prompts
  console.log('\nSeeding Task 1 Academic prompts...');
  for (const prompt of task1AcademicPrompts) {
    await prisma.content.upsert({
      where: { id: prompt.id },
      update: {
        title: prompt.title,
        contentData: {
          prompt: prompt.prompt,
          topic: prompt.topic,
          visualType: prompt.visualType,
          imageUrl: prompt.imageUrl,
          imageDescription: prompt.imageDescription,
        },
        difficultyBand: prompt.difficultyBand,
      },
      create: {
        id: prompt.id,
        module: 'WRITING',
        type: 'TASK1_ACADEMIC',
        testType: 'ACADEMIC',
        title: prompt.title,
        contentData: {
          prompt: prompt.prompt,
          topic: prompt.topic,
          visualType: prompt.visualType,
          imageUrl: prompt.imageUrl,
          imageDescription: prompt.imageDescription,
        },
        difficultyBand: prompt.difficultyBand,
        isPremium: false,
      },
    });
    console.log(`  ✓ ${prompt.title}`);
  }
  console.log(`Seeded ${task1AcademicPrompts.length} Task 1 Academic prompts`);

  // Seed Task 1 GT prompts (Letters)
  console.log('\nSeeding Task 1 GT prompts...');
  for (const prompt of task1GTPrompts) {
    await prisma.content.upsert({
      where: { id: prompt.id },
      update: {
        title: prompt.title,
        contentData: {
          prompt: prompt.prompt,
          topic: prompt.topic,
          letterType: prompt.letterType,
        },
        difficultyBand: prompt.difficultyBand,
      },
      create: {
        id: prompt.id,
        module: 'WRITING',
        type: 'TASK1_GENERAL',
        testType: 'GENERAL',
        title: prompt.title,
        contentData: {
          prompt: prompt.prompt,
          topic: prompt.topic,
          letterType: prompt.letterType,
        },
        difficultyBand: prompt.difficultyBand,
        isPremium: false,
      },
    });
    console.log(`  ✓ ${prompt.title}`);
  }
  console.log(`Seeded ${task1GTPrompts.length} Task 1 GT prompts`);

  // Seed Task 2 GT prompts
  console.log('\nSeeding Task 2 GT prompts...');
  for (const prompt of task2GTPrompts) {
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
        testType: 'GENERAL',
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
  console.log(`Seeded ${task2GTPrompts.length} Task 2 GT prompts`);

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

  // Seed Speaking Part 1 prompts
  console.log('\nSeeding Speaking Part 1 prompts...');
  for (const prompt of speakingPart1Prompts) {
    const contentData = JSON.parse(
      JSON.stringify({
        topic: prompt.topic,
        questions: prompt.questions,
        suggestedTime: prompt.suggestedTime,
      })
    );

    await prisma.content.upsert({
      where: { id: prompt.id },
      update: {
        title: prompt.topic,
        contentData,
      },
      create: {
        id: prompt.id,
        module: 'SPEAKING',
        type: 'SPEAKING_PART1',
        title: prompt.topic,
        contentData,
        difficultyBand: 5.5, // Part 1 is generally easier
        isPremium: false,
      },
    });
    console.log(`  ✓ Part 1: ${prompt.topic}`);
  }
  console.log(`Seeded ${speakingPart1Prompts.length} Speaking Part 1 prompts`);

  // Seed Speaking Part 2 prompts (Cue Cards)
  console.log('\nSeeding Speaking Part 2 prompts...');
  for (const prompt of speakingPart2Prompts) {
    const contentData = JSON.parse(
      JSON.stringify({
        topic: prompt.topic,
        cueCard: prompt.cueCard,
        prepTime: prompt.prepTime,
        speakingTime: prompt.speakingTime,
        followUpQuestion: prompt.followUpQuestion,
      })
    );

    await prisma.content.upsert({
      where: { id: prompt.id },
      update: {
        title: prompt.topic,
        contentData,
      },
      create: {
        id: prompt.id,
        module: 'SPEAKING',
        type: 'SPEAKING_PART2',
        title: prompt.topic,
        contentData,
        difficultyBand: 6.5, // Part 2 is moderate difficulty
        isPremium: false,
      },
    });
    console.log(`  ✓ Part 2: ${prompt.topic}`);
  }
  console.log(`Seeded ${speakingPart2Prompts.length} Speaking Part 2 prompts`);

  // Seed Speaking Part 3 prompts (Discussion)
  console.log('\nSeeding Speaking Part 3 prompts...');
  for (const prompt of speakingPart3Prompts) {
    const contentData = JSON.parse(
      JSON.stringify({
        topic: prompt.topic,
        relatedPart2Id: prompt.relatedPart2Id,
        questions: prompt.questions,
      })
    );

    await prisma.content.upsert({
      where: { id: prompt.id },
      update: {
        title: prompt.topic,
        contentData,
        difficultyBand: prompt.difficultyBand,
      },
      create: {
        id: prompt.id,
        module: 'SPEAKING',
        type: 'SPEAKING_PART3',
        title: prompt.topic,
        contentData,
        difficultyBand: prompt.difficultyBand,
        isPremium: false,
      },
    });
    console.log(`  ✓ Part 3: ${prompt.topic}`);
  }
  console.log(`Seeded ${speakingPart3Prompts.length} Speaking Part 3 prompts`);

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
