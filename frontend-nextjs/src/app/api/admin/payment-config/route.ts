import { NextRequest, NextResponse } from 'next/server';
import {
  getPaymentSystemConfig,
  updatePaymentSystemConfig,
  getActiveCashfreeCredentials,
} from '@/lib/paymentConfigStore';
import { purgeNonAdminUsers } from '@/lib/paymentStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role');
    if (role && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const config = getPaymentSystemConfig();
    const cfCreds = getActiveCashfreeCredentials();

    // Mask secret keys for safe UI inspection
    const maskedSecret = config.gateway.cashfreeSecretKey
      ? config.gateway.cashfreeSecretKey.length > 8
        ? `${config.gateway.cashfreeSecretKey.slice(0, 4)}••••••••${config.gateway.cashfreeSecretKey.slice(-4)}`
        : '••••••••'
      : '';

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        gateway: {
          ...config.gateway,
          cashfreeSecretKeyMasked: maskedSecret,
          hasSecretKey: Boolean(config.gateway.cashfreeSecretKey),
          isConfigured: cfCreds.isConfigured,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error fetching payment config' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role');
    if (role && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const body = await req.json();
    const { gateway, plans, purgeTestUsers } = body;

    if (purgeTestUsers) {
      const purgeResult = purgeNonAdminUsers();
      return NextResponse.json({
        success: true,
        message: `Purged ${purgeResult.purgedCount} non-admin accounts. Retained ${purgeResult.adminsRetained} Admin accounts.`,
        purgeResult,
      });
    }

    // Process gateway updates
    const gatewayUpdates: any = {};
    if (gateway) {
      if (gateway.activeGateway) gatewayUpdates.activeGateway = gateway.activeGateway;
      if (gateway.environment) gatewayUpdates.environment = gateway.environment;
      if (gateway.cashfreeAppId !== undefined) gatewayUpdates.cashfreeAppId = gateway.cashfreeAppId.trim();
      // If user supplied a non-empty, unmasked secret key, update it
      if (gateway.cashfreeSecretKey && !gateway.cashfreeSecretKey.includes('••••')) {
        gatewayUpdates.cashfreeSecretKey = gateway.cashfreeSecretKey.trim();
      }
      if (gateway.razorpayKeyId !== undefined) gatewayUpdates.razorpayKeyId = gateway.razorpayKeyId.trim();
      if (gateway.razorpayKeySecret && !gateway.razorpayKeySecret.includes('••••')) {
        gatewayUpdates.razorpayKeySecret = gateway.razorpayKeySecret.trim();
      }
    }

    // Process plan price updates
    const planUpdates: any = {};
    if (plans && typeof plans === 'object') {
      for (const [planId, planData] of Object.entries(plans as Record<string, any>)) {
        planUpdates[planId] = {
          priceINR: Number(planData.priceINR) || 0,
          name: planData.name,
          durationDays: Number(planData.durationDays) || 30,
          periodLabel: planData.periodLabel,
          badge: planData.badge,
        };
      }
    }

    const updatedConfig = updatePaymentSystemConfig({
      gateway: Object.keys(gatewayUpdates).length > 0 ? gatewayUpdates : undefined,
      plans: Object.keys(planUpdates).length > 0 ? planUpdates : undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment gateway settings and plan pricing updated successfully.',
      config: updatedConfig,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error updating payment config' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role');
    if (role && role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin only.' }, { status: 403 });
    }

    const result = purgeNonAdminUsers();
    return NextResponse.json({
      success: true,
      message: `Reset complete: Removed all non-admin test accounts (${result.purgedCount} cleared). Admin superuser accounts preserved.`,
      result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error purging users' },
      { status: 500 }
    );
  }
}
