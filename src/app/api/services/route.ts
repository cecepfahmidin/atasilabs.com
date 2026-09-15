import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SERVICES_DATA } from '@/data/initialData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await prisma.serviceItem.findMany();
    return NextResponse.json({ success: true, data: items.length ? items : SERVICES_DATA });
  } catch (error) {
    return NextResponse.json({ success: true, data: SERVICES_DATA, fallback: true });
  }
}
