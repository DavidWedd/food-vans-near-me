import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Markets & Events - Food Vans Near Me',
  description:
    'Tasmanian food markets where you can find food vans: Salamanca Market, Farm Gate Market, Street Eats @ Franko, Hobart Twilight Market and Harvest Launceston.',
  alternates: { canonical: '/markets' },
};

export default function MarketsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
