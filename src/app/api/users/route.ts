import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_USERS } from '@/data/initialData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, data: items || [] });
  } catch (error) {
    console.warn('Prisma DB query failed for users:', error);
    return NextResponse.json({ success: true, data: INITIAL_USERS, fallback: true });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, role, avatarUrl, company, phone, status, password, bio, tagline, titleBadge } = body;

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
          bio: bio || '',
          tagline: tagline || '',
          titleBadge: titleBadge || '',
        } as any,
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
        bio: bio || '',
        tagline: tagline || '',
        titleBadge: titleBadge || '',
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
