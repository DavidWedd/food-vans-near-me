'use client';

import { useState, useTransition } from 'react';
import { MapPin } from 'lucide-react';
import { goLive, stopLive, type ActionResult } from '@/app/vendor/actions';
import { reverseSuburb } from '@/lib/geo';
import { isInLiveArea } from '@/lib/regions';
import { Card, Notice, PrimaryButton, SecondaryButton, inputClass, inputStyle } from './ui';

function timeLeft(expiresAt: string) {
  const mins = Math.round((new Date(expiresAt).getTime() - Date.now()) / 60000);
  if (mins <= 0) return null;
  if (mins < 60) return `${mins} minutes`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h} hours`;
}

export function ImHereCard({
  live,
  approved,
}: {
  live: { suburb: string; expires_at: string; notes?: string | null } | null;
  approved: boolean;
}) {
  const [hours, setHours] = useState(4);
  const [note, setNote] = useState('');
  const [result, setResult] = useState<ActionResult | null>(null);
  const [locating, setLocating] = useState(false);
  const [pending, start] = useTransition();
  const remaining = live ? timeLeft(live.expires_at) : null;

  const imHere = () => {
    setResult(null);
    if (!navigator.geolocation) {
      setResult({ ok: false, error: 'Your phone or browser can\'t share its location.' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (!isInLiveArea(lat, lng)) {
          setLocating(false);
          setResult({ ok: false, error: 'Your location looks like it\'s outside Tasmania, so we can\'t pin you yet.' });
          return;
        }
        const suburb = await reverseSuburb(lat, lng);
        setLocating(false);
        start(async () => setResult(await goLive({ lat, lng, hours, suburb, note })));
      },
      (err) => {
        setLocating(false);
        setResult({
          ok: false,
          error:
            err.code === err.PERMISSION_DENIED
              ? 'Location is blocked. Allow location for foodvansnear.me in your phone or browser settings, then try again.'
              : 'We couldn\'t get your location. Make sure location is turned on and try again.',
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  return (
    <Card
      title="I'm here"
      intro="When you start trading, tap the button. We use your phone's location to put your van on the map, and it comes off by itself when your time's up."
    >
      {!approved && (
        <p className="text-[14px] mb-4" style={{ color: 'var(--muted)' }}>
          You can try this now, but your pin only shows to the public once we&apos;ve approved your listing.
        </p>
      )}
      {live && remaining ? (
        <div>
          <p className="text-[16px] mb-4" style={{ color: 'var(--text)' }}>
            <MapPin size={18} className="inline -mt-1 mr-1" style={{ color: 'var(--success)' }} />
            <strong>You&apos;re on the map</strong>
            {live.suburb ? ` in ${live.suburb}` : ''} for another {remaining}.
          </p>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton type="button" busy={pending || locating} onClick={imHere}>
              Update my spot
            </PrimaryButton>
            <SecondaryButton disabled={pending} onClick={() => start(async () => setResult(await stopLive()))}>
              I&apos;ve finished for the day
            </SecondaryButton>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <label className="block">
              <span className="block text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>
                How long are you here?
              </span>
              <select
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className={inputClass}
                style={inputStyle}
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((h) => (
                  <option key={h} value={h}>
                    {h} hour{h > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-[14px] font-semibold mb-1" style={{ color: 'var(--text)' }}>
                Note for customers (optional)
              </span>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                placeholder="e.g. Next to the playground"
                className={inputClass}
                style={inputStyle}
              />
            </label>
          </div>
          <PrimaryButton type="button" busy={pending || locating} onClick={imHere} colour="var(--success)">
            {locating ? 'Finding you…' : "I'm here - put me on the map"}
          </PrimaryButton>
        </div>
      )}
      <Notice result={result} />
    </Card>
  );
}
