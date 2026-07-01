import type { GameStatus } from '@/content/models';

const MAP: Record<GameStatus, { label: string; classes: string }> = {
  'live':           { label: 'Live',          classes: 'border-green-600/60 text-green-400 bg-green-900/20' },
  'in-development': { label: 'In Development', classes: 'border-gold/50     text-gold      bg-gold/10'       },
  'coming-soon':    { label: 'Coming Soon',    classes: 'border-white/20     text-pearl/50  bg-white/5'       },
};

export function StatusBadge({ status }: { status: GameStatus }) {
  const { label, classes } = MAP[status] ?? MAP['coming-soon'];
  return (
    <span className={`inline-block whitespace-nowrap rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${classes}`}>
      {label}
    </span>
  );
}
