import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';
import { INITIAL_COMPANY_CONTACT } from '@/data/initialData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Primary: fetch from Supabase HTTPS REST API
    const { data: sbContact, error: sbError } = await supabase
      .from('CompanyContact')
      .select('*')
      .eq('id', 'singleton-contact')
      .maybeSingle();

    if (!sbError && sbContact) {
      return NextResponse.json({ success: true, data: sbContact, fallback: false });
    }

    // 2. Fallback: Try Prisma DB query
    try {
      const contact = await prisma.companyContact.findUnique({
        where: { id: 'singleton-contact' },
      });
      if (contact) {
        return NextResponse.json({ success: true, data: contact, fallback: false });
      }
    } catch (prismaErr) {
      console.warn('Prisma query failed for contact:', prismaErr);
    }

    return NextResponse.json({ success: true, data: INITIAL_COMPANY_CONTACT, fallback: true });
  } catch (error) {
    return NextResponse.json({ success: true, data: INITIAL_COMPANY_CONTACT, fallback: true });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    const contactData = {
      id: 'singleton-contact',
      ...fields,
    };

    // Dual sync to Supabase REST API
    try {
      await supabase.from('CompanyContact').upsert(contactData);
    } catch (sbErr) {
      console.error('Supabase direct PUT contact error:', sbErr);
    }

    // Prisma update fallback
    try {
      await prisma.companyContact.upsert({
        where: { id: 'singleton-contact' },
        update: fields,
        create: {
          id: 'singleton-contact',
          ...INITIAL_COMPANY_CONTACT,
          ...fields,
        },
      });
    } catch (dbErr) {
      console.warn('Prisma contact upsert error:', dbErr);
    }

    return NextResponse.json({ success: true, data: contactData });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update company contact info' },
      { status: 500 }
    );
  }
}
