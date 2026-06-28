import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { Container } from '@/shared/ui/Container';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { Reveal } from '@/animation/Reveal';
import { forgePosts } from '@/content/data/home';

export function ForgeTeaser() {
  return (
    <section className="py-20 frost-panel">
      <Container>
        <Reveal>
          <SectionHeader
            eyebrow="From the Forge"
            title="Dev writing, coming soon."
            subtitle="Tutorials, breakdowns, and process notes from the studio. We write as we build."
          />
        </Reveal>

        <ul className="grid gap-5 sm:grid-cols-3">
          {forgePosts.map((post, i) => (
            <Reveal as="li" key={post.slug} delay={i * 0.08}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 opacity-75">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-violet/20 px-2.5 py-0.5 text-xs font-medium text-violet-300">
                    {post.tag}
                  </span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-pearl/40">
                    <Clock size={11} /> {post.mins} min
                  </span>
                </div>
                <h3 className="text-sm font-semibold leading-snug text-pearl/80">{post.title}</h3>
                <p className="mt-auto text-xs text-pearl/35 italic">Coming soon</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
