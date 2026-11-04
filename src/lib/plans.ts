/**
 * Vendor plans. Prices are in cents, AUD, GST included.
 * Each plan's Stripe price is found by its lookup key, so no price IDs need copying around.
 */
export type PlanId = 'basic' | 'pro' | 'premium';

export interface Plan {
  id: PlanId;
  name: string;
  priceCents: number;
  lookupKey: string;
  /** Free days for regular (non-founding) vendors. 0 = no trial. */
  trialDays: number;
}

export const PLANS: Record<PlanId, Plan> = {
  basic: { id: 'basic', name: 'Basic', priceCents: 1900, lookupKey: 'fvnm_basic_monthly', trialDays: 30 },
  pro: { id: 'pro', name: 'Pro', priceCents: 3900, lookupKey: 'fvnm_pro_monthly', trialDays: 30 },
  premium: { id: 'premium', name: 'Premium', priceCents: 6900, lookupKey: 'fvnm_premium_monthly', trialDays: 0 },
};

export const FOUNDING = {
  /** How many founding spots there are. */
  spots: 15,
  /** Founding vendors get any plan free for this many days. */
  freeDays: 365,
} as const;

export function isPlanId(value: unknown): value is PlanId {
  return value === 'basic' || value === 'pro' || value === 'premium';
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

/** What each plan unlocks. Basic: live pin, profile and photos, menu. */
export const PLAN_FEATURES = {
  schedule: ['pro', 'premium'],
  enquiries: ['pro', 'premium'],
  analytics: ['pro', 'premium'],
  featuredPin: ['premium'],
  vendorOfWeek: ['premium'],
} as const satisfies Record<string, readonly PlanId[]>;

export type PlanFeature = keyof typeof PLAN_FEATURES;

export function hasFeature(tier: string | undefined | null, feature: PlanFeature): boolean {
  return (PLAN_FEATURES[feature] as readonly string[]).includes(tier ?? 'basic');
}

/** The cheapest plan that includes a feature, for "upgrade to ..." messages. */
export function planFor(feature: PlanFeature): Plan {
  return PLANS[PLAN_FEATURES[feature][0]];
}
