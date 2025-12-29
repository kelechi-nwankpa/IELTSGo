import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const setPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
  currentPassword: z.string().optional(),
});

/**
 * POST /api/account/password
 * Set or update password for the current user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = setPasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.issues },
        { status: 400 }
      );
    }

    const { password, currentPassword } = result.data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If user already has a password, require current password
    if (user.passwordHash) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        );
      }

      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
    }

    // Hash and save new password
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      message: user.passwordHash ? 'Password updated successfully' : 'Password set successfully',
    });
  } catch (error) {
    console.error('Error setting password:', error);
    return NextResponse.json({ error: 'Failed to set password' }, { status: 500 });
  }
}
