import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { escapeHtml, sendEmail } from '@/lib/email';

/**
 * Emails people who saved this van and asked to be told when it's trading.
 * At most one email per person per van per day. Never blocks the vendor's "I'm here".
 */
export async function notifyFavourites(vendorId: string, suburb: string, note: string | null) {
  const db = createAdminClient();
  if (!db || !process.env.RESEND_API_KEY) return;
  try {
    const [{ data: vendor }, { data: fans }] = await Promise.all([
      db.from('vendors').select('business_name, slug, status').eq('id', vendorId).single(),
      db.from('favourites').select('user_id, email, unsubscribe_token').eq('vendor_id', vendorId).eq('notify', true).limit(500),
    ]);
    if (!vendor || vendor.status !== 'approved' || !fans?.length) return;

    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Hobart' }).format(new Date());
    const { data: already } = await db.from('alerts_sent').select('user_id').eq('vendor_id', vendorId).eq('sent_on', today);
    const skip = new Set((already ?? []).map((a) => a.user_id));
    const site = 'https://foodvansnear.me';
    const where = suburb ? ` in ${suburb}` : '';

    for (const fan of fans) {
      if (!fan.email || skip.has(fan.user_id)) continue;
      // Claim today's slot first so two quick taps can't send twice
      const { error: claimed } = await db.from('alerts_sent').insert({ user_id: fan.user_id, vendor_id: vendorId, sent_on: today });
      if (claimed) continue;
      const pageUrl = `${site}/van/${vendor.slug}`;
      const unsub = `${site}/api/unsubscribe?t=${fan.unsubscribe_token}`;
      await sendEmail({
        to: fan.email,
        subject: `${vendor.business_name} is trading now${where}`,
        text:
          `${vendor.business_name} just tapped "I'm here"${where}.\n` +
          (note ? `\n"${note}"\n` : '') +
          `\nSee where they are: ${pageUrl}\n\n` +
          `You're getting this because you saved ${vendor.business_name} on Food Vans Near Me.\n` +
          `Stop these emails for this van: ${unsub}\n\nFood Vans Near Me - a division of Virmo Pty Ltd, ABN 78 698 605 784`,
        html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;color:#222">
<h2 style="color:#E07B00;margin-bottom:6px">${escapeHtml(vendor.business_name)} is trading now${escapeHtml(where)}</h2>
${note ? `<p style="font-size:15px;color:#555">"${escapeHtml(note)}"</p>` : ''}
<p style="margin:22px 0"><a href="${pageUrl}" style="background:#E07B00;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold;display:inline-block">See where they are</a></p>
<p style="font-size:12px;color:#777">You're getting this because you saved ${escapeHtml(vendor.business_name)} on Food Vans Near Me.
<a href="${unsub}" style="color:#777">Stop these emails for this van</a> · <a href="${site}/account" style="color:#777">Manage your saved vans</a><br>
Food Vans Near Me - a division of Virmo Pty Ltd, ABN 78 698 605 784</p></div>`,
      });
    }
  } catch (err) {
    console.error('Favourite alerts failed', err);
  }
}
