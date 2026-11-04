'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { escapeHtml, sendEmail } from '@/lib/email';
import { hasFeature } from '@/lib/plans';

export type EnquiryResult = { ok: true } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** "Book this van" - saves the enquiry and emails it to the vendor, with Reply going to the customer. */
export async function submitEnquiry(vendorId: string, formData: FormData): Promise<EnquiryResult> {
  // Bots fill in every field, including this hidden one
  if (String(formData.get('company_website') ?? '').trim()) return { ok: true };

  const get = (k: string, max: number) => String(formData.get(k) ?? '').trim().slice(0, max);
  const name = get('name', 80);
  const email = get('email', 120).toLowerCase();
  const phone = get('phone', 30);
  const eventDate = get('event_date', 10);
  const eventLocation = get('event_location', 120);
  const guestsRaw = get('guests', 6);
  const message = get('message', 2000);

  if (!name) return { ok: false, error: 'Please add your name.' };
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Please check your email address.' };
  if (!message) return { ok: false, error: 'Please tell them a bit about your event.' };
  const guests = guestsRaw ? Math.round(Number(guestsRaw)) : null;
  if (guests !== null && (!Number.isFinite(guests) || guests < 1)) return { ok: false, error: 'Please check the number of guests.' };
  const date = /^\d{4}-\d{2}-\d{2}$/.test(eventDate) ? eventDate : null;

  const db = createAdminClient();
  if (!db) return { ok: false, error: 'Enquiries aren\'t available right now. Please contact the van directly.' };

  const { data: vendor } = await db
    .from('vendors')
    .select('id, business_name, status, subscription_tier, email, vendor_private(owner_email)')
    .eq('id', vendorId)
    .maybeSingle();
  if (!vendor || vendor.status !== 'approved' || !hasFeature(vendor.subscription_tier, 'enquiries')) {
    return { ok: false, error: 'This van isn\'t taking enquiries here. Please contact them directly.' };
  }
  const priv = Array.isArray(vendor.vendor_private) ? vendor.vendor_private[0] : vendor.vendor_private;
  const to = priv?.owner_email || vendor.email;
  if (!to) return { ok: false, error: 'This van isn\'t taking enquiries here. Please contact them directly.' };

  // Simple flood protection
  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const [{ count: fromThisEmail }, { count: toThisVan }] = await Promise.all([
    db.from('enquiries').select('id', { count: 'exact', head: true }).eq('email', email).gte('created_at', hourAgo),
    db.from('enquiries').select('id', { count: 'exact', head: true }).eq('vendor_id', vendorId).gte('created_at', hourAgo),
  ]);
  if ((fromThisEmail ?? 0) >= 3 || (toThisVan ?? 0) >= 20) {
    return { ok: false, error: 'You\'ve sent a few enquiries already. Please try again later.' };
  }

  const { data: saved, error } = await db
    .from('enquiries')
    .insert({
      vendor_id: vendorId,
      name,
      email,
      phone: phone || null,
      event_date: date,
      event_location: eventLocation || null,
      guests,
      message,
    })
    .select('id')
    .single();
  if (error) return { ok: false, error: 'Sorry, that didn\'t send. Please try again.' };

  const when = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Not given';
  const lines = [
    ['Name', name],
    ['Email', email],
    ['Phone', phone || 'Not given'],
    ['Event date', when],
    ['Where', eventLocation || 'Not given'],
    ['Guests', guests ? String(guests) : 'Not given'],
  ];
  const text =
    `New catering enquiry for ${vendor.business_name} via Food Vans Near Me\n\n` +
    lines.map(([k, v]) => `${k}: ${v}`).join('\n') +
    `\n\nMessage:\n${message}\n\nReply to this email to answer ${name} directly.\n\n` +
    'You can also see your enquiries in your dashboard: https://foodvansnear.me/vendor';
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;color:#222">
<h2 style="color:#E07B00">New catering enquiry</h2>
<p>Someone wants to book <strong>${escapeHtml(vendor.business_name)}</strong> through Food Vans Near Me.</p>
<table style="border-collapse:collapse;font-size:15px">${lines
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`)
    .join('')}</table>
<p style="font-size:15px;margin-top:16px"><strong>Message</strong><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
<p style="font-size:15px">Just hit <strong>Reply</strong> to answer ${escapeHtml(name)} directly.</p>
<p style="font-size:13px;color:#666">See all your enquiries at <a href="https://foodvansnear.me/vendor">foodvansnear.me/vendor</a>.<br>Food Vans Near Me - a division of Virmo Pty Ltd, ABN 78 698 605 784</p>
</div>`;

  const sent = await sendEmail({
    to,
    subject: `Catering enquiry from ${name}${date ? ` for ${when}` : ''}`,
    text,
    html,
    replyTo: email,
  });
  await Promise.all([
    db.from('enquiries').update({ emailed: sent }).eq('id', saved.id),
    db.from('vendor_events').insert({ vendor_id: vendorId, kind: 'enquiry' }),
  ]);
  return { ok: true };
}
