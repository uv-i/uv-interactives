'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Smartphone, Monitor, ExternalLink, Play } from 'lucide-react';
import type { Game } from '@/content/models';
import { StatusBadge } from '@/shared/ui/StatusBadge';

const backdrop = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
};
const panel = {
  hidden:  { opacity: 0, scale: 0.93, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0,
    transition: { type: 'spring' as const, damping: 28, stiffness: 320, mass: 0.8 } },
  exit:    { opacity: 0, scale: 0.93, y: 24,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const } },
};
const slide = {
  enter: (dir: number) => ({ x: dir * 64, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const } },
  exit:  (dir: number) => ({ x: dir * -64, opacity: 0,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] as const } }),
};

function MediaArea({ game }: { game: Game }) {
  if (game.trailerYoutubeId) {
    return (
      <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '16/9' }}>
        <iframe
          src={`https://www.youtube.com/embed/${game.trailerYoutubeId}?rel=0&modestbranding=1&autoplay=1`}
          title={`${game.title} trailer`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }
  if (game.screenshots?.length) {
    return (
      <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: '16/9' }}>
        <img src={game.screenshots[0]} alt={game.title} className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className="relative flex w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-dashed border-white/10 bg-white/[0.03]"
      style={{ aspectRatio: '16/9' }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold/40 bg-gold/10">
        <Play size={22} className="ml-1 text-gold" fill="currentColor" />
      </div>
      <p className="text-sm font-bold text-pearl/40">Trailer coming soon</p>
    </div>
  );
}

export function GameDetailPanel({
  game,
  games,
  index,
  dir,
  onClose,
  onNavigate,
}: {
  game: Game;
  games: Game[];
  index: number;
  dir: number;
  onClose: () => void;
  onNavigate: (i: number, dir: number) => void;
}) {
  const hasPrev = index > 0;
  const hasNext = index < games.length - 1;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext) onNavigate(index + 1, 1);
      if (e.key === 'ArrowLeft'  && hasPrev) onNavigate(index - 1, -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, hasPrev, hasNext, onClose, onNavigate]);

  const links = [
    game.links?.partnerUrl  && { label: `View on ${game.partnerName ?? 'Partner'}`, href: game.links.partnerUrl,  Icon: ExternalLink, accent: true },
    game.links?.android     && { label: 'Google Play', href: game.links.android, Icon: Smartphone, accent: false },
    game.links?.ios         && { label: 'App Store',   href: game.links.ios,     Icon: Smartphone, accent: false },
    game.links?.web         && { label: 'Play / View', href: game.links.web,     Icon: Monitor,    accent: false },
  ].filter(Boolean) as { label: string; href: string; Icon: typeof X; accent: boolean }[];

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        variants={backdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
        style={{ backgroundColor: 'rgba(4,3,12,0.88)', backdropFilter: 'blur(10px)' }}
        onClick={onClose}
      >
        <motion.div
          key="panel"
          variants={panel}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-violet-night"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 bg-white/[0.03] px-6 py-4">
            <button
              onClick={() => hasPrev && onNavigate(index - 1, -1)}
              disabled={!hasPrev}
              className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${hasPrev ? 'text-gold hover:text-gold/80' : 'cursor-not-allowed text-white/15'}`}
            >
              <ChevronLeft size={16} /><span className="hidden sm:inline">Prev</span>
            </button>

            <div className="flex-1 px-4 text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-gold">{game.genre}</p>
              <h2 className="text-lg font-black leading-tight">{game.title}</h2>
              {game.partnerName && (
                <p className="mt-0.5 font-mono text-[10px] text-pearl/40">IP © {game.partnerName}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => hasNext && onNavigate(index + 1, 1)}
                disabled={!hasNext}
                className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${hasNext ? 'text-gold hover:text-gold/80' : 'cursor-not-allowed text-white/15'}`}
              >
                <span className="hidden sm:inline">Next</span><ChevronRight size={16} />
              </button>
              <div className="h-5 w-px bg-white/10" />
              <button onClick={onClose} className="rounded-lg p-1.5 text-pearl/50 transition-colors hover:bg-white/10 hover:text-pearl">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={game.id}
                custom={dir}
                variants={slide}
                initial="enter"
                animate="center"
                exit="exit"
                className="grid grid-cols-1 lg:grid-cols-[1fr_320px]"
              >
                {/* Left — media */}
                <div className="border-b border-white/5 p-6 lg:border-b-0 lg:border-r">
                  <MediaArea game={game} />

                  {/* Screenshot strip */}
                  {(game.screenshots?.length ?? 0) > 1 && (
                    <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                      {game.screenshots!.slice(1).map((src, i) => (
                        <img key={i} src={src} alt={`${game.title} screenshot ${i + 2}`}
                          className="h-20 w-auto flex-shrink-0 rounded-lg object-cover" />
                      ))}
                    </div>
                  )}

                  {game.playableUrl && (
                    <a href={game.playableUrl} target="_blank" rel="noreferrer"
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-gold/30 bg-gold/10 py-3 text-sm font-bold text-gold transition-colors hover:bg-gold/20">
                      <Play size={16} fill="currentColor" /> Play in Browser
                    </a>
                  )}
                </div>

                {/* Right — info */}
                <div className="flex flex-col gap-5 p-6">
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={game.status} />
                    {game.year && (
                      <span className="rounded border border-white/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-pearl/50">
                        {game.year}
                      </span>
                    )}
                    {game.role && (
                      <span className="rounded border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-pearl/40">
                        {game.role}
                      </span>
                    )}
                  </div>

                  <p className="text-sm leading-relaxed text-pearl/75">{game.summary}</p>

                  {game.highlights?.length ? (
                    <div>
                      <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-gold/70">Highlights</p>
                      <ul className="space-y-2">
                        {game.highlights.map((h, i) => (
                          <motion.li key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.06 }}
                            className="flex items-start gap-2.5 text-sm text-pearl/65"
                          >
                            <span className="mt-0.5 text-lg leading-none text-gold">›</span>{h}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {links.length > 0 && (
                    <div className="mt-auto flex flex-col gap-2 pt-2">
                      {links.map(({ label, href, Icon, accent }) => (
                        <a key={label} href={href} target="_blank" rel="noreferrer"
                          className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${
                            accent ? 'border-gold/50 text-gold hover:bg-gold/10' : 'border-white/15 text-pearl/75 hover:border-gold hover:text-gold'
                          }`}>
                          <Icon size={14} /> {label}
                        </a>
                      ))}
                    </div>
                  )}

                  <p className="text-center font-mono text-[10px] text-pearl/25">← → to navigate · Esc to close</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
