import 'server-only';

const FROM = 'Food Vans Near Me <hello@foodvansnear.me>';

/** Sends an email through Resend. Returns true if Resend accepted it. */
export async function sendEmail(opts: { to: string; subject: string; text: string; html: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });
    if (!res.ok) console.error('Resend error', res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error('Resend failed', err);
    return false;
  }
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
