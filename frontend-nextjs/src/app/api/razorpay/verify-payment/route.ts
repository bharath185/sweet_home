import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPlanConfig, getActiveRazorpayCredentials, getPaymentSystemConfigAsync } from '@/lib/paymentConfigStore';
import { setUserPaymentStatus, recordPaymentTransaction } from '@/lib/paymentStore';
import { upsertUserInDb, saveTransactionInDb } from '@/lib/supabaseDb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function generateSubscriptionToken(payload: object, secret: string): string {
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex');
  return `${payloadStr}.${signature}`;
}

export async function POST(req: NextRequest) {
  try {
    await getPaymentSystemConfigAsync();
    const body = await req.json();
    const { orderId, paymentId, signature, planId, userId, userEmail, userName } = body;

    if (!orderId || !paymentId || !planId) {
      return NextResponse.json(
        { error: 'Missing required payment verification fields (orderId, paymentId, planId)' },
        { status: 400 }
      );
    }

    const planConfig = getPlanConfig(planId);
    if (!planConfig) {
      return NextResponse.json(
        { error: 'Invalid planId supplied' },
        { status: 400 }
      );
    }

    const rzpCreds = getActiveRazorpayCredentials();
    const keySecret = rzpCreds.keySecret;
    const subSecret = process.env.SUBSCRIPTION_JWT_SECRET || keySecret || 'sweethome-prod-sub-crypto-secret-key-2026';
    const isSimulatedOrder = orderId.startsWith('order_sim_') || paymentId.startsWith('pay_sim_');

    // 1. Live Razorpay Cryptographic Verification
    if (!isSimulatedOrder && rzpCreds.isConfigured) {
      if (!signature) {
        return NextResponse.json(
          { error: 'Payment signature missing for live transaction' },
          { status: 400 }
        );
      }

      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
      const providedBuffer = Buffer.from(signature, 'utf8');

      if (expectedBuffer.length !== providedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
        console.error('Razorpay signature mismatch: payment tampering suspected.');
        return NextResponse.json(
          { error: 'Payment signature verification failed. Untrusted transaction.' },
          { status: 400 }
        );
      }
    }

    // 2. Generate Cryptographically Signed Subscription Token with precise duration
    const durationDays = planConfig.durationDays || (planId === 'trial_2days' ? 2 : planId === 'yearly' ? 365 : 30);
    const expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;
    const effectiveUserId = userId || 'anonymous';
    const customerEmail = userEmail || '';
    const customerName = userName || 'SweetHome Architect';

    const tokenPayload = {
      userId: effectiveUserId,
      email: customerEmail,
      gateway: 'razorpay',
      tier: planConfig.tier,
      planId,
      durationDays,
      paymentId,
      orderId,
      issuedAt: Date.now(),
      expiresAt,
    };

    const subscriptionToken = generateSubscriptionToken(tokenPayload, subSecret);

    // 3. Mark User as Paid in Memory and Supabase PostgreSQL
    const userPayload = {
      userId: effectiveUserId,
      email: customerEmail,
      name: customerName,
      payment_status: 'paid' as const,
      plan: planId,
      paid_at: new Date().toISOString(),
      expires_at: new Date(expiresAt).toISOString(),
      cashfree_order_id: orderId,
      cashfree_payment_id: paymentId,
      is_free_trial: false,
    };
    setUserPaymentStatus(userPayload);
    if (customerEmail) {
      await upsertUserInDb({
        ...userPayload,
        email: customerEmail,
        id: effectiveUserId,
      });
    }

    // 4. Record Transaction in Memory and Supabase Ledger
    const txPayload = {
      id: `tx_${paymentId}`,
      orderId,
      paymentId,
      userId: effectiveUserId,
      customerName: customerName || 'SweetHome Customer',
      customerEmail: customerEmail || 'customer@sweethome.io',
      planId,
      planName: planConfig.name,
      amount: Number(planConfig.priceINR),
      gateway: 'razorpay' as const,
      status: 'PAID' as const,
      paymentMethod: 'razorpay_checkout',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
      rawEvent: { orderId, paymentId, signature, planId },
    };
    recordPaymentTransaction(txPayload);
    await saveTransactionInDb(txPayload);

    return NextResponse.json(
      {
        success: true,
        tier: planConfig.tier,
        planId,
        durationDays,
        planName: planConfig.name,
        paymentId,
        orderId,
        subscriptionToken,
        expiresAt: new Date(expiresAt).toISOString(),
        message: `Payment verified successfully! Your ${planConfig.name} is now active!`,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while verifying transaction' },
      { status: 500 }
    );
  }
}
