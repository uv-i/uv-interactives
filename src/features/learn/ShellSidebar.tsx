'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { clsx } from 'clsx';
import { useMounted, useProgress, type ChapterRef } from '@/features/learn/progress';

const NO_PARTS: number[] = [];

/** Full-height chapter sidebar (xl+) + inline progress bar (below xl).
 *  Marks the current chapter completed on mount (visited = done). */
export function ShellSidebar({ series, seriesTitle, topic, part, chapters }: {
  series: string;
  seriesTitle: string;
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

  const sorted = [...chapters].sort((a, b) => a.part - b.part);
  const doneCount = mounted ? sorted.filter((c) => doneParts.includes(c.part)).length : 0;

  return (
    <>
      {/* Sidebar — wide screens */}
      <nav aria-label="Chapters" className="sticky top-36 hidden max-h-[calc(100vh-10.5rem)] self-start overflow-y-auto pr-2 xl:block">
        <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-gold">{seriesTitle}</p>
        <p className="mb-4 text-xs text-pearl/45">{doneCount}/{sorted.length} completed</p>
        <ol className="space-y-0.5">
          {sorted.map((c) => {
            const isCurrent = c.part === part;
            const isDone = mounted && doneParts.includes(c.part);
            return (
              <li key={c.part}>
                <Link
                  href={`/lab/${topic}/${c.slug}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={clsx(
                    'flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors',
                    isCurrent ? 'bg-gold/10 font-semibold text-gold' : 'text-pearl/55 hover:text-pearl',
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

      {/* Inline progress — smaller screens */}
      <div className="mb-8 flex items-center gap-3 xl:hidden">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gold transition-all"
            style={{ width: `${(doneCount / Math.max(sorted.length, 1)) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-xs text-pearl/55">{doneCount}/{sorted.length} completed</span>
      </div>
    </>
  );
}
