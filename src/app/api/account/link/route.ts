import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/account/link
 * Initiates OAuth linking for an authenticated user
 * This endpoint stores the user's intent to link, then redirects to OAuth
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { provider } = body;

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already linked
    const alreadyLinked = user.accounts.some((acc) => acc.provider === provider);
    if (alreadyLinked) {
      return NextResponse.json({ error: 'Provider is already linked' }, { status: 400 });
    }

    // Store linking intent in a temporary session marker
    // The actual linking happens when OAuth callback returns
    // We'll use a query param to indicate linking mode
    const callbackUrl = `/api/auth/callback/${provider}?linking=true`;

    return NextResponse.json({
      redirectUrl: `/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`,
    });
  } catch (error) {
    console.error('Error initiating link:', error);
    return NextResponse.json({ error: 'Failed to initiate linking' }, { status: 500 });
  }
}
