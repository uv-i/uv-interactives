'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePerfStore } from '@/scene/debug/perfStore';

export function PerfProbe() {
  const gl = useThree((s) => s.gl);
  const frames = useRef(0);
  const last = useRef(typeof performance !== 'undefined' ? performance.now() : 0);
  const calls = useRef(0);
  const tris = useRef(0);

  // take manual control of the render-info counters so we read true per-frame totals
  useEffect(() => {
    gl.info.autoReset = false;
    return () => {
      gl.info.autoReset = true;
    };
  }, [gl]);

  useFrame(() => {
    // at this point info holds the PREVIOUS frame's accumulated totals
    calls.current = gl.info.render.calls;
    tris.current = gl.info.render.triangles;
    gl.info.reset();

    frames.current++;
    const now = performance.now();
    const elapsed = now - last.current;
    if (elapsed >= 250) {
      usePerfStore.getState().set({
        fps: Math.round((frames.current * 1000) / elapsed),
        calls: calls.current,
        tris: tris.current,
        geometries: gl.info.memory.geometries,
        textures: gl.info.memory.textures,
        programs: gl.info.programs ? gl.info.programs.length : 0,
      });
      frames.current = 0;
      last.current = now;
    }
  });

  return null;
}
