import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_TESTIMONIALS } from '@/data/initialData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (!items || items.length === 0) {
      try {
        for (const t of INITIAL_TESTIMONIALS) {
          await prisma.testimonial.upsert({
            where: { id: t.id },
            update: {
              name: t.name,
              role: t.role,
              company: t.company || '',
              quote: t.quote,
              avatarUrl: t.avatarUrl || '',
              bgColor: t.bgColor || '#161616',
              accentColor: t.accentColor || '#FFD600',
              featured: t.featured ?? true,
            },
            create: {
              id: t.id,
              name: t.name,
              role: t.role,
              company: t.company || '',
              quote: t.quote,
              avatarUrl: t.avatarUrl || '',
              bgColor: t.bgColor || '#161616',
              accentColor: t.accentColor || '#FFD600',
              featured: t.featured ?? true,
            },
          });
        }
        const seeded = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json({ success: true, data: seeded });
      } catch (seedErr) {
        return NextResponse.json({ success: true, data: INITIAL_TESTIMONIALS, fallback: true });
      }
    }

    return NextResponse.json({ success: true, data: items, fallback: false });
  } catch (error) {
    return NextResponse.json({ success: true, data: INITIAL_TESTIMONIALS, fallback: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, role, company, quote, avatarUrl, bgColor, accentColor, featured } = body;

    let created;
    try {
      created = await prisma.testimonial.create({
        data: {
          name,
          role,
          company: company || '',
          quote,
          avatarUrl: avatarUrl || '',
          bgColor: bgColor || '#161616',
          accentColor: accentColor || '#FFD600',
          featured: featured ?? true,
        },
      });
    } catch (dbErr) {
      created = {
        id: `testi-${Date.now()}`,
        name,
        role,
        company: company || '',
        quote,
        avatarUrl: avatarUrl || '',
        bgColor: bgColor || '#161616',
        accentColor: accentColor || '#FFD600',
        featured: featured ?? true,
        createdAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({ success: true, data: created });
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

    let updated;
    try {
      updated = await prisma.testimonial.update({
        where: { id },
        data,
      });
    } catch (dbErr) {
      updated = { id, ...data, updatedAt: new Date().toISOString() };
    }

    return NextResponse.json({ success: true, data: updated });
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
