import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sections = await prisma.content.findMany({
      where: {
        module: 'LISTENING',
        type: 'LISTENING_SECTION',
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

    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Error fetching listening sections:', error);
    return NextResponse.json({ error: 'Failed to fetch listening sections' }, { status: 500 });
  }
}
