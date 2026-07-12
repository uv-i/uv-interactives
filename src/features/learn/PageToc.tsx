'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';

export interface TocHeading {
  id: string;
  text: string;
}

/** "On this page" — sticky section list with scroll-spy (lg+ only). */
export function PageToc({ headings }: { headings: TocHeading[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: '-96px 0px -70% 0px' },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page" className="sticky top-36 hidden max-h-[calc(100vh-10.5rem)] self-start overflow-y-auto lg:block">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-pearl/45">On this page</p>
      <ul className="space-y-1 text-xs">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={clsx(
                '-ml-px block border-l-2 py-0.5 pl-3 transition-colors',
                active === h.id
                  ? 'border-gold font-semibold text-gold'
                  : 'border-white/10 text-pearl/55 hover:text-pearl',
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
