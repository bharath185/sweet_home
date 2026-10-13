import { NextResponse } from 'next/server';
import { getPaymentSystemConfig, getActiveCashfreeCredentials } from '@/lib/paymentConfigStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getPaymentSystemConfig();
    const cfCreds = getActiveCashfreeCredentials();

    return NextResponse.json({
      success: true,
      plans: config.plans,
      gateway: {
        activeGateway: config.gateway.activeGateway,
        environment: config.gateway.environment,
        isConfigured: cfCreds.isConfigured,
      },
      updatedAt: config.updatedAt,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve plans config' },
      { status: 500 }
    );
  }
}
