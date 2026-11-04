import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { applySubscription } from '@/lib/stripe-sync';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

/**
 * Stripe tells us here whenever a subscription starts, changes plan, or is cancelled,
 * so the vendor's features on the site always match what they're paying for.
 */
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: 'not configured' }, { status: 503 });

  const signature = request.headers.get('stripe-signature');
  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? '', secret);
  } catch {
    return NextResponse.json({ error: 'bad signature' }, { status: 400 });
  }

  try {
    let sub: Stripe.Subscription | null = null;
    if (
      event.type === 'customer.subscription.created' ||
      event.type === 'customer.subscription.updated' ||
      event.type === 'customer.subscription.deleted'
    ) {
      // Always re-read the latest version, in case events arrive out of order
      const s = event.data.object as Stripe.Subscription;
      sub = await stripe.subscriptions.retrieve(s.id);
    } else if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        sub = await stripe.subscriptions.retrieve(
          typeof session.subscription === 'string' ? session.subscription : session.subscription.id
        );
      }
    }
    if (sub) {
      const result = await applySubscription(sub);
      if (result === 'updated') {
        revalidatePath('/');
        revalidatePath('/admin');
      }
      return NextResponse.json({ received: true, result });
    }
    return NextResponse.json({ received: true, ignored: event.type });
  } catch (err) {
    console.error('Stripe webhook failed', event.type, err);
    // 500 makes Stripe retry later
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
