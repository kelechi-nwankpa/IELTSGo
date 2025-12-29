import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  registerSchema,
  validateBody,
  ValidationError,
  formatValidationError,
} from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod schema
    const { name, email, password } = validateBody(registerSchema, body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    if (existingUser) {
      // If user exists but has no password (OAuth-only user), add password to enable email login
      if (!existingUser.passwordHash) {
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            passwordHash,
            name: existingUser.name || name || null,
          },
          select: {
            id: true,
            email: true,
            name: true,
          },
        });

        return NextResponse.json({
          message: 'Password added to your account. You can now sign in with email and password.',
          user: updatedUser,
        });
      }

      // User already has a password
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json({
      message: 'Account created successfully',
      user,
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof ValidationError) {
      return NextResponse.json(formatValidationError(error), { status: 400 });
    }

    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
