'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@/shared/state/themeStore';

/**
 * Three-layer depth particle field with cursor-driven parallax.
 * Publishes --px / --py CSS vars on :root for any element to use parallax.
 * ponytail: canvas-only, zero React re-renders per frame.
 */
export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDark    = useTheme((s) => s.theme === 'dusk');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 768) return; // ponytail: no particle loop on mobile — saves rAF + compositing

    const isMobile = window.innerWidth < 768;
    const root     = document.documentElement;

    // layer config: count, size range, opacity range, parallax, attract, drift
    const CFGS = [
      { id: 0, n: isMobile ? 10 : 20, szMn: 0.5, szMx: 1.2, opMn: 0.05, opMx: 0.18, px: 0.014, att: 0.0003, dA: 10 },
      { id: 1, n: isMobile ? 14 : 26, szMn: 0.9, szMx: 2.0, opMn: 0.12, opMx: 0.30, px: 0.040, att: 0.0011, dA: 20 },
      { id: 2, n: isMobile ?  5 :  9, szMn: 1.8, szMx: 3.2, opMn: 0.26, opMx: 0.54, px: 0.088, att: 0.0022, dA: 28 },
    ];
    const MAX_D = [80, 110, 75];

    const m = { x: 0, y: 0, sx: 0, sy: 0, snx: 0, sny: 0, on: false };
    const LM = 0.068, LN = 0.036;

    let W = 0, H = 0, raf = 0;
    type Cfg = typeof CFGS[0];

    class P {
      c: Cfg; bx: number; by: number; x: number; y: number;
      vx = 0; vy = 0; sz: number; op: number;
      ang: number; asp: number; phi: number;
      constructor(c: Cfg) {
        this.c   = c;
        this.bx  = Math.random() * W;
        this.by  = Math.random() * H;
        this.x   = this.bx; this.y = this.by;
        this.sz  = c.szMn + Math.random() * (c.szMx - c.szMn);
        this.op  = c.opMn + Math.random() * (c.opMx - c.opMn);
        this.ang = Math.random() * Math.PI * 2;
        this.asp = (Math.random() - 0.5) * 0.0011 * (1 + c.id * 0.4);
        this.phi = Math.random() * Math.PI * 2;
      }
      update() {
        this.ang += this.asp;
        const dx  = Math.cos(this.ang) * this.c.dA * 0.013;
        const dy  = Math.sin(this.ang * 1.41 + this.phi) * this.c.dA * 0.013;
        const pox = m.snx * W * this.c.px;
        const poy = m.sny * H * this.c.px;
        const tx  = this.bx + dx + pox;
        const ty  = this.by + dy + poy;
        if (m.on) {
          const cdx = m.sx - tx, cdy = m.sy - ty;
          const d2  = cdx * cdx + cdy * cdy;
          if (d2 < 220 * 220) {
            const f = (1 - d2 / (220 * 220)) * this.c.att * 55;
            this.vx += cdx * f; this.vy += cdy * f;
          }
        }
        this.vx += (tx - this.x) * 0.038; this.vy += (ty - this.y) * 0.038;
        this.vx *= 0.87; this.vy *= 0.87;
        this.x  += this.vx; this.y  += this.vy;
      }
      draw() {
        if (this.c.id === 2) {
          const r  = this.sz * 5;
          const gr = ctx!.createRadialGradient(this.x, this.y, 0, this.x, this.y, r);
          gr.addColorStop(0, isDark ? `rgba(190,130,255,${this.op * 0.6})` : `rgba(100,40,200,${this.op * 0.4})`);
          gr.addColorStop(1, 'rgba(0,0,0,0)');
          ctx!.beginPath(); ctx!.arc(this.x, this.y, r, 0, Math.PI * 2);
          ctx!.fillStyle = gr; ctx!.fill();
        }
        const clrs = isDark
          ? ['rgba(110,65,210,', 'rgba(148,95,255,', 'rgba(200,145,255,']
          : ['rgba(55,0,140,',   'rgba(70,0,170,',   'rgba(95,30,195,'];
        ctx!.beginPath(); ctx!.arc(this.x, this.y, this.sz, 0, Math.PI * 2);
        ctx!.fillStyle = clrs[this.c.id] + this.op + ')'; ctx!.fill();
      }
    }

    let particles: P[] = [], layers: P[][] = [[], [], []];

    const init = () => {
      particles = CFGS.flatMap((c) => Array.from({ length: c.n }, () => new P(c)));
      layers    = [0, 1, 2].map((id) => particles.filter((p) => p.c.id === id));
    };

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          if (Math.abs(a.c.id - b.c.id) > 1) continue;
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          const md = MAX_D[Math.max(a.c.id, b.c.id)];
          if (d2 > md * md) continue;
          const t     = 1 - Math.sqrt(d2) / md;
          const alpha = t * t * (a.op + b.op) * 0.5 * (isDark ? 0.38 : 0.22);
          ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y);
          ctx!.strokeStyle = isDark ? `rgba(145,85,255,${alpha})` : `rgba(75,0,175,${alpha})`;
          ctx!.lineWidth   = t * 0.65; ctx!.stroke();
        }
      }
    };

    const tick = () => {
      m.sx  += (m.x - m.sx) * LM; m.sy += (m.y - m.sy) * LM;
      const nx = (m.x / W - 0.5) * 2, ny = (m.y / H - 0.5) * 2;
      m.snx += (nx - m.snx) * LN; m.sny += (ny - m.sny) * LN;
      root.style.setProperty('--px', m.snx.toFixed(4));
      root.style.setProperty('--py', m.sny.toFixed(4));
      ctx!.clearRect(0, 0, W, H);
      particles.forEach((p) => p.update());
      drawConnections();
      layers.forEach((l) => l.forEach((p) => p.draw()));
      raf = requestAnimationFrame(tick);
    };

    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
      init();
    };

    const onMove  = (e: MouseEvent) => { m.x = e.clientX; m.y = e.clientY; m.on = true; };
    const onLeave = () => { m.on = false; };

    resize(); tick();
    window.addEventListener('mousemove',    onMove,   { passive: true });
    window.addEventListener('resize',       resize,   { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove',    onMove);
      window.removeEventListener('resize',       resize);
      document.removeEventListener('mouseleave', onLeave);
      root.style.removeProperty('--px');
      root.style.removeProperty('--py');
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 1, mixBlendMode: isDark ? 'screen' : 'multiply' }}
    />
  );
}
