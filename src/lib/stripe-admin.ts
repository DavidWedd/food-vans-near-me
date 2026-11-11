import 'server-only';
import { getStripe } from '@/lib/stripe';
import { FOUNDING_REGIONS, isPlanId, type PlanId } from '@/lib/plans';

export interface StripeInfo {
  plan: PlanId | null;
  status: string;
  founding: boolean;
  region: string | null;
  freeUntil: string | null;
  customerUrl: string | null;
}

/** Looks up a vendor's Stripe subscription by their login email. */
export async function stripeInfoFor(email: string | null): Promise<StripeInfo | null> {
  const stripe = getStripe();
  if (!stripe || !email) return null;
  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];
    if (!customer) return null;
    const subs = await stripe.subscriptions.list({ customer: customer.id, status: 'all', limit: 1 });
    const sub = subs.data[0];
    const testPath = process.env.STRIPE_SECRET_KEY?.includes('_live_') ? '' : 'test/';
    return {
      plan: sub && isPlanId(sub.metadata?.plan) ? (sub.metadata.plan as PlanId) : null,
      status: sub?.status ?? 'no subscription',
      founding: sub?.metadata?.founding === 'true',
      region: FOUNDING_REGIONS.find((r) => r.id === sub?.metadata?.region)?.name ?? null,
      freeUntil: sub?.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
      customerUrl: `https://dashboard.stripe.com/${testPath}customers/${customer.id}`,
    };
  } catch (err) {
    console.error('Stripe lookup failed', err);
    return null;
  }
}

