import Link from 'next/link';
import { Container } from '@/shared/ui/Container';
import { studioConfig } from '@/content/data/config';

export function Footer() {
  const year = new Date().getFullYear();
  const { studio, motto, contactEmail, socials } = studioConfig;

  return (
    <footer className="border-t border-white/5 py-12 text-sm text-pearl/60">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-pearl/90">{studio}</p>
          <p className="mt-1 italic">{motto}</p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center gap-5">
            <li>
              <a className="hover:text-gold" href={`mailto:${contactEmail}`}>
                Email
              </a>
            </li>
            {socials.github ? (
              <li>
                <a className="hover:text-gold" href={socials.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </li>
            ) : null}
            {socials.linkedin ? (
              <li>
                <a className="hover:text-gold" href={socials.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </li>
            ) : null}
            <li>
              <Link className="hover:text-gold" href="/lab">
                Dev Lab
              </Link>
            </li>
          </ul>
        </nav>
      </Container>
      <Container className="mt-8 text-xs text-pearl/40">© {year} {studio}. All rights reserved.</Container>
    </footer>
  );
}
