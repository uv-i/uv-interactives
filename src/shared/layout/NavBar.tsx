'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Menu, X } from 'lucide-react';
import { Container } from '@/shared/ui/Container';
import { studioConfig } from '@/content/data/config';

const links = [
  { href: '/lab', label: 'Dev Lab' },
  { href: '/games', label: 'Games' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-white/5 bg-violet-night/70 backdrop-blur-md">
      <Container className="flex h-full items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label={`${studioConfig.studio} home`}
          onClick={() => setOpen(false)}
        >
          <Image src="/uv-logo.png" alt="" width={40} height={40} priority className="rounded" />
          <span className="text-lg font-semibold tracking-tight">{studioConfig.studio}</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-7 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={clsx(
                    'relative transition-colors hover:text-gold',
                    isActive(l.href) ? 'text-gold' : 'text-pearl/80',
                  )}
                >
                  {l.label}
                  {isActive(l.href) && (
                    <span className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-gold" />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {/* Mobile panel */}
      {open && (
        <nav
          aria-label="Mobile"
          className="md:hidden border-t border-white/5 bg-violet-night/95 backdrop-blur-md"
        >
          <ul className="flex flex-col px-5 py-3">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
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
