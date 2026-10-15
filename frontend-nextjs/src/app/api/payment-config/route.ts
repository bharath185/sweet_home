import { NextRequest, NextResponse } from 'next/server';
import {
  getPaymentSystemConfigAsync,
  getActiveCashfreeCredentials,
  getActiveRazorpayCredentials,
} from '@/lib/paymentConfigStore';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  try {
    const config = await getPaymentSystemConfigAsync();
    const cfCreds = getActiveCashfreeCredentials();
    const rzpCreds = getActiveRazorpayCredentials();

    return NextResponse.json(
      {
        success: true,
        activeGateway: config.gateway.activeGateway || 'cashfree',
        environment: config.gateway.environment || 'PRODUCTION',
        isCashfreeConfigured: cfCreds.isConfigured,
        isRazorpayConfigured: rzpCreds.isConfigured,
        razorpayKeyId: rzpCreds.keyId,
        currency: 'INR',
        plans: config.plans,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching client payment config' },
      { status: 500 }
    );
  }
}
