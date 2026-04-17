import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  asChild?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-full cursor-pointer transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px]';

  const sizes: Record<ButtonSize, string> = {
    sm: 'text-[12px] px-4 py-2 min-h-[36px]',
    md: 'text-[14px] px-5 py-2.5',
    lg: 'text-[14px] px-6 py-3',
  };

  return (
    <button
      className={cn(base, sizes[size], className)}
      style={
        variant === 'primary'
          ? {
              backgroundColor: 'var(--primary)',
              color: 'white',
            }
          : variant === 'secondary'
          ? {
              backgroundColor: 'color-mix(in srgb, var(--teal) 12%, transparent)',
              color: 'var(--teal)',
            }
          : variant === 'outline'
          ? {
              backgroundColor: 'transparent',
              color: 'var(--text)',
              border: '1.5px solid var(--border)',
            }
          : {
              backgroundColor: 'transparent',
              color: 'var(--text)',
            }
      }
      disabled={disabled}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'primary')
          (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--primary-h)';
        if (variant === 'outline')
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        if (variant === 'primary')
          (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--primary)';
        if (variant === 'outline')
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
      }}
      {...props}
    >
      {children}
    </button>
  );
}
