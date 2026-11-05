'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { createBrowserSupabase } from '@/lib/supabase/browser';
import { deleteReview, saveReview, type Result } from '@/app/account/actions';

const input = 'w-full rounded-xl border px-3 py-2.5 text-[15px]';
const inputStyle = { borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' };

/** Write or edit your review of a van. Shows a login link to visitors who aren't logged in. */
export function ReviewForm({ vendorId, slug }: { vendorId: string; slug: string }) {
  const [user, setUser] = useState<'unknown' | 'out' | 'owner' | 'in'>('unknown');
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [hasReview, setHasReview] = useState(false);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createBrowserSupabase();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return setUser('out');
      const [{ data: own }, { data: mine }] = await Promise.all([
        supabase.from('vendors').select('id').eq('id', vendorId).eq('owner_id', data.user.id).maybeSingle(),
        supabase.from('reviews').select('rating, display_name, comment').eq('vendor_id', vendorId).eq('user_id', data.user.id).maybeSingle(),
      ]);
      if (own) return setUser('owner');
      setUser('in');
      if (mine) {
        setHasReview(true);
        setRating(mine.rating);
        setName(mine.display_name);
        setComment(mine.comment ?? '');
      }
    });
  }, [vendorId]);

  if (user === 'unknown' || user === 'owner') return null;
  if (user === 'out') {
    return (
      <p className="text-[14px]" style={{ color: 'var(--muted)' }}>
        <Link href={`/account/login?next=${encodeURIComponent(`/van/${slug}#reviews`)}`} className="underline" style={{ color: 'var(--primary)' }}>
          Log in to leave a review
        </Link>
      </p>
    );
  }
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border px-5 py-2.5 text-[15px] font-semibold"
        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
      >
        {hasReview ? 'Edit your review' : 'Write a review'}
      </button>
    );
  }
  return (
    <form
      className="rounded-2xl border p-5"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData();
        fd.set('rating', String(rating));
        fd.set('display_name', name);
        fd.set('comment', comment);
        start(async () => {
          const r = await saveReview(vendorId, fd);
          setResult(r);
          if (r.ok) {
            setHasReview(true);
            setOpen(false);
          }
        });
      }}
    >
      <fieldset className="mb-3">
        <legend className="text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>Your rating</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              aria-pressed={rating === n}
            >
              <Star size={28} fill={n <= rating ? 'var(--primary)' : 'none'} stroke="var(--primary)" />
            </button>
          ))}
        </div>
      </fieldset>
      <label className="block mb-3">
        <span className="block text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>Name to show</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="e.g. Sam R" className={input} style={inputStyle} required />
      </label>
      <label className="block mb-3">
        <span className="block text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>Your review (optional)</span>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} rows={3} className={input} style={inputStyle} />
      </label>
      <p className="text-[12px] mb-3" style={{ color: 'var(--muted)' }}>
        Keep it honest and about the food and service. We may remove reviews that break our <Link href="/terms" className="underline">Terms</Link>.
      </p>
      {result && !result.ok && <p role="alert" className="text-[14px] mb-3" style={{ color: '#b42318' }}>{result.error}</p>}
      <div className="flex flex-wrap gap-3 items-center">
        <button
          type="submit"
          disabled={pending || rating === 0}
          className="rounded-full px-6 py-2.5 text-[15px] font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {pending ? 'Saving…' : hasReview ? 'Update review' : 'Post review'}
        </button>
        {hasReview && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await deleteReview(vendorId);
                setResult(r);
                setHasReview(false);
                setRating(0);
                setComment('');
                setOpen(false);
              })
            }
            className="text-[14px] underline"
            style={{ color: 'var(--muted)' }}
          >
            Delete my review
          </button>
        )}
      </div>
    </form>
  );
}
