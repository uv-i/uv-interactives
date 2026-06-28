'use client';

import { useState } from 'react';
import { Smartphone, Globe, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/shared/ui/Container';
import { SectionHeader } from '@/shared/ui/SectionHeader';
import { Button } from '@/shared/ui/Button';

const OPTIONS = [
  {
    id: 'mobile',
    Icon: Smartphone,
    platform: 'Mobile Game',
    tagline: 'Android & iOS',
    color: '#FF8C00',
    examples: ['Casual & hyper-casual', 'Trivia & quiz titles', 'AR experiences', 'Firebase live ops'],
    cta: 'Start a mobile project',
  },
  {
    id: 'web',
    Icon: Globe,
    platform: 'WebGL / Browser',
    tagline: 'No install, instant play',
    color: '#8855FF',
    examples: ['Playable ads', 'Browser mini-games', 'Interactive marketing', 'HTML5 games'],
    cta: 'Explore WebGL work',
  },
  {
    id: 'fortnite',
    Icon: Zap,
    platform: 'Fortnite Island',
    tagline: 'UEFN + Verse scripting',
    color: '#22C55E',
    examples: ['Tycoon & economy maps', 'Battle arenas', 'Live event systems', 'Custom game modes'],
    cta: 'Build a Fortnite island',
  },
] as const;

export function BuildPicker() {
  const [active, setActive] = useState<string>('mobile');
  const option = OPTIONS.find((o) => o.id === active) ?? OPTIONS[0];

  return (
    <section className="py-20 frost-panel">
      <Container>
        <SectionHeader
          eyebrow="What we build"
          title="Pick your platform."
          subtitle="Three disciplines, one studio. Tell us what you need."
        />

        {/* Tab bar */}
        <div className="mb-8 flex flex-wrap gap-3">
          {OPTIONS.map(({ id, Icon, platform }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                active === id
                  ? 'border-transparent text-ink'
                  : 'border-white/15 text-pearl/70 hover:border-white/30 hover:text-pearl'
              }`}
              style={active === id ? { background: option.color } : {}}
            >
              <Icon size={16} />
              {platform}
            </button>
          ))}
        </div>

        {/* Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-8"
          >
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: `${option.color}22`, border: `1px solid ${option.color}44` }}
              >
                <option.Icon size={28} style={{ color: option.color }} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{option.platform}</h3>
                <p className="mt-1 text-sm text-pearl/60">{option.tagline}</p>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {option.examples.map((ex) => (
                    <li key={ex} className="flex items-center gap-2 text-sm text-pearl/75">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: option.color }} />
                      {ex}
                    </li>
                  ))}
                </ul>
                <div className="mt-7">
                  <Button href="/contact">{option.cta}</Button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </Container>
    </section>
  );
}
