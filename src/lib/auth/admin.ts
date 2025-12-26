import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './config';
import { prisma } from '@/lib/prisma';

/**
 * Checks if the current user has admin role.
 * Redirects to signin if not authenticated, or to dashboard if not admin.
 * Use this in server components to protect admin pages.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return session;
}

/**
 * Checks if the current user has admin role.
 * Returns boolean - use this in API routes.
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return user?.role === 'ADMIN';
}

/**
 * Gets the current user with role information.
 * Returns null if not authenticated.
 */
export async function getCurrentUserWithRole() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  return user;
}
