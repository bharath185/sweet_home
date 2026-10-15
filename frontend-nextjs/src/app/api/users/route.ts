import { NextRequest, NextResponse } from 'next/server';
import { getUserPaymentStatus } from '@/lib/paymentStore';
import { getAllUsersFromDb } from '@/lib/supabaseDb';

export const dynamic = 'force-dynamic';

const DEFAULT_USERS = [
  {
    id: 'u1',
    name: 'Admin Superuser',
    email: 'admin@sweethome3d.io',
    role: 'ADMIN',
    isOnline: true,
    assignedPlan: 'plan-sarah-suite',
    createdAt: 'Today',
    payment_status: 'paid',
  },
  {
    id: 'u2',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@designstudio.in',
    role: 'DESIGNER',
    isOnline: false,
    assignedPlan: 'plan-sarah-suite',
    createdAt: 'Yesterday',
    payment_status: 'unpaid',
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
      }))
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

  return NextResponse.json(usersWithPayment);
}
