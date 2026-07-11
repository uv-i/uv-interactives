'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Github, BookOpen, Clock, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal } from '@/animation/Reveal';
import type { TeachingPackage } from '@/content/models';
import type { TutorialLink } from '@/features/devlab/DevLabView';
import { useSeriesCta } from '@/features/learn/progress';

function PackageCard({ pkg, index, tutorial }: {
  pkg: TeachingPackage;
  index: number;
  tutorial?: TutorialLink;
}) {
  const cta = useSeriesCta(tutorial);
  if (pkg.status === 'coming-soon') {
    return (
      <Reveal as="li" delay={index * 0.08}>
        <div className="flex h-full flex-col gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 opacity-60">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                <BookOpen size={16} className="text-pearl/40" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-pearl/35">{pkg.category}</p>
                <h4 className="font-bold leading-tight">{pkg.title}</h4>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] font-medium text-pearl/35">
              Coming soon
            </span>
          </div>
          <p className="flex-1 text-sm leading-relaxed text-pearl/50">{pkg.summary}</p>
          <div className="flex items-center gap-1.5 text-xs text-pearl/30">
            <Clock size={11} />
            In development
          </div>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal as="li" delay={index * 0.08}>
      <div className="group flex h-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-gold/50">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet/20">
              <BookOpen size={16} className="text-violet-300" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-pearl/45">{pkg.category}</p>
              <h4 className="font-bold leading-tight">{pkg.title}</h4>
            </div>
          </div>
          <span className="shrink-0 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400">
            Active
          </span>
        </div>

        {/* Description */}
        <p className="flex-1 text-sm leading-relaxed text-pearl/70">{pkg.summary}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {pkg.tags.map((tag) => (
            <span key={tag} className="rounded-md border border-white/8 bg-white/5 px-2 py-0.5 text-xs text-pearl/55">
              {tag}
            </span>
          ))}
        </div>

        {/* CTAs — tutorial first (progress-aware), then the source */}
        <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-2">
          {cta && (
            <Link
              href={cta.href}
              className="inline-flex items-center gap-2 font-semibold text-gold transition-transform group-hover:translate-x-1"
            >
              <GraduationCap size={16} />
              {cta.label}
            </Link>
          )}
          {cta && tutorial && (
            <Link
              href={tutorial.topicHref}
              className="text-xs text-pearl/50 underline-offset-2 transition-colors hover:text-gold hover:underline"
            >
              {cta.done}/{cta.total} chapters — view all
            </Link>
          )}
          <a
            href={pkg.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-pearl/70 transition-colors hover:text-gold"
          >
            <Github size={15} />
            View on GitHub
          </a>
        </div>
      </div>
    </Reveal>
  );
}

export function DevLabTabs({ grouped, categories, tutorials = {} }: {
  grouped: Record<string, TeachingPackage[]>;
  categories: string[];
  tutorials?: Record<string, TutorialLink>;
}) {
  const [active, setActive] = useState(categories[0] ?? '');
  const packages = grouped[active] ?? [];

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`cursor-pointer rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              active === cat
                ? 'border-violet bg-violet/20 text-pearl'
                : 'border-white/15 text-pearl/60 hover:border-white/30 hover:text-pearl'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Package grid */}
      <AnimatePresence mode="wait">
        <motion.ul
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="grid gap-5 md:grid-cols-2"
        >
          {packages.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} tutorial={tutorials[pkg.githubUrl]} />
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}
