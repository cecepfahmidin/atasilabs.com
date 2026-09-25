import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { INITIAL_LEADS } from '@/data/initialData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Primary: fetch from Supabase HTTPS REST API
    const { data: sbLeads, error: sbError } = await supabase
      .from('Lead')
      .select('*')
      .order('createdAt', { ascending: false });

    if (!sbError && sbLeads && sbLeads.length > 0) {
      return NextResponse.json({ success: true, data: sbLeads, fallback: false });
    }

    // 2. Fallback: Try Prisma DB query
    try {
      const leads = await prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (leads && leads.length > 0) {
        return NextResponse.json({ success: true, data: leads, fallback: false });
      }
    } catch (prismaErr) {
      console.warn('Prisma DB query failed for leads:', prismaErr);
    }

    // Static fallback only if query failed and DB returns no leads
    return NextResponse.json({ success: true, data: INITIAL_LEADS, fallback: true });
  } catch (error) {
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

    let newLead: any;
    try {
      newLead = await prisma.lead.create({
        data: {
          name,
          email,
          company: company || 'Pribadi / Perorangan',
          serviceType: serviceType || 'Konsultasi Umum',
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
        company: company || 'Pribadi / Perorangan',
        serviceType: serviceType || 'Konsultasi Umum',
        budget: budget || 'Belum Ditentukan',
        message,
        status: 'NEW',
        createdAt: new Date().toISOString(),
      };
    }

    // Dual-sync to Supabase REST API
    try {
      if (newLead && newLead.id) {
        await supabase.from('Lead').upsert({
          id: newLead.id,
          name: newLead.name,
          email: newLead.email,
          company: newLead.company,
          serviceType: newLead.serviceType,
          budget: newLead.budget,
          message: newLead.message,
          status: newLead.status,
        });
      }
    } catch (sbErr) {
      console.error('Supabase Lead POST error:', sbErr);
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

    let updated: any;
    try {
      updated = await prisma.lead.update({
        where: { id },
        data: { status },
      });
    } catch (dbErr) {
      updated = { id, status };
    }

    // Dual-sync to Supabase REST API
    try {
      await supabase.from('Lead').upsert({ id, status });
    } catch (sbErr) {
      console.error('Supabase Lead PATCH error:', sbErr);
    }

    return NextResponse.json({ success: true, data: updated });
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

    try {
      await supabase.from('Lead').delete().eq('id', id);
    } catch (sbErr) {
      console.error('Supabase Lead DELETE error:', sbErr);
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}

