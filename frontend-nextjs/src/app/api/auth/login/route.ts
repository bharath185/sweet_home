import { NextRequest, NextResponse } from 'next/server';
import { findUserInDb, upsertUserInDb } from '@/lib/supabaseDb';
import { getEffectivePaymentStatus, isSubscriptionActive } from '@/lib/paymentStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    const cleanId = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanId || !cleanPass) {
      return NextResponse.json(
        { success: false, error: 'Identifier and password are required' },
        { status: 400 }
      );
    }

    // 1. Check Superadmin shortcut (single superadmin: admin@visualrendered.io)
    if (
      (cleanId.toLowerCase() === 'admin' || cleanId.toLowerCase() === 'admin@visualrendered.io') &&
      cleanPass.toLowerCase() === 'admin'
    ) {
      const email = 'admin@visualrendered.io';
      let adminRecord = await findUserInDb(email);
      if (!adminRecord) {
        adminRecord = await upsertUserInDb({
          id: 'admin_visual',
          email,
          name: 'Superadmin',
          role: 'ADMIN',
          payment_status: 'paid',
          plan: 'yearly',
          expires_at: '2099-12-31T23:59:59.999Z',
        });
      }
      return NextResponse.json({
        success: true,
        user: adminRecord,
        isPaid: true,
        isAdmin: true,
        canAccessStudio: true,
      });
    }

    // 2. Query Supabase for user by email or phone
    const user = await findUserInDb(cleanId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email or mobile number.' },
        { status: 404 }
      );
    }

    // 3. Verify password
    if (user.password_hash && user.password_hash !== cleanPass) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password. Please try again or request login credentials.' },
        { status: 401 }
      );
    }

    const effectiveStatus = getEffectivePaymentStatus(user);
    const hasAccess = isSubscriptionActive(user);

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        payment_status: effectiveStatus,
      },
      isPaid: hasAccess,
      isAdmin: user.role === 'ADMIN',
      canAccessStudio: hasAccess,
      trialExpiresAt: user.trial_expires_at,
      hasCompletedTrial: user.has_completed_trial || false,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
