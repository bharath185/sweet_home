import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (admin) {
      // Support deleting with or without 'cat_' prefix
      await admin.from('projects').delete().in('id', [`cat_${id}`, id]);
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    console.error('[Catalog API] DELETE error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete catalog item' },
      { status: 500 }
    );
  }
}
