import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Fixed server-side pricing in INR Rupees (Cashfree takes amounts in INR, not paise)
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, userId, userEmail, userName, userPhone } = body;

    if (!planId || !SERVER_PLAN_CONFIG[planId]) {
      return NextResponse.json(
        { error: 'Invalid planId. Must be one of trial_2days, monthly, or yearly.' },
        { status: 400 }
      );
    }

    const planConfig = SERVER_PLAN_CONFIG[planId];
    const orderAmount = planConfig.priceINR;
    const orderCurrency = 'INR';

    const appId =
      process.env.CASHFREE_APP_ID ||
      process.env.NEXT_PUBLIC_CASHFREE_APP_ID ||
      process.env.CASHFREE_CLIENT_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = (process.env.CASHFREE_ENVIRONMENT || 'SANDBOX').toUpperCase();

    const isLiveConfigured =
      appId &&
      secretKey &&
      !appId.includes('TEST_CF_APP_ID') &&
      !secretKey.includes('TEST_CF_SECRET_KEY') &&
      !appId.includes('your_cashfree');

    const cleanOrderId = `cf_${planId.slice(0, 6)}_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
    const customerId = (userId || `cust_${Date.now().toString(36)}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    const customerPhone = userPhone && /^\d{10}$/.test(userPhone) ? userPhone : '9999999999';
    const customerEmail = userEmail && userEmail.includes('@') ? userEmail : 'customer@sweethome.io';
    const customerName = userName || 'SweetHome Architect';

    const baseUrl =
      env === 'PRODUCTION'
        ? 'https://api.cashfree.com/pg/orders'
        : 'https://sandbox.cashfree.com/pg/orders';

    // 1. Live Cashfree API Order Creation
    if (isLiveConfigured) {
      try {
        const cfRes = await fetch(baseUrl, {
          method: 'POST',
          headers: {
            'x-client-id': appId,
            'x-client-secret': secretKey,
            'x-api-version': '2023-08-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order_id: cleanOrderId,
            order_amount: orderAmount,
            order_currency: orderCurrency,
            customer_details: {
              customer_id: customerId,
              customer_email: customerEmail,
              customer_phone: customerPhone,
              customer_name: customerName,
            },
            order_meta: {
              return_url: 'https://3dstudio.prigenix.com?cf_order_id={order_id}',
              payment_methods: 'upi,cc,dc,nb,app',
            },
            order_note: `${planConfig.name} - SweetHome 3D Studio`,
          }),
        });

        const data = await cfRes.json();

        if (cfRes.ok && data.payment_session_id) {
          return NextResponse.json({
            success: true,
            orderId: data.order_id || cleanOrderId,
            cfOrderId: data.cf_order_id,
            paymentSessionId: data.payment_session_id,
            amount: orderAmount,
            currency: orderCurrency,
            planName: planConfig.name,
            tier: planConfig.tier,
            durationDays: planConfig.durationDays,
            environment: env,
            isTestMode: false,
          });
        } else {
          console.warn('Cashfree API error response, falling back to sandbox simulation:', data);
        }
      } catch (apiErr) {
        console.warn('Cashfree API fetch error:', apiErr);
      }
    }

    // 2. Sandbox / Instant Simulation Mode (for testing without live merchant keys)
    const simulatedSessionId = `session_cf_sim_${crypto.randomBytes(12).toString('hex')}`;
    return NextResponse.json({
      success: true,
      orderId: cleanOrderId,
      cfOrderId: `cf_order_${Date.now()}`,
      paymentSessionId: simulatedSessionId,
      amount: orderAmount,
      currency: orderCurrency,
      planName: planConfig.name,
      tier: planConfig.tier,
      durationDays: planConfig.durationDays,
      environment: env,
      isTestMode: true,
      notice: 'Running in Cashfree Sandbox/Demo mode. Add CASHFREE_SECRET_KEY to go live.',
    });
  } catch (error: any) {
    console.error('Error creating Cashfree order:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while generating Cashfree order' },
      { status: 500 }
    );
  }
}
