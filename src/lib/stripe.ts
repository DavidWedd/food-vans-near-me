import 'server-only';
import Stripe from 'stripe';
import { FOUNDING } from './plans';

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
 * How many founding spots are left. Counts every subscription ever tagged as founding,
 * including cancelled ones, so a spot isn't freed up by someone cancelling.
 * Returns null if Stripe isn't configured or can't be reached.
 */
export async function foundingSpotsLeft(): Promise<number | null> {
  const stripe = getStripe();
  if (!stripe) return null;
  try {
    let used = 0;
    let page: string | undefined;
    do {
      const result = await stripe.subscriptions.search({
        query: "metadata['founding']:'true'",
        limit: 100,
        page,
      });
      used += result.data.length;
      page = result.has_more ? (result.next_page ?? undefined) : undefined;
    } while (page);
    return Math.max(0, FOUNDING.spots - used);
  } catch (err) {
    console.error('Could not count founding spots', err);
    return null;
  }
}
