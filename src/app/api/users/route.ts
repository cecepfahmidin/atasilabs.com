import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: sbUsers, error: sbErr } = await supabase
      .from('User')
      .select('*')
      .order('createdAt', { ascending: true });

    if (!sbErr && sbUsers) {
      return NextResponse.json({ success: true, data: sbUsers, fallback: false });
    }

    const items = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, data: items || [], fallback: false });
  } catch (error) {
    console.warn('DB query failed for users:', error);
    return NextResponse.json({ success: true, data: [], fallback: false });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, role, avatarUrl, company, phone, status, password, bio, tagline, titleBadge } = body;

    if (!email || !name) {
      return NextResponse.json({ success: false, error: 'Email and name are required' }, { status: 400 });
    }

    const newUserData = {
      id: `usr-${Date.now()}`,
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
      createdAt: new Date().toISOString(),
    };

    try {
      await prisma.user.create({ data: newUserData as any });
    } catch (dbErr) {
      console.warn('Prisma user create note:', dbErr);
    }

    try {
      await supabase.from('User').upsert(newUserData, { onConflict: 'email' });
    } catch (sbErr) {
      console.error('Supabase user create error:', sbErr);
    }

    return NextResponse.json({ success: true, data: newUserData });
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

    const updatePayload = { ...fields, updatedAt: new Date().toISOString() };

    try {
      if (id) {
        await prisma.user.update({
          where: { id },
          data: updatePayload,
        });
      } else if (email) {
        await prisma.user.update({
          where: { email: email.trim() },
          data: updatePayload,
        });
      }
    } catch (dbErr) {
      console.warn('Prisma user update note:', dbErr);
    }

    // Dual-sync to Supabase REST API
    try {
      if (id) {
        await supabase.from('User').update(updatePayload).eq('id', id);
      } else if (email) {
        await supabase.from('User').update(updatePayload).eq('email', email.trim());
      }
    } catch (sbErr) {
      console.error('Supabase user update error:', sbErr);
    }

    return NextResponse.json({ success: true, data: { id, email, ...updatePayload } });
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
    } catch (dbErr) {}

    try {
      await supabase.from('User').delete().eq('id', id);
    } catch (sbErr) {}

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

