import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPlanConfig, getActiveRazorpayCredentials, getPaymentSystemConfigAsync } from '@/lib/paymentConfigStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function POST(req: NextRequest) {
  try {
    await getPaymentSystemConfigAsync();
    const body = await req.json();
    const { planId, userId, userEmail, userName } = body;

    const planConfig = getPlanConfig(planId);
    if (!planId || !planConfig) {
      return NextResponse.json(
        { error: 'Invalid planId. Must be one of trial_2days, monthly, or yearly.' },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(Number(planConfig.priceINR) * 100);
    const currency = 'INR';
    const receipt = `rcpt_${(userId || 'guest').toString().slice(-6)}_${Date.now().toString().slice(-6)}`;

    const rzpCreds = getActiveRazorpayCredentials();
    const keyId = rzpCreds.keyId;
    const keySecret = rzpCreds.keySecret;

    // 1. Live Razorpay API Order Creation
    if (!rzpCreds.isConfigured) {
      return NextResponse.json(
        {
          error: 'Razorpay API credentials (Key ID & Key Secret) are not configured. Please add your Razorpay keys in the Admin Dashboard or Vercel environment.',
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
