'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { saveSchedule, type ActionResult, type ScheduleInput } from '@/app/vendor/actions';
import { geocodeSpot } from '@/lib/geo';
import { Card, DAY_NAMES, Notice, PrimaryButton, SecondaryButton, inputClass, inputStyle } from './ui';

const blank = (): ScheduleInput => ({
  day_of_week: 6,
  start_time: '08:30',
  end_time: '14:00',
  location_name: '',
  suburb: '',
  lat: null,
  lng: null,
});

export function ScheduleEditor({ initial }: { initial: ScheduleInput[] }) {
  const [rows, setRows] = useState<ScheduleInput[]>(initial);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  const update = (i: number, patch: Partial<ScheduleInput>) =>
    setRows((list) => list.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const save = () =>
    start(async () => {
      // Find each spot on the map so customers see it near them
      const located = await Promise.all(
        rows.map(async (r) => {
          if (!r.location_name.trim()) return r;
          const spot = await geocodeSpot(r.location_name, r.suburb);
          return spot ? { ...r, lat: spot.lat, lng: spot.lng } : { ...r, lat: null, lng: null };
        })
      );
      setRows(located);
      const res = await saveSchedule(located);
      const missing = located.filter((r) => r.location_name.trim() && r.lat == null).length;
      setResult(
        res.ok && missing
          ? { ok: true, message: `Saved. We couldn't find ${missing} of your spots on the map - add the suburb to help.` }
          : res
      );
    });

  return (
    <Card
      title="Regular trading times"
      intro="Where you usually trade each week, e.g. Salamanca Market on Saturdays. During these times you'll show on the map as 'Usually here now' even if you forget to tap I'm here. Remove a time if you stop trading there."
    >
      {rows.length === 0 && (
        <p className="text-[14px] mb-4" style={{ color: 'var(--muted)' }}>
          No regular times yet.
        </p>
      )}
      <div className="space-y-4">
        {rows.map((r, i) => (
          <div key={i} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <select
                aria-label="Day"
                value={r.day_of_week}
                onChange={(e) => update(i, { day_of_week: Number(e.target.value) })}
                className={inputClass}
                style={inputStyle}
              >
                {DAY_NAMES.map((d, idx) => (
                  <option key={d} value={idx}>
                    {d}
                  </option>
                ))}
              </select>
              <input
                aria-label="Start time"
                type="time"
                value={r.start_time}
                onChange={(e) => update(i, { start_time: e.target.value })}
                className={inputClass}
                style={inputStyle}
              />
              <input
                aria-label="Finish time"
                type="time"
                value={r.end_time}
                onChange={(e) => update(i, { end_time: e.target.value })}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                aria-label="Where"
                placeholder="Where, e.g. Salamanca Market or 29 Lefroy St"
                value={r.location_name}
                maxLength={80}
                onChange={(e) => update(i, { location_name: e.target.value, lat: null, lng: null })}
                className={inputClass}
                style={inputStyle}
              />
              <input
                aria-label="Suburb"
                placeholder="Suburb, e.g. Hobart"
                value={r.suburb}
                maxLength={60}
                onChange={(e) => update(i, { suburb: e.target.value, lat: null, lng: null })}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <button
              type="button"
              onClick={() => setRows((list) => list.filter((_, idx) => idx !== i))}
              className="mt-3 inline-flex items-center gap-1 text-[13px]"
              style={{ color: 'var(--muted)' }}
            >
              <Trash2 size={14} /> Remove
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        <SecondaryButton onClick={() => setRows((l) => [...l, blank()])}>+ Add a time</SecondaryButton>
        <PrimaryButton type="button" busy={pending} onClick={save}>
          Save times
        </PrimaryButton>
      </div>
      <Notice result={result} />
    </Card>
  );
}
