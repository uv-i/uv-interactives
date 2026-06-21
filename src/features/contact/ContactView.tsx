import type { StudioConfig } from '@/content/models';
import { Container } from '@/shared/ui/Container';
import { SectionHeader } from '@/shared/ui/SectionHeader';

/** Contact — Set Sail Together. Calm CTA; form wired in a later phase. */
export function ContactView({ config }: { config: StudioConfig }) {
  return (
    <section className="pt-32 pb-24">
      <Container>
        <SectionHeader
          eyebrow="Contact"
          title="Set sail together."
          subtitle="Building something, learning game dev, or just want to talk shop? Reach out."
        />
        <div className="max-w-xl space-y-4 text-lg text-pearl/80">
          <p>
            Email:{' '}
            <a className="text-gold hover:underline" href={`mailto:${config.contactEmail}`}>
              {config.contactEmail}
            </a>
          </p>
          <p>Based in {config.contactLocation}.</p>
          <div className="flex gap-5 pt-2 text-base">
            {config.socials.github ? (
              <a className="text-gold hover:underline" href={config.socials.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
            ) : null}
            {config.socials.linkedin ? (
              <a className="text-gold hover:underline" href={config.socials.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
