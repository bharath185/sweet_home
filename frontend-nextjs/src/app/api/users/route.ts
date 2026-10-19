import { NextRequest, NextResponse } from 'next/server';
import { getUserPaymentStatus } from '@/lib/paymentStore';
import { getAllUsersFromDb, deleteUserInDb } from '@/lib/supabaseDb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const DEFAULT_USERS = [
  {
    id: 'admin_visual',
    name: 'Superadmin',
    email: 'admin@visualrendered.io',
    phone: '',
    role: 'ADMIN',
    isOnline: true,
    assignedPlan: 'plan-sarah-suite',
    plan: 'yearly',
    createdAt: 'Lifetime',
    expires_at: '2099-12-31T23:59:59.999Z',
    trial_expires_at: '',
    payment_status: 'paid' as const,
  },
];

export async function GET() {
  const dbUsers = await getAllUsersFromDb();
  if (dbUsers && dbUsers.length > 0) {
    // Filter out old legacy admin accounts (e.g. admin@sweethome3d.io, admin@decoforge3d.io)
    const filteredDbUsers = dbUsers.filter(
      (u) => {
        const em = (u.email || '').toLowerCase();
        return em !== 'admin@sweethome3d.io' && em !== 'admin@decoforge3d.io';
      }
    );

    // Normalize roles: only admin@visualrendered.io is ADMIN, all other users are CUSTOMER
    const normalizedUsers = filteredDbUsers.map((u) => {
      const isSuper = (u.email || '').toLowerCase() === 'admin@visualrendered.io';
      return {
        id: u.id,
        name: isSuper ? 'Superadmin' : u.name,
        email: u.email,
        phone: u.phone,
        role: isSuper ? 'ADMIN' : 'CUSTOMER',
        isOnline: isSuper,
        payment_status: isSuper ? 'paid' : (u.payment_status || 'unpaid'),
        plan: isSuper ? 'yearly' : u.plan,
        createdAt: u.created_at || 'Recently',
        expires_at: isSuper ? '2099-12-31T23:59:59.999Z' : u.expires_at,
        trial_expires_at: u.trial_expires_at,
      };
    });

    // Ensure the single superadmin is always present
    const hasSuperAdmin = normalizedUsers.some(
      (u) => (u.email || '').toLowerCase() === 'admin@visualrendered.io'
    );
    if (!hasSuperAdmin) {
      normalizedUsers.unshift(DEFAULT_USERS[0]);
    }

    return NextResponse.json(normalizedUsers, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
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
