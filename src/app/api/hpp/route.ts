import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_HPP_MATRIX } from '@/data/initialDocuments';

const DEFAULT_ALLOCATIONS = [
  { id: 'alloc-1', label: 'Pemasaran / CMO', percent: 17.5, nominal: 2450000, color: '#3b82f6' },
  { id: 'alloc-2', label: 'Operasional Kantor', percent: 5.0, nominal: 700000, color: '#10b981' },
  { id: 'alloc-3', label: 'Pengembangan Usaha', percent: 10.0, nominal: 1400000, color: '#f59e0b' },
  { id: 'alloc-4', label: 'Dana Mitigasi/Taktis', percent: 5.0, nominal: 700000, color: '#8b5cf6' },
  { id: 'alloc-5', label: 'Zakat / Sosial', percent: 2.5, nominal: 350000, color: '#ec4899' },
];

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const item = await (prisma as any).hppData.findUnique({
      where: { id: 'singleton-hpp' },
    });
    if (!item) {
      return NextResponse.json({
        success: true,
        data: { matrix: INITIAL_HPP_MATRIX, allocations: DEFAULT_ALLOCATIONS },
        fallback: true,
      });
    }
    return NextResponse.json({
      success: true,
      data: { matrix: item.matrix, allocations: item.allocations },
      fallback: false,
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: { matrix: INITIAL_HPP_MATRIX, allocations: DEFAULT_ALLOCATIONS },
      fallback: true,
    });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { matrix, allocations } = body;

    let updated;
    try {
      updated = await (prisma as any).hppData.upsert({
        where: { id: 'singleton-hpp' },
        update: {
          matrix: matrix || [],
          allocations: allocations || [],
        },
        create: {
          id: 'singleton-hpp',
          matrix: matrix || [],
          allocations: allocations || [],
        },
      });
    } catch (dbErr) {
      updated = { id: 'singleton-hpp', matrix, allocations, updatedAt: new Date().toISOString() };
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update HPP data' },
      { status: 500 }
    );
  }
}
