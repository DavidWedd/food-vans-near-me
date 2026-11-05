'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { createBrowserSupabase } from '@/lib/supabase/browser';
import { toggleFavourite } from '@/app/account/actions';

/** "Save" heart on a van's page. Logged-out visitors are sent to log in first. */
export function SaveButton({ vendorId, slug }: { vendorId: string; slug: string }) {
  const router = useRouter();
  const [state, setState] = useState<'unknown' | 'out' | 'saved' | 'not-saved'>('unknown');
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const supabase = createBrowserSupabase();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return setState('out');
      const { data: fav } = await supabase
        .from('favourites')
        .select('vendor_id')
        .eq('user_id', data.user.id)
        .eq('vendor_id', vendorId)
        .maybeSingle();
      setState(fav ? 'saved' : 'not-saved');
    });
  }, [vendorId]);

  const onClick = () => {
    if (state === 'out' || state === 'unknown') {
      router.push(`/account/login?next=${encodeURIComponent(`/van/${slug}`)}`);
      return;
    }
    start(async () => {
      const r = await toggleFavourite(vendorId);
      if (r.ok) {
        setState(r.saved ? 'saved' : 'not-saved');
        setMessage(r.saved ? 'Saved - we\'ll email you when they\'re trading.' : null);
      }
    });
  };

  const saved = state === 'saved';
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={onClick}
        disabled={pending}
        aria-pressed={saved}
        className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[15px] font-semibold disabled:opacity-60"
        style={{
          borderColor: saved ? 'var(--primary)' : 'var(--border)',
          color: saved ? 'var(--primary)' : 'var(--text)',
          backgroundColor: saved ? 'color-mix(in srgb, var(--primary) 8%, var(--surface))' : 'var(--surface)',
        }}
      >
        <Heart size={18} fill={saved ? 'var(--primary)' : 'none'} />
        {saved ? 'Saved' : 'Save'}
      </button>
      <span className="text-[13px]" style={{ color: 'var(--muted)' }}>
        {message ?? (saved ? 'You\'ll get an email when they\'re trading.' : 'Get an email when they start trading.')}
      </span>
    </div>
  );
}
