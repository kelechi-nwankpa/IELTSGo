import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const prompt = await prisma.content.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        title: true,
        contentData: true,
        difficultyBand: true,
        isPremium: true,
      },
    });

    if (!prompt || prompt.type?.toString().startsWith('SPEAKING') === false) {
      return NextResponse.json(
        { error: 'Speaking prompt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error('Error fetching speaking prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch speaking prompt' },
      { status: 500 }
    );
  }
}
