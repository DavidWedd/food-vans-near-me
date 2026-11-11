import 'server-only';
import Stripe from 'stripe';
import { FOUNDING_REGIONS, isRegionId, type Plan, type RegionId } from './plans';

let client: Stripe | null = null;

/** Returns the Stripe client, or null when STRIPE_SECRET_KEY isn't set (e.g. local dev). */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!client) client = new Stripe(key, { appInfo: { name: 'Food Vans Near Me' } });
  return client;
}

/** Founding subscriptions are tagged with this metadata so we can count them. */
export const FOUNDING_METADATA = { founding: 'true' } as const;

/**
 * How many founding spots are left in each region. Counts every subscription ever tagged as
 * founding, including cancelled ones, so a spot isn't freed up by someone cancelling.
 * A founding subscription with no region on it is counted against the South.
 * Returns null if Stripe isn't configured or can't be reached.
 */
export async function foundingSpotsByRegion(): Promise<Record<RegionId, number> | null> {
  const stripe = getStripe();
  if (!stripe) return null;
  try {
    const used = Object.fromEntries(FOUNDING_REGIONS.map((r) => [r.id, 0])) as Record<RegionId, number>;
    let page: string | undefined;
    do {
      const result = await stripe.subscriptions.search({
        query: "metadata['founding']:'true'",
        limit: 100,
        page,
      });
      for (const sub of result.data) {
        const region = sub.metadata?.region;
        used[isRegionId(region) ? region : 'south'] += 1;
      }
      page = result.has_more ? (result.next_page ?? undefined) : undefined;
    } while (page);
    return Object.fromEntries(
      FOUNDING_REGIONS.map((r) => [r.id, Math.max(0, r.spots - used[r.id])])
    ) as Record<RegionId, number>;
  } catch (err) {
    console.error('Could not count founding spots', err);
    return null;
  }
}

/**
 * Finds the Stripe price for a plan by its lookup key. If it doesn't exist yet (e.g. a brand new
 * live account), creates the product and monthly GST-inclusive price so no manual setup is needed.
 */
export async function getOrCreatePrice(stripe: Stripe, plan: Plan): Promise<Stripe.Price> {
  const find = async () =>
    (await stripe.prices.list({ lookup_keys: [plan.lookupKey], active: true, limit: 1 })).data[0];
  const existing = await find();
  if (existing) return existing;
  try {
    return await stripe.prices.create({
      currency: 'aud',
      unit_amount: plan.priceCents,
      recurring: { interval: 'month' },
      tax_behavior: 'inclusive',
      lookup_key: plan.lookupKey,
      nickname: `${plan.name} monthly`,
      metadata: { plan: plan.id },
      product_data: {
        name: `${plan.name} listing`,
        statement_descriptor: 'FOODVANSNEAR.ME',
        metadata: { plan: plan.id },
      },
    });
  } catch (err) {
    // Another request may have created it at the same moment - use that one.
    const again = await find();
    if (again) return again;
    throw err;
  }
}
