import { Container } from '@/shared/ui/Container';
import { platforms } from '@/content/data/home';

export function PlatformStrip() {
  return (
    <section className="py-10 frost-panel border-y border-white/5">
      <Container>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-pearl/35">
            Tech stack
          </span>
          {platforms.map((p) => (
            <span key={p} className="text-sm font-medium text-pearl/55">
              {p}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}
