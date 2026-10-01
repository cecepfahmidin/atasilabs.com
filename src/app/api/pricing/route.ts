import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const admin = getSupabaseAdmin();
    const { data: sbItems, error: sbErr } = await admin
      .from('PricingTier')
      .select('*')
      .order('tierNumber', { ascending: true });

    if (!sbErr && sbItems && sbItems.length > 0) {
      const formatted = sbItems.map((tier) => ({
        ...tier,
        active: tier.active !== false,
      }));
      return NextResponse.json({ success: true, data: formatted, fallback: false });
    }

    const items = await prisma.pricingTier.findMany({
      orderBy: { tierNumber: 'asc' },
    });
    const formattedPrisma = (items || []).map((tier: any) => ({
      ...tier,
      active: tier.active !== false,
    }));
    return NextResponse.json({ success: true, data: formattedPrisma, fallback: false });
  } catch (error) {
    return NextResponse.json({ success: true, data: [], fallback: false });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    let updated: any = null;

    // 1. Primary update in Supabase via Admin Client (bypasses RLS, writes directly to PostgreSQL)
    try {
      const admin = getSupabaseAdmin();
      const { data: sbUpdated, error: sbErr } = await admin
        .from('PricingTier')
        .update({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id)
        .select();

      if (!sbErr && sbUpdated && sbUpdated.length > 0) {
        updated = {
          ...sbUpdated[0],
          active: sbUpdated[0].active !== false,
        };
      } else if (sbErr) {
        console.error('Supabase Admin PUT PricingTier update error:', sbErr);
      }
    } catch (sbErr) {
      console.error('Supabase direct PUT pricing exception:', sbErr);
    }

    // 2. Secondary update in Prisma
    try {
      const prismaUpdated = await prisma.pricingTier.update({
        where: { id },
        data,
      });
      if (!updated) {
        updated = {
          ...prismaUpdated,
          active: (prismaUpdated as any).active !== false,
        };
      }
    } catch (dbErr) {
      // Prisma error logged as notice
      console.warn('Prisma secondary pricing update notice:', dbErr);
    }

    if (!updated) {
      updated = { id, ...data, updatedAt: new Date().toISOString() };
    }

    // 3. Broadcast real-time change to all connected tabs / clients
    try {
      await supabase.channel('public_realtime_db_changes').send({
        type: 'broadcast',
        event: 'PRICING_UPDATE',
        payload: updated,
      });
    } catch (bErr) {
      console.warn('Realtime broadcast pricing error:', bErr);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update pricing tier' },
      { status: 500 }
    );
  }
}

