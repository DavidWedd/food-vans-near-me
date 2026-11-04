'use client';

import { useState, useTransition } from 'react';
import { submitEnquiry, type EnquiryResult } from '@/app/van/[slug]/actions';

const input = 'w-full rounded-xl border px-3 py-2.5 text-[15px]';
const inputStyle = { borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' };

export function EnquiryForm({ vendorId, vendorName }: { vendorId: string; vendorName: string }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<EnquiryResult | null>(null);
  const [pending, start] = useTransition();

  if (result?.ok) {
    return (
      <div
        role="status"
        className="rounded-2xl p-5 text-[15px]"
        style={{ backgroundColor: 'color-mix(in srgb, var(--success) 12%, var(--surface))', color: 'var(--text)' }}
      >
        <strong>Sent!</strong> {vendorName} will reply to you by email.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full px-6 py-3 text-[15px] font-semibold text-white"
        style={{ backgroundColor: 'var(--primary)' }}
      >
        Book this van for an event
      </button>
    );
  }

  return (
    <form
      className="rounded-2xl border p-5"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => setResult(await submitEnquiry(vendorId, fd)));
      }}
    >
      <p className="text-[15px] mb-4" style={{ color: 'var(--text)' }}>
        Tell {vendorName} about your event. They&apos;ll reply to you by email.
      </p>
      {/* Hidden from people; bots fill it in */}
      <input type="text" name="company_website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>Your name</span>
          <input name="name" required maxLength={80} autoComplete="name" className={input} style={inputStyle} />
        </label>
        <label className="block">
          <span className="block text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>Email</span>
          <input name="email" type="email" required maxLength={120} autoComplete="email" className={input} style={inputStyle} />
        </label>
        <label className="block">
          <span className="block text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>Phone (optional)</span>
          <input name="phone" maxLength={30} autoComplete="tel" className={input} style={inputStyle} />
        </label>
        <label className="block">
          <span className="block text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>Event date (optional)</span>
          <input name="event_date" type="date" className={input} style={inputStyle} />
        </label>
        <label className="block">
          <span className="block text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>Where (optional)</span>
          <input name="event_location" maxLength={120} placeholder="Suburb or venue" className={input} style={inputStyle} />
        </label>
        <label className="block">
          <span className="block text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>Guests (optional)</span>
          <input name="guests" type="number" min={1} inputMode="numeric" className={input} style={inputStyle} />
        </label>
      </div>
      <label className="block mt-3">
        <span className="block text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>About your event</span>
        <textarea name="message" required maxLength={2000} rows={4} className={input} style={inputStyle} />
      </label>
      <p className="text-[12px] mt-2" style={{ color: 'var(--muted)' }}>
        We pass your details to this van so they can reply. See our <a href="/privacy" className="underline">Privacy Policy</a>.
      </p>
      {result && !result.ok && (
        <p role="alert" className="text-[14px] mt-3" style={{ color: '#b42318' }}>
          {result.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 rounded-full px-6 py-3 text-[15px] font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: 'var(--primary)' }}
      >
        {pending ? 'Sending…' : 'Send enquiry'}
      </button>
    </form>
  );
}
