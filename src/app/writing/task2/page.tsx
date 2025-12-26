import { prisma } from '@/lib/prisma';
import { Task2Practice } from './Task2Practice';

// Force dynamic rendering - this page needs database access
export const dynamic = 'force-dynamic';

interface ContentData {
  prompt: string;
  topic: string;
}

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

async function getRandomTask2Prompt(testType: 'academic' | 'general') {
  const prompts = await prisma.content.findMany({
    where: {
      module: 'WRITING',
      type: 'TASK2',
      testType: testType === 'academic' ? 'ACADEMIC' : 'GENERAL',
    },
    select: {
      id: true,
      title: true,
      contentData: true,
      difficultyBand: true,
      testType: true,
    },
  });

  if (prompts.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
}

export default async function Task2Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const testType = params.type === 'general' ? 'general' : 'academic';
  const prompt = await getRandomTask2Prompt(testType);

  if (!prompt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-800">No Task 2 Prompts Available</h1>
          <p className="text-gray-600">
            {testType === 'academic'
              ? 'No Academic Task 2 prompts found. Please run the database seed.'
              : 'No General Training Task 2 prompts found. Please run the database seed.'}
          </p>
        </div>
      </div>
    );
  }

  const contentData = prompt.contentData as unknown as ContentData;

  return (
    <Task2Practice
      promptId={prompt.id}
      title={prompt.title || 'Writing Task 2'}
      prompt={contentData.prompt}
      topic={contentData.topic}
      testType={testType}
    />
  );
}
