import type { StudioConfig } from '@/content/models';
import { Container } from '@/shared/ui/Container';
import { SectionHeader } from '@/shared/ui/SectionHeader';

/** About — light studio story, no recruiting push, brief founder note. */
export function AboutView({ config }: { config: StudioConfig }) {
  return (
    <section className="pt-32 pb-24">
      <Container>
        <SectionHeader eyebrow="About" title="A small studio with a simple idea." />
        <div className="max-w-2xl space-y-5 text-lg leading-relaxed text-pearl/80">
          <p>
            {config.studio} builds games and shares the craft. Right now that means two things:
            free, open learning packages for new game developers, and our own original games taking
            shape behind the scenes.
          </p>
          <p>
            The belief is simple — <span className="italic text-gold">{config.motto.toLowerCase()}</span>{' '}
            When more developers learn and build, everyone’s work gets better, ours included.
          </p>
          <p>
            The studio is led by {config.founderName} ({config.founderShort}), based in{' '}
            {config.contactLocation} and a native of {config.nativePlace} — the warm coastal flavour
            you’ll feel across this site.
          </p>
        </div>
      </Container>
    </section>
  );
}
