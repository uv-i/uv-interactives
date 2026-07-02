import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Container } from '@/shared/ui/Container';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { Reveal } from '@/animation/Reveal';
import type { Game } from '@/content/models';

const STATUS_LABEL: Record<Game['status'], string> = {
  'live': 'Live',
  'in-development': 'In Development',
  'coming-soon': 'Coming Soon',
};

const STATUS_COLOR: Record<Game['status'], string> = {
  'live': 'status-badge-live text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  'in-development': 'status-badge-dev text-amber-400 bg-amber-400/10 border-amber-400/20',
  'coming-soon': 'text-pearl/50 bg-white/5 border-white/10',
};

export function GamesSection({ games }: { games: Game[] }) {
  const preview = games.slice(0, 3);

  return (
    <section className="py-20 frost-panel">
      <Container>
        <Reveal>
          <div className="flex items-start justify-between gap-4 mb-10">
            <SectionHeader
              eyebrow="Our work"
              title="Games we've shipped."
              subtitle="Partner titles we maintain and originals we're building."
            />
            <Link
              href="/games"
              className="hidden shrink-0 items-center gap-1 pt-1 text-sm font-semibold text-gold hover:underline sm:flex"
            >
              See all <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {preview.map((g, i) => (
            <Reveal as="li" key={g.id} delay={i * 0.08}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-gold/30">
                {/* Genre + status */}
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-pearl/45">
                    {g.genre}
                  </p>
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[g.status]}`}>
                    {STATUS_LABEL[g.status]}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold leading-tight">{g.title}</h3>

                {/* Description */}
                <p className="flex-1 text-sm leading-relaxed text-pearl/70">{g.summary}</p>

                {/* Attribution + external link */}
                {g.attribution && (
                  <div className="flex items-center gap-1.5 border-t border-white/5 pt-4">
                    {g.links?.partnerUrl ? (
                      <a
                        href={g.links.partnerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-pearl/40 hover:text-pearl/70 transition-colors"
                      >
                        {g.attribution}
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className="text-xs text-pearl/40">{g.attribution}</span>
                    )}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </ul>

        <div className="mt-8 flex justify-center sm:hidden">
          <Link href="/games" className="flex items-center gap-1 text-sm font-semibold text-gold hover:underline">
            See all games <ArrowRight size={14} />
          </Link>
        </div>
      </Container>
    </section>
  );
}
