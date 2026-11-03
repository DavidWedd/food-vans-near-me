import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

/** Simple text page layout for About, Contact, Terms and Privacy. */
export function ContentPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro?: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header showSearch={false} />
      <main id="main-content" className="max-w-3xl mx-auto px-4 py-12">
        <h1
          className="text-3xl sm:text-4xl font-extrabold mb-3"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text)' }}
        >
          {title}
        </h1>
        {intro && (
          <p className="text-[17px] leading-relaxed mb-2" style={{ color: 'var(--muted)' }}>
            {intro}
          </p>
        )}
        {updated && (
          <p className="text-[13px] mb-8" style={{ color: 'var(--muted)' }}>
            Last updated: {updated}
          </p>
        )}
        <div className="content-page">{children}</div>
      </main>
      <Footer />
    </>
  );
}
