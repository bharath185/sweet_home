import { NextRequest, NextResponse } from 'next/server';
import { getUserPaymentStatus } from '@/lib/paymentStore';
import { getAllUsersFromDb, deleteUserInDb } from '@/lib/supabaseDb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const DEFAULT_USERS = [
  {
    id: 'admin_1',
    name: 'Studio Superadmin',
    email: 'admin@sweethome3d.io',
    role: 'ADMIN',
    isOnline: true,
    assignedPlan: 'plan-sarah-suite',
    createdAt: 'Lifetime',
    payment_status: 'paid',
  },
  {
    id: 'admin_2',
    name: 'Lead Architect Admin',
    email: 'admin@visualrendered.io',
    role: 'ADMIN',
    isOnline: true,
    assignedPlan: 'plan-sarah-suite',
    createdAt: 'Lifetime',
    payment_status: 'paid',
  },
];

export async function GET() {
  const dbUsers = await getAllUsersFromDb();
  if (dbUsers && dbUsers.length > 0) {
    return NextResponse.json(
      dbUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        isOnline: false,
        payment_status: u.payment_status,
        plan: u.plan,
        createdAt: u.created_at || 'Recently',
        expires_at: u.expires_at,
        trial_expires_at: u.trial_expires_at,
      })),
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  }

  const usersWithPayment = DEFAULT_USERS.map((u) => {
    const status = getUserPaymentStatus({ userId: u.id, email: u.email });
    return {
      ...u,
      payment_status: status?.payment_status || u.payment_status || 'unpaid',
      plan: status?.plan || null,
      expires_at: status?.expires_at || null,
    };
  });

  return NextResponse.json(usersWithPayment, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    },
  });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const ok = await deleteUserInDb(id);
  if (!ok) {
    return NextResponse.json({ error: 'Failed to delete user from database' }, { status: 500 });
  }
  return NextResponse.json({ success: true, id });
}
