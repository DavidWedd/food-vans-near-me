'use client';

import { useState, useTransition } from 'react';
import { setReviewHidden, type AdminResult } from './actions';
import { Notice } from '@/components/dashboard/ui';

export interface AdminReview {
  id: string;
  vendor_name: string;
  display_name: string;
  rating: number;
  comment: string | null;
  hidden: boolean;
  created_at: string;
}

export function ReviewModeration({ reviews }: { reviews: AdminReview[] }) {
  return (
    <section className="mt-12">
      <h2 className="text-[22px] font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
        Latest reviews
      </h2>
      <p className="text-[14px] mb-4" style={{ color: 'var(--muted)' }}>
        Reviews go up straight away. Hide any that are abusive, fake or break the Terms.
      </p>
      {reviews.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No reviews yet.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <Row key={r.id} review={r} />
          ))}
        </ul>
      )}
    </section>
  );
}

function Row({ review: r }: { review: AdminReview }) {
  const [hidden, setHidden] = useState(r.hidden);
  const [result, setResult] = useState<AdminResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <li className="rounded-xl border p-4 text-[14px]" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)', opacity: hidden ? 0.6 : 1 }}>
      <p>
        <strong>{r.vendor_name}</strong> · {r.display_name} <span style={{ color: 'var(--primary)' }}>{'★'.repeat(r.rating)}</span>
        {hidden && <span style={{ color: 'var(--muted)' }}> · hidden</span>}
      </p>
      {r.comment && <p className="mt-1">{r.comment}</p>}
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await setReviewHidden(r.id, !hidden);
            setResult(res);
            if (res.ok) setHidden(!hidden);
          })
        }
        className="mt-2 underline"
        style={{ color: 'var(--primary)' }}
      >
        {hidden ? 'Show again' : 'Hide this review'}
      </button>
      <Notice result={result} />
    </li>
  );
}
