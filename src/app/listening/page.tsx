import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { ListeningPractice } from './ListeningPractice';

interface ListeningQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false_ng' | 'matching' | 'short_answer';
  text: string;
  options?: string[];
  items?: string[];
  maxWords?: number;
}

interface ContentData {
  audioUrl: string;
  title: string;
  transcript?: string;
  questions: ListeningQuestion[];
  section?: number;
}

export default async function ListeningPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/listening');
  }

  // Fetch a random listening section using database-level randomization
  const sections = await prisma.$queryRaw<
    Array<{
      id: string;
      title: string;
      contentData: ContentData;
      difficultyBand: number | null;
    }>
  >`
    SELECT id, title, content_data as "contentData", difficulty_band as "difficultyBand"
    FROM content
    WHERE module = 'LISTENING' AND type = 'LISTENING_SECTION'
    ORDER BY RANDOM()
    LIMIT 1
  `;

  if (sections.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">No Listening Sections Available</h1>
          <p className="mt-2 text-gray-600">
            There are no listening sections available at the moment. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  const selectedSection = sections[0];
  const contentData = selectedSection.contentData;

  return (
    <ListeningPractice
      sectionId={selectedSection.id}
      title={contentData.title}
      audioUrl={contentData.audioUrl}
      transcript={contentData.transcript}
      questions={contentData.questions}
    />
  );
}
