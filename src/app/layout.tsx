import type { Metadata } from 'next';
import { Archivo_Black, Space_Grotesk } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import '@/styles/globals.css';
import { Providers } from '@/app/providers';
import { SceneBackdrop } from '@/scene/SceneBackdrop';
import { NavBar } from '@/shared/layout/NavBar';
import { Footer } from '@/shared/layout/Footer';
import { JsonLd } from '@/shared/seo/JsonLd';
import { PerfHud } from '@/scene/debug/PerfHud';
import { baseMetadata } from '@/lib/seo/metadata';
import { organizationLd, personLd } from '@/lib/seo/jsonld';
import { studioConfig } from '@/content/data/config';

export const metadata: Metadata = baseMetadata;

const archivoBlack = Archivo_Black({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen antialiased">
        <JsonLd data={organizationLd(studioConfig)} />
        <JsonLd data={personLd(studioConfig)} />
        <Providers>
          <SceneBackdrop className="pointer-events-none fixed inset-0 -z-10" />
          <NavBar />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
        <PerfHud />
        <Analytics />
      </body>
    </html>
  );
}
