import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { recordPendingOrder, setUserPaymentStatus } from '@/lib/paymentStore';
import { getPlanConfig, getActiveCashfreeCredentials, getPaymentSystemConfigAsync } from '@/lib/paymentConfigStore';

export async function POST(req: NextRequest) {
  try {
    await getPaymentSystemConfigAsync();
    const body = await req.json();
    const { planId, userId, userEmail, userName, userPhone } = body;

    const planConfig = getPlanConfig(planId);
    if (!planId || !planConfig) {
      return NextResponse.json(
        { error: `Invalid planId: ${planId}. Plan must be configured in system.` },
        { status: 400 }
      );
    }

    const orderAmount = planConfig.priceINR;
    const orderCurrency = 'INR';

    const { appId, secretKey, environment, isConfigured } = getActiveCashfreeCredentials();

    const cleanOrderId = `cf_${planId.slice(0, 6)}_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`;
    const customerId = (userId || `cust_${Date.now().toString(36)}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    const customerPhone = userPhone && /^\d{10}$/.test(userPhone) ? userPhone : '9999999999';
    const customerEmail = userEmail && userEmail.includes('@') ? userEmail : 'customer@sweethome.io';
    const customerName = userName || 'SweetHome Architect';

    const baseUrl =
      environment === 'PRODUCTION'
        ? 'https://api.cashfree.com/pg/orders'
        : 'https://sandbox.cashfree.com/pg/orders';

    // 1. Live Cashfree API Order Creation
    if (!isConfigured) {
      return NextResponse.json(
        {
          error: 'Cashfree API keys are not configured. Please provide CASHFREE_APP_ID and CASHFREE_SECRET_KEY in Admin Control Center or environment to enable live Cashfree payments.',
          code: 'MISSING_CASHFREE_KEYS',
        },
        { status: 400 }
      );
    }

    // Cashfree Production strictly enforces HTTPS for return_url
    let returnUrl = (req.headers.get('origin') || 'https://sweethome3d.io') + '?cf_order_id={order_id}';
    if (environment === 'PRODUCTION' && returnUrl.startsWith('http://')) {
      // Localhost or insecure HTTP origin in production mode must use HTTPS fallback
      returnUrl = `https://sweethome3d.io?cf_order_id={order_id}`;
    }

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
            return_url: returnUrl,
            payment_methods: 'upi,cc,dc,nb,app',
          },
          order_note: `${planConfig.name} - SweetHome 3D Studio`,
        }),
      });

      const data = await cfRes.json();

      if (cfRes.ok && data.payment_session_id) {
        const finalOrderId = data.order_id || cleanOrderId;

        // Register pending order in server-side payment store for webhook & return correlation
        recordPendingOrder(finalOrderId, {
          userId: customerId,
          userEmail: customerEmail,
          userName: customerName,
          planId,
          amount: orderAmount,
        });

        setUserPaymentStatus({
          userId: customerId,
          email: customerEmail,
          name: customerName,
          payment_status: 'pending',
          plan: planId,
          cashfree_order_id: finalOrderId,
        });

        return NextResponse.json({
          success: true,
          orderId: finalOrderId,
          cfOrderId: data.cf_order_id,
          paymentSessionId: data.payment_session_id,
          amount: orderAmount,
          currency: orderCurrency,
          planName: planConfig.name,
          tier: planConfig.tier,
          durationDays: planConfig.durationDays,
          environment,
          isTestMode: false,
        });
      } else {
        return NextResponse.json(
          {
            error: data.message || 'Cashfree payment gateway rejected order creation. Please check your App ID, Secret Key, and Environment (Sandbox vs Production).',
            code: data.code || 'CASHFREE_ERROR',
          },
          { status: 400 }
        );
      }
    } catch (apiErr: any) {
      return NextResponse.json(
        {
          error: `Error connecting to Cashfree API: ${apiErr.message}`,
          code: 'CASHFREE_CONNECTION_ERROR',
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error('Error creating Cashfree order:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while generating Cashfree order' },
      { status: 500 }
    );
  }
}
