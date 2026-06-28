'use client';

import { Container } from '@/shared/ui/Container';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { Reveal } from '@/animation/Reveal';
import { useCountUp } from '@/shared/hooks/useCountUp';
import { stats } from '@/content/data/home';

function StatCard({ value, label }: { value: string; label: string }) {
  const { ref, display } = useCountUp(value);
  return (
    <div className="flex h-full flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-colors hover:border-gold/40">
      <span ref={ref as React.Ref<HTMLSpanElement>} className="text-5xl font-bold tracking-tight text-gold">
        {display}
      </span>
      <span className="text-sm leading-snug text-pearl/65">{label}</span>
    </div>
  );
}

export function StatsSection() {
  return (
    <section className="frost-panel py-20">
      <Container>
        <Reveal>
          <SectionHeader eyebrow="By the numbers" title="Small team. Real impact." />
        </Reveal>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal as="li" key={s.label} delay={i * 0.07}>
              <StatCard value={s.value} label={s.label} />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
