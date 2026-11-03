import { FOUNDING_SPOT_MAILTO } from '@/lib/business';
import type { PlanId } from '@/lib/plans';

/**
 * Sends the vendor to Stripe Checkout for a plan. Works without JavaScript (plain form post).
 * If Stripe isn't configured, it falls back to the founding-spot email.
 */
export function PlanButton({
  plan,
  enabled,
  className,
  style,
  children,
}: {
  plan: PlanId;
  enabled: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  if (!enabled) {
    return (
      <a href={FOUNDING_SPOT_MAILTO} className={className} style={style}>
        {children}
      </a>
    );
  }
  return (
    <form action="/api/checkout" method="post">
      <input type="hidden" name="plan" value={plan} />
      <button type="submit" className={`w-full cursor-pointer ${className ?? ''}`} style={style}>
        {children}
      </button>
    </form>
  );
}
