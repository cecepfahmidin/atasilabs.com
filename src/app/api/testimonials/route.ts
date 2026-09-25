import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Primary: fetch from Supabase HTTPS REST API
    const { data: sbItems, error: sbError } = await supabase
      .from('Testimonial')
      .select('*')
      .order('createdAt', { ascending: false });

    if (!sbError && sbItems) {
      return NextResponse.json({ success: true, data: sbItems, fallback: false });
    }

    // 2. Fallback: Try Prisma DB query
    try {
      const items = await prisma.testimonial.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (items) {
        return NextResponse.json({ success: true, data: items, fallback: false });
      }
    } catch (prismaErr) {
      console.warn('Prisma query failed for testimonials:', prismaErr);
    }

    return NextResponse.json({ success: true, data: [], fallback: false });
  } catch (error) {
    return NextResponse.json({ success: true, data: [], fallback: false });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, role, company, quote, avatarUrl, bgColor, accentColor, featured } = body;

    const testiId = id || `testi-${Date.now()}`;
    const itemData = {
      id: testiId,
      name,
      role,
      company: company || '',
      quote,
      avatarUrl: avatarUrl || '',
      bgColor: bgColor || '#161616',
      accentColor: accentColor || '#FFD600',
      featured: featured ?? true,
    };

    // Dual sync to Supabase REST API
    try {
      await supabase.from('Testimonial').upsert(itemData);
    } catch (sbErr) {
      console.error('Supabase direct POST testimonial error:', sbErr);
    }

    // Prisma write fallback
    try {
      await prisma.testimonial.create({
        data: itemData,
      });
    } catch (dbErr) {
      console.warn('Prisma create testimonial failed:', dbErr);
    }

    return NextResponse.json({ success: true, data: itemData });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create testimonial' },
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
      await supabase.from('Testimonial').upsert({ id, ...data });
    } catch (sbErr) {
      console.error('Supabase direct PUT testimonial error:', sbErr);
    }

    // Prisma update fallback
    try {
      await prisma.testimonial.update({
        where: { id },
        data,
      });
    } catch (dbErr) {
      console.warn('Prisma testimonial update failed:', dbErr);
    }

    return NextResponse.json({ success: true, data: { id, ...data } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update testimonial' },
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
      await supabase.from('Testimonial').delete().eq('id', id);
    } catch (sbErr) {
      console.error('Supabase direct DELETE testimonial error:', sbErr);
    }

    // Prisma delete
    try {
      await prisma.testimonial.delete({ where: { id } });
    } catch (dbErr) {
      // safe fallback
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}
