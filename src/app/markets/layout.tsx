import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Markets & Events - Food Vans Near Me',
  description:
    'Tasmanian markets where you can find food vans, from Salamanca and Farm Gate in Hobart to Harvest and World Street Eats in Launceston, Evandale and the Devonport Twilight Market.',
  alternates: { canonical: '/markets' },
};

export default function MarketsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
