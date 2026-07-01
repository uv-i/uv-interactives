'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useQualityStore } from '@/scene/quality/qualityStore';
import { useScrollStore } from '@/animation/scrollStore';
import { useCameraStore } from '@/scene/cameraStore';
import {
  ARCH_CAMERA, ARCH_ORBIT, ROUTE_CAMERAS,
  responsiveR, basePosFromR, zoomPosFromR,
} from '@/scene/archipelago/layout';

// Mouse parallax strength (world units at pointer edge).
const PARALLAX_X = 10;
const PARALLAX_Y = 7.5;
// Lerp speeds
const LERP_HOME  = 0.1;
const LERP_ROUTE = 0.03;
const LERP_ZOOM  = 0.12; // fast punch-in before page switch

// Module-level scratch — reused every frame, zero allocation in hot path
const DYN_BASE = new Vector3();
const DYN_ZOOM = new Vector3();
const TARGET   = new Vector3(...ARCH_CAMERA.target);
const GOAL     = new Vector3();
const LOOK     = new Vector3();

/**
 * Narrative camera — responsive to viewport size, hero angle + mouse parallax
 * + scroll zoom.
 *
 * Modes (priority order):
 *   zoom-in   — page-switch punch: fast lerp to ARCH_ZOOM_TARGET
 *   route     — cinematic slow lerp to per-page landmark camera
 *   home      — scroll-driven zoom BASE→ZOOM + mouse parallax
 *
 * BASE and ZOOM are recomputed each frame from responsiveR() so resizing the
 * window smoothly re-targets the camera without any jump.
 */
export function NarrativeCamera() {
  const { camera, size } = useThree();
  const { tier, reducedMotion } = useQualityStore();
  const heroProgress = useScrollStore((s) => s.heroProgress);
  const routeTarget  = useCameraStore((s) => s.routeTarget);
  const zoomPhase    = useCameraStore((s) => s.zoomPhase);

  // Init pos at the correct position for the current screen size.
  const R0  = responsiveR(size.width, size.height);
  const pos    = useRef(new Vector3(...basePosFromR(R0)));
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

    // Recompute base/zoom for current viewport every frame — cheap, handles
    // live resize and orientation change with automatic lerp transition.
    const R = responsiveR(size.width, size.height);
    DYN_BASE.set(...basePosFromR(R));
    DYN_ZOOM.set(...zoomPosFromR(R));

    if (zoomPhase === 'in' && routeTarget && ROUTE_CAMERAS[routeTarget]) {
      // Fast punch-in toward destination landmark before page switch
      const rc = ROUTE_CAMERAS[routeTarget];
      GOAL.set(...rc.position);
      LOOK.set(...rc.lookAt);
      pos.current.lerp(GOAL, LERP_ZOOM);
      lookAt.current.lerp(LOOK, LERP_ZOOM);
    } else if (zoomPhase === 'in') {
      // Fallback: no route camera, punch to scroll zoom position
      pos.current.lerp(DYN_ZOOM, LERP_ZOOM);
      lookAt.current.lerp(TARGET, LERP_ZOOM);
    } else if (routeTarget && ROUTE_CAMERAS[routeTarget]) {
      // On inner page: hold camera at landmark position
      const rc = ROUTE_CAMERAS[routeTarget];
      GOAL.set(...rc.position);
      LOOK.set(...rc.lookAt);
      pos.current.lerp(GOAL, LERP_ROUTE);
      lookAt.current.lerp(LOOK, LERP_ROUTE);
    } else {
      // Home: scroll-driven zoom BASE→ZOOM + mouse parallax
      GOAL.lerpVectors(DYN_ZOOM, DYN_BASE, heroProgress);
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
