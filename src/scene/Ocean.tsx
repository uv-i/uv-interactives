'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ShaderMaterial, Color, Vector3, type Mesh } from 'three';
import { useReveal } from '@/scene/reveal/revealStore';

const common = /* glsl */ `
uniform float uTime;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453123); }
float vnoise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  f=f*f*(3.0-2.0*f);
  float a=hash(i), b=hash(i+vec2(1.0,0.0)), c=hash(i+vec2(0.0,1.0)), d=hash(i+vec2(1.0,1.0));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
}
float fbm(vec2 p){
  float v=0.0, a=0.5;
  for(int i=0;i<4;i++){ v+=a*vnoise(p); p=p*2.02+vec2(13.1,7.3); a*=0.5; }
  return v;
}
vec3 gerstner(vec2 p, vec2 dir, float steep, float wl, float speed){
  float k = 6.2831853 / wl;
  float c = sqrt(9.8 / k);
  vec2 d = normalize(dir);
  float f = k * (dot(d, p) - c * uTime * speed);
  float a = steep / k;
  return vec3(d.x * (a * cos(f)), a * sin(f), d.y * (a * cos(f)));
}
vec3 waveDisp(vec2 g0){
  vec2 warp = vec2(
    fbm(g0 * 0.05 + vec2(0.0, uTime * 0.02)),
    fbm(g0 * 0.05 + vec2(5.2, -uTime * 0.015))
  );
  vec2 g = g0 + (warp - 0.5) * 8.0;
  vec3 disp = vec3(0.0);
  disp += gerstner(g, vec2( 1.0, 0.25), 0.16, 9.3, 0.9);
  disp += gerstner(g, vec2(-0.7, 1.0 ), 0.12, 5.7, 1.2);
  disp += gerstner(g, vec2( 0.6,-0.85), 0.08, 3.1, 1.5);
  disp += gerstner(g, vec2(-0.3,-0.6 ), 0.06, 1.9, 1.9);
  float chop = fbm(g * 0.16 + vec2(uTime * 0.06, uTime * 0.04)) * 0.65
             + fbm(g * 0.42 + vec2(-uTime * 0.09, uTime * 0.05)) * 0.30;
  disp.y += (chop - 0.5) * 0.95;
  disp.x += (fbm(g * 0.22 + vec2(uTime * 0.03, 0.0)) - 0.5) * 0.7;
  disp.z += (fbm(g * 0.22 + vec2(9.0, -uTime * 0.03)) - 0.5) * 0.7;
  return disp;
}
`;

const vertex = /* glsl */ `
uniform float uReveal;
varying float vH;
varying vec3 vPos;
varying vec3 vNormal;
${common}
void main(){
  vec3 pos = position;
  vec2 g = position.xy;
  vec3 d0 = waveDisp(g) * uReveal;
  float e = 0.6;
  float hx = waveDisp(g + vec2(e, 0.0)).y * uReveal;
  float hy = waveDisp(g + vec2(0.0, e)).y * uReveal;
  vec3 nLocal = normalize(vec3(-(hx - d0.y) / e, -(hy - d0.y) / e, 1.0));
  vNormal = normalize(normalMatrix * nLocal);
  pos.x += d0.x;
  pos.y += d0.z;
  pos.z += d0.y;
  vH = d0.y;
  vec4 wp = modelMatrix * vec4(pos, 1.0);
  vPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const fragment = /* glsl */ `
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uSunColor;
uniform vec3 uSunDir;
varying float vH;
varying vec3 vPos;
varying vec3 vNormal;
${common}
void main(){
  vec3 n = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vPos);
  float fres = pow(1.0 - max(dot(n, V), 0.0), 3.0);
  float h = clamp(vH * 1.5 + 0.5, 0.0, 1.0);
  vec3 col = mix(uDeep, uShallow, h);
  col = mix(col, uShallow, fres * 0.3);
  vec3 R = reflect(-normalize(uSunDir), n);
  float spec = pow(max(dot(R, V), 0.0), 120.0);
  col += uSunColor * spec * 0.9;
  float fn = fbm(vPos.xz * 0.35 + vec2(uTime * 0.04, -uTime * 0.03));
  float crest = smoothstep(0.14, 0.32, vH + (fn - 0.5) * 0.22);
  float foamPatch = smoothstep(0.55, 0.9, fn);
  float foam = crest * foamPatch;
  col = mix(col, vec3(0.9, 0.95, 1.0), foam * 0.38);
  gl_FragColor = vec4(col, 1.0);
}
`;

export function Ocean({
  size = 240,
  segments = 150,
  sunDir = [40, 16, 20] as [number, number, number],
  deep = '#0c3d54',
  shallow = '#2f86a6',
  sunColor = '#ffe7b3',
}: {
  size?: number;
  segments?: number;
  sunDir?: [number, number, number];
  deep?: string;
  shallow?: string;
  sunColor?: string;
}) {
  const meshRef = useRef<Mesh>(null);
  const current = useReveal((s) => s.stage);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uTime: { value: 0 },
          uReveal: { value: 0 },
          uDeep: { value: new Color(deep) },
          uShallow: { value: new Color(shallow) },
          uSunColor: { value: new Color(sunColor) },
          uSunDir: { value: new Vector3(...sunDir).normalize() },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // intentional: ShaderMaterial must NOT be recreated on prop changes -- uniforms are
    // mutated imperatively in useFrame below. Recreating would cause a flash + GC spike.
  );

  // cached lerp targets -- rebuilt only when props change (no per-frame alloc)
  const targets = useMemo(
    () => ({
      deep: new Color(deep),
      shallow: new Color(shallow),
      sunColor: new Color(sunColor),
      sunDir: new Vector3(...sunDir).normalize(),
    }),
    [deep, shallow, sunColor, sunDir],
  );

  useFrame((_, dt) => {
    material.uniforms.uTime.value += dt;
    const target = current >= 0 ? 1 : 0;
    const uReveal = material.uniforms.uReveal;
    uReveal.value += (target - uReveal.value) * Math.min(1, dt * 2.2);
    const k = Math.min(1, dt * 1.8);
    (material.uniforms.uDeep.value as Color).lerp(targets.deep, k);
    (material.uniforms.uShallow.value as Color).lerp(targets.shallow, k);
    (material.uniforms.uSunColor.value as Color).lerp(targets.sunColor, k);
    (material.uniforms.uSunDir.value as Vector3).lerp(targets.sunDir, k);
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} material={material}>
      <planeGeometry args={[size, size, segments, segments]} />
    </mesh>
  );
}
