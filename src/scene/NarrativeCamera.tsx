'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useQualityStore } from '@/scene/quality/qualityStore';
import { useScrollStore } from '@/animation/scrollStore';
import { ARCH_CAMERA, ARCH_ZOOM_TARGET } from '@/scene/archipelago/layout';

// Mouse parallax strength (world units at pointer edge).
const PARALLAX_X = 10;
const PARALLAX_Y = 7.5;
// Lerp speed. 0.04 ~ 2s to settle at 60fps.
const LERP = 0.1;

const BASE = new Vector3(...ARCH_CAMERA.position);
const ZOOM = new Vector3(...ARCH_ZOOM_TARGET);
const TARGET = new Vector3(...ARCH_CAMERA.target);
// Reusable scratch vector -- avoids allocation in useFrame
const GOAL = new Vector3();

/**
 * Narrative camera -- fixed hero angle + mouse parallax + scroll zoom.
 * Quality-gated: low-tier / reduced-motion devices hold static position.
 *
 * Scroll zoom: heroProgress 0->1 (first screenful) lerps camera BASE->ZOOM.
 * Mouse parallax: pointer offset adds a gentle drift on top.
 * Both lerped -- always smooth, interruptible, bidirectional.
 */
export function NarrativeCamera() {
  const { camera } = useThree();
  const { tier, reducedMotion } = useQualityStore();
  const heroProgress = useScrollStore((s) => s.heroProgress);
  const pos = useRef(BASE.clone());
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(() => {
    const still = reducedMotion || tier === 'low';

    // Zoom base: starts CLOSE (ZOOM), pulls OUT to far (BASE) as user scrolls
    GOAL.lerpVectors(ZOOM, BASE, heroProgress);

    // Mouse parallax on top of zoom base (skip on low-end)
    GOAL.x += still ? 0 : mouse.current.x * PARALLAX_X;
    GOAL.y += still ? 0 : mouse.current.y * PARALLAX_Y;

    // Smooth pursuit
    pos.current.lerp(GOAL, LERP);

    camera.position.copy(pos.current);
    camera.lookAt(TARGET);
  });

  return null;
}
