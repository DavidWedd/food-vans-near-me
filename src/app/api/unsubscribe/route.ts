import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/** One-click "stop these emails" link from a live alert. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('t') ?? '';
  const origin = request.nextUrl.origin;
  const db = createAdminClient();
  if (db && /^[0-9a-f-]{36}$/i.test(token)) {
    await db.from('favourites').update({ notify: false }).eq('unsubscribe_token', token);
  }
  return NextResponse.redirect(`${origin}/account?unsubscribed=1`, 303);
}

// Email apps may send a one-click unsubscribe as a POST
export const POST = GET;
