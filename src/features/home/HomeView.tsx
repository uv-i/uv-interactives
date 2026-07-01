'use client';

import type { StudioConfig, Service, Game } from '@/content/models';
import { Container } from '@/shared/ui/Container';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { Button } from '@/shared/ui/Button';
import { Reveal } from '@/animation/Reveal';
import { StatsSection } from '@/features/home/StatsSection';
import { BuildPicker } from '@/features/home/BuildPicker';
import { GamesSection } from '@/features/home/GamesSection';
import { OpenSourceBanner } from '@/features/home/OpenSourceBanner';
import { ForgeTeaser } from '@/features/home/ForgeTeaser';
import { PlatformStrip } from '@/features/home/PlatformStrip';
import { useIslandStore } from '@/scene/islandStore';

export function HomeView({
  config,
  services,
  games,
}: {
  config: StudioConfig;
  services: Service[];
  games: Game[];
}) {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative flex min-h-[88vh] items-start overflow-hidden pt-[clamp(5.5rem,8vw,6rem)]">
        <Container className="flex flex-col items-center text-center">
          <h1
            className="max-w-2xl animate-fade-up font-bold leading-[1.08] tracking-tight drop-shadow-[0_2px_16px_rgba(8,4,20,0.55)] text-[clamp(1.6rem,7vw,3.75rem)]"
            style={{ animationDelay: '80ms' }}
          >
            {config.tagline}
          </h1>
          <p
            className="mt-[clamp(0.5rem,2vw,1.25rem)] max-w-xl animate-fade-up italic text-pearl/85 [text-shadow:0_1px_10px_rgba(8,4,20,0.6)] text-[clamp(0.875rem,2.5vw,1.125rem)]"
            style={{ animationDelay: '160ms' }}
          >
            &ldquo;{config.motto}&rdquo;
          </p>
          <div
            className="mt-[clamp(0.75rem,3vw,2.25rem)] flex animate-fade-up justify-center gap-[clamp(0.5rem,2vw,1rem)]"
            style={{ animationDelay: '240ms' }}
          >
            <Button href="/lab" className="text-[clamp(0.75rem,3.2vw,1rem)] px-[clamp(0.875rem,3.5vw,1.5rem)] py-[clamp(0.45rem,1.5vw,0.75rem)]">Explore free learning</Button>
            <Button href="/games" variant="ghost" className="text-[clamp(0.75rem,3.2vw,1rem)] px-[clamp(0.875rem,3.5vw,1.5rem)] py-[clamp(0.45rem,1.5vw,0.75rem)]">See what we&apos;re building</Button>
            {/* <Button
              variant="ghost"
              style={{ animationDelay: '320ms' }}
              className="animate-fade-up"
              onClick={() => useIslandStore.getState().enter()}
            >
              Explore in 3D
            </Button> */}
          </div>
        </Container>
      </section>

      {/* ── Platform strip ── */}
      {/* <PlatformStrip /> */}

      {/* ── Stats ── */}
      <StatsSection />

      {/* ── What we do (Services) ── */}
      <section className="py-20 frost-panel">
        <Container>
          <Reveal>
            <SectionHeader
              eyebrow="What we do"
              title="Build games. Share the craft."
              subtitle="A small studio shipping games and open learning materials for the next wave of developers."
            />
          </Reveal>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => (
              <Reveal as="li" key={s.id} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-gold/40">
                  <h3 className="text-lg font-semibold text-gold">{s.title}</h3>
                  <p className="mt-2 text-sm text-pearl/70">{s.description}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── Games preview ── */}
      <GamesSection games={games} />

      {/* ── Build picker ── */}
      <BuildPicker />

      {/* ── Open source banner ── */}
      <OpenSourceBanner />

      {/* ── Forge teaser ── */}
      <ForgeTeaser />
    </>
  );
}
