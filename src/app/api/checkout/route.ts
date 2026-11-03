import { NextResponse, type NextRequest } from 'next/server';
import type Stripe from 'stripe';
import { FOUNDING, PLANS, isPlanId } from '@/lib/plans';
import { FOUNDING_METADATA, foundingSpotsLeft, getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/**
 * The Join page posts a plan here. We create a Stripe Checkout session and send the
 * vendor straight to it. While founding spots remain, any plan is free for 12 months.
 * No card is asked for unless something is due today.
 */
export async function POST(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const back = (reason: string) => NextResponse.redirect(`${origin}/join?checkout=${reason}#pricing`, 303);

  const form = await request.formData().catch(() => null);
  const planId = form?.get('plan');
  if (!isPlanId(planId)) return back('invalid-plan');
  const plan = PLANS[planId];

  const stripe = getStripe();
  if (!stripe) return back('unavailable');

  try {
    const prices = await stripe.prices.list({ lookup_keys: [plan.lookupKey], active: true, limit: 1 });
    const price = prices.data[0];
    if (!price) {
      console.error(`No active Stripe price with lookup key ${plan.lookupKey}`);
      return back('unavailable');
    }

    // 10% GST, already included in the price. Shows GST on invoices without needing Stripe Tax.
    const gst = (await stripe.taxRates.list({ active: true, inclusive: true, limit: 100 })).data.find(
      (r) => r.display_name === 'GST' && r.percentage === 10
    );

    const spotsLeft = await foundingSpotsLeft();
    const founding = spotsLeft !== null && spotsLeft > 0;
    const trialDays = founding ? FOUNDING.freeDays : plan.trialDays;

    const subscription_data: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
      billing_mode: { type: 'flexible' },
      description: founding
        ? `Founding vendor - ${plan.name} free for 12 months`
        : `${plan.name} plan`,
      metadata: { plan: plan.id, ...(founding ? FOUNDING_METADATA : {}) },
    };
    if (trialDays > 0) {
      subscription_data.trial_period_days = trialDays;
      // If they haven't added a card by the end of the free period, the plan simply ends.
      subscription_data.trial_settings = { end_behavior: { missing_payment_method: 'cancel' } };
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: price.id, quantity: 1, ...(gst ? { tax_rates: [gst.id] } : {}) }],
      subscription_data,
      payment_method_collection: trialDays > 0 ? 'if_required' : 'always',
      billing_address_collection: 'auto',
      phone_number_collection: { enabled: true },
      custom_fields: [
        {
          key: 'business_name',
          label: { type: 'custom', custom: 'Food van or business name' },
          type: 'text',
          text: { maximum_length: 80 },
        },
      ],
      tax_id_collection: { enabled: true },
      allow_promotion_codes: founding ? undefined : true,
      consent_collection: { terms_of_service: 'required' },
      custom_text: {
        terms_of_service_acceptance: {
          message: `I agree to the [Terms](${origin}/terms) and [Privacy Policy](${origin}/privacy).`,
        },
        submit: founding
          ? { message: `Founding vendor: ${plan.name} is free for 12 months. No card needed.` }
          : trialDays > 0
            ? { message: `Free for ${trialDays} days. We'll email you before it ends.` }
            : undefined,
      },
      success_url: `${origin}/join/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/join#pricing`,
      locale: 'en-GB',
    });

    if (!session.url) return back('unavailable');
    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    console.error('Stripe checkout failed', err);
    return back('unavailable');
  }
}
