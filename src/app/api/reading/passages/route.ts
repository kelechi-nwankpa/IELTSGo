import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const passages = await prisma.content.findMany({
      where: {
        module: 'READING',
        type: 'READING_PASSAGE',
      },
      select: {
        id: true,
        title: true,
        contentData: true,
        difficultyBand: true,
        testType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ passages });
  } catch (error) {
    console.error('Error fetching reading passages:', error);
    return NextResponse.json({ error: 'Failed to fetch reading passages' }, { status: 500 });
  }
}
