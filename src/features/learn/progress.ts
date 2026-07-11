'use client';

import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Client-side tutorial progress — localStorage via zustand persist.
 *  "Completed" = the chapter page was opened. Zero-friction tracking. */

export interface ChapterRef {
  part: number;
  slug: string;
  title?: string;
}

export interface SeriesProgressData {
  series: string;
  topic: string;
  chapters: ChapterRef[];
}

interface ProgressState {
  done: Record<string, number[]>; // series id -> completed parts
  markDone: (series: string, part: number) => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      done: {},
      markDone: (series, part) =>
        set((s) => {
          const cur = s.done[series] ?? [];
          if (cur.includes(part)) return s;
          return { done: { ...s.done, [series]: [...cur, part].sort((a, b) => a - b) } };
        }),
    }),
    { name: 'uvi_learn_progress' },
  ),
);

/** SSR-safe mount flag — progress reads must wait for the client. */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export interface SeriesCta {
  label: string;
  href: string;
  done: number;
  total: number;
}

/** CTA for a series card: Start → Continue — Chapter X → Completed. */
export function useSeriesCta(data?: SeriesProgressData): SeriesCta | null {
  const mounted = useMounted();
  const doneParts = useProgress((s) => (data ? s.done[data.series] : undefined));
  if (!data || data.chapters.length === 0) return null;

  const sorted = [...data.chapters].sort((a, b) => a.part - b.part);
  const total = sorted.length;
  const first = sorted[0];
  const base = `/lab/${data.topic}`;

  if (!mounted || !doneParts || doneParts.length === 0) {
    return { label: 'Start the tutorial', href: `${base}/${first.slug}`, done: 0, total };
  }
  const doneCount = sorted.filter((c) => doneParts.includes(c.part)).length;
  const next = sorted.find((c) => !doneParts.includes(c.part));
  if (!next) {
    return { label: 'Completed — revisit', href: `${base}/${first.slug}`, done: total, total };
  }
  return { label: `Continue — Chapter ${next.part}`, href: `${base}/${next.slug}`, done: doneCount, total };
}
