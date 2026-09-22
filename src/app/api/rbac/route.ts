import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DEFAULT_ROLE_PERMISSIONS } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const item = await prisma.rbacMatrix.findUnique({
      where: { id: 'singleton-rbac' },
    });

    if (!item || !item.permissions) {
      try {
        const seeded = await prisma.rbacMatrix.upsert({
          where: { id: 'singleton-rbac' },
          update: { permissions: DEFAULT_ROLE_PERMISSIONS as any },
          create: {
            id: 'singleton-rbac',
            permissions: DEFAULT_ROLE_PERMISSIONS as any,
          },
        });
        return NextResponse.json({ success: true, data: seeded.permissions });
      } catch (seedErr) {
        return NextResponse.json({ success: true, data: DEFAULT_ROLE_PERMISSIONS, fallback: true });
      }
    }

    return NextResponse.json({ success: true, data: item.permissions, fallback: false });
  } catch (error) {
    return NextResponse.json({ success: true, data: DEFAULT_ROLE_PERMISSIONS, fallback: true });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { permissions } = body;

    if (!permissions) {
      return NextResponse.json({ success: false, error: 'Permissions object is required' }, { status: 400 });
    }

    let updated;
    try {
      updated = await prisma.rbacMatrix.upsert({
        where: { id: 'singleton-rbac' },
        update: { permissions: permissions as any },
        create: {
          id: 'singleton-rbac',
          permissions: permissions as any,
        },
      });
    } catch (dbErr) {
      updated = { id: 'singleton-rbac', permissions };
    }

    return NextResponse.json({ success: true, data: updated.permissions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update RBAC matrix' },
      { status: 500 }
    );
  }
}
