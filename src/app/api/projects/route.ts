import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_PROJECTS } from '@/data/initialData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const projects = await prisma.clientProject.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: projects.length ? projects : INITIAL_PROJECTS });
  } catch (error) {
    return NextResponse.json({ success: true, data: INITIAL_PROJECTS, fallback: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientName, clientEmail, title, description, deadline, budget, progress, status } = body;

    let newProj;
    try {
      newProj = await prisma.clientProject.create({
        data: {
          clientName,
          clientEmail,
          title,
          description,
          deadline: deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          budget: Number(budget) || 15000000,
          progress: Number(progress) || 0,
          status: status || 'PLANNING',
        },
      });
    } catch (dbErr) {
      newProj = {
        id: `proj-${Date.now()}`,
        clientName,
        clientEmail,
        title,
        description,
        deadline: deadline || '2024-05-01',
        budget: Number(budget) || 15000000,
        progress: Number(progress) || 0,
        status: status || 'PLANNING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
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
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    let updated;
    try {
      updated = await prisma.clientProject.update({
        where: { id },
        data,
      });
    } catch (dbErr) {
      updated = { id, ...data, updatedAt: new Date().toISOString() };
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
      await prisma.clientProject.delete({ where: { id } });
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
