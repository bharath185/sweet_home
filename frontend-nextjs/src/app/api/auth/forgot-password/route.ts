import { NextRequest, NextResponse } from 'next/server';
import { findUserInDb } from '@/lib/supabaseDb';
import { generateOtpCode, storeOtp, sendPasswordResetOtpEmail } from '@/lib/emailOtpService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier } = body;

    const cleanId = (identifier || '').trim().toLowerCase();
    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: 'Please enter your registered email address or mobile number.' },
        { status: 400 }
      );
    }

    // 1. Look up user in database
    const user = await findUserInDb(cleanId);
    if (!user || !user.email) {
      return NextResponse.json(
        {
          success: false,
          error: 'No account found matching this email or phone. Please verify and try again, or create a new account.',
        },
        { status: 404 }
      );
    }

    // 2. Generate secure 6-digit OTP
    const otpCode = generateOtpCode();

    // 3. Persist OTP in Supabase cloud / memory cache
    await storeOtp(user.email, otpCode, user.name || '', user.phone || '');

    // 4. Send Password Reset Email via Gmail SMTP
    const dispatchResult = await sendPasswordResetOtpEmail(user.email, otpCode, user.name);

    // Mask email for privacy (e.g., b***h@gmail.com)
    const emailParts = user.email.split('@');
    const maskedUser =
      emailParts[0].length > 2
        ? `${emailParts[0][0]}***${emailParts[0].slice(-1)}@${emailParts[1]}`
        : user.email;

    return NextResponse.json({
      success: true,
      email: user.email,
      maskedEmail: maskedUser,
      provider: dispatchResult.provider,
      message: `Password reset verification code sent to ${maskedUser}. Please check your inbox.`,
    });
  } catch (err: any) {
    console.error('[ForgotPassword] API Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to dispatch password reset code.' },
      { status: 500 }
    );
  }
}
