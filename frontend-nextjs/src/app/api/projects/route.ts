import { NextRequest, NextResponse } from 'next/server';
import { getUserProjectsFromDb, saveProjectInDb, deleteProjectInDb } from '@/lib/supabaseDb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || '';
    const email = searchParams.get('email') || '';

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: 'userId or email is required' },
        { status: 400 }
      );
    }

    const projects = await getUserProjectsFromDb(userId, email);
    return NextResponse.json(
      {
        success: true,
        projects,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching projects' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, userId, userEmail, name, data, thumbnail } = body;

    if (!id || !data) {
      return NextResponse.json(
        { success: false, error: 'Project id and data are required' },
        { status: 400 }
      );
    }

    const saved = await saveProjectInDb({
      id,
      user_id: userId,
      user_email: userEmail,
      name: name || 'Untitled Project',
      data,
      thumbnail,
    });

    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Failed to save project in database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      project: saved,
      message: 'Project synchronized with cloud database',
    });
  } catch (error: any) {
    console.error('Error saving project:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error saving project' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId') || undefined;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Project id is required' },
        { status: 400 }
      );
    }

    const ok = await deleteProjectInDb(id, userId);
    return NextResponse.json({
      success: ok,
      message: ok ? 'Project deleted' : 'Project could not be deleted',
    });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error deleting project' },
      { status: 500 }
    );
  }
}
