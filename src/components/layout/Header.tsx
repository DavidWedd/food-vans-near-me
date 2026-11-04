'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Menu, X, MapPin, Search, Navigation } from 'lucide-react';

/* ── Logo SVG ─────────────────────────────────────── */
function FoodVanLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Van body */}
      <rect x="2" y="13" width="22" height="10" rx="2" fill="currentColor" opacity="0.9" />
      {/* Van cab */}
      <path d="M16 13H24V11L20 8H16V13Z" fill="currentColor" />
      {/* Van window */}
      <rect x="17" y="9" width="5" height="3" rx="1" fill="white" opacity="0.8" />
      {/* Service window */}
      <rect x="5" y="14" width="7" height="5" rx="1" fill="white" opacity="0.7" />
      {/* Wheels */}
      <circle cx="7" cy="23" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="7" cy="23" r="1.5" fill="white" opacity="0.8" />
      <circle cx="19" cy="23" r="3" fill="currentColor" opacity="0.6" />
      <circle cx="19" cy="23" r="1.5" fill="white" opacity="0.8" />
      {/* Location pin rising from roof */}
      <path
        d="M13 12C13 10.3 14.3 9 16 9C17.7 9 19 10.3 19 12C19 14 16 17 16 17C16 17 13 14 13 12Z"
        fill="var(--primary,#E07B00)"
      />
      <circle cx="16" cy="12" r="1.2" fill="white" />
    </svg>
  );
}

/* ── Theme toggle ─────────────────────────────────── */
function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('fvnm-theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(stored ?? (prefersDark ? 'dark' : 'light'));
  }, []);

  const toggle = () => {
    const next: 'light' | 'dark' = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('fvnm-theme', next);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center justify-center w-9 h-9 rounded-full border transition-all"
      style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

/* ── Main header ──────────────────────────────────── */
interface HeaderProps {
  searchQuery?: string;
  radius?: 2 | 5 | 10 | 20;
  onSearchChange?: (q: string) => void;
  onRadiusChange?: (r: 2 | 5 | 10 | 20) => void;
  onLocateMe?: () => void;
  showSearch?: boolean;
}

export function Header({
  searchQuery = '',
  radius = 5,
  onSearchChange,
  onRadiusChange,
  onLocateMe,
  showSearch = true,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0"
            aria-label="Food Vans Near Me — home"
          >
            <span style={{ color: 'var(--primary)' }}>
              <FoodVanLogo size={26} />
            </span>
            <span
              className="font-bold text-[17px] hidden sm:block"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--text)',
              }}
            >
              <span style={{ color: 'var(--primary)' }}>Food Vans</span>{' '}
              <span>Near Me</span>
            </span>
          </Link>

          {/* Search bar – desktop/tablet */}
          {showSearch && (
            <div className="hidden sm:flex flex-1 max-w-lg mx-4">
              <div
                className="flex items-center w-full rounded-full border overflow-hidden"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface-2)',
                }}
              >
                <Search
                  size={16}
                  className="ml-3 flex-shrink-0"
                  style={{ color: 'var(--muted)' }}
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Suburb or postcode…"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="flex-1 px-3 py-2 text-[14px] bg-transparent outline-none"
                  style={{ color: 'var(--text)' }}
                  aria-label="Search by suburb or postcode"
                />
                <button
                  onClick={onLocateMe}
                  className="flex items-center gap-1 px-3 py-2 text-[13px] font-medium border-l flex-shrink-0"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--primary)',
                  }}
                  title="Use my location"
                  aria-label="Use my current location"
                >
                  <Navigation size={13} />
                  <span className="hidden lg:inline">Near me</span>
                </button>
                <select
                  value={radius}
                  onChange={(e) => onRadiusChange?.(Number(e.target.value) as 2 | 5 | 10 | 20)}
                  className="px-2 py-2 text-[13px] bg-transparent border-l cursor-pointer outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                  aria-label="Search radius"
                >
                  {([2, 5, 10, 20] as const).map((r) => (
                    <option key={r} value={r}>
                      {r}km
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Right nav */}
          <nav
            className="hidden sm:flex items-center gap-3 ml-auto"
            aria-label="Main navigation"
          >
            <Link
              href="/markets"
              className="text-[14px] font-medium transition-colors"
              style={{ color: 'var(--text)' }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--primary)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text)')}
            >
              Markets
            </Link>
            <Link
              href="/vendor"
              className="text-[14px] font-medium transition-colors"
              style={{ color: 'var(--text)' }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--primary)')}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text)')}
            >
              Vendor login
            </Link>
            <Link
              href="/join"
              className="rounded-full px-4 py-2 text-[14px] font-semibold text-white"
              style={{ backgroundColor: 'var(--primary)' }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--primary-h)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.backgroundColor = 'var(--primary)')
              }
            >
              List Your Van
            </Link>
            <ThemeToggle />
          </nav>

          {/* Mobile hamburger */}
          <div className="sm:hidden flex items-center gap-2 ml-auto">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-full"
              style={{ color: 'var(--text)' }}
              aria-expanded={mobileOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {showSearch && (
          <div className="sm:hidden pb-3">
            <div
              className="flex items-center rounded-full border overflow-hidden"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}
            >
              <Search
                size={15}
                className="ml-3"
                style={{ color: 'var(--muted)' }}
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Suburb or postcode…"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="flex-1 px-3 py-2.5 text-[14px] bg-transparent outline-none"
                style={{ color: 'var(--text)' }}
                aria-label="Search by suburb or postcode"
              />
              <button
                onClick={onLocateMe}
                className="px-3"
                style={{ color: 'var(--primary)' }}
                aria-label="Use my current location"
              >
                <Navigation size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div
          ref={navRef}
          className="sm:hidden border-t"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <nav className="flex flex-col p-4 gap-3" aria-label="Mobile navigation">
            <Link
              href="/markets"
              onClick={() => setMobileOpen(false)}
              className="text-[16px] font-medium py-2"
              style={{ color: 'var(--text)' }}
            >
              Markets &amp; Events
            </Link>
            <Link
              href="/join"
              onClick={() => setMobileOpen(false)}
              className="text-[16px] font-medium py-2"
              style={{ color: 'var(--text)' }}
            >
              List Your Van
            </Link>
            <Link
              href="/vendor"
              onClick={() => setMobileOpen(false)}
              className="text-[16px] font-medium py-2"
              style={{ color: 'var(--text)' }}
            >
              Vendor login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
