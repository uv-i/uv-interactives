'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import {
  AdditiveBlending,
  BackSide,
  Color,
  ShaderMaterial,
  Vector3,
  type Group,
  type Points,
  type PointsMaterial,
} from 'three';
import { useTheme } from '@/scene/theme/themeStore';
import { THEME_GRADE } from '@/scene/theme/grade';

const DOME_R = 460;
const BODY_DIST = 400;
const LERP = 1.8;

/** Vertical gradient sky + sun/moon disc + stars, all crossfading by theme. */
export function SkyDome() {
  const theme = useTheme((s) => s.theme);

  const domeMat = useMemo(
    () =>
      new ShaderMaterial({
        side: BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uTop: { value: new Color(THEME_GRADE.dusk.skyTop) },
          uBottom: { value: new Color(THEME_GRADE.dusk.skyBottom) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main(){
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vDir;
          uniform vec3 uTop; uniform vec3 uBottom;
          void main(){
            float t = smoothstep(-0.18, 0.55, vDir.y);
            gl_FragColor = vec4(mix(uBottom, uTop, t), 1.0);
          }
        `,
      }),
    [],
  );

  const bodyMat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: false,
        fog: false,
        blending: AdditiveBlending,
        uniforms: {
          uCore: { value: new Color(THEME_GRADE.dusk.bodyColor) },
          uGlow: { value: new Color(THEME_GRADE.dusk.bodyGlow) },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv;
          uniform vec3 uCore; uniform vec3 uGlow;
          void main(){
            float d = distance(vUv, vec2(0.5));
            float core = smoothstep(0.32, 0.16, d);
            float glow = smoothstep(0.5, 0.0, d);
            vec3 c = mix(uGlow, uCore, core);
            gl_FragColor = vec4(c, glow);
          }
        `,
      }),
    [],
  );

  // cached targets -- rebuilt only on theme change (no per-frame allocation)
  const t = useMemo(() => {
    const g = THEME_GRADE[theme];
    return {
      top: new Color(g.skyTop),
      bottom: new Color(g.skyBottom),
      core: new Color(g.bodyColor),
      glow: new Color(g.bodyGlow),
      dir: new Vector3(...g.bodyDir).normalize().multiplyScalar(BODY_DIST),
      size: g.bodySize * 6,
      stars: g.stars,
    };
  }, [theme]);

  const body = useRef<Group>(null);
  const stars = useRef<Points>(null);

  useFrame((_, dt) => {
    const k = Math.min(1, dt * LERP);
    (domeMat.uniforms.uTop.value as Color).lerp(t.top, k);
    (domeMat.uniforms.uBottom.value as Color).lerp(t.bottom, k);
    (bodyMat.uniforms.uCore.value as Color).lerp(t.core, k);
    (bodyMat.uniforms.uGlow.value as Color).lerp(t.glow, k);

    if (body.current) {
      body.current.position.lerp(t.dir, k);
      body.current.lookAt(0, 0, 0);
      body.current.scale.x += (t.size - body.current.scale.x) * k;
      body.current.scale.y = body.current.scale.x;
    }
    if (stars.current) {
      const m = stars.current.material as PointsMaterial;
      m.transparent = true;
      m.opacity += (t.stars - m.opacity) * k;
      stars.current.visible = m.opacity > 0.01;
    }
  });

  return (
    <group>
      <mesh material={domeMat} renderOrder={-10}>
        <sphereGeometry args={[DOME_R, 32, 16]} />
      </mesh>

      <group ref={body} renderOrder={-9}>
        <mesh material={bodyMat}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      </group>

      {/* Stars: cast as RefObject<Points> -- drei's Stars exposes a Points ref */}
      <Stars ref={stars as React.RefObject<Points>} radius={300} depth={60} count={1000} factor={6} saturation={0} fade speed={0.4} />
    </group>
  );
}
