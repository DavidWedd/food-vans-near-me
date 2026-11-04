'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { saveMenu, type ActionResult, type MenuInput } from '@/app/vendor/actions';
import { Card, DIETARY_OPTIONS, Notice, PrimaryButton, SecondaryButton, inputClass, inputStyle } from './ui';

const blank = (): MenuInput => ({ name: '', description: '', price: '', dietary_tags: [], is_available: true });

export function MenuEditor({ initial }: { initial: MenuInput[] }) {
  const [items, setItems] = useState<MenuInput[]>(initial.length ? initial : [blank()]);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  const update = (i: number, patch: Partial<MenuInput>) =>
    setItems((list) => list.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  return (
    <Card title="Menu" intro="Add your main items. Untick 'Available' for anything that's sold out or off the menu for now.">
      <div className="space-y-4">
        {items.map((it, i) => (
          <div key={i} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)' }}>
            <div className="grid sm:grid-cols-[1fr_120px] gap-3 mb-3">
              <input
                aria-label="Item name"
                placeholder="Item, e.g. Beef brisket roll"
                value={it.name}
                maxLength={80}
                onChange={(e) => update(i, { name: e.target.value })}
                className={inputClass}
                style={inputStyle}
              />
              <input
                aria-label="Price"
                placeholder="Price, e.g. 16"
                inputMode="decimal"
                value={it.price}
                onChange={(e) => update(i, { price: e.target.value })}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <input
              aria-label="Description"
              placeholder="Short description (optional)"
              value={it.description}
              maxLength={300}
              onChange={(e) => update(i, { description: e.target.value })}
              className={`${inputClass} mb-3`}
              style={inputStyle}
            />
            <div className="flex flex-wrap items-center gap-3 text-[13px]" style={{ color: 'var(--text)' }}>
              {DIETARY_OPTIONS.map((d) => (
                <label key={d.value} className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={it.dietary_tags.includes(d.value)}
                    onChange={(e) =>
                      update(i, {
                        dietary_tags: e.target.checked
                          ? [...it.dietary_tags, d.value]
                          : it.dietary_tags.filter((t) => t !== d.value),
                      })
                    }
                  />
                  {d.label}
                </label>
              ))}
              <label className="inline-flex items-center gap-1.5 font-semibold">
                <input
                  type="checkbox"
                  checked={it.is_available}
                  onChange={(e) => update(i, { is_available: e.target.checked })}
                />
                Available
              </label>
              <button
                type="button"
                onClick={() => setItems((list) => list.filter((_, idx) => idx !== i))}
                className="ml-auto inline-flex items-center gap-1"
                style={{ color: 'var(--muted)' }}
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        <SecondaryButton onClick={() => setItems((l) => [...l, blank()])}>+ Add an item</SecondaryButton>
        <PrimaryButton type="button" busy={pending} onClick={() => start(async () => setResult(await saveMenu(items)))}>
          Save menu
        </PrimaryButton>
      </div>
      <Notice result={result} />
    </Card>
  );
}
