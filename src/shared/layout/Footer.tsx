import Link from 'next/link';
import { Container } from '@/shared/ui/Container';
import { studioConfig } from '@/content/data/config';

/** Slim fixed status-bar footer — mirrors the frosted NavBar. */
export function Footer() {
  const year = new Date().getFullYear();
  const { studio, motto, contactEmail, socials } = studioConfig;

  return (
    <footer className="frost-panel !fixed inset-x-0 bottom-0 z-[60] h-12 border-t border-white/5 text-xs text-pearl/60">
      <Container className="flex h-full items-center justify-between gap-4">
        <p className="truncate">
          <span className="font-semibold text-pearl/90">{studio}</span>
          <span className="mx-2 hidden md:inline">·</span>
          <span className="hidden italic md:inline">{motto}</span>
          <span className="mx-2">·</span>© {year}
        </p>
        <nav aria-label="Footer">
          <ul className="flex items-center gap-4">
            <li>
              <a className="hover:text-gold" href={`mailto:${contactEmail}`}>Email</a>
            </li>
            {socials.github ? (
              <li>
                <a className="hover:text-gold" href={socials.github} target="_blank" rel="noreferrer">GitHub</a>
              </li>
            ) : null}
            {socials.linkedin ? (
              <li>
                <a className="hover:text-gold" href={socials.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              </li>
            ) : null}
            <li>
              <Link className="hover:text-gold" href="/lab">Dev Lab</Link>
            </li>
          </ul>
        </nav>
      </Container>
    </footer>
  );
}
