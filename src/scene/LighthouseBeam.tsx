'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { ShaderMaterial, AdditiveBlending, DoubleSide, Color, type Group } from 'three';
import { useTheme } from '@/scene/theme/themeStore';
import { useReveal } from '@/scene/reveal/revealStore';
import { ARCH_STAGE } from '@/scene/archipelago/layout';

// ponytail: tweak LIGHTHOUSE_TOP to match your geometry
const LIGHTHOUSE_TOP: [number, number, number] = [29.5, 7, -3];
const BEAM_LEN   = 55;
const BEAM_END_R = 10;
const BEAM_SPEED = 0.7; // rad/s

const vert = /* glsl */`
  varying vec2  vUv;
  varying vec3  vNormal;
  varying vec3  vViewDir;
  void main() {
    vUv       = uv;
    vNormal   = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir  = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const frag = /* glsl */`
  uniform vec3  uColor;
  uniform float uOpacity;
  varying vec2  vUv;
  varying vec3  vNormal;
  varying vec3  vViewDir;
  void main() {
    float lenFade  = pow(1.0 - vUv.y, 1.2);
    float rim      = abs(dot(vNormal, vViewDir));
    float edgeFade = pow(rim, 0.45);
    float alpha    = lenFade * edgeFade * uOpacity;
    if (alpha < 0.002) discard;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export function LighthouseBeam() {
  const rotRef = useRef<Group>(null);
  const isDusk  = useTheme((s) => s.theme === 'dusk');
  // Gate on dock stage — lighthouse 3D model is in the dock GLB
  const ready   = useReveal((s) => s.stage >= ARCH_STAGE.DOCK);

  const mat = useMemo(() => new ShaderMaterial({
    vertexShader:   vert,
    fragmentShader: frag,
    uniforms: {
      uColor:   { value: new Color('#fff8c0') },
      uOpacity: { value: 0.55 },
    },
    transparent: true,
    side:        DoubleSide,
    depthWrite:  false,
    blending:    AdditiveBlending,
  }), []);

  mat.uniforms.uOpacity.value = isDusk ? 0.55 : 0.1;

  useFrame(({ clock }) => {
    if (!ready || !rotRef.current) return;
    rotRef.current.rotation.y = clock.getElapsedTime() * BEAM_SPEED;
  });

  if (!ready) return null;

  return (
    <>
      <group ref={rotRef} position={LIGHTHOUSE_TOP}>
        <mesh
          position={[0, 0, BEAM_LEN / 2]}
          rotation={[Math.PI / 2, 0, 0]}
          renderOrder={5}
        >
          <cylinderGeometry args={[BEAM_END_R, 0.05, BEAM_LEN, 32, 16, true]} />
          <primitive object={mat} attach="material" />
        </mesh>
      </group>

      <pointLight
        position={LIGHTHOUSE_TOP}
        color="#fff4a0"
        intensity={isDusk ? 10 : 5}
        distance={50}
        decay={2}
      />
    </>
  );
}
