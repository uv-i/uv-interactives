import Link from 'next/link';
import { Container } from '@/shared/ui/Container';

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center pt-20">
      <Container>
        <p className="text-sm font-semibold uppercase tracking-widest text-gold">Off the map</p>
        <h1 className="mt-3 text-4xl font-bold">This shore doesn’t exist.</h1>
        <p className="mt-3 text-pearl/70">The page drifted out with the tide.</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-gold px-6 py-3 font-semibold text-ink"
        >
          Back to harbour
        </Link>
      </Container>
    </section>
  );
}
