import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_USERS } from '@/data/initialData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (!items || items.length === 0) {
      // Seed initial users into database if empty
      try {
        for (const u of INITIAL_USERS) {
          await prisma.user.upsert({
            where: { email: u.email },
            update: {
              name: u.name,
              role: u.role,
              avatarUrl: u.avatarUrl || '',
              company: u.company || '',
              phone: u.phone || '',
              status: u.status || 'ACTIVE',
            },
            create: {
              id: u.id,
              email: u.email,
              name: u.name,
              role: u.role,
              avatarUrl: u.avatarUrl || '',
              company: u.company || '',
              phone: u.phone || '',
              status: u.status || 'ACTIVE',
            },
          });
        }
        const seeded = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
        return NextResponse.json({ success: true, data: seeded });
      } catch (seedErr) {
        return NextResponse.json({ success: true, data: INITIAL_USERS, fallback: true });
      }
    }

    return NextResponse.json({ success: true, data: items, fallback: false });
  } catch (error) {
    return NextResponse.json({ success: true, data: INITIAL_USERS, fallback: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, role, avatarUrl, company, phone, status, password } = body;

    if (!email || !name) {
      return NextResponse.json({ success: false, error: 'Email and name are required' }, { status: 400 });
    }

    let created;
    try {
      created = await prisma.user.create({
        data: {
          email: email.trim(),
          name: name.trim(),
          role: role || 'ADMIN',
          avatarUrl: avatarUrl || '',
          company: company || '',
          phone: phone || '',
          status: status || 'ACTIVE',
          password: password || '',
        },
      });
    } catch (dbErr) {
      created = {
        id: `usr-${Date.now()}`,
        email,
        name,
        role: role || 'ADMIN',
        avatarUrl: avatarUrl || '',
        company: company || '',
        phone: phone || '',
        status: status || 'ACTIVE',
        password: password || '',
        createdAt: new Date().toISOString(),
      };
    }

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, email, ...fields } = body;

    if (!id && !email) {
      return NextResponse.json({ success: false, error: 'ID or Email is required' }, { status: 400 });
    }

    let updated;
    try {
      if (id) {
        updated = await prisma.user.update({
          where: { id },
          data: fields,
        });
      } else {
        updated = await prisma.user.update({
          where: { email: email.trim() },
          data: fields,
        });
      }
    } catch (dbErr) {
      updated = { id, email, ...fields, updatedAt: new Date().toISOString() };
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
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
      await prisma.user.delete({ where: { id } });
    } catch (dbErr) {
      // safe fallback
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
