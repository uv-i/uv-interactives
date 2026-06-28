import { Reveal } from '@/animation/Reveal';

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Reveal>
      <header className="mb-10 max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-gold">{eyebrow}</p>
        ) : null}
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        {subtitle ? <p className="mt-3 text-pearl/70">{subtitle}</p> : null}
      </header>
    </Reveal>
  );
}
