import { NextRequest, NextResponse } from 'next/server';
import { findUserInDb } from '@/lib/supabaseDb';
import { verifyOtp } from '@/lib/emailOtpService';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, otp, newPassword } = body;

    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanOtp = (otp || '').trim().replace(/\s/g, '');
    const cleanPass = (newPassword || '').trim();

    if (!cleanId || !cleanOtp || !cleanPass) {
      return NextResponse.json(
        { success: false, error: 'Identifier, verification code, and new password are required.' },
        { status: 400 }
      );
    }

    if (cleanPass.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // 1. Verify user exists
    const user = await findUserInDb(cleanId);
    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, error: 'Account not found.' },
        { status: 404 }
      );
    }

    // 2. Verify OTP
    const otpResult = await verifyOtp(user.email, cleanOtp);
    if (!otpResult.valid) {
      return NextResponse.json(
        { success: false, error: otpResult.error || 'Invalid or expired verification code.' },
        { status: 400 }
      );
    }

    // 3. Update password in Supabase database
    const admin = getSupabaseAdmin();
    if (admin) {
      const { error: updateError } = await admin
        .from('users')
        .update({
          password_hash: cleanPass,
          updated_at: new Date().toISOString(),
        })
        .eq('email', user.email);

      if (updateError) {
        console.error('[ResetPassword] Supabase update error:', updateError);
        return NextResponse.json(
          { success: false, error: 'Database update failed. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.',
    });
  } catch (err: any) {
    console.error('[ResetPassword] API Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to reset password.' },
      { status: 500 }
    );
  }
}
