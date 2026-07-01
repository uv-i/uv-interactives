'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  ShaderMaterial, Color, Vector3,
  WebGLRenderTarget, OrthographicCamera,
  type Mesh,
} from 'three';
import { useReveal } from '@/scene/reveal/revealStore';

// ponytail: 1024×1024 world-space top-down terrain map, every 8th frame
const DEPTH_SIZE = 1024;
const PREPASS_EVERY = 8;

// Encodes world-space Y into red channel for the shore-foam pass.
// Prepass uses an overhead ortho camera — world-anchored, not screen-space.
const worldYVertex = /* glsl */ `
varying float vWorldY;
void main(){
  vWorldY = (modelMatrix * vec4(position, 1.0)).y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const worldYFragment = /* glsl */ `
varying float vWorldY;
void main(){
  float enc = clamp((vWorldY + 10.0) / 30.0, 0.001, 1.0);
  gl_FragColor = vec4(enc, 0.0, 0.0, 1.0);
}`;

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
  disp += gerstner(g, vec2( 1.0, 0.25), 0.16, 14.0, 0.9);
  disp += gerstner(g, vec2(-0.7, 1.0 ), 0.05, 9.0,  1.2);
  disp += gerstner(g, vec2( 0.6,-0.85), 0.03, 5.5,  1.5);
  disp += gerstner(g, vec2(-0.3,-0.6 ), 0.02, 3.2,  1.9);
  float chop = fbm(g * 0.16 + vec2(uTime * 0.16, uTime * 0.04)) * 0.65
             + fbm(g * 0.42 + vec2(-uTime * 0.09, uTime * 0.05)) * 0.30;
  disp.y += (chop - 0.5) * 0.5;
  disp.x += (fbm(g * 0.22 + vec2(uTime * 0.03, 0.0)) - 0.5) * 0.35;
  disp.z += (fbm(g * 0.22 + vec2(9.0, -uTime * 0.03)) - 0.5) * 0.35;
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
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
uniform sampler2D tWorldY;
uniform float uSize;
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

  // Wave-crest foam
  float fn = fbm(vPos.xz * 0.35 + vec2(uTime * 0.04, -uTime * 0.03));
  float crest = smoothstep(0.14, 0.32, vH + (fn - 0.5) * 0.22);
  float foamPatch = smoothstep(0.55, 0.9, fn);
  col = mix(col, vec3(0.9, 0.95, 1.0), crest * foamPatch * 0.35);

  // Shore foam: soft-blurred world-space terrain sample
  vec2 worldUV = vPos.xz / uSize + 0.5;
  vec2 waveOff = vec2(
    fbm(vPos.xz * 0.07 + vec2(uTime * 0.14, 0.0)) - 0.5,
    fbm(vPos.xz * 0.07 + vec2(0.0, -uTime * 0.11)) - 0.5
  ) * 0.006;
  // 9-tap blur on terrain mask (bs=0.012 = ~12px in 1024 RT) — softens hard edges
  float bs = 0.012;
  float enc = texture2D(tWorldY, worldUV + waveOff).r                * 0.25
            + texture2D(tWorldY, worldUV + waveOff + vec2( bs, 0.0)).r * 0.125
            + texture2D(tWorldY, worldUV + waveOff + vec2(-bs, 0.0)).r * 0.125
            + texture2D(tWorldY, worldUV + waveOff + vec2(0.0,  bs)).r * 0.125
            + texture2D(tWorldY, worldUV + waveOff + vec2(0.0, -bs)).r * 0.125
            + texture2D(tWorldY, worldUV + waveOff + vec2( bs,  bs)).r * 0.0625
            + texture2D(tWorldY, worldUV + waveOff + vec2(-bs,  bs)).r * 0.0625
            + texture2D(tWorldY, worldUV + waveOff + vec2( bs, -bs)).r * 0.0625
            + texture2D(tWorldY, worldUV + waveOff + vec2(-bs, -bs)).r * 0.0625;
  if (enc > 0.001) {
    float terrainY = enc * 30.0 - 10.0;
    float pulse = 0.5 + 0.5 * sin(uTime * 1.4 + vPos.x * 0.22 + vPos.z * 0.17);
    float band = 0.45 + pulse * 0.75;
    // Soft inner edge: smoothstep from band→-0.3 so no hard wall at center
    float proximity = smoothstep(band, -0.3, abs(terrainY));
    float foamN = fbm(vPos.xz * 0.45 + vec2(uTime * 0.18, -uTime * 0.12));
    float shoreFoam = proximity * (0.4 + foamN * 0.4);
    col = mix(col, vec3(0.97, 0.99, 1.0), clamp(shoreFoam, 0.0, 1.0) * 0.55);
  }

  // Horizon fog
  float dist = length(cameraPosition.xz - vPos.xz);
  float distFog = smoothstep(uFogNear * 0.4, uFogFar, dist);
  float horizonFog = 1.0 - smoothstep(0.0, 0.18, abs(V.y));
  float fogT = clamp(distFog + horizonFog * (1.0 - distFog), 0.0, 1.0);
  col = mix(col, uFogColor, fogT);

  gl_FragColor = vec4(col, 1.0);
}
`;

