'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type Result = { ok: true; message?: string } | { ok: false; error: string };

async function requireUser(next: string) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(`/account/login?next=${encodeURIComponent(next)}`);
  return { supabase, user: data.user };
}

async function slugFor(supabase: Awaited<ReturnType<typeof createClient>>, vendorId: string) {
  const { data } = await supabase.from('vendors').select('slug').eq('id', vendorId).maybeSingle();
  return data?.slug as string | undefined;
}

/** Saves or unsaves a van. Returns whether it's now saved. */
export async function toggleFavourite(vendorId: string): Promise<Result & { saved?: boolean }> {
  const { supabase, user } = await requireUser('/account');
  const { data: existing } = await supabase
    .from('favourites')
    .select('vendor_id')
    .eq('user_id', user.id)
    .eq('vendor_id', vendorId)
    .maybeSingle();
  if (existing) {
    await supabase.from('favourites').delete().eq('user_id', user.id).eq('vendor_id', vendorId);
    revalidatePath('/account');
    return { ok: true, saved: false };
  }
  const { error } = await supabase.from('favourites').insert({ user_id: user.id, vendor_id: vendorId });
  if (error) return { ok: false, error: 'Sorry, that didn\'t save.' };
  revalidatePath('/account');
  return { ok: true, saved: true, message: 'Saved. We\'ll email you when they\'re trading.' };
}

export async function setNotify(vendorId: string, notify: boolean): Promise<Result> {
  const { supabase, user } = await requireUser('/account');
  const { error } = await supabase.from('favourites').update({ notify }).eq('user_id', user.id).eq('vendor_id', vendorId);
  if (error) return { ok: false, error: 'Sorry, that didn\'t save.' };
  revalidatePath('/account');
  return { ok: true };
}

export async function saveReview(vendorId: string, formData: FormData): Promise<Result> {
  const slug = await slugFor(await createClient(), vendorId);
  const { supabase, user } = await requireUser(slug ? `/van/${slug}#reviews` : '/account');
  const rating = Math.round(Number(formData.get('rating')));
  const display_name = String(formData.get('display_name') ?? '').trim().slice(0, 40);
  const comment = String(formData.get('comment') ?? '').trim().slice(0, 1000);
  if (!(rating >= 1 && rating <= 5)) return { ok: false, error: 'Please pick 1 to 5 stars.' };
  if (!display_name) return { ok: false, error: 'Please add the name to show with your review.' };

  const { data: own } = await supabase.from('vendors').select('id').eq('id', vendorId).eq('owner_id', user.id).maybeSingle();
  if (own) return { ok: false, error: 'You can\'t review your own van.' };

  const { error } = await supabase
    .from('reviews')
    .upsert({ vendor_id: vendorId, user_id: user.id, rating, display_name, comment: comment || null }, { onConflict: 'vendor_id,user_id' });
  if (error) return { ok: false, error: 'Sorry, your review didn\'t save.' };
  if (slug) revalidatePath(`/van/${slug}`);
  revalidatePath('/');
  return { ok: true, message: 'Thanks! Your review is up.' };
}

export async function deleteReview(vendorId: string): Promise<Result> {
  const { supabase, user } = await requireUser('/account');
  const slug = await slugFor(supabase, vendorId);
  await supabase.from('reviews').delete().eq('vendor_id', vendorId).eq('user_id', user.id);
  if (slug) revalidatePath(`/van/${slug}`);
  revalidatePath('/account');
  return { ok: true, message: 'Review removed.' };
}

/** The van owner replies to a review of their van. */
export async function replyToReview(reviewId: string, reply: string): Promise<Result> {
  const { supabase } = await requireUser('/vendor');
  const { data, error } = await supabase
    .from('reviews')
    .update({ vendor_reply: reply.trim().slice(0, 1000) || null })
    .eq('id', reviewId)
    .select('vendor_id')
    .single();
  if (error || !data) return { ok: false, error: 'Sorry, your reply didn\'t save.' };
  const slug = await slugFor(supabase, data.vendor_id);
  if (slug) revalidatePath(`/van/${slug}`);
  revalidatePath('/vendor');
  return { ok: true, message: 'Reply saved.' };
}

export async function signOutCustomer() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
