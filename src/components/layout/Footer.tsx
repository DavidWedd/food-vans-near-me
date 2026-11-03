'use client';

import Link from 'next/link';

function FoodVanLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="2" y="13" width="22" height="10" rx="2" fill="currentColor" opacity="0.9" />
      <path d="M16 13H24V11L20 8H16V13Z" fill="currentColor" />
      <rect x="17" y="9" width="5" height="3" rx="1" fill="white" opacity="0.8" />
      <rect x="5" y="14" width="7" height="5" rx="1" fill="white" opacity="0.7" />
      <circle cx="7" cy="23" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="7" cy="23" r="1.5" fill="white" opacity="0.8" />
      <circle cx="19" cy="23" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="19" cy="23" r="1.5" fill="white" opacity="0.8" />
      <path
        d="M13 12C13 10.3 14.3 9 16 9C17.7 9 19 10.3 19 12C19 14 16 17 16 17C16 17 13 14 13 12Z"
        fill="var(--primary,#E07B00)"
      />
      <circle cx="16" cy="12" r="1.2" fill="white" />
    </svg>
  );
}

const FOOD_SAFETY_LINKS = [
  { label: 'TAS Department of Health', url: 'https://www.health.tas.gov.au/node/4656' },
  { label: 'NSW Food Authority', url: 'https://www.foodauthority.nsw.gov.au' },
  { label: 'VIC FoodTrader', url: 'https://www.foodtrader.vic.gov.au' },
  {
    label: 'QLD Health',
    url: 'https://www.qld.gov.au/health/staying-healthy/food-pantry/food-safety-for-businesses',
  },
  { label: 'WA Dept of Health', url: 'https://ww2.health.wa.gov.au/Articles/F_I/Food-businesses' },
  { label: 'SA Food Safety', url: 'https://www.sahealth.sa.gov.au/foodsafety' },
  { label: 'ACT Health', url: 'https://www.health.act.gov.au/businesses/food-safety' },
  { label: 'NT Health', url: 'https://nt.gov.au/industry/food-safety-and-regulation' },
];

export function Footer() {
  return (
    <footer
      className="border-t"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--primary)' }}>
              <FoodVanLogo size={26} />
              <span
                className="font-bold text-[17px]"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
              >
                Food Vans <span style={{ color: 'var(--primary)' }}>Near Me</span>
              </span>
            </div>
            <p className="text-[14px] leading-relaxed" style={{ color: 'var(--muted)' }}>
              Tasmania&apos;s food van map - find food trucks, coffee carts and market stalls near
              you.
            </p>
          </div>

          {/* Discover column */}
          <div>
            <h3
              className="font-bold text-[13px] uppercase tracking-wider mb-4"
              style={{ color: 'var(--text)' }}
            >
              Discover
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Find Vans', href: '/' },
                { label: 'Markets & Events', href: '/markets' },
                { label: 'List Your Van', href: '/join' },
                { label: 'About', href: '#' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[14px] transition-colors"
                    style={{ color: 'var(--muted)' }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = 'var(--primary)')
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = 'var(--muted)')
                    }
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Vendors column */}
          <div>
            <h3
              className="font-bold text-[13px] uppercase tracking-wider mb-4"
              style={{ color: 'var(--text)' }}
            >
              For Vendors
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'How it works', href: '/join#how-it-works' },
                { label: 'Pricing', href: '/join#pricing' },
                { label: 'Sign up', href: '/join' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[14px] transition-colors"
                    style={{ color: 'var(--muted)' }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = 'var(--primary)')
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = 'var(--muted)')
                    }
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Food Safety column */}
          <div>
            <h3
              className="font-bold text-[13px] uppercase tracking-wider mb-4"
              style={{ color: 'var(--text)' }}
            >
              Food Safety
            </h3>
            <ul className="space-y-2.5">
              {FOOD_SAFETY_LINKS.map(({ label, url }) => (
                <li key={label}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] transition-colors"
                    style={{ color: 'var(--muted)' }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = 'var(--primary)')
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = 'var(--muted)')
                    }
                  >
                    {label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[13px]"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          <p>© 2026 Food Vans Near Me · Australian English · ABN XXXXXXXXX</p>
          <p>
            Made in Hobart for hungry Tasmanians
          </p>
        </div>
      </div>
    </footer>
  );
}
