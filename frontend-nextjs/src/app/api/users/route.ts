import { NextRequest, NextResponse } from 'next/server';
import { getUserPaymentStatus } from '@/lib/paymentStore';

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
  {
    id: 'u3',
    name: 'David Miller',
    email: 'david.miller@interiors.com',
    role: 'DESIGNER',
    isOnline: true,
    assignedPlan: 'plan-david-villa',
    createdAt: '3 days ago',
    payment_status: 'unpaid',
  },
  {
    id: 'u4',
    name: 'Emma Watson',
    email: 'emma.watson@modernhome.org',
    role: 'CLIENT',
    isOnline: false,
    assignedPlan: 'plan-sarah-suite',
    createdAt: '1 week ago',
    payment_status: 'unpaid',
  },
];

export async function GET() {
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
