import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { StudyPlanHub } from './StudyPlanHub';

export const dynamic = 'force-dynamic';

export default async function StudyPlanPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <StudyPlanHub />;
}
