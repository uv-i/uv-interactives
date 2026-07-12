import type { ReactNode } from 'react';

/* ── MDX content components — server-safe, string props only ─────────────
   String props keep next-mdx-remote v6's blockJS security default intact
   (JSX *expressions* are blocked; plain string attributes are not).
   Data format: comma-separated items, pipe-separated label|sublabel.       */

const GOLD = 'rgb(var(--c-gold))';
const VIOLET = 'rgb(var(--c-violet))';
const PEARL = 'rgb(var(--c-pearl))';

function parseItems(s: string): { label: string; sub?: string }[] {
  return s.split(',').map((x) => {
    const [label, sub] = x.split('|');
    return { label: label.trim(), sub: sub?.trim() };
  });
}

function HandNote({ x, y, children, anchor = 'middle' }: {
  x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <text
      x={x} y={y} textAnchor={anchor}
      style={{ fontFamily: 'var(--font-hand)', fontSize: 15, fill: GOLD, opacity: 0.9 }}
    >
      {children}
    </text>
  );
}

/** Teacher's margin note — chalk in dusk, marker in dawn. Hidden until
 *  Teacher view unless the reader opens it here (renders always in teacher mode). */
export function InstructorNotes({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="instructor-notes" role="note">
      <p className="instructor-notes-label">
        {'\u{1F4CB}'} Instructor notes{title ? ` — ${title}` : ''}
      </p>
      <div className="instructor-notes-body">{children}</div>
    </aside>
  );
}

/** One source → hub → many listeners. items: "GameManager,UIManager,AudioManager" */
export function EventFanout({ source, hub, listeners, note }: {
  source: string; hub: string; listeners: string; note?: string;
}) {
  const ls = parseItems(listeners);
  const h = Math.max(ls.length * 44 + 20, 110);
  const midY = h / 2;
  return (
    <figure className="learn-diagram">
      <svg viewBox={`0 0 560 ${h + (note ? 26 : 0)}`} role="img" aria-label={`${source} broadcasts through ${hub} to ${ls.length} listeners`}>
        <rect x={4} y={midY - 16} width={130} height={32} rx={6} fill="rgba(245,166,35,0.12)" stroke={GOLD} strokeWidth={1} />
        <text x={69} y={midY + 4} textAnchor="middle" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11.5, fill: GOLD }}>{source}</text>
        <line x1={134} y1={midY} x2={196} y2={midY} stroke={GOLD} strokeWidth={1.2} />
        <rect x={198} y={midY - 16} width={124} height={32} rx={6} fill="rgba(124,111,221,0.15)" stroke={VIOLET} strokeWidth={1} />
        <text x={260} y={midY + 4} textAnchor="middle" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11.5, fill: PEARL }}>{hub}</text>
        {ls.map((l, i) => {
          const y = 20 + i * 44 + 16;
          return (
            <g key={l.label}>
              <path d={`M322 ${midY} C 360 ${midY}, 375 ${y}, 408 ${y}`} fill="none" stroke={VIOLET} strokeWidth={1} opacity={0.8} />
              <rect x={410} y={y - 14} width={140} height={28} rx={6} fill="rgba(255,255,255,0.04)" stroke={`rgb(var(--c-pearl) / 0.3)`} strokeWidth={0.7} />
              <text x={480} y={y + 4} textAnchor="middle" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, fill: `rgb(var(--c-pearl) / 0.85)` }}>{l.label}</text>
            </g>
          );
        })}
        {note && <HandNote x={280} y={h + 16}>{note}</HandNote>}
      </svg>
    </figure>
  );
}

/** Enum state machine. states: "Patrol|walk waypoints,Chaser|follow player"
 *  transitions: "0-1|player in range,1-0|player lost" (indices into states) */
export function StateDiagram({ states, transitions, note }: {
  states: string; transitions?: string; note?: string;
}) {
  const ss = parseItems(states);
  const w = 560;
  const gap = w / ss.length;
  const y = 46;
  const trans = (transitions ?? '').split(',').filter(Boolean).map((t) => {
    const [pair, label] = t.split('|');
    const [a, b] = pair.split('-').map(Number);
    return { a, b, label: label?.trim() };
  });
  return (
    <figure className="learn-diagram">
      <svg viewBox={`0 0 ${w} ${note ? 150 : 128}`} role="img" aria-label={`State machine: ${ss.map((s) => s.label).join(', ')}`}>
        {ss.map((s, i) => {
          const cx = gap * i + gap / 2;
          return (
            <g key={s.label}>
              <rect x={cx - 62} y={y - 20} width={124} height={40} rx={8} fill={i === 0 ? 'rgba(245,166,35,0.12)' : 'rgba(124,111,221,0.14)'} stroke={i === 0 ? GOLD : VIOLET} strokeWidth={1} />
              <text x={cx} y={y - 2} textAnchor="middle" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12, fill: PEARL }}>{s.label}</text>
              {s.sub && <text x={cx} y={y + 13} textAnchor="middle" style={{ fontSize: 9.5, fill: `rgb(var(--c-pearl) / 0.55)` }}>{s.sub}</text>}
            </g>
          );
        })}
        {trans.map((t, i) => {
          const x1 = gap * t.a + gap / 2 + (t.b > t.a ? 62 : -62);
          const x2 = gap * t.b + gap / 2 + (t.b > t.a ? -66 : 66);
          const up = t.b > t.a;
          const yy = up ? y - 26 : y + 26;
          return (
            <g key={i}>
              <path d={`M${x1} ${up ? y - 10 : y + 10} C ${x1 + (up ? 20 : -20)} ${yy}, ${x2 + (up ? -20 : 20)} ${yy}, ${x2} ${up ? y - 10 : y + 10}`} fill="none" stroke={GOLD} strokeWidth={1} opacity={0.75} />
              {t.label && (
                <text x={(x1 + x2) / 2} y={up ? y - 34 : y + 44} textAnchor="middle" style={{ fontFamily: 'var(--font-hand)', fontSize: 14, fill: GOLD, opacity: 0.9 }}>{t.label}</text>
              )}
            </g>
          );
        })}
        {note && <HandNote x={w / 2} y={note ? 142 : 120}>{note}</HandNote>}
      </svg>
    </figure>
  );
}

