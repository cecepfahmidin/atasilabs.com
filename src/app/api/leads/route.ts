import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Primary: fetch from Supabase HTTPS REST API
    const { data: sbLeads, error: sbError } = await supabase
      .from('Lead')
      .select('*')
      .order('createdAt', { ascending: false });

    if (!sbError && sbLeads) {
      return NextResponse.json({ success: true, data: sbLeads, fallback: false });
    }

    // 2. Fallback: Try Prisma DB query
    try {
      const leads = await prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (leads) {
        return NextResponse.json({ success: true, data: leads, fallback: false });
      }
    } catch (prismaErr) {
      console.warn('Prisma DB query failed for leads:', prismaErr);
    }

    return NextResponse.json({ success: true, data: [], fallback: false });
  } catch (error) {
    return NextResponse.json({ success: true, data: [], fallback: false });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, serviceType, budget, message } = body;

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
          phone: phone || null,
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
        phone: phone || null,
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
          phone: newLead.phone || phone || null,
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
    const { id, status, phone, name, email, company, serviceType, budget, message } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (phone !== undefined) updateData.phone = phone;
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (company !== undefined) updateData.company = company;
    if (serviceType !== undefined) updateData.serviceType = serviceType;
    if (budget !== undefined) updateData.budget = budget;
    if (message !== undefined) updateData.message = message;

    let updated: any;
    try {
      updated = await prisma.lead.update({
        where: { id },
        data: updateData,
      });
    } catch (dbErr) {
      updated = { id, ...updateData };
    }

    // Dual-sync to Supabase REST API
    try {
      await supabase.from('Lead').upsert({ id, ...updateData });
    } catch (sbErr) {
      console.error('Supabase Lead PATCH error:', sbErr);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update lead' },
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

