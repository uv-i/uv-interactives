import type { Game, StudioConfig } from '@/content/models';
import { Container } from '@/shared/ui/Container';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { JsonLd } from '@/shared/seo/JsonLd';
import { Reveal } from '@/animation/Reveal';
import { videoGameLd } from '@/lib/seo/jsonld';

/** Games — the Dry Docks. Originals in development + the Skillmatics-owned title. */
export function GamesView({ games, config }: { games: Game[]; config: StudioConfig }) {
  const originals = games.filter((g) => g.ownership === 'original');
  const partners = games.filter((g) => g.ownership === 'partner');

  return (
    <section className="pt-32 pb-24">
      <Container>
        <SectionHeader
          eyebrow="Games · The Dry Docks"
          title="Set sail soon."
          subtitle="Our own games are under construction. Below, a title we proudly help keep afloat."
        />

        {games.map((g) => (
          <JsonLd key={`ld-${g.id}`} data={videoGameLd(g, config)} />
        ))}

        <div className="mb-14">
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-pearl/50">
            UV Originals — in development
          </h3>
          <ul className="grid gap-5 md:grid-cols-2">
            {originals.map((g, i) => (
              <Reveal
                as="li"
                key={g.id}
                delay={i * 0.08}
                className="rounded-2xl border border-dashed border-gold/30 bg-white/[0.02] p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-xl font-semibold">{g.title}</h4>
                  <span className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold">
                    {g.engine}
                  </span>
                </div>
                <p className="mt-3 text-sm text-pearl/70">{g.summary}</p>
                <p className="mt-4 text-xs uppercase tracking-widest text-gold/70">Coming soon</p>
              </Reveal>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-pearl/50">
            Live & maintained
          </h3>
          <ul className="grid gap-5 md:grid-cols-2">
            {partners.map((g, i) => (
              <Reveal
                as="li"
                key={g.id}
                delay={i * 0.08}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-xl font-semibold">{g.title}</h4>
                  <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-pearl/70">
                    {g.genre}
                  </span>
                </div>
                <p className="mt-3 text-sm text-pearl/70">{g.summary}</p>
                {g.highlights ? (
                  <ul className="mt-3 list-inside list-disc text-sm text-pearl/60">
                    {g.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  {g.links?.android ? (
                    <a className="text-gold hover:underline" href={g.links.android} target="_blank" rel="noreferrer">
                      Google Play
                    </a>
                  ) : null}
                  {g.links?.ios ? (
                    <a className="text-gold hover:underline" href={g.links.ios} target="_blank" rel="noreferrer">
                      App Store
                    </a>
                  ) : null}
                  {g.links?.partnerUrl ? (
                    <a className="text-pearl/60 hover:underline" href={g.links.partnerUrl} target="_blank" rel="noreferrer">
                      Skillmatics
                    </a>
                  ) : null}
                </div>
                {g.attribution ? (
                  <p className="mt-4 text-xs text-pearl/40">{g.attribution}</p>
                ) : null}
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
