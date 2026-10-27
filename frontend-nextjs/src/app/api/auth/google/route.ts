import { NextRequest, NextResponse } from 'next/server';
import { findUserInDb, upsertUserInDb } from '@/lib/supabaseDb';

export const dynamic = 'force-dynamic';

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '394367748205-dcmca6ria2rqm9ligb38ojp85ib7khqo.apps.googleusercontent.com';

interface GoogleTokenInfo {
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
  sub?: string;
  error_description?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { credential, phone } = body;

    if (!credential) {
      return NextResponse.json(
        { success: false, error: 'Google credential token is required.' },
        { status: 400 }
      );
    }

    // 1. Verify credential token with Google OAuth TokenInfo API
    const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
    const googleRes = await fetch(verifyUrl, { method: 'GET' });
    const tokenInfo: GoogleTokenInfo = await googleRes.json();

    if (!googleRes.ok || !tokenInfo.email || tokenInfo.error_description) {
      return NextResponse.json(
        {
          success: false,
          error: tokenInfo.error_description || 'Invalid or expired Google authentication credential.',
        },
        { status: 401 }
      );
    }

    // Verify audience matches our Client ID
    if (tokenInfo.aud && tokenInfo.aud !== GOOGLE_CLIENT_ID) {
      console.warn('[GoogleAuth] Audience mismatch:', tokenInfo.aud, 'expected:', GOOGLE_CLIENT_ID);
    }

    const cleanEmail = (tokenInfo.email || '').trim().toLowerCase();
    const isGmail = cleanEmail.endsWith('@gmail.com') || cleanEmail.endsWith('@googlemail.com');

    // 2. Strict Domain Check: Personal Gmail ONLY!
    // Block Business / Google Workspace accounts
    if (!isGmail) {
      return NextResponse.json(
        {
          success: false,
          isBusinessEmail: true,
          email: cleanEmail,
          error:
            'Google Social Login is only allowed for personal @gmail.com accounts. Business/work email users must register using the Email OTP verification form.',
        },
        { status: 403 }
      );
    }

    const cleanName = (tokenInfo.name || cleanEmail.split('@')[0]).trim();
    const cleanPhone = (phone || '').replace(/\D/g, '');

    // 3. Check existing user in database
    const existing = await findUserInDb(cleanEmail);

    // If existing user already has a valid phone, or phone wasn't provided yet
    if (existing && existing.phone && existing.phone.length === 10) {
      return NextResponse.json({
        success: true,
        user: existing,
        message: 'Welcome back! Signed in with Google.',
      });
    }

    // 4. Mandatory Mobile Phone check for new users or existing users without phone
    if (!cleanPhone || cleanPhone.length !== 10) {
      return NextResponse.json({
        success: true,
        needsPhone: true,
        email: cleanEmail,
        name: cleanName,
        message: 'Mobile number is mandatory. Please provide your 10-digit mobile number to complete registration.',
      });
    }

    // 5. Check if the provided phone is already registered to a DIFFERENT email
    const existingPhone = await findUserInDb(cleanPhone);
    if (existingPhone && existingPhone.email?.toLowerCase() !== cleanEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'An account is already registered with this mobile number under a different email. Please switch to Sign In.',
        },
        { status: 409 }
      );
    }

    // 6. Create or update user in Supabase DB with 48h trial
    const now = new Date();
    const trialDurationMs = 48 * 60 * 60 * 1000;
    const trialStartedAt = existing?.trial_started_at || now.toISOString();
    const trialExpiresAt = existing?.trial_expires_at || new Date(now.getTime() + trialDurationMs).toISOString();

    const user = await upsertUserInDb({
      id: existing?.id || `u_g_${tokenInfo.sub || Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password_hash: existing?.password_hash || `google_oauth_${tokenInfo.sub || Date.now()}`,
      role: existing?.role || (cleanEmail.includes('admin') ? 'ADMIN' : 'DESIGNER'),
      payment_status: existing?.payment_status || 'paid',
      plan: existing?.plan || 'trial_48h',
      paid_at: existing?.paid_at || now.toISOString(),
      expires_at: existing?.expires_at || trialExpiresAt,
      trial_started_at: trialStartedAt,
      trial_expires_at: trialExpiresAt,
      is_free_trial: existing?.is_free_trial ?? true,
      has_completed_trial: existing?.has_completed_trial ?? false,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Failed to save user in database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
      message: 'Account verified with Google & 48-Hour Free Trial activated!',
    });
  } catch (error: any) {
    console.error('[GoogleAuth] Error handling Google sign-in:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Google authentication failed.' },
      { status: 500 }
    );
  }
}
