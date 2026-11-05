'use client';

import { useState, useTransition } from 'react';
import { replyToReview, type Result } from '@/app/account/actions';
import { Card, Notice, inputClass, inputStyle } from './ui';

export interface DashboardReview {
  id: string;
  display_name: string;
  rating: number;
  comment: string | null;
  vendor_reply: string | null;
  created_at: string;
}

export function ReviewsCard({ reviews }: { reviews: DashboardReview[] }) {
  const avg = reviews.length ? reviews.reduce((t, r) => t + r.rating, 0) / reviews.length : 0;
  return (
    <Card
      title="Reviews"
      intro={
        reviews.length
          ? `${reviews.length} review${reviews.length > 1 ? 's' : ''}, averaging ${avg.toFixed(1)} stars. A short, friendly reply shows customers you care.`
          : 'No reviews yet. Ask happy customers to leave one on your page.'
      }
    >
      <ul className="space-y-4">
        {reviews.map((r) => (
          <ReviewItem key={r.id} review={r} />
        ))}
      </ul>
    </Card>
  );
}

function ReviewItem({ review: r }: { review: DashboardReview }) {
  const [reply, setReply] = useState(r.vendor_reply ?? '');
  const [result, setResult] = useState<Result | null>(null);
  const [pending, start] = useTransition();
  return (
    <li className="rounded-xl border p-4 text-[14px]" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
      <p>
        <strong>{r.display_name}</strong> <span style={{ color: 'var(--primary)' }}>{'★'.repeat(r.rating)}</span>
        <span style={{ color: 'var(--muted)' }}>
          {' '}
          · {new Date(r.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', timeZone: 'Australia/Hobart' })}
        </span>
      </p>
      {r.comment && <p className="mt-1">{r.comment}</p>}
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        maxLength={1000}
        rows={2}
        placeholder="Write a public reply (optional)"
        className={`${inputClass} mt-3`}
        style={inputStyle}
      />
      <button
        disabled={pending}
        onClick={() => start(async () => setResult(await replyToReview(r.id, reply)))}
        className="mt-2 rounded-full border px-4 py-2 text-[14px] font-semibold disabled:opacity-60"
        style={{ borderColor: 'var(--border)' }}
      >
        {pending ? 'Saving…' : r.vendor_reply ? 'Update reply' : 'Post reply'}
      </button>
      <Notice result={result} />
    </li>
  );
}
