'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabase } from '@/lib/supabase/browser';

const inputClass = 'w-full rounded-xl border px-4 py-3 text-[16px]';
const inputStyle = { borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text)' };

export function LoginForm({ initialEmail, linkError, next }: { initialEmail: string; linkError: boolean; next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'email' | 'sent'>('email');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(
    linkError ? 'That login link has expired or was already used. Enter your email to get a new one.' : null
  );

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}` },
    });
    setBusy(false);
    if (error) {
      setMessage(
        error.status === 429
          ? 'Too many tries. Please wait a minute and try again.'
          : 'Sorry, we couldn\'t send the email. Check the address and try again.'
      );
      return;
    }
    setStage('sent');
  };

  const useCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
    setBusy(false);
    if (error) {
      setMessage('That code didn\'t work. Check it, or ask for a new email.');
      return;
    }
    router.push(next);
    router.refresh();
  };

  if (stage === 'sent') {
    return (
      <div className="space-y-5">
        <p className="text-[16px]" style={{ color: 'var(--text)' }}>
          We&apos;ve emailed a login link to <strong>{email}</strong>. Tap the link in the email, or type the
          6-digit code from it here.
        </p>
        <form onSubmit={useCode} className="space-y-3">
          <label className="block text-[14px] font-semibold" htmlFor="code" style={{ color: 'var(--text)' }}>
            6-digit code
          </label>
          <input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className={inputClass}
            style={inputStyle}
            required
          />
          <button
            type="submit"
            disabled={busy || code.length !== 6}
            className="w-full rounded-full py-3 text-[15px] font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {busy ? 'Checking…' : 'Log in'}
          </button>
        </form>
        {message && <p role="alert" className="text-[14px]" style={{ color: 'var(--error, #b42318)' }}>{message}</p>}
        <button
          type="button"
          onClick={() => setStage('email')}
          className="text-[14px] underline"
          style={{ color: 'var(--muted)' }}
        >
          Use a different email or send again
        </button>
        <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
          Can&apos;t see it? Check your spam folder. It comes from hello@foodvansnear.me.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={sendLink} className="space-y-4">
      <label className="block text-[14px] font-semibold" htmlFor="email" style={{ color: 'var(--text)' }}>
        Your email
      </label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
        style={inputStyle}
        required
      />
      <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
        Use the same email you signed up with. No password needed - we&apos;ll email you a login link.
      </p>
      {message && <p role="alert" className="text-[14px]" style={{ color: 'var(--error, #b42318)' }}>{message}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full py-3 text-[15px] font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: 'var(--primary)' }}
      >
        {busy ? 'Sending…' : 'Email me a login link'}
      </button>
    </form>
  );
}
