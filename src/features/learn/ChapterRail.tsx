'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { useMounted, useProgress, type ChapterRef } from '@/features/learn/progress';

// Stable fallback — a fresh [] per read makes useSyncExternalStore loop.
const NO_PARTS: number[] = [];

/** Google-Docs-style chapter index — fixed left rail on xl+, inline bar below.
 *  Also marks the current chapter as completed on mount (visited = done). */
export function ChapterRail({ series, topic, part, chapters }: {
  series: string;
  topic: string;
  part: number;
  chapters: ChapterRef[];
}) {
  const mounted = useMounted();
  const markDone = useProgress((s) => s.markDone);
  const doneParts = useProgress((s) => s.done[series]) ?? NO_PARTS;

  useEffect(() => {
    markDone(series, part);
  }, [series, part, markDone]);

  if (!mounted) return null;

  const sorted = [...chapters].sort((a, b) => a.part - b.part);
  const doneCount = sorted.filter((c) => doneParts.includes(c.part)).length;

  const rail = (
      <nav
        aria-label="Chapter index"
        className="fixed left-6 top-1/2 z-40 hidden w-56 -translate-y-1/2 xl:block"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">
          {doneCount}/{sorted.length} completed
        </p>
        <ol className="space-y-1 border-l border-white/10">
          {sorted.map((c) => {
            const isCurrent = c.part === part;
            const isDone = doneParts.includes(c.part);
            return (
              <li key={c.part}>
                <Link
                  href={`/lab/${topic}/${c.slug}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={clsx(
                    '-ml-px flex items-center gap-2 border-l-2 py-1.5 pl-3 text-xs transition-colors',
                    isCurrent
                      ? 'border-gold font-semibold text-gold'
                      : 'border-transparent text-pearl/55 hover:text-pearl',
                  )}
                >
                  <span
                    className={clsx(
                      'grid h-4 w-4 shrink-0 place-items-center rounded-full border',
                      isDone ? 'border-gold bg-gold/20 text-gold' : 'border-white/25 text-transparent',
                    )}
                  >
                    <Check size={10} strokeWidth={3} />
                  </span>
                  <span className="truncate">Ch. {c.part} — {c.title ?? c.slug}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
  );

  return (
    <>
      {/* Fixed left rail (portaled to body — frost-panel's backdrop-filter would
          otherwise become its containing block and scroll it with the page) */}
      {createPortal(rail, document.body)}

      {/* Inline progress — smaller screens */}
      <div className="mb-8 flex items-center gap-3 xl:hidden">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gold transition-all"
            style={{ width: `${(doneCount / sorted.length) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-xs text-pearl/55">{doneCount}/{sorted.length} completed</span>
      </div>
    </>
  );
}
