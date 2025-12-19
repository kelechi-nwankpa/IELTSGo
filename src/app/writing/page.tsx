import { prisma } from '@/lib/prisma';
import { WritingPractice } from './WritingPractice';

interface ContentData {
  prompt: string;
  topic: string;
}

async function getRandomPrompt() {
  const prompts = await prisma.content.findMany({
    where: {
      module: 'WRITING',
      type: 'TASK2',
    },
    select: {
      id: true,
      title: true,
      contentData: true,
      difficultyBand: true,
    },
  });

  if (prompts.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
}

export default async function WritingPage() {
  const prompt = await getRandomPrompt();

  if (!prompt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">No Prompts Available</h1>
          <p className="text-gray-600">Please check back later.</p>
        </div>
      </div>
    );
  }

  const contentData = prompt.contentData as unknown as ContentData;

  return (
    <WritingPractice
      promptId={prompt.id}
      title={prompt.title || 'Writing Task 2'}
      prompt={contentData.prompt}
      topic={contentData.topic}
    />
  );
}
