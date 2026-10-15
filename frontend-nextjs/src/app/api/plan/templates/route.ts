import { NextRequest, NextResponse } from 'next/server';
import { GET as getTemplates } from '../../templates/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  return getTemplates(req);
}
