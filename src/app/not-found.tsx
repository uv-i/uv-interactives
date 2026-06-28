import Link from 'next/link';
import { Container } from '@/shared/ui/Container';

export default function NotFound() {
  return (
    <section className="frost-panel flex min-h-screen items-center pt-20">
      <Container>
        <div className="max-w-lg">
          {/* Big 404 */}
          <p className="text-[120px] font-black leading-none tracking-tighter text-white/5 select-none sm:text-[160px]">
            404
          </p>
          <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-gold">
            Off the map
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            This shore doesn&apos;t exist.
          </h1>
          <p className="mt-3 text-pearl/65">
            The page drifted out with the tide. Maybe it never existed, or it moved.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/"
              className="inline-flex cursor-pointer items-center rounded-full bg-gold px-6 py-3 font-semibold text-ink transition-transform duration-200 hover:scale-[1.03] active:scale-100"
            >
              Back to harbour
            </Link>
            <Link
              href="/games"
              className="inline-flex cursor-pointer items-center rounded-full border border-white/15 px-6 py-3 font-semibold text-pearl transition-colors hover:border-gold hover:text-gold"
            >
              See our games
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
