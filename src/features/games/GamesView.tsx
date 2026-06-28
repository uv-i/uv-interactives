'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Star, Handshake } from 'lucide-react';
import type { Game, StudioConfig } from '@/content/models';
import { Container } from '@/shared/ui/Container';
import { TiltWrapper } from '@/shared/ui/TiltWrapper';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { Reveal } from '@/animation/Reveal';
import { GameDetailPanel } from './GameDetailPanel';

const TABS = [
  { id: 'originals', label: 'UV Originals'   },
  { id: 'partners',  label: 'Proud Partners'  },
];

// ── Timeline dot ──────────────────────────────────────────────────────────────
const Dot = ({ pulse }: { pulse?: boolean }) => (
  <div className={`absolute left-[18px] top-8 z-10 h-5 w-5 rounded-full border-2 ${
    pulse
      ? 'flex items-center justify-center border-gold bg-violet-night shadow-[0_0_12px_rgba(255,196,0,0.6)]'
      : 'border-dashed border-gold/40 bg-violet-night'
  }`}>
    {pulse && <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-gold" />}
  </div>
);

// ── Teaser card (UV Original) ─────────────────────────────────────────────────
function TeaserCard({ game }: { game: Game }) {
  return (
    <div className="relative mb-12 pl-16">
      <Dot />
      <TiltWrapper>
        <article className="overflow-hidden rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02]">
          <div className="bg-white/[0.03] px-8 pb-6 pt-8">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-gold/70">{game.genre}</p>
                {/* Redacted title */}
                <p className="select-none text-2xl font-black tracking-widest text-white/5" aria-label="Title under wraps">
                  ████████████
                </p>
              </div>
              <div className="mt-1 flex gap-2">
                <StatusBadge status={game.status} />
                {game.year && (
                  <span className="rounded border border-white/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-pearl/40">
                    {game.year}
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-pearl/50">{game.summary}</p>
          </div>
        </article>
      </TiltWrapper>
    </div>
  );
}

// ── End cap ───────────────────────────────────────────────────────────────────
function OriginalsEndCap() {
  return (
    <div className="relative pl-16">
      <div className="absolute left-[18px] top-5 h-5 w-5 rounded-full border-2 border-dashed border-white/15 bg-violet-night" />
      <TiltWrapper>
        <div className="rounded-2xl border-2 border-dashed border-white/10 p-10 text-center">
          <Star size={28} className="mx-auto mb-3 text-white/10" />
          <p className="mb-1 text-sm font-bold text-pearl/40">More originals on the way</p>
          <p className="font-mono text-xs text-pearl/25">UV Interactives is building its own IP catalog — stay tuned.</p>
        </div>
      </TiltWrapper>
    </div>
  );
}

// ── Partner card ──────────────────────────────────────────────────────────────
function PartnerCard({ game, onClick }: { game: Game; onClick: () => void }) {
  return (
    <div className="relative mb-12 pl-16">
      <Dot pulse />
      {game.year && (
        <span className="absolute left-[42px] top-[26px] -translate-y-1/2 font-mono text-[9px] text-gold">
          {game.year}
        </span>
      )}
      <TiltWrapper>
        <article
          onClick={onClick}
          className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md transition-all duration-300 hover:border-gold/40 hover:bg-white/[0.06] hover:shadow-[0_0_32px_rgba(255,196,0,0.08)]"
        >
          {/* Hover shimmer */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-gold via-orange-400 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          {/* Attribution strip */}
          <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 py-3">
            <div className="flex items-center gap-2">
              <Handshake size={13} className="text-gold/70" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-gold/70">{game.role ?? 'Partner'}</span>
            </div>
            <span className="font-mono text-[10px] text-pearl/35">IP © {game.partnerName ?? ''}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
            {/* Thumbnail placeholder */}
            <div className="relative flex h-48 w-full items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02] md:h-full">
              <span className="select-none text-7xl font-black text-white/[0.04]">{game.title.charAt(0)}</span>
              <div className="absolute left-3 top-3"><StatusBadge status={game.status} /></div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-xs font-bold uppercase tracking-widest text-gold">View Details</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col p-6">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-gold/70">{game.genre}</p>
              <h3 className="mb-3 text-2xl font-black">{game.title}</h3>
              <p className="mb-5 flex-1 text-sm leading-relaxed text-pearl/65">{game.summary}</p>
              {game.highlights?.length ? (
                <ul className="mb-5 space-y-1">
                  {game.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-xs text-pearl/55">
                      <ChevronRight size={11} className="mt-0.5 flex-shrink-0 text-gold" />{h}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-gold/70">
                Click to view details <ChevronRight size={12} />
              </p>
            </div>
          </div>
        </article>
      </TiltWrapper>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export function GamesView({ games }: { games: Game[]; config: StudioConfig }) {
  const [activeTab, setActiveTab] = useState<'originals' | 'partners'>('originals');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [slideDir, setSlideDir]       = useState(0);

  const originals = games.filter((g) => g.ownership === 'original');
  const partners  = games.filter((g) => g.ownership === 'partner');

  const openGame     = (i: number, dir = 1) => { setSlideDir(dir); setSelectedIdx(i); };
  const closeGame    = () => setSelectedIdx(null);
  const navigateGame = (i: number, dir: number) => openGame(i, dir);

  const selectedGame = selectedIdx !== null ? partners[selectedIdx] : null;

  return (
    <>
      <section className="frost-panel min-h-screen pt-24 pb-20 md:pt-32 md:pb-24">
        <Container>
          {/* Page header */}
          <Reveal>
            <div className="mb-12">
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-gold">Games · The Dry Docks</p>
              <h1 className="text-4xl font-black sm:text-5xl">Set sail soon.</h1>
              <p className="mt-4 max-w-xl text-pearl/60">
                Our own games are under construction. Below, a title we proudly help keep afloat.
              </p>
            </div>
          </Reveal>

          {/* Tabs */}
          <div className="mb-10 flex gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as 'originals' | 'partners')}
                className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${
                  activeTab === t.id
                    ? 'border-gold bg-gold text-ink'
                    : 'border-white/15 text-pearl/65 hover:border-gold hover:text-gold'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25 }}
              className="relative border-l border-white/[0.07] pl-0"
            >
              {activeTab === 'originals' && (
                <>
                  {originals.map((g) => <TeaserCard key={g.id} game={g} />)}
                  <OriginalsEndCap />
                </>
              )}
              {activeTab === 'partners' && (
                <>
                  {partners.map((g, i) => (
                    <PartnerCard key={g.id} game={g} onClick={() => openGame(i)} />
                  ))}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </Container>
      </section>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedGame && (
          <GameDetailPanel
            game={selectedGame}
            games={partners}
            index={selectedIdx!}
            dir={slideDir}
            onClose={closeGame}
            onNavigate={navigateGame}
          />
        )}
      </AnimatePresence>
    </>
  );
}
