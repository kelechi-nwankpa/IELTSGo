import { prisma } from '@/lib/prisma';
import { Task1Practice } from './Task1Practice';

// Force dynamic rendering - this page needs database access
export const dynamic = 'force-dynamic';

interface Task1AcademicContentData {
  prompt: string;
  topic: string;
  visualType?: string;
  imageUrl?: string;
  imageDescription?: string;
}

interface Task1GTContentData {
  prompt: string;
  topic: string;
  letterType?: 'formal' | 'semi-formal' | 'informal';
}

type ContentData = Task1AcademicContentData | Task1GTContentData;

interface PageProps {
  searchParams: Promise<{ type?: string }>;
}

async function getRandomTask1Prompt(testType: 'academic' | 'general') {
  const contentType = testType === 'academic' ? 'TASK1_ACADEMIC' : 'TASK1_GENERAL';

  const prompts = await prisma.content.findMany({
    where: {
      module: 'WRITING',
      type: contentType,
    },
    select: {
      id: true,
      title: true,
      contentData: true,
      difficultyBand: true,
      testType: true,
      type: true,
    },
  });

  if (prompts.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
}

export default async function Task1Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const testType = params.type === 'general' ? 'general' : 'academic';
  const prompt = await getRandomTask1Prompt(testType);

  if (!prompt) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-800">No Task 1 Prompts Available</h1>
          <p className="text-gray-600">
            {testType === 'academic'
              ? 'No Academic Task 1 prompts found. Please run the database seed.'
              : 'No General Training Task 1 prompts found. Please run the database seed.'}
          </p>
        </div>
      </div>
    );
  }

  const contentData = prompt.contentData as unknown as ContentData;
  const isAcademic = prompt.type === 'TASK1_ACADEMIC';

  return (
    <Task1Practice
      promptId={prompt.id}
      title={prompt.title || 'Writing Task 1'}
      prompt={contentData.prompt}
      topic={contentData.topic}
      isAcademic={isAcademic}
      imageUrl={isAcademic ? (contentData as Task1AcademicContentData).imageUrl : undefined}
      imageDescription={
        isAcademic ? (contentData as Task1AcademicContentData).imageDescription : undefined
      }
      letterType={!isAcademic ? (contentData as Task1GTContentData).letterType : undefined}
    />
  );
}
