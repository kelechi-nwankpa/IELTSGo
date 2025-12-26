import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { isAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { Module, ContentType, TestType, Prisma } from '@prisma/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/admin/content/[id] - Get single content item
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check admin authorization
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        _count: {
          select: { sessions: true },
        },
      },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

// PATCH /api/admin/content/[id] - Update content
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check admin authorization
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Check if content exists
    const existing = await prisma.content.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const body = await request.json();
    const { module, type, testType, title, contentData, answers, difficultyBand, isPremium } = body;

    // Validate enums if provided
    if (module && !Object.values(Module).includes(module)) {
      return NextResponse.json({ error: 'Invalid module value' }, { status: 400 });
    }

    if (type && !Object.values(ContentType).includes(type)) {
      return NextResponse.json({ error: 'Invalid type value' }, { status: 400 });
    }

    if (testType && !Object.values(TestType).includes(testType)) {
      return NextResponse.json({ error: 'Invalid testType value' }, { status: 400 });
    }

    // Build update data using Prisma's ContentUpdateInput type
    const updateData: Prisma.ContentUpdateInput = {};

    if (module !== undefined) updateData.module = module;
    if (type !== undefined) updateData.type = type;
    if (testType !== undefined) updateData.testType = testType || null;
    if (title !== undefined) updateData.title = title || null;
    if (contentData !== undefined) updateData.contentData = contentData;
    if (answers !== undefined) {
      updateData.answers = answers === null ? Prisma.DbNull : answers;
    }
    if (difficultyBand !== undefined)
      updateData.difficultyBand = difficultyBand ? parseFloat(difficultyBand) : null;
    if (isPremium !== undefined) updateData.isPremium = isPremium;

    const content = await prisma.content.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}

// DELETE /api/admin/content/[id] - Delete content
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check admin authorization
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Check if content exists
    const existing = await prisma.content.findUnique({
      where: { id },
      include: {
        _count: {
          select: { sessions: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Warn if content has associated sessions
    if (existing._count.sessions > 0) {
      // Check for force delete flag
      const { searchParams } = new URL(request.url);
      const force = searchParams.get('force') === 'true';

      if (!force) {
        return NextResponse.json(
          {
            error: 'Content has associated practice sessions',
            sessions: existing._count.sessions,
            hint: 'Use ?force=true to delete anyway',
          },
          { status: 409 }
        );
      }
    }

    await prisma.content.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
  }
}
