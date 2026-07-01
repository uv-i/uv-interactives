'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLandmarkStore, type ScreenPin } from '@/scene/landmarkStore';
import { useIslandStore } from '@/scene/islandStore';
import { useTheme } from '@/shared/state/themeStore';
import { useReveal } from '@/scene/reveal/revealStore';
import { useCameraStore } from '@/scene/cameraStore';
import { ARCH_STAGE } from '@/scene/archipelago/layout';

const ZOOM_DELAY = 480;
const CARD_W = 148; // intrinsic card width

// ponytail: zoom (not transform:scale) so DOM box shrinks too → correct translate + tighter gaps
function useViewport() {
  const [vw, setVw] = useState(1920);
  useEffect(() => {
    setVw(window.innerWidth);
    const h = () => setVw(window.innerWidth);
    window.addEventListener('resize', h, { passive: true });
    return () => window.removeEventListener('resize', h);
  }, []);
  const scale   = Math.min(1, Math.max(0.55, vw / 900));
  const halfCard = (CARD_W * scale) / 2 + 10; // visual half-width + padding
  return { vw, scale, halfCard };
}

function LandmarkCard({ pin, onNavigate, scale }: {
  pin: ScreenPin;
  onNavigate: (id: string, route: string) => void;
  scale: number;
}) {
  const [hovered, setHovered] = useState(false);
  const isDawn = useTheme((s) => s.resolved === 'dawn');

  const onEnter = () => { setHovered(true);  useLandmarkStore.getState().setHoveredId(pin.id); };
  const onLeave = () => { setHovered(false); useLandmarkStore.getState().setHoveredId(null); };

  const bg         = isDawn ? 'rgba(242, 235, 218, 0.50)' : 'rgba(8,8,15,0.50)';
  const borderIdle = isDawn ? 'rgba(175,135,55,0.35)'     : 'rgba(136,85,255,0.28)';
  const subColor   = isDawn ? 'rgba(80,65,40,0.55)'       : 'rgba(200,190,255,0.45)';
  const labelColor = isDawn ? (hovered ? pin.color : '#29243f') : (hovered ? pin.color : '#f0f0ff');
  const descColor  = isDawn ? 'rgba(60,50,30,0.7)'        : 'rgba(220,210,255,0.6)';

  return (
    <div
      style={{
        position: 'relative',
        background: bg,
        border: `1.5px solid ${hovered ? pin.color : borderIdle}`,
        borderRadius: '14px',
        padding: '10px 16px 10px',
        cursor: 'pointer',
        pointerEvents: 'auto',
        backdropFilter: 'blur(16px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
        textAlign: 'center',
        minWidth: `${CARD_W}px`,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease',
        // zoom shrinks DOM box (fixes translate + layout); transform handles hover pop only
        zoom: scale,
        transform: `scale(${hovered ? 1.08 : 1})`,
        transformOrigin: 'top center',
        boxShadow: hovered
          ? `0 0 22px ${pin.color}60, 0 6px 20px rgba(0,0,0,0.35)`
          : isDawn ? '0 4px 14px rgba(140,105,40,0.18)' : '0 4px 14px rgba(0,0,0,0.28)',
      }}
      onClick={() => onNavigate(pin.id, pin.route)}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div style={{ fontSize: '20px', lineHeight: 1, marginBottom: '5px' }}>{pin.icon}</div>

      <div style={{ color: labelColor, fontWeight: 700, fontSize: '12px', letterSpacing: '0.09em', textTransform: 'uppercase', transition: 'color 0.2s ease' }}>
        {pin.label}
      </div>

      <div style={{ color: subColor, fontSize: '10px', letterSpacing: '0.05em', marginTop: '3px' }}>
        {pin.sub}
      </div>

      <div style={{ maxHeight: hovered ? '140px' : '0px', overflow: 'hidden', transition: 'max-height 0.22s ease' }}>
        <div style={{ margin: '7px 0 6px', height: '1px', background: `linear-gradient(to right, transparent, ${pin.color}55, transparent)` }} />
        {pin.desc && (
          <div style={{ color: descColor, fontSize: '9px', letterSpacing: '0.04em', marginBottom: '6px', lineHeight: 1.4 }}>{pin.desc}</div>
        )}
        {pin.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {pin.tags.map((tag) => (
              <span key={tag} style={{
                fontSize: '8px', fontFamily: 'monospace', letterSpacing: '0.06em',
                padding: '2px 6px', borderRadius: '999px',
                border: `1px solid ${pin.color}66`, color: pin.color, background: `${pin.color}14`,
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '6px', height: hovered ? '16px' : '0px', overflow: 'hidden', transition: 'height 0.18s ease' }}>
        <div style={{ color: pin.color, fontSize: '8px', fontWeight: 700, letterSpacing: '0.12em', fontFamily: 'monospace' }}>▶ ENTER</div>
      </div>

      <div style={{
        position: 'absolute', bottom: '-18px', left: '50%', transform: 'translateX(-50%)',
        width: '2px', height: '18px',
        background: `linear-gradient(to bottom, ${pin.color}99, transparent)`,
        borderRadius: '1px',
      }} />
    </div>
  );
}

export function LandmarkOverlay() {
  const router     = useRouter();
  const pathname   = usePathname();
  const isIsland   = useIslandStore((s) => s.isIsland);
  const sceneReady = useReveal((s) => s.stage >= ARCH_STAGE.PLACARDS);
  const { setRouteTarget, startZoomIn, endZoom } = useCameraStore();
  const [pins, setPins]   = useState<ScreenPin[]>([]);
  const wrapperRef        = useRef<HTMLDivElement>(null);
  const timerRef          = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { vw, scale, halfCard } = useViewport();

  const isHome = pathname === '/';
  const active = isHome || isIsland;

  useEffect(() => useLandmarkStore.subscribe((s) => setPins(s.pins)), []);

  useEffect(() => {
    if (!isHome || isIsland) return;
    const onScroll = () => {
      if (!wrapperRef.current) return;
      wrapperRef.current.style.opacity    = window.scrollY > 80 ? '0' : '1';
      wrapperRef.current.style.pointerEvents = window.scrollY > 80 ? 'none' : '';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome, isIsland]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  if (!active) return null;
  if (vw < 768) return null;

  const handleNavigate = (id: string, route: string) => {
    if (id === 'leo') { window.dispatchEvent(new CustomEvent('leo:open')); return; }
    setRouteTarget(route);
    startZoomIn();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { endZoom(); router.push(route); }, ZOOM_DELAY);
  };

  // Clamp to keep cards within viewport, then push overlapping pairs apart
  const visible = pins.filter((p) => p.visible);
  const placed  = visible
    .map((p) => ({ ...p, cx: Math.max(halfCard, Math.min(p.x, vw - halfCard)) }))
    .sort((a, b) => a.cx - b.cx);

  // Single-pass nudge: push adjacent cards apart if they overlap
  const minGap = CARD_W * scale + 4;
  for (let i = 1; i < placed.length; i++) {
    const overlap = minGap - (placed[i].cx - placed[i - 1].cx);
    if (overlap > 0) {
      placed[i - 1].cx = Math.max(halfCard, placed[i - 1].cx - overlap / 2);
      placed[i].cx     = Math.min(vw - halfCard, placed[i].cx + overlap / 2);
    }
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'fixed', inset: 0,
        zIndex: isIsland ? 20 : 50,
        pointerEvents: 'none',
        opacity: sceneReady ? 1 : 0,
        transition: 'opacity 0.6s ease',
      }}
    >
      {placed.map((pin) => (
        <div
          key={pin.id}
          style={{
            position: 'absolute',
            left: pin.cx,
            top: pin.y,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
          }}
        >
          <LandmarkCard pin={pin} onNavigate={handleNavigate} scale={scale} />
        </div>
      ))}
    </div>
  );
}
