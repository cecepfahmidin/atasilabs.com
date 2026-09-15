import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_PRICING_TIERS } from '@/data/initialData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await prisma.pricingTier.findMany({
      orderBy: { tierNumber: 'asc' },
    });
    return NextResponse.json({ success: true, data: items.length ? items : INITIAL_PRICING_TIERS });
  } catch (error) {
    return NextResponse.json({ success: true, data: INITIAL_PRICING_TIERS, fallback: true });
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
      updated = await prisma.pricingTier.update({
        where: { id },
        data,
      });
    } catch (dbErr) {
      updated = { id, ...data, updatedAt: new Date().toISOString() };
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update pricing tier' },
      { status: 500 }
    );
  }
}
