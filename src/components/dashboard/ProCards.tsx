import { Lock } from 'lucide-react';
import type { VendorStats } from '@/lib/vendor-stats';

const cardStyle = { borderColor: 'var(--border)', backgroundColor: 'var(--surface)' };

/** Shown in place of a feature the vendor's plan doesn't include. */
export function LockedCard({ title, planName, children }: { title: string; planName: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border p-5 sm:p-6 mb-6" style={{ ...cardStyle, opacity: 0.9 }}>
      <h2 className="text-[20px] font-bold mb-1 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
        <Lock size={18} style={{ color: 'var(--muted)' }} /> {title}
      </h2>
      <p className="text-[14px] mb-2" style={{ color: 'var(--muted)' }}>
        {children}
      </p>
      <p className="text-[14px]" style={{ color: 'var(--text)' }}>
        Included on the <strong>{planName}</strong> plan.{' '}
        <a href="mailto:hello@foodvansnear.me?subject=Upgrade%20my%20plan" className="underline" style={{ color: 'var(--primary)' }}>
          Email us to upgrade
        </a>
        .
      </p>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: 'var(--border)' }}>
      <p className="text-[12px]" style={{ color: 'var(--muted)' }}>{label}</p>
      <p className="text-[24px] font-extrabold" style={{ color: 'var(--text)' }}>{value}</p>
    </div>
  );
}

export function StatsCard({ stats }: { stats: VendorStats }) {
  return (
    <section className="rounded-2xl border p-5 sm:p-6 mb-6" style={cardStyle}>
      <h2 className="text-[20px] font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
        Your stats
      </h2>
      <p className="text-[14px] mb-4" style={{ color: 'var(--muted)' }}>
        The last {stats.days} days.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat label="Page views" value={stats.profileViews} />
        <Stat label="Map pin taps" value={stats.mapClicks} />
        <Stat label="Contact taps" value={stats.contactClicks + stats.websiteClicks} />
        <Stat label="Enquiries" value={stats.enquiries} />
        <Stat label="Days you tapped I'm here" value={stats.tradingDays} />
        <Stat label="Searches near your spots" value={stats.nearbySearches} />
      </div>
      {stats.hasSpots ? (
        stats.nearbySearches > 0 ? (
          <div className="grid sm:grid-cols-2 gap-5 text-[14px]" style={{ color: 'var(--text)' }}>
            <div>
              <p className="font-semibold mb-1">When people search near you</p>
              <ul className="space-y-1">
                {stats.busiestTimes.map((t) => (
                  <li key={t.label}>
                    {t.label} <span style={{ color: 'var(--muted)' }}>· {t.count} searches</span>
                  </li>
                ))}
              </ul>
            </div>
            {stats.topPlaces.length > 0 && (
              <div>
                <p className="font-semibold mb-1">Places people searched</p>
                <ul className="space-y-1">
                  {stats.topPlaces.map((t) => (
                    <li key={t.label}>
                      {t.label} <span style={{ color: 'var(--muted)' }}>· {t.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[14px]" style={{ color: 'var(--muted)' }}>
            No searches near your spots yet. These fill in as more people use the map.
          </p>
        )
      ) : (
        <p className="text-[14px]" style={{ color: 'var(--muted)' }}>
          Add your regular trading times or tap &quot;I&apos;m here&quot; once, and we&apos;ll show when people search near you.
        </p>
      )}
    </section>
  );
}

export interface EnquiryRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  event_date: string | null;
  event_location: string | null;
  guests: number | null;
  message: string;
  created_at: string;
}

export function EnquiriesCard({ enquiries }: { enquiries: EnquiryRow[] }) {
  return (
    <section className="rounded-2xl border p-5 sm:p-6 mb-6" style={cardStyle}>
      <h2 className="text-[20px] font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
        Catering enquiries
      </h2>
      <p className="text-[14px] mb-4" style={{ color: 'var(--muted)' }}>
        People can book you from your page. Each enquiry is also emailed to you, and Reply goes straight to them.
      </p>
      {enquiries.length === 0 ? (
        <p className="text-[14px]" style={{ color: 'var(--muted)' }}>No enquiries yet.</p>
      ) : (
        <ul className="space-y-3">
          {enquiries.map((e) => (
            <li key={e.id} className="rounded-xl border p-4 text-[14px]" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
              <p className="font-semibold">
                {e.name}
                <span className="font-normal" style={{ color: 'var(--muted)' }}>
                  {' '}
                  · {new Date(e.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', timeZone: 'Australia/Hobart' })}
                </span>
              </p>
              <p style={{ color: 'var(--muted)' }}>
                {[
                  e.event_date &&
                    new Date(`${e.event_date}T00:00:00`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }),
                  e.event_location,
                  e.guests && `${e.guests} guests`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <p className="mt-2 whitespace-pre-line">{e.message}</p>
              <p className="mt-2 flex flex-wrap gap-4">
                <a href={`mailto:${e.email}?subject=${encodeURIComponent('Your catering enquiry')}`} className="underline" style={{ color: 'var(--primary)' }}>
                  Reply to {e.email}
                </a>
                {e.phone && (
                  <a href={`tel:${e.phone.replace(/\s/g, '')}`} className="underline" style={{ color: 'var(--primary)' }}>
                    Call {e.phone}
                  </a>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
