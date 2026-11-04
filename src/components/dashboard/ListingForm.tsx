'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { saveListing, setPhoto, type ActionResult } from '@/app/vendor/actions';
import { createBrowserSupabase } from '@/lib/supabase/browser';
import {
  Card,
  CheckboxGroup,
  CUISINE_OPTIONS,
  DIETARY_OPTIONS,
  Field,
  Notice,
  PAYMENT_OPTIONS,
  PrimaryButton,
  inputClass,
  inputStyle,
} from './ui';

export interface ListingValues {
  business_name: string;
  description: string;
  suburb: string;
  cuisine_type: string[];
  dietary_tags: string[];
  payment_methods: string[];
  price_range: number;
  phone: string;
  email: string;
  website_url: string;
  instagram_handle: string;
  facebook_url: string;
  logo_url: string;
  cover_photo_url: string;
}

export function ListingForm({ values, isNew, userId }: { values: ListingValues; isNew: boolean; userId: string }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await saveListing(fd);
      setResult(r);
      if (r.ok) router.refresh();
    });
  };

  return (
    <Card
      title={isNew ? 'Set up your listing' : 'Your listing'}
      intro={
        isNew
          ? 'Tell hungry Tasmanians about your van. You can change any of this later.'
          : 'This is what customers see on your page.'
      }
    >
      {!isNew && (
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <PhotoPicker kind="logo" label="Logo" current={values.logo_url} userId={userId} />
          <PhotoPicker kind="cover" label="Cover photo (wide)" current={values.cover_photo_url} userId={userId} />
        </div>
      )}
      <form onSubmit={onSubmit}>
        <Field label="Business name">
          <input name="business_name" defaultValue={values.business_name} required maxLength={80} className={inputClass} style={inputStyle} />
        </Field>
        <Field label="About your van" hint="What you sell, what you're known for. Up to 1,500 characters.">
          <textarea name="description" defaultValue={values.description} maxLength={1500} rows={4} className={inputClass} style={inputStyle} />
        </Field>
        <Field label="Home base (suburb or town)" hint="Where you're usually based, e.g. Moonah or Launceston.">
          <input name="suburb" defaultValue={values.suburb} maxLength={60} className={inputClass} style={inputStyle} />
        </Field>
        <div className="mb-4">
          <span className="block text-[14px] font-semibold mb-2" style={{ color: 'var(--text)' }}>What do you sell?</span>
          <CheckboxGroup name="cuisine_type" options={CUISINE_OPTIONS} selected={values.cuisine_type} />
        </div>
        <div className="mb-4">
          <span className="block text-[14px] font-semibold mb-2" style={{ color: 'var(--text)' }}>Dietary options</span>
          <CheckboxGroup name="dietary_tags" options={DIETARY_OPTIONS} selected={values.dietary_tags} />
        </div>
        <div className="mb-4">
          <span className="block text-[14px] font-semibold mb-2" style={{ color: 'var(--text)' }}>Payments you take</span>
          <CheckboxGroup name="payment_methods" options={PAYMENT_OPTIONS} selected={values.payment_methods} />
        </div>
        <Field label="Price range">
          <select name="price_range" defaultValue={values.price_range} className={inputClass} style={inputStyle}>
            <option value={1}>$ - most things under $10</option>
            <option value={2}>$$ - around $10 to $20</option>
            <option value={3}>$$$ - around $20 to $30</option>
            <option value={4}>$$$$ - over $30</option>
          </select>
        </Field>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <Field label="Phone (optional, shown publicly)">
            <input name="phone" defaultValue={values.phone} maxLength={30} className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Email (optional, shown publicly)">
            <input name="email" type="email" defaultValue={values.email} maxLength={120} className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Instagram" hint="Your handle, e.g. tacotacotas">
            <input name="instagram_handle" defaultValue={values.instagram_handle} maxLength={100} className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Facebook page link">
            <input name="facebook_url" defaultValue={values.facebook_url} maxLength={200} className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Website">
            <input name="website_url" defaultValue={values.website_url} maxLength={200} className={inputClass} style={inputStyle} />
          </Field>
        </div>
        <PrimaryButton busy={pending}>{isNew ? 'Create my listing' : 'Save changes'}</PrimaryButton>
        <Notice result={result} />
      </form>
    </Card>
  );
}

function PhotoPicker({
  kind,
  label,
  current,
  userId,
}: {
  kind: 'logo' | 'cover';
  label: string;
  current: string;
  userId: string;
}) {
  const router = useRouter();
  const [preview, setPreview] = useState(current);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [busy, setBusy] = useState(false);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setResult({ ok: false, error: 'Please choose a JPG, PNG or WebP photo.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResult({ ok: false, error: 'That photo is over 5MB. Please choose a smaller one.' });
      return;
    }
    setBusy(true);
    const supabase = createBrowserSupabase();
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `${userId}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('vendor-photos').upload(path, file, { contentType: file.type });
    if (error) {
      setBusy(false);
      setResult({ ok: false, error: 'Sorry, the upload didn\'t work. Please try again.' });
      return;
    }
    const url = supabase.storage.from('vendor-photos').getPublicUrl(path).data.publicUrl;
    const r = await setPhoto(kind, url);
    setBusy(false);
    setResult(r);
    if (r.ok) {
      setPreview(url);
      router.refresh();
    }
  };

  return (
    <div>
      <span className="block text-[14px] font-semibold mb-2" style={{ color: 'var(--text)' }}>{label}</span>
      <div
        className={`${kind === 'logo' ? 'w-24 h-24 rounded-full' : 'w-full aspect-video rounded-xl'} mb-2 overflow-hidden border`}
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-off)' }}
      >
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <label
        className="inline-block rounded-full border px-4 py-2 text-[14px] font-semibold cursor-pointer"
        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
      >
        {busy ? 'Uploading…' : preview ? 'Change' : 'Upload'}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onFile} disabled={busy} />
      </label>
      <Notice result={result} />
    </div>
  );
}
