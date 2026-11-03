import { Tent } from 'lucide-react';
import type { Market } from '@/types';

/**
 * Cover block for a market card. We don't have rights to use market photos yet,
 * so this shows a warm branded panel with the market's day instead.
 */
export function MarketCover({ market, height = 'h-40' }: { market: Market; height?: string }) {
  return (
    <div
      className={`relative ${height} flex flex-col items-center justify-center text-center px-4`}
      style={{
        background:
          'linear-gradient(135deg, color-mix(in srgb, var(--primary) 22%, var(--surface)) 0%, color-mix(in srgb, var(--teal) 14%, var(--surface)) 100%)',
      }}
      aria-hidden="true"
    >
      <Tent size={40} strokeWidth={1.6} className="mb-1" style={{ color: 'var(--teal)' }} />
      <span className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>
        {market.suburb}, {market.state}
      </span>
    </div>
  );
}
