'use client';

import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { Container } from '@/shared/ui/Container';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { Reveal } from '@/animation/Reveal';
import { forgePosts } from '@/content/data/home';
import { useSeriesCta, type ChapterRef } from '@/features/learn/progress';

/** Serializable tutorial shortcut (computed server-side in app/page.tsx). */
export interface ForgeTutorial {
  series: string;
  topic: string;
  title: string;
  topicLabel: string;
  chapters: ChapterRef[];
}

function TutorialCard({ t }: { t: ForgeTutorial }) {
  const cta = useSeriesCta({ series: t.series, topic: t.topic, chapters: t.chapters });
  if (!cta) return null;
  return (
    <Link
      href={cta.href}
      className="group flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-gold/50"
    >
      <div className="flex items-center gap-2">
        <span className="forge-tag rounded-full bg-violet/20 px-2.5 py-0.5 text-xs font-medium text-violet-300">
          {t.topicLabel}
        </span>
        <span className="ml-auto text-xs text-pearl/40">
          {cta.done > 0 ? `${cta.done}/${cta.total} chapters` : `${cta.total} chapters`}
        </span>
      </div>
      <h3 className="text-sm font-semibold leading-snug text-pearl/90 group-hover:text-gold">
        {t.title}
      </h3>
      <p className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-gold">
        {cta.label} <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
      </p>
    </Link>
  );
}

export function ForgeTeaser({ tutorials = [] }: { tutorials?: ForgeTutorial[] }) {
  const hasReal = tutorials.length > 0;
  const placeholders = forgePosts.slice(0, Math.max(0, 3 - tutorials.length));

  return (
    <section className="py-20 frost-panel">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="From the Forge"
            title={hasReal ? 'Learn with the studio.' : 'Dev writing, coming soon.'}
            subtitle={
              hasReal
                ? 'Free step-by-step tutorial series — from empty Unity project to playable game. More tracks in the works.'
                : 'Tutorials, breakdowns, and process notes from the studio. We write as we build.'
            }
          />
        </Reveal>

        <ul className="grid gap-5 sm:grid-cols-3">
          {tutorials.map((t, i) => (
            <Reveal as="li" key={t.series} delay={i * 0.08}>
              <TutorialCard t={t} />
            </Reveal>
          ))}
          {placeholders.map((post, i) => (
            <Reveal as="li" key={post.slug} delay={(tutorials.length + i) * 0.08}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 opacity-75">
                <div className="flex items-center gap-2">
                  <span className="forge-tag rounded-full bg-violet/20 px-2.5 py-0.5 text-xs font-medium text-violet-300">
                    {post.tag}
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-pearl/40">
                    <Clock size={11} /> {post.mins} min
                  </span>
                </div>
                <h3 className="text-sm font-semibold leading-snug text-pearl/80">{post.title}</h3>
                <p className="mt-auto text-xs text-pearl/35 italic">Coming soon</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
