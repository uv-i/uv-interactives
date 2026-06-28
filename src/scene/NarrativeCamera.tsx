'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useQualityStore } from '@/scene/quality/qualityStore';
import { useScrollStore } from '@/animation/scrollStore';
import { useCameraStore } from '@/scene/cameraStore';
import { ARCH_CAMERA, ARCH_ZOOM_TARGET, ROUTE_CAMERAS } from '@/scene/archipelago/layout';

// Mouse parallax strength (world units at pointer edge).
const PARALLAX_X = 10;
const PARALLAX_Y = 7.5;
// Lerp speeds
const LERP_HOME  = 0.1;
const LERP_ROUTE = 0.03;
const LERP_ZOOM  = 0.12; // fast punch-in before page switch

const BASE   = new Vector3(...ARCH_CAMERA.position);
const ZOOM   = new Vector3(...ARCH_ZOOM_TARGET);
const TARGET = new Vector3(...ARCH_CAMERA.target);
// Reusable scratch — avoids allocation in useFrame
const GOAL = new Vector3();
const LOOK = new Vector3();

/**
 * Narrative camera — fixed hero angle + mouse parallax + scroll zoom.
 *
 * Modes (priority order):
 *   zoom-in   — page-switch punch: fast lerp to ARCH_ZOOM_TARGET, fires before navigation
 *   route     — cinematic slow lerp to per-page landmark camera
 *   home      — scroll-driven zoom BASE→ZOOM + mouse parallax
 *
 * All lerped — always smooth, interruptible, bidirectional.
 */
export function NarrativeCamera() {
  const { camera } = useThree();
  const { tier, reducedMotion } = useQualityStore();
  const heroProgress = useScrollStore((s) => s.heroProgress);
  const routeTarget  = useCameraStore((s) => s.routeTarget);
  const zoomPhase    = useCameraStore((s) => s.zoomPhase);

  const pos    = useRef(BASE.clone());
  const lookAt = useRef(TARGET.clone());
  const mouse  = useRef({ x: 0, y: 0 });

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

    if (zoomPhase === 'in') {
      // Punch in toward world center before page switch
      pos.current.lerp(ZOOM, LERP_ZOOM);
      lookAt.current.lerp(TARGET, LERP_ZOOM);
    } else if (routeTarget && ROUTE_CAMERAS[routeTarget]) {
      // Route zoom: lerp toward per-page landmark camera (slow, cinematic)
      const rc = ROUTE_CAMERAS[routeTarget];
      GOAL.set(...rc.position);
      LOOK.set(...rc.lookAt);
      pos.current.lerp(GOAL, LERP_ROUTE);
      lookAt.current.lerp(LOOK, LERP_ROUTE);
    } else {
      // Home: scroll-driven zoom + mouse parallax
      GOAL.lerpVectors(ZOOM, BASE, heroProgress);
      GOAL.x += still ? 0 : mouse.current.x * PARALLAX_X;
      GOAL.y += still ? 0 : mouse.current.y * PARALLAX_Y;
      pos.current.lerp(GOAL, LERP_HOME);
      lookAt.current.lerp(TARGET, LERP_HOME);
    }

    camera.position.copy(pos.current);
    camera.lookAt(lookAt.current);
  });

  return null;
}
