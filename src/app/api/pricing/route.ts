import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { INITIAL_PRICING_TIERS } from '@/data/initialData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await prisma.pricingTier.findMany({
      orderBy: { tierNumber: 'asc' },
    });
    if (!items || items.length === 0) {
      return NextResponse.json({ success: true, data: INITIAL_PRICING_TIERS, fallback: true, isInitialSeed: true });
    }
    return NextResponse.json({ success: true, data: items, fallback: false, isInitialSeed: false });
  } catch (error) {
    return NextResponse.json({ success: true, data: INITIAL_PRICING_TIERS, fallback: true, isInitialSeed: true });
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

    // Dual-sync to Supabase REST client
    try {
      await supabase.from('PricingTier').upsert({ id, ...data });
    } catch (sbErr) {
      console.error('Supabase direct PUT pricing error:', sbErr);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update pricing tier' },
      { status: 500 }
    );
  }
}
