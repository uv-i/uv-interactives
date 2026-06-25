import {
  Group,
  Mesh,
  Material,
  MeshLambertMaterial,
  MeshStandardMaterial,
  BufferGeometry,
  type Object3D,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// cache: one cheap material per source material (keeps merge buckets small)
const cheapCache = new Map<string, Material>();

/** Swap costly MeshStandardMaterial for cheap MeshLambert (per-vertex lighting). */
export function cheapMaterial(src: Material): Material {
  const hit = cheapCache.get(src.uuid);
  if (hit) return hit;
  const s = src as MeshStandardMaterial;
  const m = new MeshLambertMaterial({
    color: s.color ? s.color.clone() : undefined,
    map: s.map ?? null,
    vertexColors: s.vertexColors,
    transparent: s.transparent,
    opacity: s.opacity,
    side: s.side,
    emissive: s.emissive ? s.emissive.clone() : undefined,
    emissiveIntensity: s.emissiveIntensity ?? 1,
    emissiveMap: s.emissiveMap ?? null,
  });
  cheapCache.set(src.uuid, m);
  return m;
}

/** Replace every mesh material in a subtree with its cheap Lambert equivalent. */
export function cheapenMaterials(root: Object3D): void {
  root.traverse((o: Object3D) => {
    const m = o as Mesh;
    if (!m.isMesh) return;
    if (Array.isArray(m.material)) m.material = m.material.map(cheapMaterial);
    else m.material = cheapMaterial(m.material as Material);
  });
}

/**
 * Collapse a glb scene into one mesh PER MATERIAL (world matrices baked in) AND
 * cheapen materials. Turns hundreds of draw calls + PBR into a handful of cheap
 * draws. Multi-material meshes are kept separate (rare).
 */
export function mergeByMaterial(root: Object3D): Group {
  root.updateWorldMatrix(true, true);
  const buckets = new Map<string, { mat: Material; geos: BufferGeometry[] }>();
  const out = new Group();

  root.traverse((o: Object3D) => {
    const m = o as Mesh;
    if (!m.isMesh) return;
    if (Array.isArray(m.material)) {
      const g = m.geometry.clone();
      g.applyMatrix4(m.matrixWorld);
      out.add(new Mesh(g, m.material.map(cheapMaterial)));
      return;
    }
    const geo = m.geometry.clone();
    geo.applyMatrix4(m.matrixWorld);
    const mat = cheapMaterial(m.material as Material);
    const sig = mat.uuid + '|' + Object.keys(geo.attributes).sort().join(',');
    let b = buckets.get(sig);
    if (!b) {
      b = { mat, geos: [] };
      buckets.set(sig, b);
    }
    b.geos.push(geo);
  });

  for (const { mat, geos } of buckets.values()) {
    if (geos.length === 1) {
      out.add(new Mesh(geos[0], mat));
      continue;
    }
    try {
      const merged = mergeGeometries(geos, false);
      if (merged) out.add(new Mesh(merged, mat));
      else geos.forEach((g) => out.add(new Mesh(g, mat)));
    } catch {
      geos.forEach((g) => out.add(new Mesh(g, mat)));
    }
  }
  return out;
}
