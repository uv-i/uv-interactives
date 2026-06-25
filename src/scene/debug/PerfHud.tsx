'use client';

import { useEffect, useState } from 'react';
import { usePerfStore } from '@/scene/debug/perfStore';
import { isDebug } from '@/scene/debug/perfStore';

export function PerfHud() {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(isDebug()), []);
  const p = usePerfStore();
  if (!show) return null;

  const fpsColor = p.fps < 30 ? '#ff7a7a' : p.fps < 50 ? '#ffd479' : '#9effa0';
  const row: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 14 };
  return (
    <div
      style={{
        position: 'fixed',
        top: 72,
        right: 10,
        zIndex: 9999,
        font: '11px ui-monospace, SFMono-Regular, Menlo, monospace',
        background: 'rgba(8,6,20,0.72)',
        color: '#cfe',
        padding: '8px 10px',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.12)',
        pointerEvents: 'none',
        lineHeight: 1.6,
        minWidth: 132,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={row}><span>FPS</span><b style={{ color: fpsColor }}>{p.fps}</b></div>
      <div style={row}><span>draw calls</span><b>{p.calls}</b></div>
      <div style={row}><span>triangles</span><b>{p.tris.toLocaleString()}</b></div>
      <div style={row}><span>geometries</span><b>{p.geometries}</b></div>
      <div style={row}><span>textures</span><b>{p.textures}</b></div>
      <div style={row}><span>programs</span><b>{p.programs}</b></div>
    </div>
  );
}
