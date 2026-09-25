import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { INITIAL_PORTFOLIOS } from '@/data/initialData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Primary: fetch from Supabase HTTPS REST API
    const { data: sbItems, error: sbError } = await supabase
      .from('Portfolio')
      .select('*')
      .order('createdAt', { ascending: false });

    if (!sbError && sbItems && sbItems.length > 0) {
      return NextResponse.json({ success: true, data: sbItems, fallback: false, isInitialSeed: false });
    }

    // 2. Fallback: Try Prisma DB query
    try {
      const items = await prisma.portfolio.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (items && items.length > 0) {
        return NextResponse.json({ success: true, data: items, fallback: false, isInitialSeed: false });
      }
    } catch (prismaErr) {
      console.warn('Prisma query failed for portfolio:', prismaErr);
    }

    return NextResponse.json({ success: true, data: INITIAL_PORTFOLIOS, fallback: true, isInitialSeed: false });
  } catch (error) {
    return NextResponse.json({ success: true, data: INITIAL_PORTFOLIOS, fallback: true, isInitialSeed: false });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, fullDescription, category, imageUrl, techStack, liveUrl, repoUrl, featured } = body;

    const portId = id || `port-${Date.now()}`;
    const itemData = {
      id: portId,
      title,
      description,
      fullDescription: fullDescription || description,
      category: category || 'Full-Stack',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      techStack: Array.isArray(techStack) ? techStack : (techStack ? techStack.split(',').map((s: string) => s.trim()) : ['Next.js', 'Prisma', 'Supabase']),
      liveUrl: liveUrl || '',
      repoUrl: repoUrl || '',
      featured: featured || false,
    };

    // Dual sync to Supabase REST API
    try {
      await supabase.from('Portfolio').upsert(itemData);
    } catch (sbErr) {
      console.error('Supabase direct POST portfolio error:', sbErr);
    }

    // Prisma write fallback
    try {
      await prisma.portfolio.create({
        data: itemData,
      });
    } catch (dbErr) {
      console.warn('Prisma create portfolio failed:', dbErr);
    }

    return NextResponse.json({ success: true, data: itemData });
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

    // Dual sync to Supabase REST API
    try {
      await supabase.from('Portfolio').upsert({ id, ...data });
    } catch (sbErr) {
      console.error('Supabase direct PUT portfolio error:', sbErr);
    }

    // Prisma update fallback
    try {
      await prisma.portfolio.update({
        where: { id },
        data,
      });
    } catch (dbErr) {
      console.warn('Prisma portfolio update failed:', dbErr);
    }

    return NextResponse.json({ success: true, data: { id, ...data } });
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

    // Supabase REST delete
    try {
      await supabase.from('Portfolio').delete().eq('id', id);
    } catch (sbErr) {
      console.error('Supabase direct DELETE portfolio error:', sbErr);
    }

    // Prisma delete
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
