import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const unlinkSchema = z.object({
  provider: z.string().min(1, 'Provider is required'),
});

/**
 * POST /api/account/unlink
 * Unlink an OAuth provider from the current user's account
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = unlinkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.issues },
        { status: 400 }
      );
    }

    const { provider } = result.data;

    // Get user with accounts and password status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        passwordHash: true,
        accounts: {
          select: { provider: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if provider is linked
    const hasProvider = user.accounts.some((acc) => acc.provider === provider);
    if (!hasProvider) {
      return NextResponse.json(
        { error: 'Provider is not linked to this account' },
        { status: 400 }
      );
    }

    // Ensure user has at least one way to sign in
    const hasPassword = !!user.passwordHash;
    const otherProviders = user.accounts.filter((acc) => acc.provider !== provider);

    if (!hasPassword && otherProviders.length === 0) {
      return NextResponse.json(
        {
          error:
            'Cannot unlink the only sign-in method. Please set a password or link another provider first.',
        },
        { status: 400 }
      );
    }

    // Find and delete the account
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider,
      },
    });

    if (account) {
      await prisma.account.delete({
        where: { id: account.id },
      });
    }

    return NextResponse.json({
      message: `${provider} account unlinked successfully`,
    });
  } catch (error) {
    console.error('Error unlinking provider:', error);
    return NextResponse.json({ error: 'Failed to unlink provider' }, { status: 500 });
  }
}
