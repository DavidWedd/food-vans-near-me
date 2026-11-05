'use client';

import { useRef, useState, useTransition } from 'react';
import { addVendor, type AdminResult } from './actions';
import { Notice, inputClass, inputStyle } from '@/components/dashboard/ui';

const CUISINES: [string, string][] = [
  ['coffee', 'Coffee'], ['burgers', 'Burgers'], ['pizza', 'Pizza'], ['tacos', 'Tacos'], ['mexican', 'Mexican'],
  ['bbq', 'BBQ'], ['asian', 'Asian'], ['thai', 'Thai'], ['japanese', 'Japanese'], ['indian', 'Indian'],
  ['fish-chips', 'Fish and chips'], ['dessert', 'Dessert'], ['bubble-tea', 'Bubble tea'], ['vegan', 'Vegan'], ['other', 'Other'],
];

/** Admin: add a van yourself, and optionally name the owner's email so they can take it over. */
export function AddVendorForm() {
  const [result, setResult] = useState<AdminResult | null>(null);
  const [pending, start] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <details className="rounded-2xl border p-5 mb-8" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
      <summary className="cursor-pointer text-[18px] font-bold" style={{ color: 'var(--text)' }}>
        Add a van
      </summary>
      <p className="text-[14px] mt-2 mb-4" style={{ color: 'var(--muted)' }}>
        Set up a listing for a van yourself. Add the owner&apos;s email and it becomes theirs the first time they log in
        with that email at foodvansnear.me/vendor/login.
      </p>
      <form
        ref={formRef}
        action={(fd) =>
          start(async () => {
            const r = await addVendor(fd);
            setResult(r);
            if (r.ok) formRef.current?.reset();
          })
        }
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Input name="business_name" label="Van name" required />
          <Input name="suburb" label="Suburb or town" />
          <Input name="owner_email" label="Owner's email (optional)" type="email" />
          <Input name="instagram_handle" label="Instagram (optional)" />
          <Input name="website_url" label="Website (optional)" />
          <Input name="phone" label="Phone (optional)" />
        </div>
        <fieldset className="mt-4">
          <legend className="text-[14px] font-semibold mb-2" style={{ color: 'var(--text)' }}>
            Food
          </legend>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {CUISINES.map(([value, label]) => (
              <label key={value} className="flex items-center gap-1.5 text-[14px]" style={{ color: 'var(--text)' }}>
                <input type="checkbox" name="cuisine_type" value={value} /> {label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block mt-4">
          <span className="block text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>
            Description (optional)
          </span>
          <textarea name="description" rows={3} maxLength={1500} className={inputClass} style={inputStyle} />
        </label>
        <label className="flex items-center gap-2 mt-4 text-[15px]" style={{ color: 'var(--text)' }}>
          <input type="checkbox" name="publish" defaultChecked /> Put it on the map straight away
        </label>
        <button
          type="submit"
          disabled={pending}
          className="mt-4 rounded-full px-6 py-3 text-[15px] font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {pending ? 'Adding…' : 'Add van'}
        </button>
      </form>
      <Notice result={result} />
    </details>
  );
}

function Input({ name, label, type = 'text', required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="block text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>
        {label}
      </span>
      <input name={name} type={type} required={required} className={inputClass} style={inputStyle} />
    </label>
  );
}