/** Repeating loop. steps: "Input|key presses,Logic|game rules,Physics|forces,Render|draw frame" */
export function CycleDiagram({ steps, note }: { steps: string; note?: string }) {
  const ss = parseItems(steps);
  const w = 560;
  const gap = (w - 40) / ss.length;
  const y = 40;
  return (
    <figure className="learn-diagram">
      <svg viewBox={`0 0 ${w} ${note ? 128 : 108}`} role="img" aria-label={`Loop: ${ss.map((s) => s.label).join(' then ')}, repeating`}>
        {ss.map((s, i) => {
          const x = 20 + gap * i + 6;
          return (
            <g key={s.label}>
              <rect x={x} y={y - 20} width={gap - 12} height={40} rx={7} fill="rgba(124,111,221,0.14)" stroke={VIOLET} strokeWidth={1} />
              <text x={x + (gap - 12) / 2} y={y - 2} textAnchor="middle" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12, fill: PEARL }}>{s.label}</text>
              {s.sub && <text x={x + (gap - 12) / 2} y={y + 13} textAnchor="middle" style={{ fontSize: 9.5, fill: `rgb(var(--c-pearl) / 0.55)` }}>{s.sub}</text>}
              {i < ss.length - 1 && <line x1={x + gap - 12} y1={y} x2={x + gap - 4} y2={y} stroke={GOLD} strokeWidth={1.2} />}
            </g>
          );
        })}
        <path d={`M${w - 26} ${y + 20} C ${w - 10} ${y + 46}, 36 ${y + 46}, 26 ${y + 22}`} fill="none" stroke={GOLD} strokeWidth={1} strokeDasharray="5 4" opacity={0.7} />
        <HandNote x={w / 2} y={y + 52}>{note ?? 'repeats every frame, forever'}</HandNote>
      </svg>
    </figure>
  );
}

/** One parent, many children. root: "BaseScreen|abstract" children: "SplashScreen,..." */
export function TreeDiagram({ root, leaves, note }: { root: string; leaves: string; note?: string }) {
  const r = parseItems(root)[0];
  const ls = parseItems(leaves);
  const w = 560;
  const gap = w / ls.length;
  return (
    <figure className="learn-diagram">
      <svg viewBox={`0 0 ${w} ${note ? 152 : 130}`} role="img" aria-label={`${r.label} is the base of ${ls.map((l) => l.label).join(', ')}`}>
        <rect x={w / 2 - 70} y={8} width={140} height={36} rx={7} fill="rgba(245,166,35,0.12)" stroke={GOLD} strokeWidth={1} />
        <text x={w / 2} y={24} textAnchor="middle" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 12, fill: GOLD }}>{r.label}</text>
        {r.sub && <text x={w / 2} y={38} textAnchor="middle" style={{ fontSize: 9.5, fill: `rgb(var(--c-pearl) / 0.55)` }}>{r.sub}</text>}
        {ls.map((l, i) => {
          const cx = gap * i + gap / 2;
          return (
            <g key={l.label}>
              <path d={`M${w / 2} 44 C ${w / 2} 66, ${cx} 70, ${cx} 88`} fill="none" stroke={VIOLET} strokeWidth={1} opacity={0.8} />
              <rect x={cx - gap / 2 + 8} y={88} width={gap - 16} height={32} rx={6} fill="rgba(124,111,221,0.14)" stroke={VIOLET} strokeWidth={1} />
              <text x={cx} y={107} textAnchor="middle" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 10.5, fill: PEARL }}>{l.label}</text>
            </g>
          );
        })}
        {note && <HandNote x={w / 2} y={144}>{note}</HandNote>}
      </svg>
    </figure>
  );
}

export const learnMdxComponents = {
  InstructorNotes,
  EventFanout,
  StateDiagram,
  CycleDiagram,
  TreeDiagram,
};
