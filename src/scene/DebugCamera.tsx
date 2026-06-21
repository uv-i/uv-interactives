'use client';

import { OrbitControls } from '@react-three/drei';

interface XYZ {
  x: number;
  y: number;
  z: number;
}
interface ControlsLike {
  object: { position: XYZ };
  target: XYZ;
}

/**
 * Dev-only free camera. Enable by adding ?cam to the URL.
 * Drag to orbit, scroll to zoom; on release it prints a ready-to-paste
 * CAMERA block to the console so the framing can be baked into layout.ts.
 */
export function DebugCamera({ target }: { target: [number, number, number] }) {
  const onEnd = (e?: unknown) => {
    const c = (e as { target?: ControlsLike } | undefined)?.target;
    if (!c) return;
    const p = c.object.position;
    const t = c.target;
    // eslint-disable-next-line no-console
    console.log(
      `CAMERA → position: [${p.x.toFixed(1)}, ${p.y.toFixed(1)}, ${p.z.toFixed(1)}], target: [${t.x.toFixed(1)}, ${t.y.toFixed(1)}, ${t.z.toFixed(1)}]`,
    );
  };
  return (
    <OrbitControls makeDefault target={target} onEnd={onEnd} enableDamping dampingFactor={0.08} />
  );
}
