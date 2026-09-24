import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (projectId) {
      const doc = await (prisma as any).customDocument.findUnique({
        where: { projectId },
      });
      if (!doc) {
        return NextResponse.json({ success: true, data: null });
      }
      return NextResponse.json({ success: true, data: doc.data });
    }

    const allDocs = await (prisma as any).customDocument.findMany();
    const map: Record<string, any> = {};
    for (const d of allDocs) {
      map[d.projectId] = d.data;
    }
    return NextResponse.json({ success: true, data: map });
  } catch (error) {
    return NextResponse.json({ success: true, data: {} });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { projectId, data } = body;

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'ProjectId is required' }, { status: 400 });
    }

    let updated;
    try {
      updated = await (prisma as any).customDocument.upsert({
        where: { projectId },
        update: { data },
        create: { projectId, data },
      });
    } catch (dbErr) {
      updated = { projectId, data, updatedAt: new Date().toISOString() };
    }

    // Dual sync to Supabase REST API
    try {
      await supabase.from('CustomDocument').upsert(
        { projectId, data },
        { onConflict: 'projectId' }
      );
    } catch (sbErr) {
      console.error('Supabase direct PUT CustomDocument upsert error:', sbErr);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update custom document' },
      { status: 500 }
    );
  }
}

