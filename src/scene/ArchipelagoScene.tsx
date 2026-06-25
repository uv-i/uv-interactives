'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import {
  Color,
  Vector3,
  type AmbientLight,
  type DirectionalLight,
  type Fog,
  type HemisphereLight,
  type Object3D,
} from 'three';
import { useQualityStore } from '@/scene/quality/qualityStore';
import { Ocean } from '@/scene/Ocean';
import { Effects } from '@/scene/Effects';
import { Reveal3D } from '@/scene/reveal/Reveal3D';
import { useReveal } from '@/scene/reveal/revealStore';
import { useTheme } from '@/scene/theme/themeStore';
import { THEME_GRADE } from '@/scene/theme/grade';
import { SkyDome } from '@/scene/theme/SkyDome';
import { ARCH_MODELS, ARCH_STAGE } from '@/scene/archipelago/layout';
import { mergeByMaterial, cheapenMaterials } from '@/scene/archipelago/merge';
import { easeOutBack } from '@/scene/reveal/easing';

const LERP = 1.8;

/** Loads a group glb and clones it (world transforms baked -> mount at origin). */
function ArchModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const obj = useMemo(() => mergeByMaterial(scene), [scene]);
  return <primitive object={obj} />;
}

/**
 * Reveals the top-level children of a group glb ONE BY ONE (staggered pop).
 * Stops doing per-frame work once every child has finished appearing.
 */
function StaggeredGroup({
  url,
  stage,
  step = 0.04,
  dur = 0.55,
}: {
  url: string;
  stage: number;
  step?: number;
  dur?: number;
}) {
  const { scene } = useGLTF(url);
  const world = useMemo(() => {
    const w = scene.clone(true);
    cheapenMaterials(w);
    return w;
  }, [scene]);
  const current = useReveal((s) => s.stage);
  const elapsed = useRef(0);
  const done = useRef(false);
  const bases = useRef<Vector3[]>([]);

  useEffect(() => {
    bases.current = world.children.map((c: Object3D) => c.scale.clone());
    world.children.forEach((c: Object3D) => {
      c.scale.setScalar(0.0001);
      c.visible = false;
    });
  }, [world]);

  useFrame((_, dt) => {
    if (done.current) return;
    const active = current >= stage;
    if (!active) {
      elapsed.current = 0;
      return;
    }
    elapsed.current += dt;
    const n = world.children.length;
    world.children.forEach((c: Object3D, i: number) => {
      const local = Math.min(1, Math.max(0, (elapsed.current - i * step) / dur));
      const base = bases.current[i];
      if (!base) return;
      c.scale.copy(base).multiplyScalar(Math.max(0.0001, easeOutBack(local)));
      c.visible = local > 0.001;
    });
    if (elapsed.current > n * step + dur + 0.1) {
      world.children.forEach((c: Object3D, i: number) => {
        const base = bases.current[i];
        if (base) c.scale.copy(base);
        c.visible = true;
      });
      done.current = true;
    }
  });

  return <primitive object={world} />;
}

