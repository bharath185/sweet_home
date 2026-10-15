import { NextRequest, NextResponse } from 'next/server';
import { getAllTemplatesFromDb, saveTemplateInDb, deleteTemplateInDb, DbTemplateRecord } from '@/lib/supabaseDb';
import { SWEET_HOME_DEMOS } from '@/services/demoPlans';
import { sarahPlan, davidPlan, emmaPlan } from '@/services/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const SEED_TEMPLATES = [
  ...SWEET_HOME_DEMOS.map(demo => ({
    id: demo.id,
    name: demo.name,
    category: demo.category || 'Apartment',
    description: `Sweet Home 3D Architectural Starter: ${demo.name}`,
    floors: demo.plan.floors?.length || 1,
    area: `${demo.plan.rooms?.reduce((acc, r) => acc + (r.areaSquareMeters || 0), 0).toFixed(0) || '45'} m²`,
    badge: demo.badge || (demo.category === 'Blank' ? 'Blank Canvas' : demo.category),
    thumbnail: demo.previewType || 'topdown',
    data: demo.plan,
  })),
  {
    id: 'starter-sarah-suite',
    name: 'Modern 2-Bedroom Duplex',
    category: 'Duplex',
    description: 'Two-story modern home with ground floor open-concept living, staircase, master bedroom, and ensuite bath.',
    floors: 2,
    area: '59 m²',
    badge: 'Popular Duplex',
    thumbnail: 'topdown',
    data: sarahPlan,
  },
  {
    id: 'starter-david-villa',
    name: 'Luxury Multi-Story Villa',
    category: 'Villa',
    description: 'Grand foyer with interior staircase, private presidential suites, luxury spa tub, and entertainer lounge.',
    floors: 2,
    area: '90 m²',
    badge: 'Luxury Duplex',
    thumbnail: 'exterior',
    data: davidPlan,
  },
  {
    id: 'starter-emma-studio',
    name: 'Urban Minimalist Studio Loft',
    category: 'Studio',
    description: 'Chic open-concept urban loft with integrated kitchen island, lounge, daybed, and industrial bookcase.',
    floors: 1,
    area: '20 m²',
    badge: 'Single Story',
    thumbnail: 'topdown',
    data: emmaPlan,
  },
];

export async function GET(req: NextRequest) {
  try {
    let dbTemplates = await getAllTemplatesFromDb();

    // Auto-seed if database is currently empty
    if (!dbTemplates || dbTemplates.length === 0) {
      console.log('[API/templates] Seeding default templates into Supabase...');
      for (const tpl of SEED_TEMPLATES) {
        await saveTemplateInDb(tpl);
      }
      dbTemplates = await getAllTemplatesFromDb();
    }

    const responseTemplates = (dbTemplates && dbTemplates.length > 0)
      ? dbTemplates.map(t => ({
          id: t.id,
          name: t.name,
          category: t.category,
          description: t.description || '',
          floors: t.floors || 1,
          area: t.area || 'Spacious',
          badge: t.badge,
          thumbnail: t.thumbnail,
          plan: t.data,
          data: t.data,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
        }))
      : SEED_TEMPLATES.map(t => ({
          ...t,
          plan: t.data,
        }));

    return NextResponse.json(responseTemplates, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('[API/templates] GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, category, description, floors, area, badge, thumbnail, data, plan } = body;

    if (!id || !name || (!data && !plan)) {
      return NextResponse.json(
        { error: 'Template id, name, and plan/data are required' },
        { status: 400 }
      );
    }

    const saved = await saveTemplateInDb({
      id,
      name,
      category: category || 'Apartment',
      description: description || '',
      floors: floors || (data?.floors?.length || plan?.floors?.length || 1),
      area: area || 'Spacious Suite',
      badge: badge || null,
      thumbnail: thumbnail || null,
      data: data || plan,
    });

    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to save template to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      template: saved,
    });
  } catch (error: any) {
    console.error('[API/templates] POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create template' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template id is required' },
        { status: 400 }
      );
    }

    const deleted = await deleteTemplateInDb(id);
    return NextResponse.json({
      success: deleted,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete template' },
      { status: 500 }
    );
  }
}
