import type { StudioConfig, Service } from '@/content/models';
import { Container } from '@/shared/ui/Container';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { Button } from '@/shared/ui/Button';
import { Reveal } from '@/animation/Reveal';

/**
 * Home presentation. Pure: receives content as props (page fetches it).
 * Hero uses CSS fade-up (no-JS / crawler safe); below-fold uses scroll reveals.
 * The active 3D environment mounts behind the hero via <SceneBackdrop/> (client-only).
 */
export function HomeView({ config, services }: { config: StudioConfig; services: Service[] }) {
  return (
    <>
      {/* Hero — the future rising-tide harbour lives behind this content */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden pt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-violet/30 to-transparent"
        />
        {/* readability scrim over the 3D scene (darkens behind the copy, clears to the right) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-[1] bg-gradient-to-r from-violet-night/85 via-violet-night/45 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-[1] h-2/5 bg-gradient-to-t from-violet-night/70 to-transparent"
        />
        <Container>
          <p className="mb-4 animate-fade-up text-sm font-semibold uppercase tracking-[0.2em] text-gold [text-shadow:0_1px_8px_rgba(8,4,20,0.6)]">
            {config.studio}
          </p>
          <h1
            className="max-w-2xl animate-fade-up text-4xl font-bold leading-[1.08] tracking-tight drop-shadow-[0_2px_16px_rgba(8,4,20,0.55)] sm:text-5xl lg:text-6xl"
            style={{ animationDelay: '80ms' }}
          >
            {config.tagline}
          </h1>
          <p
            className="mt-5 max-w-xl animate-fade-up text-lg italic text-pearl/85 [text-shadow:0_1px_10px_rgba(8,4,20,0.6)]"
            style={{ animationDelay: '160ms' }}
          >
            “{config.motto}”
          </p>
          <div
            className="mt-9 flex animate-fade-up flex-wrap gap-4"
            style={{ animationDelay: '240ms' }}
          >
            <Button href="/lab">Explore free learning</Button>
            <Button href="/games" variant="ghost">
              See what we’re building
            </Button>
          </div>
        </Container>
      </section>

      {/* What we do */}
      <section className="py-24">
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
    </>
  );
}
