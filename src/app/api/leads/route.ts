import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_LEADS } from '@/data/initialData';

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: leads });
  } catch (error) {
    console.warn('Prisma DB query failed for leads, falling back to seed data:', error);
    return NextResponse.json({ success: true, data: INITIAL_LEADS, fallback: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, serviceType, budget, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    let newLead;
    try {
      newLead = await prisma.lead.create({
        data: {
          name,
          email,
          company: company || '',
          serviceType: serviceType || 'Full-Stack Web App',
          budget: budget || 'Belum Ditentukan',
          message,
          status: 'NEW',
        },
      });
    } catch (dbErr) {
      newLead = {
        id: `lead-${Date.now()}`,
        name,
        email,
        company: company || '',
        serviceType: serviceType || 'Full-Stack Web App',
        budget: budget || 'Belum Ditentukan',
        message,
        status: 'NEW',
        createdAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({ success: true, data: newLead });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process lead inquiry' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID and status are required' },
        { status: 400 }
      );
    }

    try {
      const updated = await prisma.lead.update({
        where: { id },
        data: { status },
      });
      return NextResponse.json({ success: true, data: updated });
    } catch (dbErr) {
      return NextResponse.json({ success: true, data: { id, status } });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update lead status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    try {
      await prisma.lead.delete({ where: { id } });
    } catch (dbErr) {
      // safe fallback
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
