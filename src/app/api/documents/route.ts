import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (projectId) {
      // 1. Supabase REST query
      const { data: sbDoc } = await supabase
        .from('CustomDocument')
        .select('*')
        .eq('projectId', projectId)
        .maybeSingle();

      if (sbDoc && sbDoc.data) {
        return NextResponse.json({ success: true, data: sbDoc.data });
      }

      // 2. Prisma query
      try {
        const doc = await (prisma as any).customDocument.findUnique({
          where: { projectId },
        });
        if (doc && doc.data) {
          return NextResponse.json({ success: true, data: doc.data });
        }
      } catch (pErr) {}

      return NextResponse.json({ success: true, data: null });
    }

    // Single fetch for all docs
    const { data: sbDocs } = await supabase.from('CustomDocument').select('*');
    if (sbDocs && sbDocs.length > 0) {
      const map: Record<string, any> = {};
      for (const d of sbDocs) {
        map[d.projectId] = d.data;
      }
      return NextResponse.json({ success: true, data: map });
    }

    try {
      const allDocs = await (prisma as any).customDocument.findMany();
      const map: Record<string, any> = {};
      for (const d of allDocs) {
        map[d.projectId] = d.data;
      }
      return NextResponse.json({ success: true, data: map });
    } catch (pErr) {}

    return NextResponse.json({ success: true, data: {} });
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

