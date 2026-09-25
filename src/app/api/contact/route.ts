import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

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

    return NextResponse.json({ success: true, data: null, fallback: false });
  } catch (error) {
    return NextResponse.json({ success: true, data: null, fallback: false });
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
          companyName: fields.companyName || 'Atasi Labs',
          brandName: fields.brandName || 'Atasi Labs Studio',
          tagline: fields.tagline || 'Enterprise Web & AI Studio',
          email: fields.email || 'contact@atasilabs.com',
          whatsappNumber: fields.whatsappNumber || '6281234567890',
          address: fields.address || 'Jakarta, Indonesia',
          operatingHours: fields.operatingHours || 'Senin - Jumat: 09:00 - 17:00 WIB',
          googleMapsUrl: fields.googleMapsUrl || '',
          socialLinks: fields.socialLinks || {},
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
