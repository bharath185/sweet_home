import { NextRequest, NextResponse } from 'next/server';
import {
  getUserPaymentStatus,
  setUserPaymentStatus,
  isSubscriptionActive,
  getEffectivePaymentStatus,
  startOrGet48HourFreeTrial,
} from '@/lib/paymentStore';
import { findUserInDb, upsertUserInDb } from '@/lib/supabaseDb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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

    // 1. Try querying Supabase first for persistent cross-device truth
    let record: any = null;
    const lookupKey = email || userId || '';
    const dbUser = await findUserInDb(lookupKey);
    if (dbUser) {
      record = dbUser;
      // Populate local memory cache
      setUserPaymentStatus(dbUser);
    } else {
      record = getUserPaymentStatus({ userId, email });
    }

    // 2. If user is Admin (by role or seed email)
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
        isFreeTrial: false,
      });
    }

    // 3. If non-admin user is logging in and has no record yet -> Grant 48-Hour Free Trial!
    if (!record) {
      record = startOrGet48HourFreeTrial({
        userId,
        email,
        role: 'DESIGNER',
      });
      // Persist in Supabase immediately
      await upsertUserInDb({
        ...record,
        email: email || `${userId}@user.local`,
      });
    }

    const effectiveStatus = getEffectivePaymentStatus(record);
    const hasAccess = isSubscriptionActive(record);
    const isTrialActive = Boolean(
      record.is_free_trial &&
      record.trial_expires_at &&
      Date.now() < new Date(record.trial_expires_at).getTime()
    );

    return NextResponse.json({
      success: true,
      user: {
        ...record,
        payment_status: effectiveStatus,
      },
      isPaid: hasAccess,
      isAdmin: false,
      canAccessStudio: hasAccess,
      isFreeTrial: isTrialActive,
      trialExpiresAt: record.trial_expires_at,
      hasCompletedTrial: record.has_completed_trial || false,
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
    const { userId, email, name, role, payment_status, plan, action, is_free_trial, trial_started_at, trial_expires_at } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'Missing userId or email in request body' },
        { status: 400 }
      );
    }

    if (action === 'start_trial' || is_free_trial) {
      const trialRecord = startOrGet48HourFreeTrial({
        userId,
        email,
        name,
        role,
      });
      await upsertUserInDb({
        ...trialRecord,
        email: email || `${userId}@user.local`,
      });
      return NextResponse.json({
        success: true,
        user: trialRecord,
        isPaid: isSubscriptionActive(trialRecord),
        isFreeTrial: true,
        trialExpiresAt: trialRecord.trial_expires_at,
      });
    }

    const updated = setUserPaymentStatus({
      userId,
      email,
      name,
      role,
      payment_status: payment_status || 'unpaid',
      plan,
      trial_started_at,
      trial_expires_at,
      is_free_trial,
    });

    await upsertUserInDb({
      ...updated,
      email: email || `${userId}@user.local`,
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
