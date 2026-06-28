import type { TeachingPackage, StudioConfig } from '@/content/models';
import { Github } from 'lucide-react';
import { Container } from '@/shared/ui/Container';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { JsonLd } from '@/shared/seo/JsonLd';
import { Reveal } from '@/animation/Reveal';
import { courseLd } from '@/lib/seo/jsonld';
import { IdeaForge } from '@/features/devlab/IdeaForge';
import { DevLabTabs } from '@/features/devlab/DevLabTabs';

export function DevLabView({ teaching, config }: { teaching: TeachingPackage[]; config: StudioConfig }) {
  const grouped = teaching.reduce<Record<string, typeof teaching>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});
  const categories = Object.keys(grouped);

  return (
    <section className="frost-panel relative min-h-screen pt-24 pb-20 md:pt-32 md:pb-24">
      <Container>
        {/* Intro banner */}
        <Reveal>
          <div className="mb-14 flex flex-col gap-6 rounded-2xl border border-violet/20 bg-violet/5 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">
                Dev Lab — Free & open source
              </p>
              <h1 className="text-3xl font-bold sm:text-4xl">Learn game dev, for free.</h1>
              <p className="mt-3 max-w-xl text-pearl/65">
                Installable Unity &amp; C# packages — straight from GitHub via UPM.
                Unreal, UEFN and Fortnite tracks are coming very soon.
              </p>
            </div>
            <a
              href="https://github.com/uv-interactives"
              target="_blank"
              rel="noreferrer"
              className="flex shrink-0 cursor-pointer items-center gap-2 self-start rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-pearl transition-colors hover:border-gold hover:text-gold sm:self-auto"
            >
              <Github size={16} />
              GitHub
            </a>
          </div>
        </Reveal>

        {teaching.map((pkg) => (
          <JsonLd key={`ld-${pkg.id}`} data={courseLd(pkg, config)} />
        ))}

        <IdeaForge />

        {/* Tab bar + package cards (client) */}
        <DevLabTabs grouped={grouped} categories={categories} />
      </Container>
    </section>
  );
}
