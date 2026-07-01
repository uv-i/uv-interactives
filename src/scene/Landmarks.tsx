'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, ShaderMaterial, Color } from 'three';
import type { Mesh, MeshStandardMaterial } from 'three';
import { useLandmarkStore } from '@/scene/landmarkStore';

const sonarVert = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const sonarFrag = /* glsl */`
  uniform float uTime;
  uniform vec3  uColor;
  uniform float uAlpha;
  varying vec2  vUv;
  void main() {
    vec2  uv   = vUv * 2.0 - 1.0;
    float dist = length(uv);
    if (dist > 1.0) discard;
    float speed = 0.55;
    float ring1 = fract(dist - uTime * speed);
    float ring2 = fract(dist - uTime * speed + 0.5);
    float r1Alpha = smoothstep(0.88, 1.0, ring1) * (1.0 - dist * dist);
    float r2Alpha = smoothstep(0.88, 1.0, ring2) * (1.0 - dist * dist) * 0.55;
    float centre  = pow(max(0.0, 1.0 - dist * 1.4), 3.0) * 0.18;
    float alpha   = (r1Alpha + r2Alpha + centre) * uAlpha;
    gl_FragColor  = vec4(uColor, alpha);
  }
`;

const NAV_PINS = [
  {
    id: '/lab',
    label: 'Dev Lab',
    icon: '⚗️',
    sub: 'Free Unity Packages',
    desc: 'Free & open source. No signup.',
    tags: ['Unity', 'C#', 'GitHub'],
    color: '#FF8C00',
    route: '/lab',
    pos: new Vector3(29.5, 10, -3),
    groundPos: new Vector3(30, 1.5, -3),
  },
  {
    id: '/games',
    label: 'Our Games',
    icon: '⚔️',
    sub: 'Partner & Original Titles',
    desc: '50K+ downloads. More in the forge.',
    tags: ['Mobile', 'Fortnite', 'WebGL'],
    color: '#8855FF',
    route: '/games',
    pos: new Vector3(15, 5, 13),
    groundPos: new Vector3(15, 1.0, 13),
  },
  {
    id: '/contact',
    label: 'Contact',
    icon: '🗺️',
    sub: 'Start a Project',
    desc: 'Chennai, India · Open for work.',
    tags: ['Pitch us', 'Collaborate'],
    color: '#22C55E',
    route: '/contact',
    pos: new Vector3(-11, 5, 13),
    groundPos: new Vector3(-11, 0, 13),
  },
];

const LEO_PIN = {
  id: 'leo',
  label: 'Leo',
  icon: '🦁',
  sub: 'Your Guide',
  desc: 'Ask me anything about UV Interactives.',
  tags: ['AI', 'Chat'],
  color: '#f5a623',
  route: 'leo',
};

// Label projection point (mid-air above orb)
const LEO_POS: [number, number, number] = [-21, 6, 2.5];
const LEO_WORLD = new Vector3(...LEO_POS);

// Orb sits at ground level — adjust Y to match terrain surface
const LEO_GROUND_Y = 2;
const LEO_ORB_BASE: [number, number, number] = [LEO_POS[0], LEO_GROUND_Y, LEO_POS[2]];
const LEO_GROUND_POS = new Vector3(LEO_POS[0], LEO_GROUND_Y, LEO_POS[2]);

const _v = new Vector3();

type PinData = typeof NAV_PINS[0] | { id: string; color: string; groundPos: Vector3 };

function SonarDisc({ id, color, groundPos }: { id: string; color: string; groundPos: Vector3 }) {
  const discRef = useRef<Mesh>(null);
  const alphaRef = useRef(0);

  const mat = useMemo(() => new ShaderMaterial({
    vertexShader: sonarVert,
    fragmentShader: sonarFrag,
    uniforms: {
      uTime:  { value: 0 },
      uColor: { value: new Color(color) },
      uAlpha: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    depthTest: false,
  }), [color]);

  useFrame(({ clock }) => {
    const hovered = useLandmarkStore.getState().hoveredId === id;
    mat.uniforms.uTime.value = clock.getElapsedTime();

    const target = hovered ? 0.85 : 0;
    alphaRef.current += (target - alphaRef.current) * 0.10;
    mat.uniforms.uAlpha.value = alphaRef.current;

    if (discRef.current) {
      const ts = hovered ? 1.08 : 1.0;
      discRef.current.scale.x += (ts - discRef.current.scale.x) * 0.10;
      discRef.current.scale.z += (ts - discRef.current.scale.z) * 0.10;
    }
  });

  return (
    <mesh
      ref={discRef}
      position={groundPos}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={10}
    >
      <planeGeometry args={[5.6, 5.6, 1, 1]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

export function Landmarks() {
  const { camera, size } = useThree();
  const meshRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    // Leo orb bobs gently above ground level
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      meshRef.current.position.y = LEO_ORB_BASE[1] + Math.sin(t * 0.9) * 0.18;
      (meshRef.current.material as MeshStandardMaterial).emissiveIntensity =
        0.7 + Math.sin(t * 2.2) * 0.35;
    }

    const allPins = [
      ...NAV_PINS.map((p) => ({ meta: p, pos: p.pos })),
      { meta: LEO_PIN, pos: LEO_WORLD },
    ];

    const pins = allPins.map(({ meta, pos }) => {
      _v.copy(pos).project(camera);
      return {
        ...meta,
        x: (_v.x * 0.5 + 0.5) * size.width,
        y: (-_v.y * 0.5 + 0.5) * size.height,
        visible: _v.z < 1 && _v.z > -1 && Math.abs(_v.x) < 1.1 && _v.y > -1.3 && _v.y < 1.3,
      };
    });

    useLandmarkStore.getState().setPins(pins);
  });

  return (
    <>
      {/* Nav sonar discs */}
      {NAV_PINS.map((pin) => (
        <SonarDisc key={pin.id} id={pin.id} color={pin.color} groundPos={pin.groundPos} />
      ))}

      {/* Leo sonar disc */}
      <SonarDisc id="leo" color={LEO_PIN.color} groundPos={LEO_GROUND_POS} />

      {/* Leo orb — floats just above ground */}
      <mesh ref={meshRef} position={LEO_ORB_BASE}>
        <sphereGeometry args={[0.32, 20, 20]} />
        <meshStandardMaterial
          color="#f5a623"
          emissive="#f5a623"
          emissiveIntensity={0.7}
          roughness={0.25}
          metalness={0.05}
        />
      </mesh>
    </>
  );
}
