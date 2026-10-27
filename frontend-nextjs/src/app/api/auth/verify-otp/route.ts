import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/emailOtpService';
import { upsertUserInDb, findUserInDb } from '@/lib/supabaseDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, name, phone, password } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = (otp || '').trim().replace(/\s/g, '');

    if (!cleanEmail || !cleanOtp) {
      return NextResponse.json(
        { success: false, error: 'Email and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    // Verify OTP against Supabase cloud database / server store
    const check = await verifyOtp(cleanEmail, cleanOtp);
    if (!check.valid) {
      return NextResponse.json(
        { success: false, error: check.error || 'Invalid or expired verification code.' },
        { status: 400 }
      );
    }

    // If registration payload provided, create user account in Supabase
    const cleanName = (name || '').trim();
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanPassword = (password || '').trim();

    if (cleanPassword) {
      if (!cleanPhone || cleanPhone.length !== 10) {
        return NextResponse.json(
          { success: false, error: 'A valid 10-digit mobile phone number is mandatory to create an account.' },
          { status: 400 }
        );
      }

      const existingPhone = await findUserInDb(cleanPhone);
      if (existingPhone && existingPhone.email?.toLowerCase() !== cleanEmail) {
        return NextResponse.json(
          { success: false, error: 'An account is already registered with this mobile number. Please switch to Sign In.' },
          { status: 409 }
        );
      }

      const now = new Date();
      const trialDurationMs = 48 * 60 * 60 * 1000;
      const trialStartedAt = now.toISOString();
      const trialExpiresAt = new Date(now.getTime() + trialDurationMs).toISOString();

      const user = await upsertUserInDb({
        id: `u_${Date.now()}`,
        name: cleanName || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: cleanPhone || null,
        password_hash: cleanPassword,
        role: 'DESIGNER',
        payment_status: 'paid',
        plan: 'trial_48h',
        trial_started_at: trialStartedAt,
        trial_expires_at: trialExpiresAt,
        expires_at: trialExpiresAt,
        is_free_trial: true,
        has_completed_trial: false,
      });

      return NextResponse.json({
        success: true,
        message: 'Email verified and account created successfully!',
        user,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email verification code verified successfully.',
    });
  } catch (error: any) {
    console.error('[verify-otp] Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Verification failed.' },
      { status: 500 }
    );
  }
}
