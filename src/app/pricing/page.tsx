import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { PricingContent } from './PricingContent';

export const metadata = {
  title: 'Pricing - IELTSGo',
  description: 'Upgrade to IELTSGo Premium for unlimited evaluations and full access',
};

export default async function PricingPage() {
  const session = await getServerSession(authOptions);

  let currentSubscription = null;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionTier: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
      },
    });
    currentSubscription = user;
  }

  return <PricingContent isLoggedIn={!!session} currentSubscription={currentSubscription} />;
}
