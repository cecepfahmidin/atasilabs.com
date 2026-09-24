import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { INITIAL_PROJECTS } from '@/data/initialData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let projects = await (prisma as any).clientProject.findMany({
      orderBy: { createdAt: 'desc' },
    });
    if (!projects || projects.length === 0) {
      try {
        await Promise.all(
          INITIAL_PROJECTS.map((p) =>
            (prisma as any).clientProject.upsert({
              where: { id: p.id },
              update: {},
              create: {
                id: p.id,
                clientName: p.clientName || '',
                clientEmail: p.clientEmail || '',
                clientPhone: p.clientPhone || '',
                clientCompany: p.clientCompany || '',
                title: p.title || '',
                description: p.description || '',
                deadline: p.deadline || '2024-05-30',
                budget: Number(p.budget) || 15000000,
                progress: Number(p.progress) || 0,
                status: p.status || 'PLANNING',
                ipwStage: p.ipwStage || 'STAGE_1_DISCOVERY',
                tierNumber: Number(p.tierNumber) || 1,
                freelancerName: p.freelancerName || '',
                freelancerFee: p.freelancerFee ? Number(p.freelancerFee) : null,
                isArchived: Boolean(p.isArchived),
                payments: p.payments || [],
                totalPaid: p.totalPaid ? Number(p.totalPaid) : 0,
              },
            })
          )
        );
        projects = await (prisma as any).clientProject.findMany({
          orderBy: { createdAt: 'desc' },
        });
      } catch (seedErr) {
        console.error('Projects initial seed error:', seedErr);
      }
    }
    const formatted = (projects && projects.length > 0 ? projects : INITIAL_PROJECTS).map((p: any) => ({
      ...p,
      payments: Array.isArray(p.payments)
        ? p.payments
        : typeof p.payments === 'string'
        ? JSON.parse(p.payments)
        : [],
      totalPaid: p.totalPaid !== null && p.totalPaid !== undefined ? Number(p.totalPaid) : 0,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      fallback: false,
    });
  } catch (error) {
    return NextResponse.json({ success: true, data: INITIAL_PROJECTS, fallback: true });
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

    let newProj;
    try {
      newProj = await (prisma as any).clientProject.create({
        data: {
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
        },
      });
    } catch (dbErr) {
      newProj = {
        id: `proj-${Date.now()}`,
        clientName,
        clientEmail,
        clientPhone,
        clientCompany,
        title,
        description,
        deadline: deadline || '2024-05-01',
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Dual sync to Supabase REST API
    try {
      if (newProj && newProj.id) {
        await supabase.from('ClientProject').upsert({
          id: newProj.id,
          clientName: newProj.clientName,
          clientEmail: newProj.clientEmail,
          clientPhone: newProj.clientPhone,
          clientCompany: newProj.clientCompany,
          title: newProj.title,
          description: newProj.description,
          deadline: newProj.deadline,
          budget: newProj.budget,
          progress: newProj.progress,
          status: newProj.status,
          ipwStage: newProj.ipwStage,
          tierNumber: newProj.tierNumber,
          freelancerName: newProj.freelancerName,
          freelancerFee: newProj.freelancerFee,
          isArchived: newProj.isArchived,
          payments: newProj.payments || [],
          totalPaid: newProj.totalPaid || 0,
        });
      }
    } catch (sbErr) {
      console.error('Supabase direct POST upsert error:', sbErr);
    }

    return NextResponse.json({ success: true, data: newProj });
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

    const prismaUpdateData: any = {};
    if (clientName !== undefined) prismaUpdateData.clientName = clientName;
    if (clientEmail !== undefined) prismaUpdateData.clientEmail = clientEmail;
    if (clientPhone !== undefined) prismaUpdateData.clientPhone = clientPhone;
    if (clientCompany !== undefined) prismaUpdateData.clientCompany = clientCompany;
    if (title !== undefined) prismaUpdateData.title = title;
    if (description !== undefined) prismaUpdateData.description = description;
    if (deadline !== undefined) prismaUpdateData.deadline = deadline;
    if (budget !== undefined) prismaUpdateData.budget = Number(budget);
    if (progress !== undefined) prismaUpdateData.progress = Number(progress);
    if (status !== undefined) prismaUpdateData.status = status;
    if (ipwStage !== undefined) prismaUpdateData.ipwStage = ipwStage;
    if (tierNumber !== undefined) prismaUpdateData.tierNumber = Number(tierNumber);
    if (freelancerName !== undefined) prismaUpdateData.freelancerName = freelancerName;
    if (freelancerFee !== undefined) prismaUpdateData.freelancerFee = freelancerFee !== null ? Number(freelancerFee) : null;
    if (isArchived !== undefined) prismaUpdateData.isArchived = Boolean(isArchived);
    if (payments !== undefined) prismaUpdateData.payments = payments;
    if (totalPaid !== undefined) prismaUpdateData.totalPaid = Number(totalPaid);

    let updated;
    try {
      updated = await (prisma as any).clientProject.upsert({
        where: { id },
        update: prismaUpdateData,
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
          ...prismaUpdateData,
        },
      });
    } catch (dbErr) {
      console.error('DB Upsert project error:', dbErr);
      updated = { id, ...body, updatedAt: new Date().toISOString() };
    }

    // Dual sync to Supabase REST API
    try {
      await supabase.from('ClientProject').upsert({
        id,
        ...prismaUpdateData,
      });
    } catch (sbErr) {
      console.error('Supabase direct PATCH upsert error:', sbErr);
    }

    return NextResponse.json({ success: true, data: updated });
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
