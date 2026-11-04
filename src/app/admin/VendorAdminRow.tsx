'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import type { StripeInfo } from '@/lib/stripe-admin';
import { approveWithStripe, clearLive, saveNotes, setPlan, setStatus, setVendorOfWeek, type AdminResult } from './actions';
import { Notice, inputClass, inputStyle } from '@/components/dashboard/ui';

export interface AdminVendor {
  id: string;
  slug: string;
  business_name: string;
  suburb: string;
  owner_email: string | null;
  status: 'pending' | 'approved' | 'hidden';
  subscription_tier: string;
  founding: boolean;
  admin_notes: string;
  vendor_of_week: boolean;
  created_at: string;
  live_until: string | null;
  live_suburb: string;
  has_logo: boolean;
  has_cover: boolean;
  has_description: boolean;
  stripe: StripeInfo | null;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-AU', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Australia/Hobart' });

export function VendorAdminRow({ vendor: v }: { vendor: AdminVendor }) {
  const [result, setResult] = useState<AdminResult | null>(null);
  const [pending, start] = useTransition();
  const [tier, setTier] = useState(v.subscription_tier);
  const [founding, setFounding] = useState(v.founding);
  const [notes, setNotes] = useState(v.admin_notes);
  const run = (fn: () => Promise<AdminResult>) => start(async () => setResult(await fn()));

  const missing = [
    !v.has_description && 'description',
    !v.has_logo && 'logo',
    !v.has_cover && 'cover photo',
  ].filter(Boolean);

  return (
    <article className="rounded-2xl border p-5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-bold" style={{ color: 'var(--text)' }}>
            {v.business_name}
            {v.suburb && <span className="font-normal" style={{ color: 'var(--muted)' }}> · {v.suburb}</span>}
          </h2>
          <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
            {v.owner_email ?? 'No login linked'} · joined {fmt(v.created_at)}
          </p>
          {v.live_until && (
            <p className="text-[13px] font-semibold mt-1" style={{ color: 'var(--success)' }}>
              Trading now{v.live_suburb ? ` in ${v.live_suburb}` : ''} until {fmt(v.live_until)}
            </p>
          )}
          {missing.length > 0 && (
            <p className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>
              Still missing: {missing.join(', ')}
            </p>
          )}
        </div>
        <span
          className="text-[12px] font-bold uppercase tracking-wide rounded-full px-3 py-1"
          style={{
            backgroundColor:
              v.status === 'approved' ? 'var(--success)' : v.status === 'pending' ? 'var(--primary)' : 'var(--muted)',
            color: 'white',
          }}
        >
          {v.status === 'approved' ? 'On the map' : v.status === 'pending' ? 'Waiting' : 'Hidden'}
        </span>
      </div>

      <div className="mt-3 text-[14px]" style={{ color: 'var(--text)' }}>
        <strong>Stripe:</strong>{' '}
        {v.stripe ? (
          <>
            {v.stripe.plan ? `${v.stripe.plan} plan` : 'no plan'} · {v.stripe.status}
            {v.stripe.founding ? ' · founding vendor' : ''}
            {v.stripe.freeUntil ? ` · free until ${fmt(v.stripe.freeUntil)}` : ''}
            {v.stripe.customerUrl && (
              <>
                {' '}
                ·{' '}
                <a href={v.stripe.customerUrl} target="_blank" rel="noreferrer" className="underline">
                  open in Stripe
                </a>
              </>
            )}
          </>
        ) : (
          <span style={{ color: 'var(--muted)' }}>no sign-up found for this email</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {v.status !== 'approved' && (
          <button
            disabled={pending}
            onClick={() => run(() => approveWithStripe(v.id))}
            className="rounded-full px-5 py-2 text-[14px] font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: 'var(--success)' }}
          >
            Approve
          </button>
        )}
        {v.status !== 'hidden' && (
          <button
            disabled={pending}
            onClick={() => run(() => setStatus(v.id, 'hidden'))}
            className="rounded-full px-5 py-2 text-[14px] font-semibold border disabled:opacity-60"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            Hide
          </button>
        )}
        {v.live_until && (
          <button
            disabled={pending}
            onClick={() => run(() => clearLive(v.id))}
            className="rounded-full px-5 py-2 text-[14px] font-semibold border disabled:opacity-60"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            Take off live map
          </button>
        )}
        {v.status === 'approved' && v.subscription_tier === 'premium' && (
          <button
            disabled={pending}
            onClick={() => run(() => setVendorOfWeek(v.vendor_of_week ? null : v.id))}
            className="rounded-full px-5 py-2 text-[14px] font-semibold border disabled:opacity-60"
            style={{ borderColor: '#F5B301', color: 'var(--text)', backgroundColor: v.vendor_of_week ? '#F5B30133' : 'transparent' }}
          >
            {v.vendor_of_week ? '★ Vendor of the Week (clear)' : '★ Make Vendor of the Week'}
          </button>
        )}
        {v.status === 'approved' && (
          <Link
            href={`/van/${v.slug}`}
            target="_blank"
            className="rounded-full px-5 py-2 text-[14px] font-semibold border"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            View page
          </Link>
        )}
      </div>

      <details className="mt-4">
        <summary className="text-[14px] cursor-pointer" style={{ color: 'var(--muted)' }}>
          Plan and notes
        </summary>
        <div className="mt-3 grid sm:grid-cols-[160px_auto_1fr] gap-3 items-center">
          <select value={tier} onChange={(e) => setTier(e.target.value)} className={inputClass} style={inputStyle} aria-label="Plan">
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="premium">Premium</option>
          </select>
          <label className="inline-flex items-center gap-2 text-[14px]" style={{ color: 'var(--text)' }}>
            <input type="checkbox" checked={founding} onChange={(e) => setFounding(e.target.checked)} />
            Founding vendor
          </label>
          <button
            disabled={pending}
            onClick={() => run(() => setPlan(v.id, tier, founding))}
            className="justify-self-start rounded-full px-5 py-2 text-[14px] font-semibold border disabled:opacity-60"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            Save plan
          </button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Private notes (only you see these)"
          className={`${inputClass} mt-3`}
          style={inputStyle}
        />
        <button
          disabled={pending}
          onClick={() => run(() => saveNotes(v.id, notes))}
          className="mt-2 rounded-full px-5 py-2 text-[14px] font-semibold border disabled:opacity-60"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          Save notes
        </button>
      </details>

      <Notice result={result} />
    </article>
  );
}
