'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLandmarkStore, type ScreenPin } from '@/scene/landmarkStore';
import { useIslandStore } from '@/scene/islandStore';
import { useReveal } from '@/scene/reveal/revealStore';
import { useCameraStore } from '@/scene/cameraStore';
import { ARCH_STAGE } from '@/scene/archipelago/layout';

const ZOOM_DELAY = 480;

function LandmarkCard({ pin, onNavigate }: { pin: ScreenPin; onNavigate: (id: string, route: string) => void }) {
  const [hovered, setHovered] = useState(false);

  const onEnter = () => {
    setHovered(true);
    useLandmarkStore.getState().setHoveredId(pin.id);
  };
  const onLeave = () => {
    setHovered(false);
    useLandmarkStore.getState().setHoveredId(null);
  };

  const cardStyle: React.CSSProperties = {
    position: 'relative',
    background: 'rgba(8,8,15,0.90)',
    border: `1.5px solid ${hovered ? pin.color : 'rgba(136,85,255,0.28)'}`,
    borderRadius: '14px',
    padding: '10px 16px 10px',
    cursor: 'pointer',
    pointerEvents: 'auto',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    textAlign: 'center',
    minWidth: '148px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease',
    transform: `scale(${hovered ? 1.08 : 1})`,
    boxShadow: hovered
      ? `0 0 22px ${pin.color}60, 0 6px 20px rgba(0,0,0,0.35)`
      : '0 4px 14px rgba(0,0,0,0.28)',
  };

  return (
    <div style={cardStyle} onClick={() => onNavigate(pin.id, pin.route)} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <div style={{ fontSize: '20px', lineHeight: 1, marginBottom: '5px' }}>{pin.icon}</div>

      <div style={{
        color: hovered ? pin.color : '#f0f0ff',
        fontWeight: 700, fontSize: '12px', letterSpacing: '0.09em',
        textTransform: 'uppercase', transition: 'color 0.2s ease',
      }}>
        {pin.label}
      </div>

      <div style={{ color: 'rgba(200,190,255,0.45)', fontSize: '10px', letterSpacing: '0.05em', marginTop: '3px' }}>
        {pin.sub}
      </div>

      <div style={{ maxHeight: hovered ? '140px' : '0px', overflow: 'hidden', transition: 'max-height 0.22s ease' }}>
        <div style={{
          margin: '7px 0 6px', height: '1px',
          background: `linear-gradient(to right, transparent, ${pin.color}55, transparent)`,
        }} />
        {pin.desc && (
          <div style={{ color: 'rgba(220,210,255,0.6)', fontSize: '9px', letterSpacing: '0.04em', marginBottom: '6px', lineHeight: 1.4 }}>
            {pin.desc}
          </div>
        )}
        {pin.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {pin.tags.map((tag) => (
              <span key={tag} style={{
                fontSize: '8px', fontFamily: 'monospace', letterSpacing: '0.06em',
                padding: '2px 6px', borderRadius: '999px',
                border: `1px solid ${pin.color}66`,
                color: pin.color, background: `${pin.color}14`,
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '6px', height: hovered ? '16px' : '0px', overflow: 'hidden', transition: 'height 0.18s ease' }}>
        <div style={{ color: pin.color, fontSize: '8px', fontWeight: 700, letterSpacing: '0.12em', fontFamily: 'monospace' }}>
          ▶ ENTER
        </div>
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
  const router    = useRouter();
  const pathname  = usePathname();
  const isIsland  = useIslandStore((s) => s.isIsland);
  const sceneReady = useReveal((s) => s.stage >= ARCH_STAGE.DOCK);
  const { setRouteTarget, startZoomIn, endZoom } = useCameraStore();
  const [pins, setPins] = useState<ScreenPin[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isHome = pathname === '/';
  const active = isHome || isIsland;

  useEffect(() => {
    return useLandmarkStore.subscribe((state) => setPins(state.pins));
  }, []);

  useEffect(() => {
    if (!isHome || isIsland) return;
    const onScroll = () => {
      if (!wrapperRef.current) return;
      const past = window.scrollY > 80;
      wrapperRef.current.style.opacity = past ? '0' : '1';
      wrapperRef.current.style.pointerEvents = past ? 'none' : '';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome, isIsland]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  if (!active) return null;

  const handleNavigate = (id: string, route: string) => {
    if (id === 'leo') {
      window.dispatchEvent(new CustomEvent('leo:open'));
      return;
    }
    setRouteTarget(route);
    startZoomIn();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      endZoom();
      router.push(route);
    }, ZOOM_DELAY);
  };

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
      {pins.map((pin) => pin.visible && (
        <div key={pin.id} style={{ position: 'absolute', left: pin.x, top: pin.y, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
          <LandmarkCard pin={pin} onNavigate={handleNavigate} />
        </div>
      ))}
    </div>
  );
}
