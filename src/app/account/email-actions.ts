'use server';

import { createClient } from '@/lib/supabase/server';

export type EmailChangeResult = { ok: true; message: string } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Starts a login email change. Supabase emails both the old and new address to confirm. */
export async function requestEmailChange(newEmail: string): Promise<EmailChangeResult> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false, error: 'Please log in again.' };
  const email = newEmail.trim().toLowerCase().slice(0, 120);
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Please check the new email address.' };
  if (email === data.user.email?.toLowerCase()) return { ok: false, error: 'That\'s already your login email.' };
  const { error } = await supabase.auth.updateUser({ email });
  if (error) {
    if (/already|registered|exists/i.test(error.message)) {
      return { ok: false, error: 'That email already has an account here. Use a different one, or email hello@foodvansnear.me for help.' };
    }
    if (/rate|seconds/i.test(error.message)) return { ok: false, error: 'Please wait a minute and try again.' };
    return { ok: false, error: 'Sorry, that didn\'t work. Please try again.' };
  }
  return {
    ok: true,
    message: `Nearly done. We've emailed ${data.user.email} and ${email}. Tap the link in both emails to finish the change.`,
  };
}
