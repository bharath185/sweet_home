import { NextRequest, NextResponse } from 'next/server';
import {
  verifyCashfreeWebhookSignature,
  isWebhookProcessed,
  markWebhookProcessed,
  setUserPaymentStatus,
  recordTransaction,
  getPendingOrder,
  getUserPaymentStatus,
} from '@/lib/paymentStore';

const PLAN_DURATIONS: Record<string, number> = {
  trial_2days: 2,
  monthly: 30,
  yearly: 365,
  pro_monthly: 30,
  pro_yearly: 365,
};

export async function POST(req: NextRequest) {
  try {
    // 1. Extract raw request body for exact cryptographic verification
    const rawBody = await req.text();

    const signature =
      req.headers.get('x-webhook-signature') ||
      req.headers.get('x-cf-signature');
    const timestamp =
      req.headers.get('x-webhook-timestamp') ||
      req.headers.get('x-cf-timestamp');

    const secretKey = process.env.CASHFREE_SECRET_KEY;

    if (!secretKey) {
      console.error('Webhook Error: CASHFREE_SECRET_KEY is missing from environment');
      return NextResponse.json(
        { error: 'Server misconfiguration: CASHFREE_SECRET_KEY missing' },
        { status: 500 }
      );
    }

    // 2. Cryptographic signature check
    const isValid = verifyCashfreeWebhookSignature(rawBody, timestamp, signature, secretKey);
    if (!isValid) {
      console.warn('Unauthorized Cashfree Webhook: Signature mismatch', {
        timestamp,
        signatureProvided: !!signature,
      });
      return NextResponse.json(
        { error: 'Invalid webhook signature', code: 'INVALID_SIGNATURE' },
        { status: 401 }
      );
    }

    // 3. Parse JSON safely
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    // 4. Idempotency Key Determination
    const eventType = payload.type || payload.event || 'UNKNOWN';
    const orderId =
      payload.data?.order?.order_id ||
      payload.data?.order_id ||
      payload.order_id ||
      payload.orderId;
    const paymentId =
      payload.data?.payment?.cf_payment_id ||
      payload.data?.cf_payment_id ||
      payload.payment_id ||
      payload.paymentId;

    const eventId =
      payload.event_id ||
      (paymentId ? `${eventType}_${paymentId}` : null) ||
      (orderId ? `${eventType}_${orderId}` : null) ||
      `${eventType}_${timestamp}`;

    if (isWebhookProcessed(eventId)) {
      // Idempotent duplicate: Return 200 without duplicate mutation
      return NextResponse.json({
        success: true,
        message: 'Webhook event already processed (idempotent)',
        eventId,
      });
    }

    // 5. Correlate with registered pending order and user details
    const pending = orderId ? getPendingOrder(orderId) : null;
    const customerDetails = payload.data?.customer_details || {};
    const userId = pending?.userId || customerDetails.customer_id;
    const userEmail = pending?.userEmail || customerDetails.customer_email;
    const userName = pending?.userName || customerDetails.customer_name;
    const orderAmount = Number(
      payload.data?.order?.order_amount ||
      payload.data?.payment?.payment_amount ||
      pending?.amount ||
      0
    );

    // Determine plan
    let planId = pending?.planId;
    if (!planId) {
      if (orderAmount >= 9000) planId = 'yearly';
      else if (orderAmount >= 900) planId = 'monthly';
      else planId = 'trial_2days';
    }

    const durationDays = PLAN_DURATIONS[planId] || 30;

    // 6. Handle Events
    const isSuccess =
      eventType === 'PAYMENT_SUCCESS_WEBHOOK' ||
      eventType === 'ORDER_PAID' ||
      payload.data?.payment?.payment_status === 'SUCCESS';

    const isFailed =
      eventType === 'PAYMENT_FAILED_WEBHOOK' ||
      payload.data?.payment?.payment_status === 'FAILED';

    const isDropped =
      eventType === 'PAYMENT_USER_DROPPED_WEBHOOK' ||
      eventType === 'USER_DROPPED';

    if (isSuccess) {
      const expiresAt = new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString();

      // Activate user access immediately even if user closed browser
      if (userId || userEmail) {
        setUserPaymentStatus({
          userId,
          email: userEmail,
          name: userName,
          payment_status: 'paid',
          plan: planId,
          paid_at: new Date().toISOString(),
          expires_at: expiresAt,
          cashfree_order_id: orderId,
          cashfree_payment_id: paymentId ? String(paymentId) : undefined,
        });
      }

      // Record in immutable transaction ledger
      recordTransaction({
        id: `tx_${paymentId || Date.now()}`,
        orderId: orderId || `cf_${Date.now()}`,
        paymentId: paymentId ? String(paymentId) : undefined,
        userId,
        customerName: userName || 'SweetHome Customer',
        customerEmail: userEmail || 'customer@sweethome.io',
        planId,
        planName: planId === 'yearly' ? 'Annual Pro Pass' : planId === 'monthly' ? 'Monthly Pro Pass' : '2-Day Trial Pass',
        amount: orderAmount,
        gateway: 'cashfree',
        status: 'PAID',
        paymentMethod: payload.data?.payment?.payment_method
          ? (typeof payload.data.payment.payment_method === 'object'
              ? Object.keys(payload.data.payment.payment_method)[0]?.toUpperCase()
              : String(payload.data.payment.payment_method))
          : 'Cashfree PG',
        createdAt: new Date().toISOString(),
        expiresAt,
        rawEvent: payload,
      });

      markWebhookProcessed(eventId);

      return NextResponse.json({
        success: true,
        status: 'PAID',
        userId,
        orderId,
        expiresAt,
      });
    }

    if (isFailed || isDropped) {
      if (userId || userEmail) {
        const existing = getUserPaymentStatus({ userId, email: userEmail });
        // Only mark failed/pending if user wasn't already paid
        if (existing && existing.payment_status !== 'paid') {
          setUserPaymentStatus({
            userId,
            email: userEmail,
            payment_status: isDropped ? 'pending' : 'failed',
            plan: planId,
            cashfree_order_id: orderId,
          });
        }
      }

      recordTransaction({
        id: `tx_${Date.now()}`,
        orderId: orderId || `cf_${Date.now()}`,
        paymentId: paymentId ? String(paymentId) : undefined,
        userId,
        customerName: userName,
        customerEmail: userEmail,
        planId,
        planName: planId,
        amount: orderAmount,
        gateway: 'cashfree',
        status: isDropped ? 'USER_DROPPED' : 'FAILED',
        paymentMethod: 'Cashfree PG',
        createdAt: new Date().toISOString(),
        rawEvent: payload,
      });

      markWebhookProcessed(eventId);

      return NextResponse.json({
        success: true,
        status: isDropped ? 'USER_DROPPED' : 'FAILED',
        orderId,
      });
    }

    // Default handler for informational webhooks
    markWebhookProcessed(eventId);
    return NextResponse.json({ success: true, eventType, ignored: true });
  } catch (err: any) {
    console.error('Error handling Cashfree webhook:', err);
    return NextResponse.json(
      { error: 'Internal Server Error handling webhook' },
      { status: 500 }
    );
  }
}