export function Ocean({
  size = 1500,
  segments = 150,
  sunDir = [40, 16, 20] as [number, number, number],
  deep = '#0c3d54',
  shallow = '#2f86a6',
  sunColor = '#ffe7b3',
  fogColor = '#222a52',
  fogNear = 85,
  fogFar = 250,
}: {
  size?: number;
  segments?: number;
  sunDir?: [number, number, number];
  deep?: string;
  shallow?: string;
  sunColor?: string;
  fogColor?: string;
  fogNear?: number;
  fogFar?: number;
}) {
  const meshRef = useRef<Mesh>(null);
  const current = useReveal((s) => s.stage);
  const frameRef = useRef(0);

  const { worldYTarget, worldYMat, prepassCam } = useMemo(() => {
    const t = new WebGLRenderTarget(DEPTH_SIZE, DEPTH_SIZE);
    const m = new ShaderMaterial({
      vertexShader: worldYVertex,
      fragmentShader: worldYFragment,
    });
    // Overhead orthographic camera covers the full ocean plane
    const c = new OrthographicCamera(-size / 2, size / 2, size / 2, -size / 2, 0.1, 200);
    c.position.set(0, 100, 0);
    c.lookAt(0, 0, 0);
    c.updateMatrixWorld(true);
    c.layers.disableAll();
    c.layers.enable(0); // ponytail: only see default-layer terrain; beam is on layer 2
    return { worldYTarget: t, worldYMat: m, prepassCam: c };
  }, [size]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uTime:       { value: 0 },
          uReveal:     { value: 0 },
          uDeep:       { value: new Color(deep) },
          uShallow:    { value: new Color(shallow) },
          uSunColor:   { value: new Color(sunColor) },
          uSunDir:     { value: new Vector3(...sunDir).normalize() },
          uFogColor:   { value: new Color(fogColor) },
          uFogNear:    { value: fogNear },
          uFogFar:     { value: fogFar },
          tWorldY:     { value: null },
          uSize:       { value: size },
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const targets = useMemo(
    () => ({
      deep:     new Color(deep),
      shallow:  new Color(shallow),
      sunColor: new Color(sunColor),
      sunDir:   new Vector3(...sunDir).normalize(),
      fogColor: new Color(fogColor),
      fogNear,
      fogFar,
    }),
    [deep, shallow, sunColor, sunDir, fogColor, fogNear, fogFar],
  );

  useFrame(({ gl, scene }, dt) => {
    // World-Y prepass: render scene from above with ortho cam into color RT
    if (frameRef.current % PREPASS_EVERY === 0 && meshRef.current) {
      meshRef.current.visible = false;
      scene.overrideMaterial = worldYMat;
      gl.setRenderTarget(worldYTarget);
      gl.clear(true, true, false);
      gl.render(scene, prepassCam);
      gl.setRenderTarget(null);
      scene.overrideMaterial = null;
      meshRef.current.visible = true;
      material.uniforms.tWorldY.value = worldYTarget.texture;
    }
    frameRef.current++;

    material.uniforms.uTime.value += dt;
    const target  = current >= 0 ? 1 : 0;
    const uReveal = material.uniforms.uReveal;
    uReveal.value += (target - uReveal.value) * Math.min(1, dt * 2.2);
    const k = Math.min(1, dt * 1.8);
    (material.uniforms.uDeep.value     as Color).lerp(targets.deep,     k);
    (material.uniforms.uShallow.value  as Color).lerp(targets.shallow,  k);
    (material.uniforms.uSunColor.value as Color).lerp(targets.sunColor, k);
    (material.uniforms.uSunDir.value   as Vector3).lerp(targets.sunDir, k);
    (material.uniforms.uFogColor.value as Color).lerp(targets.fogColor, k);
    material.uniforms.uFogNear.value +=
      (targets.fogNear - material.uniforms.uFogNear.value) * k;
    material.uniforms.uFogFar.value +=
      (targets.fogFar  - material.uniforms.uFogFar.value)  * k;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} material={material}>
      <planeGeometry args={[size, size, segments, segments]} />
    </mesh>
  );
}
