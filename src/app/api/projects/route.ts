import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Primary: fetch from Supabase HTTPS REST API (bypasses PgBouncer timeout)
    const { data: sbProjects, error: sbError } = await supabase
      .from('ClientProject')
      .select('*')
      .order('createdAt', { ascending: false });

    if (!sbError && sbProjects && sbProjects.length > 0) {
      const formatted = sbProjects.map((p: any) => ({
        ...p,
        payments: Array.isArray(p.payments)
          ? p.payments
          : typeof p.payments === 'string'
          ? JSON.parse(p.payments)
          : [],
        totalPaid: p.totalPaid !== null && p.totalPaid !== undefined ? Number(p.totalPaid) : 0,
      }));
      return NextResponse.json({ success: true, data: formatted, fallback: false });
    }

    // 2. Fallback: Try Prisma DB query
    try {
      const projects = await (prisma as any).clientProject.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (projects && projects.length > 0) {
        const formatted = projects.map((p: any) => ({
          ...p,
          payments: Array.isArray(p.payments)
            ? p.payments
            : typeof p.payments === 'string'
            ? JSON.parse(p.payments)
            : [],
          totalPaid: p.totalPaid !== null && p.totalPaid !== undefined ? Number(p.totalPaid) : 0,
        }));
        return NextResponse.json({ success: true, data: formatted, fallback: false });
      }
    } catch (prismaErr) {
      console.warn('Prisma query failed for projects:', prismaErr);
    }

    // 3. Fallback empty array
    return NextResponse.json({ success: true, data: [], fallback: false });
  } catch (error) {
    return NextResponse.json({ success: true, data: [], fallback: false });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      clientName,
      clientEmail,
      clientPhone,
      clientCompany,
      title,
      description,
      deadline,
      budget,
      progress,
      status,
      ipwStage,
      tierNumber,
      freelancerName,
      freelancerFee,
      isArchived,
      payments,
      totalPaid,
    } = body;

    const projId = body.id || `proj-${Date.now()}`;
    const newProjData = {
      id: projId,
      clientName: clientName || '',
      clientEmail: clientEmail || '',
      clientPhone: clientPhone || '',
      clientCompany: clientCompany || '',
      title: title || '',
      description: description || '',
      deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: Number(budget) || 15000000,
      progress: Number(progress) || 0,
      status: status || 'PLANNING',
      ipwStage: ipwStage || 'STAGE_1_DISCOVERY',
      tierNumber: Number(tierNumber) || 1,
      freelancerName: freelancerName || '',
      freelancerFee: freelancerFee ? Number(freelancerFee) : null,
      isArchived: Boolean(isArchived),
      payments: payments || [],
      totalPaid: totalPaid ? Number(totalPaid) : 0,
    };

    // Dual sync to Supabase REST API (Primary write)
    try {
      await supabase.from('ClientProject').upsert(newProjData);
    } catch (sbErr) {
      console.error('Supabase direct POST upsert error:', sbErr);
    }

    // Prisma write fallback
    try {
      await (prisma as any).clientProject.create({
        data: newProjData,
      });
    } catch (dbErr) {
      console.warn('Prisma create project skipped/failed:', dbErr);
    }

    return NextResponse.json({ success: true, data: newProjData });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      clientName,
      clientEmail,
      clientPhone,
      clientCompany,
      title,
      description,
      deadline,
      budget,
      progress,
      status,
      ipwStage,
      tierNumber,
      freelancerName,
      freelancerFee,
      isArchived,
      payments,
      totalPaid,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (clientName !== undefined) updateData.clientName = clientName;
    if (clientEmail !== undefined) updateData.clientEmail = clientEmail;
    if (clientPhone !== undefined) updateData.clientPhone = clientPhone;
    if (clientCompany !== undefined) updateData.clientCompany = clientCompany;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (deadline !== undefined) updateData.deadline = deadline;
    if (budget !== undefined) updateData.budget = Number(budget);
    if (progress !== undefined) updateData.progress = Number(progress);
    if (status !== undefined) updateData.status = status;
    if (ipwStage !== undefined) updateData.ipwStage = ipwStage;
    if (tierNumber !== undefined) updateData.tierNumber = Number(tierNumber);
    if (freelancerName !== undefined) updateData.freelancerName = freelancerName;
    if (freelancerFee !== undefined) updateData.freelancerFee = freelancerFee !== null ? Number(freelancerFee) : null;
    if (isArchived !== undefined) updateData.isArchived = Boolean(isArchived);
    if (payments !== undefined) updateData.payments = payments;
    if (totalPaid !== undefined) updateData.totalPaid = Number(totalPaid);

    // Dual sync to Supabase REST API (Primary write)
    try {
      await supabase.from('ClientProject').upsert({
        id,
        ...updateData,
      });
    } catch (sbErr) {
      console.error('Supabase direct PATCH upsert error:', sbErr);
    }

    // Prisma write fallback
    try {
      await (prisma as any).clientProject.upsert({
        where: { id },
        update: updateData,
        create: {
          id,
          clientName: clientName || 'Klien Sample',
          clientEmail: clientEmail || '',
          clientPhone: clientPhone || '',
          clientCompany: clientCompany || '',
          title: title || 'Proyek Sample',
          description: description || '',
          deadline: deadline || '2024-05-30',
          budget: budget ? Number(budget) : 15000000,
          progress: progress ? Number(progress) : 0,
          status: status || 'PLANNING',
          ipwStage: ipwStage || 'STAGE_1_DISCOVERY',
          tierNumber: tierNumber ? Number(tierNumber) : 1,
          freelancerName: freelancerName || '',
          freelancerFee: freelancerFee ? Number(freelancerFee) : null,
          isArchived: Boolean(isArchived),
          payments: payments || [],
          totalPaid: totalPaid ? Number(totalPaid) : 0,
          ...updateData,
        },
      });
    } catch (dbErr) {
      console.warn('Prisma project upsert error:', dbErr);
    }

    return NextResponse.json({ success: true, data: { id, ...updateData } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
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
      await supabase.from('ClientProject').delete().eq('id', id);
    } catch (sbErr) {
      console.error('Supabase direct DELETE project error:', sbErr);
    }

    // Prisma delete
    try {
      await (prisma as any).clientProject.delete({ where: { id } });
    } catch (dbErr) {
      // safe fallback
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
