import { NextRequest, NextResponse } from 'next/server';
import {
  getUserPaymentStatus,
  setUserPaymentStatus,
  isSubscriptionActive,
  getEffectivePaymentStatus,
} from '@/lib/paymentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || req.headers.get('x-user-id');
    const email = searchParams.get('email') || req.headers.get('x-user-email');
    const roleHeader = req.headers.get('x-user-role');

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'Missing userId or email parameter' },
        { status: 400 }
      );
    }

    const record = getUserPaymentStatus({ userId, email });

    // If user is Admin (by role or seed email)
    const isAdmin =
      roleHeader === 'ADMIN' ||
      record?.role === 'ADMIN' ||
      (email && (email.toLowerCase().includes('admin') || email.toLowerCase() === 'admin@sweethome3d.io'));

    if (isAdmin) {
      return NextResponse.json({
        success: true,
        user: {
          id: record?.id || userId || 'admin',
          email: record?.email || email || 'admin@sweethome.io',
          name: record?.name || 'Administrator',
          role: 'ADMIN',
          payment_status: 'paid',
          plan: 'yearly',
          paid_at: record?.paid_at || new Date().toISOString(),
          expires_at: '2099-12-31T23:59:59.999Z',
          cashfree_order_id: record?.cashfree_order_id || 'cf_admin',
          cashfree_payment_id: record?.cashfree_payment_id || 'cf_pay_admin',
        },
        isPaid: true,
        isAdmin: true,
        canAccessStudio: true,
      });
    }

    if (!record) {
      // Unpaid unknown user
      return NextResponse.json({
        success: true,
        user: {
          id: userId || 'anonymous',
          email: email || '',
          role: 'DESIGNER',
          payment_status: 'unpaid',
          plan: null,
          paid_at: null,
          expires_at: null,
          cashfree_order_id: null,
          cashfree_payment_id: null,
        },
        isPaid: false,
        isAdmin: false,
        canAccessStudio: false,
      });
    }

    const effectiveStatus = getEffectivePaymentStatus(record);
    const hasAccess = effectiveStatus === 'paid';

    return NextResponse.json({
      success: true,
      user: {
        ...record,
        payment_status: effectiveStatus,
      },
      isPaid: hasAccess,
      isAdmin: false,
      canAccessStudio: hasAccess,
    });
  } catch (error: any) {
    console.error('Error fetching user status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, name, role, payment_status, plan } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'Missing userId or email in request body' },
        { status: 400 }
      );
    }

    const updated = setUserPaymentStatus({
      userId,
      email,
      name,
      role,
      payment_status: payment_status || 'unpaid',
      plan,
    });

    return NextResponse.json({
      success: true,
      user: updated,
      isPaid: isSubscriptionActive(updated),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error updating user status' },
      { status: 500 }
    );
  }
}
