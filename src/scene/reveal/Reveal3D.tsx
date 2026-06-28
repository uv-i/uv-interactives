'use client';

import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { useReveal } from '@/scene/reveal/revealStore';
import { easeOutBack } from '@/scene/reveal/easing';


/**
 * Animates its children in when the global reveal reaches `stage`.
 * Grows from the base (scale pop) with an optional rise from below the water.
 * Place layout position on a PARENT group; this only applies the entrance.
 *
 * Once fully revealed (p > 0.99), locks state — never re-hides on page switch.
 */
export function Reveal3D({
  stage,
  rise = 0,
  delay = 0,
  mode = 'pop',
  children,
}: {
  stage: number;
  rise?: number;
  delay?: number;
  mode?: 'pop' | 'rise';
  children: ReactNode;
}) {
  const ref = useRef<Group>(null);
  const p = useRef(0);
  const wait = useRef(0);
  const done = useRef(false); // ponytail: latch — once revealed, skip all frame work
  const current = useReveal((s) => s.stage);

  useFrame((_, dt) => {
    if (done.current) return;

    const active = current >= stage;
    wait.current = active ? wait.current + dt : 0;
    const started = wait.current >= delay;
    const target = active && started ? 1 : 0;
    // critically-damped approach (~0.8s ease-in)
    p.current += (target - p.current) * Math.min(1, dt * 4);
    const g = ref.current;
    if (!g) return;
    const t = Math.min(1, Math.max(0, p.current));
    if (mode === 'rise') {
      g.position.y = (1 - t) * -rise;
    } else {
      const e = easeOutBack(t);
      g.scale.setScalar(Math.max(0.0001, e));
      g.position.y = (1 - t) * -rise;
    }
    g.visible = p.current > 0.002;

    // Lock once fully revealed — objects never re-hide on page switch
    if (p.current > 0.99) {
      done.current = true;
      g.visible = true;
      g.position.y = 0;
      if (mode !== 'rise') g.scale.setScalar(1);
    }
  });

  return (
    <group ref={ref} visible={false}>
      {children}
    </group>
  );
}
