import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { isAdmin } from '@/lib/auth/admin';
import { prisma } from '@/lib/prisma';
import { Module, ContentType, TestType } from '@prisma/client';
import { z } from 'zod';

// Zod schema for admin content creation
const adminContentCreateSchema = z.object({
  module: z.enum(['WRITING', 'SPEAKING', 'READING', 'LISTENING'], {
    message: 'Invalid module value',
  }),
  type: z.enum(
    [
      'TASK1_ACADEMIC',
      'TASK1_GENERAL',
      'TASK2',
      'SPEAKING_PART1',
      'SPEAKING_PART2',
      'SPEAKING_PART3',
      'READING_PASSAGE',
      'LISTENING_SECTION',
    ],
    { message: 'Invalid content type' }
  ),
  testType: z.enum(['ACADEMIC', 'GENERAL']).optional().nullable(),
  title: z.string().max(500).optional().nullable(),
  contentData: z.record(z.string(), z.unknown()),
  answers: z.record(z.string(), z.unknown()).optional().nullable(),
  difficultyBand: z
    .union([z.number(), z.string().transform((v) => parseFloat(v))])
    .pipe(z.number().min(1).max(9))
    .optional()
    .nullable(),
  isPremium: z.boolean().optional().default(false),
});

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

    // Validate with Zod
    const parseResult = adminContentCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: parseResult.error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    const { module, type, testType, title, contentData, answers, difficultyBand, isPremium } =
      parseResult.data;

    // Create content
    const content = await prisma.content.create({
      data: {
        module: module as Module,
        type: type as ContentType,
        testType: (testType as TestType) || null,
        title: title || null,
        contentData: contentData as object,
        answers: answers ? (answers as object) : undefined,
        difficultyBand: difficultyBand || null,
        isPremium,
      },
    });

    return NextResponse.json({ content }, { status: 201 });
  } catch (error) {
    console.error('Error creating content:', error);
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
  }
}
