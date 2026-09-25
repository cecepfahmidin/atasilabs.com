import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: sbServices, error: sbErr } = await supabase.from('ServiceItem').select('*');
    if (!sbErr && sbServices) {
      return NextResponse.json({ success: true, data: sbServices });
    }
    const items = await prisma.serviceItem.findMany();
    return NextResponse.json({ success: true, data: items || [] });
  } catch (error) {
    return NextResponse.json({ success: true, data: [] });
  }
}
