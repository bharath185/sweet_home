import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Fixed server-side pricing in INR paise (1 INR = 100 paise)
// Client CANNOT tamper with prices.
const SERVER_PLAN_PRICES_PAISE: Record<string, { amount: number; tier: 'PRO' | 'ENTERPRISE'; name: string }> = {
  pro_monthly: { amount: 999 * 100, tier: 'PRO', name: 'Architect Pro (Monthly)' },
  pro_yearly: { amount: 7999 * 100, tier: 'PRO', name: 'Architect Pro (Annual)' },
  enterprise_monthly: { amount: 2499 * 100, tier: 'ENTERPRISE', name: 'Studio Enterprise (Monthly)' },
  enterprise_yearly: { amount: 19999 * 100, tier: 'ENTERPRISE', name: 'Studio Enterprise (Annual)' },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planId, userId, userEmail, userName } = body;

    if (!planId || !SERVER_PLAN_PRICES_PAISE[planId]) {
      return NextResponse.json(
        { error: 'Invalid planId. Must be one of pro_monthly, pro_yearly, enterprise_monthly, enterprise_yearly.' },
        { status: 400 }
      );
    }

    const planConfig = SERVER_PLAN_PRICES_PAISE[planId];
    const amountInPaise = planConfig.amount;
    const currency = 'INR';
    const receipt = `rcpt_${(userId || 'guest').toString().slice(-6)}_${Date.now().toString().slice(-6)}`;

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Determine if live Razorpay keys are configured
    const hasLiveKeys = keyId && keySecret && !keyId.includes('YourRazorpay') && !keySecret.includes('YourRazorpay');

    if (hasLiveKeys) {
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

        if (rzpRes.ok) {
          const order = await rzpRes.json();
          return NextResponse.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId,
            planName: planConfig.name,
            tier: planConfig.tier,
            isTestMode: false,
          });
        } else {
          const errData = await rzpRes.json();
          console.warn('Razorpay API error, falling back to secure sandbox:', errData);
        }
      } catch (apiErr) {
        console.warn('Razorpay fetch error:', apiErr);
      }
    }

    // Secure Sandbox / Simulation fallback (if live Razorpay credentials are still being setup)
    const testOrderId = `order_sim_${crypto.randomBytes(8).toString('hex')}`;
    return NextResponse.json({
      success: true,
      orderId: testOrderId,
      amount: amountInPaise,
      currency,
      keyId: keyId || 'rzp_test_51Ru7jLBBymQ8D',
      planName: planConfig.name,
      tier: planConfig.tier,
      isTestMode: true,
      notice: 'Running in Razorpay Sandbox / Demo mode. Add RAZORPAY_KEY_SECRET to go live.',
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while generating payment order' },
      { status: 500 }
    );
  }
}
