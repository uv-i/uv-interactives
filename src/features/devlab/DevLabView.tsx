import type { TeachingPackage, StudioConfig } from '@/content/models';
import { Container } from '@/shared/ui/Container';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { JsonLd } from '@/shared/seo/JsonLd';
import { Reveal } from '@/animation/Reveal';
import { courseLd } from '@/lib/seo/jsonld';

/**
 * Dev Lab — the free learning library (the Lighthouse).
 * Cards are real, server-rendered HTML so every package is indexable;
 * each emits Course JSON-LD. Categories are derived from the data.
 */
export function DevLabView({
  teaching,
  config,
}: {
  teaching: TeachingPackage[];
  config: StudioConfig;
}) {
  const categories = Array.from(new Set(teaching.map((t) => t.category)));

  return (
    <section className="pt-32 pb-24">
      <Container>
        <SectionHeader
          eyebrow="Dev Lab · Free & open source"
          title="Learn game dev, for free."
          subtitle="Installable Unity & C# packages — straight from GitHub via UPM. Unreal, UEFN and Fortnite tracks are coming very soon."
        />

        {teaching.map((pkg) => (
          <JsonLd key={`ld-${pkg.id}`} data={courseLd(pkg, config)} />
        ))}

        {categories.map((category) => (
          <div key={category} className="mb-14">
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-widest text-pearl/50">
              {category}
            </h3>
            <ul className="grid gap-5 md:grid-cols-2">
              {teaching
                .filter((t) => t.category === category)
                .map((pkg, i) => (
                  <Reveal
                    as="li"
                    key={pkg.id}
                    delay={i * 0.08}
                    className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-gold/50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-xl font-semibold">{pkg.title}</h4>
                      <span className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold">
                        {pkg.engine}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-pearl/70">{pkg.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {pkg.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-white/5 px-2 py-1 text-xs text-pearl/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <a
                      href={pkg.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-5 inline-block font-semibold text-gold transition-transform group-hover:translate-x-1"
                    >
                      View on GitHub →
                    </a>
                  </Reveal>
                ))}
            </ul>
          </div>
        ))}
      </Container>
    </section>
  );
}
