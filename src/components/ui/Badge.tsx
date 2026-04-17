import { cn } from '@/lib/utils';

type BadgeVariant = 'open' | 'closed' | 'featured' | 'cuisine' | 'dietary' | 'tier' | 'frequency';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({ children, variant = 'cuisine', className, style: styleProp }: BadgeProps) {
  const base = 'inline-flex items-center gap-1 rounded-full font-medium leading-none';

  const variants: Record<BadgeVariant, string> = {
    open: 'bg-success/15 text-success text-[11px] px-2 py-1 font-bold uppercase tracking-wide',
    closed: 'text-[11px] px-2 py-1 font-semibold uppercase tracking-wide',
    featured: 'text-[11px] px-2 py-1 font-bold uppercase tracking-wide',
    cuisine: 'text-[12px] px-2.5 py-1',
    dietary: 'text-[11px] px-2 py-0.5 font-semibold',
    tier: 'text-[11px] px-2 py-0.5',
    frequency: 'text-[11px] px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={cn(base, variants[variant], className)}
      style={styleProp ?? (
        variant === 'open'
          ? { backgroundColor: 'color-mix(in srgb, var(--success) 15%, transparent)', color: 'var(--success)' }
          : variant === 'closed'
          ? { backgroundColor: 'color-mix(in srgb, var(--muted) 12%, transparent)', color: 'var(--muted)' }
          : variant === 'featured'
          ? { backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }
          : variant === 'cuisine'
          ? { backgroundColor: 'color-mix(in srgb, var(--teal) 12%, transparent)', color: 'var(--teal)' }
          : variant === 'dietary'
          ? { backgroundColor: 'color-mix(in srgb, var(--teal) 10%, transparent)', color: 'var(--teal)', border: '1px solid color-mix(in srgb, var(--teal) 25%, transparent)' }
          : variant === 'frequency'
          ? { backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', color: 'var(--primary)' }
          : {}
      )}
    >
      {children}
    </span>
  );
}
