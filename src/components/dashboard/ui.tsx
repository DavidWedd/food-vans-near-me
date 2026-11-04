'use client';

/** Small shared pieces for the vendor dashboard and admin pages. */

export const inputClass = 'w-full rounded-xl border px-3 py-2.5 text-[15px]';
export const inputStyle: React.CSSProperties = {
  borderColor: 'var(--border)',
  backgroundColor: 'var(--surface)',
  color: 'var(--text)',
};

export function Card({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-2xl border p-5 sm:p-6 mb-6"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <h2 className="text-[20px] font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
        {title}
      </h2>
      {intro && (
        <p className="text-[14px] mb-4" style={{ color: 'var(--muted)' }}>
          {intro}
        </p>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="block text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>
        {label}
      </span>
      {children}
      {hint && (
        <span className="block text-[12px] mt-1" style={{ color: 'var(--muted)' }}>
          {hint}
        </span>
      )}
    </label>
  );
}

export function PrimaryButton({
  children,
  busy,
  disabled,
  type = 'submit',
  onClick,
  colour = 'var(--primary)',
}: {
  children: React.ReactNode;
  busy?: boolean;
  disabled?: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
  colour?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy || disabled}
      className="rounded-full px-6 py-3 text-[15px] font-semibold text-white disabled:opacity-60"
      style={{ backgroundColor: colour }}
    >
      {busy ? 'Saving…' : children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full px-5 py-2.5 text-[14px] font-semibold border disabled:opacity-60"
      style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
    >
      {children}
    </button>
  );
}

export function Notice({ result }: { result: { ok: boolean; message?: string; error?: string } | null }) {
  if (!result) return null;
  const text = result.ok ? result.message : result.error;
  if (!text) return null;
  return (
    <p
      role={result.ok ? 'status' : 'alert'}
      className="text-[14px] mt-3 rounded-xl px-4 py-3"
      style={{
        backgroundColor: result.ok
          ? 'color-mix(in srgb, var(--success) 12%, var(--surface))'
          : 'color-mix(in srgb, #b42318 10%, var(--surface))',
        color: 'var(--text)',
      }}
    >
      {text}
    </p>
  );
}

export function CheckboxGroup({
  name,
  options,
  selected,
}: {
  name: string;
  options: { value: string; label: string }[];
  selected: string[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label
          key={o.value}
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[14px] cursor-pointer"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          <input type="checkbox" name={name} value={o.value} defaultChecked={selected.includes(o.value)} />
          {o.label}
        </label>
      ))}
    </div>
  );
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DIETARY_OPTIONS = [
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'gluten-free', label: 'Gluten free' },
  { value: 'dairy-free', label: 'Dairy free' },
  { value: 'nut-free', label: 'Nut free' },
  { value: 'halal', label: 'Halal' },
];

export const PAYMENT_OPTIONS = [
  { value: 'eftpos', label: 'Card / EFTPOS' },
  { value: 'cash', label: 'Cash' },
  { value: 'apple-pay', label: 'Apple Pay' },
  { value: 'google-pay', label: 'Google Pay' },
];

export const CUISINE_OPTIONS = [
  { value: 'coffee', label: 'Coffee' },
  { value: 'burgers', label: 'Burgers' },
  { value: 'pizza', label: 'Pizza' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'tacos', label: 'Tacos' },
  { value: 'bbq', label: 'BBQ' },
  { value: 'asian', label: 'Asian' },
  { value: 'thai', label: 'Thai' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'indian', label: 'Indian' },
  { value: 'fish-chips', label: 'Fish and chips' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'bubble-tea', label: 'Bubble tea' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'other', label: 'Other' },
];
