'use client';

import { useState, useTransition } from 'react';
import { requestEmailChange, type EmailChangeResult } from '@/app/account/email-actions';

const statusMessages: Record<string, { text: string; good: boolean }> = {
  half: { text: 'One address confirmed. Now tap the link in the email sent to the other address.', good: true },
  changed: { text: 'Done - your login email has been changed.', good: true },
  error: { text: 'That link didn\'t work or has expired. Please start the change again.', good: false },
};

/** "Login email" card for the vendor dashboard and the customer account page. */
export function ChangeEmailCard({ current, status }: { current: string; status?: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [result, setResult] = useState<EmailChangeResult | null>(null);
  const [pending, start] = useTransition();
  const banner = status ? statusMessages[status] : undefined;

  return (
    <section
      className="rounded-2xl border p-5 sm:p-6 mb-6"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
      id="login-email"
    >
      <h2 className="text-[20px] font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
        Login email
      </h2>
      {banner && (
        <p
          className="text-[15px] mb-3 rounded-xl px-3 py-2"
          role="status"
          style={{
            color: banner.good ? 'var(--success)' : 'var(--error, #b42318)',
            backgroundColor: 'color-mix(in srgb, currentColor 8%, transparent)',
          }}
        >
          {banner.text}
        </p>
      )}
      <p className="text-[15px] mb-3" style={{ color: 'var(--text)' }}>
        You log in with <strong>{current}</strong>.
      </p>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full px-5 py-2.5 text-[15px] font-semibold border"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          Change login email
        </button>
      ) : (
        <form
          action={() => start(async () => setResult(await requestEmailChange(value)))}
          className="max-w-md"
        >
          <label className="block mb-3">
            <span className="block text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>
              New email
            </span>
            <input
              type="email"
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              maxLength={120}
              className="w-full rounded-xl border px-3 py-2.5 text-[15px]"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' }}
            />
            <span className="block text-[12px] mt-1" style={{ color: 'var(--muted)' }}>
              We&apos;ll email both your current and new address. The change happens once you&apos;ve tapped the link in both.
            </span>
          </label>
          <div className="flex gap-3 items-center">
            <button
              type="submit"
              disabled={pending}
              className="rounded-full px-5 py-2.5 text-[15px] font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {pending ? 'Sending…' : 'Send confirmation emails'}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-[14px] underline" style={{ color: 'var(--muted)' }}>
              Cancel
            </button>
          </div>
          {result && (
            <p
              className="text-[14px] mt-3"
              role={result.ok ? 'status' : 'alert'}
              style={{ color: result.ok ? 'var(--success)' : 'var(--error, #b42318)' }}
            >
              {result.ok ? result.message : result.error}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
