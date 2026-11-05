'use client';

import { useState, useTransition } from 'react';
import { Flag } from 'lucide-react';
import { reportListing, type ReportResult } from '@/app/van/[slug]/actions';

const REASONS: [string, string][] = [
  ['closed', 'The van has closed or stopped trading'],
  ['wrong-location', 'Wrong location or times'],
  ['wrong-details', 'Wrong details (menu, contact, photos)'],
  ['not-their-listing', 'This is my van and I didn\'t list it'],
  ['other', 'Something else'],
];

const field = 'w-full rounded-xl border px-3 py-2.5 text-[15px]';
const fieldStyle: React.CSSProperties = { borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' };

/** Small "Something wrong with this listing?" form at the bottom of a van page. */
export function ReportListing({ vendorId }: { vendorId: string }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);
  const [pending, start] = useTransition();

  if (result?.ok) {
    return (
      <p className="text-[14px]" style={{ color: 'var(--success)' }}>
        Thanks for letting us know. We&apos;ll check it.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-[14px] underline"
        style={{ color: 'var(--muted)' }}
      >
        <Flag size={14} /> Something wrong with this listing?
      </button>
    );
  }

  return (
    <form
      action={(fd) => start(async () => setResult(await reportListing(vendorId, fd)))}
      className="rounded-2xl border p-5 max-w-xl"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <h2 className="text-[18px] font-bold mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
        Report a problem with this listing
      </h2>
      <fieldset className="mb-4">
        <legend className="text-[14px] font-semibold mb-2" style={{ color: 'var(--text)' }}>
          What&apos;s wrong?
        </legend>
        {REASONS.map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 text-[15px] mb-1.5" style={{ color: 'var(--text)' }}>
            <input type="radio" name="reason" value={value} required /> {label}
          </label>
        ))}
      </fieldset>
      <label className="block mb-4">
        <span className="block text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>
          Details (optional)
        </span>
        <textarea name="details" rows={3} maxLength={1500} className={field} style={fieldStyle} />
      </label>
      <label className="block mb-4">
        <span className="block text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>
          Your email (optional, if you&apos;d like a reply)
        </span>
        <input type="email" name="email" maxLength={120} className={field} style={fieldStyle} />
      </label>
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {result && !result.ok && (
        <p className="text-[14px] mb-3" role="alert" style={{ color: 'var(--error, #b42318)' }}>
          {result.error}
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full px-5 py-2.5 text-[15px] font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {pending ? 'Sending…' : 'Send report'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-[14px] underline" style={{ color: 'var(--muted)' }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
