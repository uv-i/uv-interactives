import { Github } from 'lucide-react';
import { Container } from '@/shared/ui/Container';
import { Reveal } from '@/animation/Reveal';

export function OpenSourceBanner() {
  return (
    <Reveal>
      <section className="py-14 frost-panel">
        <Container>
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-gold/20 bg-gold/5 px-8 py-10 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-2">Open Source</p>
              <h2 className="text-xl font-bold sm:text-2xl">All our Unity packages are free on GitHub.</h2>
              <p className="mt-2 text-sm text-pearl/65">No paywalls. No gatekeeping. A rising tide lifts all boats.</p>
            </div>
            <a
              href="https://github.com/uv-interactives"
              target="_blank"
              rel="noreferrer"
              className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink transition-transform duration-200 hover:scale-[1.03] active:scale-100"
            >
              <Github size={18} />
              View on GitHub
            </a>
          </div>
        </Container>
      </section>
    </Reveal>
  );
}
