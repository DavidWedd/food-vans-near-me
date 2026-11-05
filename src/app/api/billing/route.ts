import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import { ensurePortalConfiguration, findCustomerId } from '@/lib/stripe-sync';

export const dynamic = 'force-dynamic';

/** Sends a logged-in vendor to Stripe's billing page to change plan, update their card or cancel. */
export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.redirect(`${origin}/vendor/login`, 303);

  const { data: vendor } = await supabase.from('vendors').select('id').eq('owner_id', auth.user.id).maybeSingle();
  const stripe = getStripe();
  if (!vendor || !stripe) return NextResponse.redirect(`${origin}/vendor?billing=unavailable`, 303);

  try {
    const customer = await findCustomerId(vendor.id, auth.user.email);
    if (!customer) return NextResponse.redirect(`${origin}/vendor?billing=none`, 303);
    const configuration = await ensurePortalConfiguration(stripe);
    const session = await stripe.billingPortal.sessions.create({
      customer,
      configuration,
      return_url: `${origin}/vendor`,
      locale: 'en-GB',
    });
    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error('Billing portal failed', err);
    return NextResponse.redirect(`${origin}/vendor?billing=unavailable`, 303);
  }
}
