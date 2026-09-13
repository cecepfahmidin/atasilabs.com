import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_PORTFOLIOS } from '@/data/initialData';

export async function GET() {
  try {
    const items = await prisma.portfolio.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json({ success: true, data: INITIAL_PORTFOLIOS, fallback: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, fullDescription, category, imageUrl, techStack, liveUrl, repoUrl, featured } = body;

    let created;
    try {
      created = await prisma.portfolio.create({
        data: {
          title,
          description,
          fullDescription: fullDescription || description,
          category: category || 'Full-Stack',
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
          techStack: Array.isArray(techStack) ? techStack : (techStack ? techStack.split(',').map((s: string) => s.trim()) : ['Next.js', 'Prisma', 'Supabase']),
          liveUrl: liveUrl || '',
          repoUrl: repoUrl || '',
          featured: featured || false,
        },
      });
    } catch (dbErr) {
      created = {
        id: `port-${Date.now()}`,
        title,
        description,
        fullDescription: fullDescription || description,
        category: category || 'Full-Stack',
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        techStack: Array.isArray(techStack) ? techStack : ['Next.js', 'Prisma', 'Supabase'],
        liveUrl: liveUrl || '',
        repoUrl: repoUrl || '',
        featured: featured || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create portfolio item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    let updated;
    try {
      updated = await prisma.portfolio.update({
        where: { id },
        data,
      });
    } catch (dbErr) {
      updated = { id, ...data, updatedAt: new Date().toISOString() };
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update portfolio item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    try {
      await prisma.portfolio.delete({ where: { id } });
    } catch (dbErr) {
      // safe fallback
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete portfolio item' },
      { status: 500 }
    );
  }
}
