import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { ReadingPractice } from './ReadingPractice';

interface ReadingQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false_ng' | 'matching' | 'short_answer';
  text: string;
  options?: string[];
  items?: string[];
  maxWords?: number;
}

interface ContentData {
  passage: string;
  title: string;
  questions: ReadingQuestion[];
}

export default async function ReadingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/reading');
  }

  // Fetch a random reading passage
  const passages = await prisma.content.findMany({
    where: {
      module: 'READING',
      type: 'READING_PASSAGE',
    },
    select: {
      id: true,
      title: true,
      contentData: true,
      difficultyBand: true,
    },
  });

  if (passages.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">No Passages Available</h1>
          <p className="mt-2 text-gray-600">
            There are no reading passages available at the moment. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  // Select a random passage
  const randomIndex = Math.floor(Math.random() * passages.length);
  const selectedPassage = passages[randomIndex];
  const contentData = selectedPassage.contentData as unknown as ContentData;

  return (
    <ReadingPractice
      passageId={selectedPassage.id}
      title={contentData.title}
      passage={contentData.passage}
      questions={contentData.questions}
    />
  );
}
