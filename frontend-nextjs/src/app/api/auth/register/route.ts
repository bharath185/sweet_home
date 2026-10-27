import { NextRequest, NextResponse } from 'next/server';
import { findUserInDb, upsertUserInDb } from '@/lib/supabaseDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, password } = body;

    const cleanName = (name || '').trim();
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPhone || !cleanName) {
      return NextResponse.json(
        { success: false, error: 'Name, mobile phone number, and email are required.' },
        { status: 400 }
      );
    }

    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { success: false, error: 'A valid 10-digit mobile phone number is mandatory.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const isGmail = cleanEmail.endsWith('@gmail.com') || cleanEmail.endsWith('@googlemail.com');
    if (!isGmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Non-Gmail addresses require email OTP verification. Please verify your email with the 6-digit code.',
        },
        { status: 403 }
      );
    }

    // 1. Check if email or phone already registered in Supabase
    const existing = await findUserInDb(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account is already registered with this email address. Please switch to Sign In.' },
        { status: 409 }
      );
    }

    const existingPhone = await findUserInDb(cleanPhone);
    if (existingPhone) {
      return NextResponse.json(
        { success: false, error: 'An account is already registered with this mobile number. Please switch to Sign In.' },
        { status: 409 }
      );
    }

    // 2. Compute 48-Hour Free Trial window
    const now = new Date();
    const trialDurationMs = 48 * 60 * 60 * 1000;
    const trialStartedAt = now.toISOString();
    const trialExpiresAt = new Date(now.getTime() + trialDurationMs).toISOString();

    const newUser = await upsertUserInDb({
      id: `u_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password_hash: cleanPassword,
      role: 'DESIGNER',
      payment_status: 'paid', // Active free trial counts as paid access
      plan: 'trial_48h',
      trial_started_at: trialStartedAt,
      trial_expires_at: trialExpiresAt,
      expires_at: trialExpiresAt,
      is_free_trial: true,
      has_completed_trial: false,
    });

    if (!newUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to create user in database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'Account created with 48-Hour Free Trial!',
      trialExpiresAt,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
