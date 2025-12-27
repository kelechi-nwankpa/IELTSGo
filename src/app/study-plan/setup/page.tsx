import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { StudyPlanSetupWizard } from './StudyPlanSetupWizard';

export const dynamic = 'force-dynamic';

export default async function StudyPlanSetupPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return <StudyPlanSetupWizard />;
}
