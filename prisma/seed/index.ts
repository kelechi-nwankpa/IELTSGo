import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { task2Prompts } from './task2-prompts';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Seed Task 2 prompts
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

  console.log(`\nSeeded ${task2Prompts.length} Task 2 prompts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
