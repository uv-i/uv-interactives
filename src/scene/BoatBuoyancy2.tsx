'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Group, Vector3, Quaternion, Mesh, Material, type Object3D } from 'three';
import { ARCH_MODELS, ARCH_STAGE } from './archipelago/layout';
import { useReveal } from './reveal/revealStore';
import { cheapMaterial } from './archipelago/merge';

// ── Wave math: mirrors Ocean.tsx GLSL ─────────────────────────────────────────
function fract(x: number) { return x - Math.floor(x); }
function hash(px: number, py: number) {
  return fract(Math.sin(px * 127.1 + py * 311.7) * 43758.5453123);
}
function mix(a: number, b: number, t: number) { return a + (b - a) * t; }
function vnoise(px: number, py: number) {
  const ix = Math.floor(px), iy = Math.floor(py);
  let fx = fract(px), fy = fract(py);
  fx = fx * fx * (3 - 2 * fx);
  fy = fy * fy * (3 - 2 * fy);
  return mix(mix(hash(ix,iy), hash(ix+1,iy), fx), mix(hash(ix,iy+1), hash(ix+1,iy+1), fx), fy);
}
function fbm(px: number, py: number) {
  let v = 0, a = 0.5, x = px, y = py;
  for (let i = 0; i < 4; i++) { v += a * vnoise(x, y); x=x*2.02+13.1; y=y*2.02+7.3; a*=0.5; }
  return v;
}
function gerstnerY(px: number, py: number, dx: number, dy: number, steep: number, wl: number, speed: number, t: number) {
  const k = 6.2831853 / wl;
  const c = Math.sqrt(9.8 / k);
  const len = Math.hypot(dx, dy);
  const f = k * (dx/len * px + dy/len * py - c * t * speed);
  return (steep / k) * Math.sin(f);
}
function waveHeight(wx: number, wz: number, t: number): number {
  const warpX = fbm(wx * 0.05,       wz * 0.05 + t * 0.02);
  const warpZ = fbm(wx * 0.05 + 5.2, wz * 0.05 - t * 0.015);
  const gx = wx + (warpX - 0.5) * 8;
  const gz = wz + (warpZ - 0.5) * 8;
  let h = gerstnerY(gx, gz,  1.0,  0.25, 0.16, 14.0, 0.9, t)
        + gerstnerY(gx, gz, -0.7,  1.0,  0.05,  9.0, 1.2, t)
        + gerstnerY(gx, gz,  0.6, -0.85, 0.03,  5.5, 1.5, t)
        + gerstnerY(gx, gz, -0.3, -0.6,  0.02,  3.2, 1.9, t);
  const chop = fbm(gx * 0.16 + t * 0.16, gz * 0.16 + t * 0.04) * 0.65
             + fbm(gx * 0.42 - t * 0.09, gz * 0.42 + t * 0.05) * 0.30;
  h += (chop - 0.5) * 0.5;
  return h;
}
// ─────────────────────────────────────────────────────────────────────────────

// Three.js sanitizes '.' → '_' in node names via PropertyBinding.sanitizeNodeName
// Use traverse + regex instead of getObjectByName to find all catamaran nodes
const BOAT_RE = /DG_Boat_Catamaran/;

const E = 1.5;
const TILT = 0.45;
// ponytail: small lift keeps hull above water even if CPU/GPU wave math drifts
const HULL_LIFT = 0.18;

function findMesh(root: Object3D): Mesh | null {
  if ((root as Mesh).isMesh) return root as Mesh;
  for (const child of root.children) {
    const found = findMesh(child);
    if (found) return found;
  }
  return null;
}

type BoatData = {
  geometry: Mesh['geometry'];
  material: Material;
  wPos: Vector3;
  wQuat: Quaternion;
  wScale: Vector3;
};

export function BoatBuoyancy() {
  const { scene } = useGLTF(ARCH_MODELS.dock);
  const stage = useReveal((s) => s.stage);
  const timeRef = useRef(0);
  const innerRefs = useRef<(Group | null)[]>([]);

  const boats = useMemo((): BoatData[] => {
    scene.updateWorldMatrix(true, true);

    // Traverse finds all catamaran nodes regardless of sanitized name
    const nodes: Object3D[] = [];
    scene.traverse((o: Object3D) => {
      if (BOAT_RE.test(o.name)) nodes.push(o);
    });

    return nodes.map((node) => {
      const mesh = findMesh(node);
      if (!mesh) return null;
      const wPos = new Vector3();
      const wQuat = new Quaternion();
      const wScale = new Vector3();
      node.matrixWorld.decompose(wPos, wQuat, wScale);
      return {
        geometry: mesh.geometry,
        material: cheapMaterial(mesh.material as Material),
        wPos: wPos.clone(),
        wQuat: wQuat.clone(),
        wScale: wScale.clone(),
      };
    }).filter(Boolean) as BoatData[];
  }, [scene]);

  innerRefs.current = innerRefs.current.slice(0, boats.length);

  useFrame((_, dt) => {
    if (stage < ARCH_STAGE.BOATS) return;
    timeRef.current += dt;
    const t = timeRef.current;
    innerRefs.current.forEach((g, i) => {
      const b = boats[i];
      if (!g || !b) return;
      const { x, z } = b.wPos;
      const h  = waveHeight(x,     z,     t) + HULL_LIFT;
      const hx = waveHeight(x + E, z,     t) + HULL_LIFT;
      const hz = waveHeight(x,     z + E, t) + HULL_LIFT;
      g.position.y = h;
      g.rotation.x = Math.atan2(hz - h, E) * TILT;
      g.rotation.z = Math.atan2(hx - h, E) * TILT;
    });
  });

  return (
    <>
      {boats.map((b, i) => (
        <group key={i} position={b.wPos.toArray()} quaternion={b.wQuat}>
          <group ref={(el) => { innerRefs.current[i] = el; }}>
            <mesh geometry={b.geometry} material={b.material} scale={b.wScale.toArray()} />
          </group>
        </group>
      ))}
    </>
  );
}
