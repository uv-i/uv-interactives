import type { GameStatus } from '@/content/models';

const MAP: Record<GameStatus, { label: string; classes: string; extra?: string }> = {
  'live':           { label: 'Live',          classes: 'border-green-600/60 text-green-400 bg-green-900/20', extra: 'status-badge-live'  },
  'in-development': { label: 'In Development', classes: 'border-gold/50     text-gold      bg-gold/10',       extra: 'status-badge-dev'   },
  'coming-soon':    { label: 'Coming Soon',    classes: 'border-white/20     text-pearl/50  bg-white/5'                                    },
};

export function StatusBadge({ status }: { status: GameStatus }) {
  const { label, classes, extra } = MAP[status] ?? MAP['coming-soon'];
  return (
    <span className={`inline-block whitespace-nowrap rounded border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${classes}${extra ? ` ${extra}` : ''}`}>
      {label}
    </span>
  );
}
