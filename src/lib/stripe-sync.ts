import 'server-only';
import type Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe';
import { isPlanId, type PlanId } from '@/lib/plans';

/** Statuses where the vendor keeps their plan's features. */
const ACTIVE = new Set(['trialing', 'active', 'past_due']);

export interface PlanState {
  tier: PlanId;
  founding: boolean;
  status: string;
}

/** Works out the plan from a Stripe subscription: by its price's lookup key, falling back to metadata. */
export function planFromSubscription(sub: Stripe.Subscription): PlanState {
  const lookup = sub.items.data[0]?.price?.lookup_key ?? '';
  const fromPrice = lookup.match(/^fvnm_(basic|pro|premium)_monthly$/)?.[1];
  const fromMeta = sub.metadata?.plan;
  const paidTier: PlanId = isPlanId(fromPrice) ? fromPrice : isPlanId(fromMeta) ? fromMeta : 'basic';
  const active = ACTIVE.has(sub.status);
  return {
    // A cancelled or unpaid vendor drops to Basic features; the admin decides whether to hide them
    tier: active ? paidTier : 'basic',
    founding: sub.metadata?.founding === 'true',
    status: sub.status,
  };
}

async function customerEmail(stripe: Stripe, customer: string | Stripe.Customer | Stripe.DeletedCustomer) {
  if (typeof customer !== 'string') return 'email' in customer ? customer.email : null;
  const c = await stripe.customers.retrieve(customer);
  return 'email' in c ? c.email : null;
}

/** Applies a subscription to the matching vendor (by Stripe customer, else by login email). */
export async function applySubscription(sub: Stripe.Subscription): Promise<'updated' | 'no-vendor' | 'not-configured'> {
  const stripe = getStripe();
  const db = createAdminClient();
  if (!stripe || !db) return 'not-configured';
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

  let { data: link } = await db
    .from('vendor_private')
    .select('vendor_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  if (!link) {
    const email = await customerEmail(stripe, sub.customer);
    if (email) {
      const { data } = await db
        .from('vendor_private')
        .select('vendor_id')
        .ilike('owner_email', email)
        .limit(1)
        .maybeSingle();
      link = data;
    }
  }
  if (!link) return 'no-vendor';

  const plan = planFromSubscription(sub);
  await Promise.all([
    db
      .from('vendors')
      .update({ subscription_tier: plan.tier, founding: plan.founding, plan_status: plan.status })
      .eq('id', link.vendor_id),
    db.from('vendor_private').update({ stripe_customer_id: customerId }).eq('vendor_id', link.vendor_id),
  ]);
  return 'updated';
}

/** Finds a vendor's newest subscription by their login email and applies it. Used when a listing is created. */
export async function syncVendorByEmail(email: string | null | undefined) {
  const stripe = getStripe();
  if (!stripe || !email) return;
  try {
    const customers = await stripe.customers.list({ email, limit: 5 });
    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({ customer: customer.id, status: 'all', limit: 1 });
      if (subs.data[0]) {
        await applySubscription(subs.data[0]);
        return;
      }
    }
  } catch (err) {
    console.error('Stripe sync by email failed', err);
  }
}

/** The vendor's Stripe customer id, from our records or by their login email. */
export async function findCustomerId(vendorId: string, email: string | null | undefined): Promise<string | null> {
  const stripe = getStripe();
  const db = createAdminClient();
  if (!stripe || !db) return null;
  const { data } = await db.from('vendor_private').select('stripe_customer_id').eq('vendor_id', vendorId).maybeSingle();
  if (data?.stripe_customer_id) return data.stripe_customer_id;
  if (!email) return null;
  const customers = await stripe.customers.list({ email, limit: 1 });
  return customers.data[0]?.id ?? null;
}

/**
 * Makes sure Stripe's self-service billing page is set up: vendors can switch between our three plans,
 * update their card, see invoices and cancel at the end of the period.
 */
export async function ensurePortalConfiguration(stripe: Stripe): Promise<string> {
  const existing = await stripe.billingPortal.configurations.list({ active: true, limit: 20 });
  const ours = existing.data.find((c) => c.metadata?.fvnm === 'v1');
  if (ours) return ours.id;

  const prices = await stripe.prices.list({
    lookup_keys: ['fvnm_basic_monthly', 'fvnm_pro_monthly', 'fvnm_premium_monthly'],
    active: true,
    limit: 3,
  });
  const products = prices.data.map((p) => ({
    product: typeof p.product === 'string' ? p.product : p.product.id,
    prices: [p.id],
  }));
  const config = await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: 'Food Vans Near Me - manage your plan',
      privacy_policy_url: 'https://foodvansnear.me/privacy',
      terms_of_service_url: 'https://foodvansnear.me/terms',
    },
    features: {
      customer_update: { enabled: true, allowed_updates: ['email', 'name', 'address', 'phone', 'tax_id'] },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: {
        enabled: true,
        mode: 'at_period_end',
        cancellation_reason: {
          enabled: true,
          options: ['too_expensive', 'missing_features', 'unused', 'other'],
        },
      },
      subscription_update: products.length
        ? {
            enabled: true,
            default_allowed_updates: ['price'],
            proration_behavior: 'create_prorations',
            products,
          }
        : { enabled: false },
    },
    metadata: { fvnm: 'v1' },
  });
  return config.id;
}
