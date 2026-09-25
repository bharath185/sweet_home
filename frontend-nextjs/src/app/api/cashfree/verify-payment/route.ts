import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const SERVER_PLAN_CONFIG: Record<
  string,
  { priceINR: number; durationDays: number; tier: 'TRIAL' | 'PRO'; name: string }
> = {
  trial_2days: { priceINR: 200, durationDays: 2, tier: 'TRIAL', name: '2-Day Studio Trial Pass' },
  monthly: { priceINR: 999, durationDays: 30, tier: 'PRO', name: 'Monthly Studio Pass' },
  yearly: { priceINR: 9590, durationDays: 365, tier: 'PRO', name: 'Annual Studio Pass (20% Off)' },
  // Backward compatibility aliases
  pro_monthly: { priceINR: 999, durationDays: 30, tier: 'PRO', name: 'Monthly Studio Pass' },
  pro_yearly: { priceINR: 9590, durationDays: 365, tier: 'PRO', name: 'Annual Studio Pass (20% Off)' },
};

function generateSubscriptionToken(payload: object, secret: string): string {
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');
  return `${payloadStr}.${signature}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, planId, userId } = body;

    if (!orderId || !planId) {
      return NextResponse.json(
        { error: 'Missing required order verification parameters (orderId, planId)' },
        { status: 400 }
      );
    }

    const planConfig = SERVER_PLAN_CONFIG[planId];
    if (!planConfig) {
      return NextResponse.json(
        { error: 'Invalid planId supplied' },
        { status: 400 }
      );
    }

    const appId =
      process.env.CASHFREE_APP_ID ||
      process.env.NEXT_PUBLIC_CASHFREE_APP_ID ||
      process.env.CASHFREE_CLIENT_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = (process.env.CASHFREE_ENVIRONMENT || 'SANDBOX').toUpperCase();
    const subSecret = process.env.SUBSCRIPTION_JWT_SECRET || secretKey || 'sweethome-prod-sub-crypto-secret-key-2026';

    const isLiveConfigured =
      appId &&
      secretKey &&
      !appId.includes('TEST_CF_APP_ID') &&
      !secretKey.includes('TEST_CF_SECRET_KEY') &&
      !appId.includes('your_cashfree');

    const isSimulated = orderId.includes('_sim_') || orderId.startsWith('cf_sim_');

    // 1. Live Cashfree API Order Verification
    const baseUrl =
      env === 'PRODUCTION'
        ? `https://api.cashfree.com/pg/orders/${orderId}`
        : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

    const cfRes = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
    });

    if (!cfRes.ok) {
      const errData = await cfRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errData.message || 'Could not verify payment status with Cashfree payment gateway.',
          code: 'VERIFICATION_FAILED',
        },
        { status: 400 }
      );
    }

    const orderData = await cfRes.json();
    if (orderData.order_status !== 'PAID') {
      return NextResponse.json(
        {
          error: `Cashfree order status is '${orderData.order_status}'. Payment has not been marked as PAID.`,
          status: orderData.order_status,
        },
        { status: 400 }
      );
    }

    // 2. Generate Cryptographically Signed Subscription Token with precise duration
    const durationDays = planConfig.durationDays;
    const expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;
    const tokenPayload = {
      userId: userId || 'anonymous',
      gateway: 'cashfree',
      tier: planConfig.tier,
      planId,
      durationDays,
      paymentId: `cf_pay_${Date.now()}`,
      orderId,
      issuedAt: Date.now(),
      expiresAt,
    };

    const subscriptionToken = generateSubscriptionToken(tokenPayload, subSecret);

    return NextResponse.json({
      success: true,
      tier: planConfig.tier,
      planId,
      durationDays,
      planName: planConfig.name,
      paymentId: `cf_pay_${Date.now()}`,
      orderId,
      gateway: 'cashfree',
      subscriptionToken,
      expiresAt: new Date(expiresAt).toISOString(),
      message: `Cashfree payment verified successfully! Your ${planConfig.name} is active for ${durationDays} days.`,
    });
  } catch (error: any) {
    console.error('Error verifying Cashfree payment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while verifying Cashfree payment' },
      { status: 500 }
    );
  }
}
