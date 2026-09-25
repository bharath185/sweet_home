import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Fixed server-side pricing in INR paise (1 INR = 100 paise)
// Client CANNOT tamper with prices.
const SERVER_PLAN_PRICES_PAISE: Record<string, { amount: number; durationDays: number; tier: 'TRIAL' | 'PRO'; name: string }> = {
  trial_2days: { amount: 200 * 100, durationDays: 2, tier: 'TRIAL', name: '2-Day Studio Trial Pass' },
  monthly: { amount: 999 * 100, durationDays: 30, tier: 'PRO', name: 'Monthly Studio Pass' },
  yearly: { amount: 9590 * 100, durationDays: 365, tier: 'PRO', name: 'Annual Studio Pass (20% Off)' },
  // Backward compatibility aliases
  pro_monthly: { amount: 999 * 100, durationDays: 30, tier: 'PRO', name: 'Monthly Studio Pass' },
  pro_yearly: { amount: 9590 * 100, durationDays: 365, tier: 'PRO', name: 'Annual Studio Pass (20% Off)' },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, userId, userEmail, userName } = body;

    if (!planId || !SERVER_PLAN_PRICES_PAISE[planId]) {
      return NextResponse.json(
        { error: 'Invalid planId. Must be one of trial_2days, monthly, or yearly.' },
        { status: 400 }
      );
    }

    const planConfig = SERVER_PLAN_PRICES_PAISE[planId];
    const amountInPaise = planConfig.amount;
    const currency = 'INR';
    const receipt = `rcpt_${(userId || 'guest').toString().slice(-6)}_${Date.now().toString().slice(-6)}`;

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // 1. Live Razorpay API Order Creation
    if (!keyId || !keySecret || keyId.includes('YourRazorpay')) {
      return NextResponse.json(
        {
          error: 'Razorpay API credentials (NEXT_PUBLIC_RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are not configured on Vercel. Please provide your Razorpay keys to enable live Razorpay checkout.',
          code: 'MISSING_RAZORPAY_KEYS',
        },
        { status: 400 }
      );
    }

    try {
      // Use Razorpay REST API directly with Basic Auth
      const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt,
          notes: {
            planId,
            tier: planConfig.tier,
            userId: userId || 'anonymous',
            userEmail: userEmail || '',
            userName: userName || '',
            platform: 'SweetHome 3D Studio',
          },
        }),
      });

      const data = await rzpRes.json();

      if (rzpRes.ok && data.id) {
        return NextResponse.json({
          success: true,
          orderId: data.id,
          amount: data.amount,
          currency: data.currency,
          keyId,
          planName: planConfig.name,
          tier: planConfig.tier,
          isTestMode: false,
        });
      } else {
        return NextResponse.json(
          {
            error: data.error?.description || 'Razorpay rejected order generation. Please verify your Razorpay Key ID and Secret.',
            code: data.error?.code || 'RAZORPAY_ERROR',
          },
          { status: 400 }
        );
      }
    } catch (apiErr: any) {
      return NextResponse.json(
        {
          error: `Error connecting to Razorpay API: ${apiErr.message}`,
          code: 'RAZORPAY_CONNECTION_ERROR',
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while generating payment order' },
      { status: 500 }
    );
  }
}
