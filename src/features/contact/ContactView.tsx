import type { StudioConfig } from '@/content/models';
import { Container } from '@/shared/ui/Container';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { ContactForm } from '@/features/contact/ContactForm';

/** Contact — Set Sail Together. EmailJS-backed form + studio details. */
export function ContactView({ config }: { config: StudioConfig }) {
  return (
    <section className="frost-panel relative min-h-screen pt-32 pb-24">
      <Container>
        <SectionHeader
          eyebrow="Contact"
          title="Set sail together."
          subtitle="Building something, learning game dev, or just want to talk shop? Reach out."
        />

        <div className="grid gap-10 md:grid-cols-[1.15fr_0.85fr]">
          <ContactForm />

          <div className="space-y-6">
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-pearl/40">
                Email
              </div>
              <a className="text-lg text-gold hover:underline" href={`mailto:${config.contactEmail}`}>
                {config.contactEmail}
              </a>
            </div>

            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-pearl/40">
                Based in
              </div>
              <p className="text-lg text-pearl/80">{config.contactLocation}</p>
            </div>

            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-pearl/40">
                Elsewhere
              </div>
              <div className="flex gap-5 text-base">
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

            <p className="border-t border-white/10 pt-5 text-sm leading-relaxed text-pearl/60">
              {config.studio} is a small studio in {config.contactLocation} — building games and
              sharing the craft through free, open learning.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
