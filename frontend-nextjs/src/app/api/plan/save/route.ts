import { NextRequest, NextResponse } from 'next/server';
import { saveProjectInDb } from '@/lib/supabaseDb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const plan = await req.json();
    if (!plan || !plan.id) {
      return NextResponse.json(
        { success: false, error: 'Valid plan object with an id is required' },
        { status: 400 }
      );
    }

    const userId =
      req.headers.get('x-user-id') ||
      req.nextUrl.searchParams.get('userId') ||
      'guest';
    const userEmail =
      req.headers.get('x-user-email') ||
      req.nextUrl.searchParams.get('userEmail') ||
      undefined;

    const saved = await saveProjectInDb({
      id: plan.id,
      user_id: userId,
      user_email: userEmail,
      name: plan.name || 'Untitled Blueprint',
      data: plan,
    });

    return NextResponse.json({
      success: true,
      message: 'Plan saved successfully to Supabase database',
      planId: plan.id,
      savedAt: new Date().toISOString(),
      project: saved,
      savedInDb: Boolean(saved),
    });
  } catch (error: any) {
    console.error('Error saving plan to database:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error saving plan' },
      { status: 500 }
    );
  }
}
