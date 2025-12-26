import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const part = searchParams.get('part'); // 1, 2, or 3

    const typeMap: Record<string, string> = {
      '1': 'SPEAKING_PART1',
      '2': 'SPEAKING_PART2',
      '3': 'SPEAKING_PART3',
    };

    const whereClause: Record<string, unknown> = {
      module: 'SPEAKING',
    };

    if (part && typeMap[part]) {
      whereClause.type = typeMap[part];
    }

    const prompts = await prisma.content.findMany({
      where: whereClause,
      select: {
        id: true,
        type: true,
        title: true,
        contentData: true,
        difficultyBand: true,
        isPremium: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ prompts });
  } catch (error) {
    console.error('Error fetching speaking prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch speaking prompts' },
      { status: 500 }
    );
  }
}
