import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { syncLoginEmail } from '@/lib/login-email';

/** Login and email-change links from our email templates. Works even if opened in a different browser or on another device. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const token_hash = searchParams.get('token_hash');
  const type = (searchParams.get('type') ?? 'email') as EmailOtpType;
  const nextParam = searchParams.get('next');
  const next = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/vendor';
  if (token_hash) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (type === 'email_change') {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return NextResponse.redirect(`${origin}/vendor/login?error=link`);
      // Both the old and new address must confirm. Until then Supabase keeps the old one.
      const status = error ? 'error' : user.new_email ? 'half' : 'changed';
      if (status === 'changed') await syncLoginEmail(user.id, user.email);
      const { data: van } = await supabase.from('vendors').select('id').eq('owner_id', user.id).maybeSingle();
      return NextResponse.redirect(`${origin}${van ? '/vendor' : '/account'}?email=${status}`);
    }
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/vendor/login?error=link`);
}
