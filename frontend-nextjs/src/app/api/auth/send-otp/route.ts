import { NextRequest, NextResponse } from 'next/server';
import { generateOtpCode, storeOtp, sendOtpEmail } from '@/lib/emailOtpService';
import { findUserInDb } from '@/lib/supabaseDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, phone } = body;

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanName = (name || '').trim();

    if (!cleanEmail) {
      return NextResponse.json(
        { success: false, error: 'Email address is required.' },
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

    // Check if user is already registered with this email
    const existing = await findUserInDb(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account is already registered with this email. Please switch to Sign In.' },
        { status: 409 }
      );
    }

    // Generate real-time 6-digit OTP code
    const otpCode = generateOtpCode();

    // Store securely on server and Supabase Database with 10-minute expiry
    await storeOtp(cleanEmail, otpCode, cleanName, cleanPhone);

    // Dispatch real-time email
    const result = await sendOtpEmail(cleanEmail, otpCode, cleanName);

    // Return response WITHOUT leaking the OTP code
    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your inbox.`,
      dispatched: result.success,
    });
  } catch (error: any) {
    console.error('[send-otp] Error dispatching OTP:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to dispatch email verification code.' },
      { status: 500 }
    );
  }
}
