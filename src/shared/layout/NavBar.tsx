'use client';
import type React from 'react';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { Menu, X, Sun, Moon, Monitor } from 'lucide-react';
import { Container } from '@/shared/ui/Container';
import { studioConfig } from '@/content/data/config';
import { useTheme } from '@/shared/state/themeStore';
import { useMagnetic } from '@/shared/hooks/useMagnetic';
import { useCameraStore } from '@/scene/cameraStore';

const ROUTED_LINKS = [
  { href: '/lab',     label: 'Dev Lab' },
  { href: '/games',   label: 'Games'   },
  { href: '/contact', label: 'Contact' },
];

const ZOOM_DELAY = 480; // ms — matches punch-in animation (~500ms to feel settled)

function MagneticLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  const ref = useMagnetic(0.28);
  const router = useRouter();
  const pathname = usePathname();
  const { setRouteTarget, startZoomIn, endZoom } = useCameraStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href === pathname) return;
    setRouteTarget(href);
    if (pathname === '/') {
      // From home: zoom in first, then navigate
      e.preventDefault();
      startZoomIn();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        endZoom();
        router.push(href);
      }, ZOOM_DELAY);
    }
    // From inner pages: navigate instantly (routeTarget already set above)
  };

  // Cleanup on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <Link
      ref={ref as React.Ref<HTMLAnchorElement>}
      href={href}
      onClick={handleClick}
      className={clsx(
        'relative transition-colors hover:text-gold',
        active ? 'text-gold' : 'text-pearl/80',
      )}
    >
      {label}
      {active && (
        <span className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-gold" />
      )}
    </Link>
  );
}

function ThemeToggle() {
  const theme = useTheme((s) => s.theme);
  const cycle = useTheme((s) => s.cycle);
  const labels = { dusk: 'Switch to day (golden dawn)', dawn: 'Switch to auto (system)', auto: 'Switch to night (purple dusk)' };
  const icons  = { dusk: <Sun className="h-5 w-5" />, dawn: <Monitor className="h-5 w-5" />, auto: <Moon className="h-5 w-5" /> };
  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={labels[theme]}
      className="grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-white/10 text-pearl transition-colors hover:border-gold/60 hover:text-gold"
    >
      {icons[theme]}
    </button>
  );
}

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const clearRouteTarget  = useCameraStore((s) => s.clearRouteTarget);
  const setRouteTarget    = useCameraStore((s) => s.setRouteTarget);

  // Clear camera target when landing on home; set it when already on an inner page
  useEffect(() => {
    if (pathname === '/') clearRouteTarget();
    else setRouteTarget(pathname);
  }, [pathname, clearRouteTarget, setRouteTarget]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="fixed inset-x-0 top-0 z-[60] h-20 border-b border-white/5 bg-[rgba(22,11,50,0.72)]">
      <Container className="flex h-full items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label={`${studioConfig.studio} home`}
          onClick={() => { setOpen(false); clearRouteTarget(); }}
        >
          <Image src="/uv-logo.png" alt="" width={40} height={40} priority className="rounded" />
          <span className="text-lg font-semibold tracking-tight">{studioConfig.studio}</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7 text-sm">
            {ROUTED_LINKS.map((l) => (
              <li key={l.href}>
                <MagneticLink href={l.href} label={l.label} active={isActive(l.href)} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            className="md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </Container>

      {open && (
        <nav
          aria-label="Mobile"
          className="md:hidden border-t border-white/5 bg-[rgba(22,11,50,0.96)]"
        >
          <ul className="flex flex-col px-5 py-3">
            {ROUTED_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => { setOpen(false); setRouteTarget(l.href); }}
                  className={clsx(
                    'block py-3 text-base',
                    isActive(l.href) ? 'text-gold' : 'text-pearl/85',
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
