import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { CatalogItem } from '@/types/plan';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json([]);
  }

  try {
    const { data, error } = await admin
      .from('projects')
      .select('*')
      .eq('user_id', 'catalog_system')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('[Catalog API] GET error:', error.message);
      return NextResponse.json([]);
    }

    const items: CatalogItem[] = (data || []).map((row: any) => ({
      ...row.data,
      id: row.data?.id || row.id.replace('cat_', ''),
      name: row.name || row.data?.name || 'Custom 3D Asset',
      isCustom: true,
    }));

    return NextResponse.json(items);
  } catch (err: any) {
    console.warn('[Catalog API] GET exception:', err.message);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const item: CatalogItem = await req.json();
    if (!item || !item.id || !item.name) {
      return NextResponse.json(
        { error: 'Valid CatalogItem with id and name is required' },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    const customItem: CatalogItem = {
      ...item,
      isCustom: true,
      updatedAt: new Date().toISOString(),
    };

    if (admin) {
      await admin.from('projects').upsert({
        id: `cat_${item.id}`,
        user_id: 'catalog_system',
        name: item.name,
        data: customItem,
        thumbnail: item.icon || (item as any).thumbnail || null,
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(customItem);
  } catch (error: any) {
    console.error('[Catalog API] POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save catalog item' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (admin) {
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
