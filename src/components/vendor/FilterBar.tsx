'use client';

import { X } from 'lucide-react';
import type { AustralianState, CuisineType, DietaryTag, FilterState } from '@/types';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const CUISINE_CHIPS: { type: CuisineType; label: string }[] = [
  { type: 'coffee', label: '☕ Coffee' },
  { type: 'tacos', label: '🌮 Tacos' },
  { type: 'bbq', label: '🔥 BBQ' },
  { type: 'asian', label: '🍜 Asian' },
  { type: 'dessert', label: '🍦 Dessert' },
  { type: 'burgers', label: '🍔 Burgers' },
  { type: 'vegan', label: '🌿 Vegan' },
  { type: 'pizza', label: '🍕 Pizza' },
  { type: 'thai', label: '🇹🇭 Thai' },
  { type: 'japanese', label: '🍣 Japanese' },
];

const DIETARY_OPTIONS: { tag: DietaryTag; label: string }[] = [
  { tag: 'gluten-free', label: 'Gluten-Free' },
  { tag: 'vegan', label: 'Vegan' },
  { tag: 'halal', label: 'Halal' },
  { tag: 'vegetarian', label: 'Vegetarian' },
  { tag: 'nut-free', label: 'Nut-Free' },
  { tag: 'dairy-free', label: 'Dairy-Free' },
];

const STATE_OPTIONS: (AustralianState | 'ALL')[] = [
  'ALL', 'NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT',
];

const isActive = (filters: FilterState) =>
  filters.openNow ||
  filters.cuisineTypes.length > 0 ||
  filters.dietaryTags.length > 0 ||
  filters.state !== 'ALL';

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const toggleCuisine = (type: CuisineType) => {
    const next = filters.cuisineTypes.includes(type)
      ? filters.cuisineTypes.filter((c) => c !== type)
      : [...filters.cuisineTypes, type];
    onChange({ ...filters, cuisineTypes: next });
  };

  const clearAll = () =>
    onChange({ ...filters, openNow: false, cuisineTypes: [], dietaryTags: [], state: 'ALL' });

  const filtersActive = isActive(filters);

  return (
    <div
      className="sticky top-[64px] z-30 border-b"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 py-2 overflow-x-auto scrollbar-thin">
          {/* Open Now toggle */}
          <button
            onClick={() => onChange({ ...filters, openNow: !filters.openNow })}
            className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all duration-150 border min-h-[36px]"
            style={
              filters.openNow
                ? {
                    backgroundColor: 'color-mix(in srgb, var(--success) 15%, transparent)',
                    color: 'var(--success)',
                    borderColor: 'var(--success)',
                  }
                : {
                    backgroundColor: 'transparent',
                    color: 'var(--muted)',
                    borderColor: 'var(--border)',
                  }
            }
            aria-pressed={filters.openNow}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: filters.openNow ? 'var(--success)' : 'var(--muted)' }}
            />
            Open Now
          </button>

          {/* Divider */}
          <div className="h-6 w-px flex-shrink-0" style={{ backgroundColor: 'var(--border)' }} />

          {/* Cuisine chips */}
          {CUISINE_CHIPS.map(({ type, label }) => {
            const active = filters.cuisineTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleCuisine(type)}
                className="flex-shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition-all duration-150 border min-h-[36px] whitespace-nowrap"
                style={
                  active
                    ? {
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        borderColor: 'var(--primary)',
                      }
                    : {
                        backgroundColor: 'transparent',
                        color: 'var(--text)',
                        borderColor: 'var(--border)',
                      }
                }
                aria-pressed={active}
              >
                {label}
              </button>
            );
          })}

          {/* Divider */}
          <div className="h-6 w-px flex-shrink-0" style={{ backgroundColor: 'var(--border)' }} />

          {/* Dietary dropdown */}
          <select
            value=""
            onChange={(e) => {
              const tag = e.target.value as DietaryTag;
              if (tag && !filters.dietaryTags.includes(tag)) {
                onChange({ ...filters, dietaryTags: [...filters.dietaryTags, tag] });
              }
            }}
            className="flex-shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium border min-h-[36px] cursor-pointer bg-transparent"
            style={{
              borderColor:
                filters.dietaryTags.length > 0 ? 'var(--teal)' : 'var(--border)',
              color:
                filters.dietaryTags.length > 0 ? 'var(--teal)' : 'var(--text)',
            }}
            aria-label="Filter by dietary requirements"
          >
            <option value="">
              Dietary{filters.dietaryTags.length > 0 ? ` (${filters.dietaryTags.length})` : ''}
            </option>
            {DIETARY_OPTIONS.map(({ tag, label }) => (
              <option key={tag} value={tag}>
                {label}
              </option>
            ))}
          </select>

          {/* State dropdown */}
          <select
            value={filters.state}
            onChange={(e) =>
              onChange({ ...filters, state: e.target.value as AustralianState | 'ALL' })
            }
            className="flex-shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium border min-h-[36px] cursor-pointer bg-transparent"
            style={{
              borderColor: filters.state !== 'ALL' ? 'var(--primary)' : 'var(--border)',
              color: filters.state !== 'ALL' ? 'var(--primary)' : 'var(--text)',
            }}
            aria-label="Filter by state"
          >
            {STATE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All States' : s}
              </option>
            ))}
          </select>

          {/* Clear filters */}
          {filtersActive && (
            <button
              onClick={clearAll}
              className="flex-shrink-0 flex items-center gap-1 text-[13px] font-medium min-h-[36px] px-2"
              style={{ color: 'var(--primary)' }}
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>

        {/* Active dietary tags */}
        {filters.dietaryTags.length > 0 && (
          <div className="flex flex-wrap gap-2 pb-2">
            {filters.dietaryTags.map((tag) => (
              <button
                key={tag}
                onClick={() =>
                  onChange({
                    ...filters,
                    dietaryTags: filters.dietaryTags.filter((t) => t !== tag),
                  })
                }
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--teal) 12%, transparent)',
                  color: 'var(--teal)',
                }}
              >
                {tag}
                <X size={10} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
