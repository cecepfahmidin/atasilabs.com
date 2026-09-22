import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_COMPANY_CONTACT } from '@/data/initialData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const contact = await prisma.companyContact.findUnique({
      where: { id: 'singleton-contact' },
    });

    if (!contact) {
      try {
        const seeded = await prisma.companyContact.upsert({
          where: { id: 'singleton-contact' },
          update: INITIAL_COMPANY_CONTACT,
          create: {
            id: 'singleton-contact',
            ...INITIAL_COMPANY_CONTACT,
          },
        });
        return NextResponse.json({ success: true, data: seeded });
      } catch (seedErr) {
        return NextResponse.json({ success: true, data: INITIAL_COMPANY_CONTACT, fallback: true });
      }
    }

    return NextResponse.json({ success: true, data: contact, fallback: false });
  } catch (error) {
    return NextResponse.json({ success: true, data: INITIAL_COMPANY_CONTACT, fallback: true });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...fields } = body;

    let updated;
    try {
      updated = await prisma.companyContact.upsert({
        where: { id: 'singleton-contact' },
        update: fields,
        create: {
          id: 'singleton-contact',
          ...INITIAL_COMPANY_CONTACT,
          ...fields,
        },
      });
    } catch (dbErr) {
      updated = { ...INITIAL_COMPANY_CONTACT, ...fields, updatedAt: new Date().toISOString() };
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update company contact info' },
      { status: 500 }
    );
  }
}
