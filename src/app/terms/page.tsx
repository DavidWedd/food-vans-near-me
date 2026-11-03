import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage } from '@/components/layout/ContentPage';
import { BUSINESS, BUSINESS_LINE, LEGAL_LAST_UPDATED } from '@/lib/business';

export const metadata: Metadata = {
  title: 'Terms of Use - Food Vans Near Me',
  description: 'The terms for using Food Vans Near Me, including vendor listings and subscriptions.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <ContentPage
      title="Terms of Use"
      intro={`${BUSINESS_LINE}. These terms apply to everyone who uses ${BUSINESS.website.replace('https://', '')}.`}
      updated={LEGAL_LAST_UPDATED}
    >
      <p>
        In these terms, &quot;we&quot;, &quot;us&quot; and &quot;our&quot; mean {BUSINESS.legalName} trading as{' '}
        {BUSINESS.tradingName}. &quot;Vendor&quot; means a food van, food truck, coffee cart, market stall or
        other mobile food or drink business listed on the site. By using the site you agree to these terms. If
        you don&apos;t agree, please don&apos;t use the site.
      </p>

      <h2>1. What the site does</h2>
      <p>
        {BUSINESS.tradingName} is a directory and map that helps people find mobile food vendors and the
        markets where they trade. We don&apos;t make, sell or deliver food. Any purchase you make from a vendor
        is between you and that vendor.
      </p>

      <h2>2. Listings and accuracy</h2>
      <p>
        Vendors supply their own information, including locations, trading times, menus, prices, dietary and
        allergen details, and payment methods. Locations and times can change at short notice. We try to keep
        the site accurate, but we can&apos;t guarantee that a vendor will be where or when the site says.
      </p>
      <p>
        <strong>Allergies and dietary needs:</strong> dietary tags are provided by vendors. Always check
        directly with the vendor before you eat if you have an allergy or medical dietary requirement.
      </p>
      <p>
        Market details are taken from the markets&apos; own published information. Check the market&apos;s
        website before you go.
      </p>

      <h2>3. Vendor accounts</h2>
      <p>If you list your business, you agree that:</p>
      <ul>
        <li>you are authorised to act for the business, and the details you give us are true and up to date</li>
        <li>
          your business holds the registrations, permits and insurance it needs, including food business
          registration with your local council and any permits for the places you trade
        </li>
        <li>you&apos;ll only mark yourself as trading at a location when you are actually trading there</li>
        <li>you own, or have permission to use, the photos, logos and text you upload</li>
        <li>you&apos;ll keep your login details secure and tell us if your account is misused</li>
      </ul>
      <p>
        You give us a non-exclusive, royalty-free licence to display your listing content on the site and to
        use it to promote the site and your business (for example on our social media). You can remove your
        content at any time by editing or closing your listing.
      </p>
      <p>
        We may review, edit for formatting, decline or remove listings that are inaccurate, misleading,
        offensive or in breach of these terms.
      </p>

      <h2>4. Plans, trials and payments</h2>
      <ul>
        <li>
          Paid plans are monthly subscriptions, billed in advance in Australian dollars. Prices
          {BUSINESS.gstRegistered ? ' include GST and we issue tax invoices' : ' are shown on the pricing page'}.
        </li>
        <li>Payments are processed by Stripe. Your subscription renews each month until you cancel.</li>
        <li>
          Free trials and founding-vendor offers run for the period stated when you sign up. We&apos;ll email
          you before a free period ends. Your plan only becomes paid if you add a payment method and choose to
          continue.
        </li>
        <li>
          You can cancel at any time. Cancelling stops future payments, and your plan stays active until the
          end of the period you&apos;ve paid for. There are no lock-in contracts.
        </li>
        <li>
          We may change our prices with at least 30 days&apos; notice by email. If you don&apos;t want to
          continue at the new price, you can cancel before it applies.
        </li>
        <li>
          If a payment fails, we&apos;ll let you know. If it isn&apos;t fixed, we may pause your paid
          features.
        </li>
      </ul>

      <h2>5. Using the site fairly</h2>
      <p>You must not:</p>
      <ul>
        <li>post false, misleading or offensive content, or pretend to be another business</li>
        <li>copy, scrape or resell the site&apos;s listings or data without our written permission</li>
        <li>try to break, overload or get unauthorised access to the site or its systems</li>
        <li>use the site to send spam or for anything unlawful</li>
      </ul>

      <h2>6. Our content</h2>
      <p>
        The site&apos;s design, logo, text and software belong to us or our licensors. Map data is provided by
        Mapbox and OpenStreetMap contributors under their own terms.
      </p>

      <h2>7. Your rights under Australian Consumer Law</h2>
      <p>
        Our services come with guarantees that cannot be excluded under the Australian Consumer Law. Nothing in
        these terms limits those rights.
      </p>

      <h2>8. Limits on our responsibility</h2>
      <p>
        To the extent the law allows, we are not responsible for the food, service, prices, safety or conduct
        of vendors or markets, or for loss caused by inaccurate listings or the site being unavailable. Where
        our liability can be limited, it is limited to supplying the service again or refunding what you paid
        us for the relevant period.
      </p>

      <h2>9. Suspending or closing accounts</h2>
      <p>
        We may suspend or close a vendor account that breaches these terms, after letting you know where
        reasonable. You can close your account at any time by contacting us.
      </p>

      <h2>10. Changes to these terms</h2>
      <p>
        We may update these terms as the site grows. The date at the top shows when they last changed. For
        changes that significantly affect vendors, we&apos;ll give at least 30 days&apos; notice by email.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These terms are governed by the laws of {BUSINESS.state}, Australia, and the courts of{' '}
        {BUSINESS.state} have jurisdiction.
      </p>

      <h2>12. Contact us</h2>
      <p>
        {BUSINESS.legalName} trading as {BUSINESS.tradingName}
        <br />
        ABN {BUSINESS.abn}
        <br />
        {BUSINESS.postalAddress}
        <br />
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
      </p>
      <p>
        See also our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </ContentPage>
  );
}
