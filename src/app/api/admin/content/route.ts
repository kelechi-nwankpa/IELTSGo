import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { isAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { Module, ContentType, TestType } from '@prisma/client';

// GET /api/admin/content - List all content with pagination and filters
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const moduleFilter = searchParams.get('module') as Module | null;
    const type = searchParams.get('type') as ContentType | null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';

    // Build filter
    const where: {
      module?: Module;
      type?: ContentType;
      title?: { contains: string; mode: 'insensitive' };
    } = {};

    if (moduleFilter) where.module = moduleFilter;
    if (type) where.type = type;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    // Get total count
    const total = await prisma.content.count({ where });

    // Get paginated content
    const content = await prisma.content.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        module: true,
        type: true,
        testType: true,
        title: true,
        difficultyBand: true,
        isPremium: true,
        createdAt: true,
        updatedAt: true,
        // Don't include full contentData in list view for performance
        _count: {
          select: { sessions: true },
        },
      },
    });

    return NextResponse.json({
      content,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
}

// POST /api/admin/content - Create new content
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { module, type, testType, title, contentData, answers, difficultyBand, isPremium } = body;

    // Validate required fields
    if (!module || !type || !contentData) {
      return NextResponse.json(
        { error: 'Missing required fields: module, type, contentData' },
        { status: 400 }
      );
    }

    // Validate enums
    if (!Object.values(Module).includes(module)) {
      return NextResponse.json({ error: 'Invalid module value' }, { status: 400 });
    }

    if (!Object.values(ContentType).includes(type)) {
      return NextResponse.json({ error: 'Invalid type value' }, { status: 400 });
    }

    if (testType && !Object.values(TestType).includes(testType)) {
      return NextResponse.json({ error: 'Invalid testType value' }, { status: 400 });
    }

    // Create content
    const content = await prisma.content.create({
      data: {
        module,
        type,
        testType: testType || null,
        title: title || null,
        contentData,
        answers: answers || null,
        difficultyBand: difficultyBand ? parseFloat(difficultyBand) : null,
        isPremium: isPremium || false,
      },
    });

    return NextResponse.json({ content }, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
  }
}
