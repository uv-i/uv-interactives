import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Providers } from '@/app/providers';
import { NavBar } from '@/shared/layout/NavBar';
import { Footer } from '@/shared/layout/Footer';
import { JsonLd } from '@/shared/seo/JsonLd';
import { baseMetadata } from '@/lib/seo/metadata';
import { organizationLd, personLd } from '@/lib/seo/jsonld';
import { studioConfig } from '@/content/data/config';

export const metadata: Metadata = baseMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <JsonLd data={organizationLd(studioConfig)} />
        <JsonLd data={personLd(studioConfig)} />
        <Providers>
          <NavBar />
          {/* Each page owns its own top offset to clear the fixed 80px nav. */}
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
