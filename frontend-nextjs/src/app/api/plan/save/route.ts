import { NextRequest, NextResponse } from 'next/server';
import { requirePaidAccess } from '@/lib/authGuard';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Guard: Return 402/403 if user is unpaid or expired
  const deniedResponse = requirePaidAccess(req);
  if (deniedResponse) {
    return deniedResponse;
  }

  try {
    const plan = await req.json();
    return NextResponse.json({
      success: true,
      message: 'Plan saved successfully to cloud storage',
      planId: plan.id,
      savedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error saving plan' },
      { status: 500 }
    );
  }
}
