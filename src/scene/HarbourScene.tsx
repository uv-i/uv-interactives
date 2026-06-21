'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import { DebugCamera } from '@/scene/DebugCamera';
import { AdditiveBlending, Color, DoubleSide, ShaderMaterial, type Group } from 'three';
import { useQuality } from '@/shared/providers/QualityProvider';
import { Ocean } from '@/scene/Ocean';
import { Effects } from '@/scene/Effects';
import { HModel } from '@/scene/models/HModel';
import { Reveal3D } from '@/scene/reveal/Reveal3D';
import { useReveal, STAGE } from '@/scene/reveal/revealStore';
import {
  TERRAIN,
  LIGHTHOUSE,
  DOCK,
  BOATS,
  PALMS,
  CAMERA,
  type Placement,
  preloadHarbour,
} from '@/scene/layout';

// golden-hour sun (shared by key light, sky, and water glint)
const SUN: [number, number, number] = [42, 17, 22];

function RevealAsset({
  p,
  stage,
  delay = 0,
  rise = 0,
}: {
  p: Placement;
  stage: number;
  delay?: number;
  rise?: number;
}) {
  return (
    <group position={p.position}>
      <Reveal3D stage={stage} delay={delay} rise={rise}>
        <HModel url={p.url} rotation={[0, p.rotationY ?? 0, 0]} scale={p.scale ?? 1} />
      </Reveal3D>
    </group>
  );
}

const BEAM_LEN = 50; // ponytail: long enough to sweep to the screen edge from the headland

// Beam brightest at the lantern, fading out toward the far end (light decay).
const beamMaterial = new ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: AdditiveBlending,
  side: DoubleSide,
  uniforms: {
    uColor: { value: new Color('#ffd89a') },
    uOpacity: { value: 0.16 },
    uHalf: { value: BEAM_LEN / 2 },
  },
  vertexShader: /* glsl */ `
    varying float vT;
    uniform float uHalf;
    void main(){
      vT = (position.y + uHalf) / (2.0 * uHalf);   // 0 = far end, 1 = lantern
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    varying float vT;
    uniform vec3 uColor;
    uniform float uOpacity;
    void main(){
      float t = clamp(vT, 0.0, 1.0);
      float a = pow(t, 1.25) * uOpacity;           // gentle decay so it carries to the far edge
      gl_FragColor = vec4(uColor, a);
    }
  `,
});

function LighthouseBeam({ y }: { y: number }) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.5;
  });
  return (
    <group ref={ref} position={[0, y, 0]}>
      {/* apex at the lantern, flaring outward; opacity fades toward the far end */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[BEAM_LEN / 2, 0, 0]} material={beamMaterial}>
        <coneGeometry args={[3.4, BEAM_LEN, 18, 1, true]} />
      </mesh>
    </group>
  );
}

export function HarbourScene() {
  const { reducedMotion, tier } = useQuality();
  const root = useRef<Group>(null);
  const { camera } = useThree();
  const segments = tier === 'high' ? 150 : tier === 'medium' ? 90 : 48;
  const shadowSize = tier === 'high' ? 2048 : 1024;
  const debug = useMemo(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('cam'),
    [],
  );

  useEffect(() => {
    preloadHarbour();
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      useReveal.getState().revealAll();
      return;
    }
    const set = useReveal.getState().setStage;
    const steps: [number, number][] = [
      [STAGE.WATER, 200],
      [STAGE.TREES, 1000],
      [STAGE.LIGHTHOUSE, 1900],
      [STAGE.DOCKS, 2700],
      [STAGE.EXTRAS, 3400],
    ];
    const timers = steps.map(([s, ms]) => window.setTimeout(() => set(s), ms));
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      useReveal.getState().reset();
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (debug) return; // OrbitControls owns the camera in debug mode
    camera.lookAt(CAMERA.target[0], CAMERA.target[1], CAMERA.target[2]);
  }, [camera, debug]);

  useFrame((state, dt) => {
    if (debug || !root.current) return;
    const tx = state.pointer.x * 0.04;
    root.current.rotation.y += (tx - root.current.rotation.y) * Math.min(1, dt * 2);
  });

  return (
    <>
      {/* atmosphere */}
      <Sky sunPosition={SUN} turbidity={8} rayleigh={1.6} mieCoefficient={0.012} mieDirectionalG={0.86} />
      <fog attach="fog" args={['#bcd2d9', 75, 230]} />
      {debug && <DebugCamera target={CAMERA.target} />}

      {/* golden-hour lighting */}
      <ambientLight intensity={0.5} color="#bcd0ec" />
      <hemisphereLight intensity={0.55} color="#dcecff" groundColor="#5a6440" />
      <directionalLight
        position={SUN}
        intensity={2.4}
        color="#ffe2ad"
        castShadow
        shadow-mapSize-width={shadowSize}
        shadow-mapSize-height={shadowSize}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={55}
        shadow-camera-bottom={-55}
        shadow-bias={-0.0004}
      />
      {/* cool rim/back light for separation */}
      <directionalLight position={[-30, 12, -28]} intensity={0.5} color="#9ec5ff" />

      <group ref={root}>
        {/* environment: terrain rises with the water */}
        <Reveal3D stage={STAGE.WATER} mode="rise" rise={6}>
          <group position={TERRAIN.position}>
            <HModel url={TERRAIN.url} />
          </group>
        </Reveal3D>
        <Ocean segments={segments} sunDir={SUN} />

        {/* trees along the banks */}
        {PALMS.map((p, i) => (
          <RevealAsset key={`palm-${i}`} p={p} stage={STAGE.TREES} delay={i * 0.05} />
        ))}

        {/* lighthouse on the headland + beam + glow */}
        <group
          position={LIGHTHOUSE.position}
          rotation={[0, LIGHTHOUSE.rotationY ?? 0, 0]}
          scale={LIGHTHOUSE.scale ?? 1}
        >
          <Reveal3D stage={STAGE.LIGHTHOUSE} rise={3}>
            <HModel url={LIGHTHOUSE.url} />
            <LighthouseBeam y={12} />
            <pointLight position={[0, 12, 0]} color="#ffce85" intensity={10} distance={36} />
          </Reveal3D>
        </group>

        {/* dock */}
        <RevealAsset p={DOCK.pier} stage={STAGE.DOCKS} rise={2} />
        <RevealAsset p={DOCK.railing} stage={STAGE.DOCKS} rise={2} />
        <RevealAsset p={DOCK.lamp} stage={STAGE.DOCKS} rise={2} />
        <pointLight
          position={[DOCK.lamp.position[0] - 0.8, DOCK.lamp.position[1] + 2.6, DOCK.lamp.position[2]]}
          color="#ffb24d"
          intensity={3}
          distance={9}
        />

        {/* boats */}
        {BOATS.map((b, i) => (
          <RevealAsset key={`boat-${i}`} p={b} stage={STAGE.EXTRAS} delay={i * 0.12} />
        ))}
      </group>

      <Effects />
    </>
  );
}