/** Lights + fog + exposure crossfading toward the active theme grade (cached targets). */
function GradedAtmosphere() {
  const theme = useTheme((s) => s.theme);
  const { scene, gl } = useThree();
  const amb = useRef<AmbientLight>(null);
  const hemi = useRef<HemisphereLight>(null);
  const key = useRef<DirectionalLight>(null);
  const rim = useRef<DirectionalLight>(null);

  // rebuilt only on theme change — zero per-frame allocation
  const t = useMemo(() => {
    const g = THEME_GRADE[theme];
    return {
      g,
      amb: new Color(g.ambient.color),
      hemiSky: new Color(g.hemi.sky),
      hemiGround: new Color(g.hemi.ground),
      key: new Color(g.key.color),
      rim: new Color(g.rim.color),
      fog: new Color(g.fog.color),
      dir: new Vector3(...g.bodyDir),
    };
  }, [theme]);

  useFrame((_, dt) => {
    const k = Math.min(1, dt * LERP);
    const g = t.g;
    if (amb.current) {
      amb.current.color.lerp(t.amb, k);
      amb.current.intensity += (g.ambient.intensity - amb.current.intensity) * k;
    }
    if (hemi.current) {
      hemi.current.color.lerp(t.hemiSky, k);
      hemi.current.groundColor.lerp(t.hemiGround, k);
      hemi.current.intensity += (g.hemi.intensity - hemi.current.intensity) * k;
    }
    if (key.current) {
      key.current.color.lerp(t.key, k);
      key.current.intensity += (g.key.intensity - key.current.intensity) * k;
      key.current.position.lerp(t.dir, k);
    }
    if (rim.current) {
      rim.current.color.lerp(t.rim, k);
      rim.current.intensity += (g.rim.intensity - rim.current.intensity) * k;
    }
    if (scene.fog) {
      const f = scene.fog as Fog;
      f.color.lerp(t.fog, k);
      f.near += (g.fog.near - f.near) * k;
      f.far += (g.fog.far - f.far) * k;
    }
    gl.toneMappingExposure += (g.exposure - gl.toneMappingExposure) * k;
  });

  const d = THEME_GRADE.dusk;
  return (
    <>
      <fog attach="fog" args={[d.fog.color, d.fog.near, d.fog.far]} />
      <ambientLight ref={amb} />
      <hemisphereLight ref={hemi} />
      <directionalLight ref={key} position={d.bodyDir} />
      <directionalLight ref={rim} position={[-30, 14, -28]} />
    </>
  );
}

export function ArchipelagoScene() {
  const reducedMotion = useQualityStore((s) => s.reducedMotion);
  const tier = useQualityStore((s) => s.tier);
  const theme = useTheme((s) => s.theme);
  const g = THEME_GRADE[theme];
  const segments = tier === 'high' ? 90 : tier === 'medium' ? 64 : 40;

  useEffect(() => {
    if (reducedMotion) {
      useReveal.getState().revealAll();
      return;
    }
    const set = useReveal.getState().setStage;
    const steps: [number, number][] = [
      [ARCH_STAGE.ISLANDS, 250],
      [ARCH_STAGE.PEAKS, 1100],
      [ARCH_STAGE.STRUCTURES, 1950],
      [ARCH_STAGE.FLORA, 2700],
      [ARCH_STAGE.DOCK, 3700],
    ];
    const timers = steps.map(([s, ms]) => window.setTimeout(() => set(s), ms));
    return () => {
      timers.forEach((tm) => window.clearTimeout(tm));
      useReveal.getState().reset();
    };
  }, [reducedMotion]);

  return (
    <>
      <SkyDome />
      <GradedAtmosphere />

      <Reveal3D stage={ARCH_STAGE.ISLANDS} mode="rise" rise={9}>
        <ArchModel url={ARCH_MODELS.islands} />
      </Reveal3D>

      <Reveal3D stage={ARCH_STAGE.PEAKS} mode="rise" rise={13}>
        <ArchModel url={ARCH_MODELS.peaks} />
      </Reveal3D>

      <Reveal3D stage={ARCH_STAGE.STRUCTURES} mode="rise" rise={6}>
        <ArchModel url={ARCH_MODELS.structures} />
      </Reveal3D>

      <StaggeredGroup url={ARCH_MODELS.flora} stage={ARCH_STAGE.FLORA} />

      <Reveal3D stage={ARCH_STAGE.DOCK} mode="rise" rise={2}>
        <ArchModel url={ARCH_MODELS.dock} />
      </Reveal3D>

      <Ocean
        segments={segments}
        sunDir={g.bodyDir}
        deep={g.ocean.deep}
        shallow={g.ocean.shallow}
        sunColor={g.ocean.sun}
      />
      <Effects />
    </>
  );
}

Object.values(ARCH_MODELS).forEach((u) => useGLTF.preload(u));
