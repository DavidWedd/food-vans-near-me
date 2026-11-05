'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { setNotify, toggleFavourite } from '@/app/account/actions';

export function FavouriteRow(props: {
  vendorId: string;
  name: string;
  slug: string;
  suburb: string;
  live: boolean;
  notify: boolean;
}) {
  const [notify, setLocal] = useState(props.notify);
  const [removed, setRemoved] = useState(false);
  const [pending, start] = useTransition();
  if (removed) return null;
  return (
    <li className="rounded-xl border p-4 flex flex-wrap items-center gap-3 justify-between" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <div>
        <Link href={`/van/${props.slug}`} className="font-semibold text-[16px] underline" style={{ color: 'var(--text)' }}>
          {props.name}
        </Link>
        <p className="text-[13px]" style={{ color: props.live ? 'var(--success)' : 'var(--muted)' }}>
          {props.live ? 'Trading now' : props.suburb || 'Not trading right now'}
        </p>
      </div>
      <div className="flex items-center gap-4 text-[14px]" style={{ color: 'var(--text)' }}>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={notify}
            disabled={pending}
            onChange={(e) => {
              const v = e.target.checked;
              setLocal(v);
              start(async () => void (await setNotify(props.vendorId, v)));
            }}
          />
          Email me when they&apos;re trading
        </label>
        <button
          disabled={pending}
          onClick={() => start(async () => { const r = await toggleFavourite(props.vendorId); if (r.ok) setRemoved(true); })}
          className="underline"
          style={{ color: 'var(--muted)' }}
        >
          Remove
        </button>
      </div>
    </li>
  );
}
