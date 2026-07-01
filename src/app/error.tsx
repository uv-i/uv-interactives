'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/shared/ui/Container';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="frost-panel flex min-h-screen items-center pt-20">
      <Container>
        <div className="max-w-lg">
          <p className="select-none text-[120px] font-black leading-none tracking-tighter text-white/5 sm:text-[160px]">
            500
          </p>
          <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-gold">
            Something broke
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            The tide came in unexpectedly.
          </h1>
          <p className="mt-3 text-pearl/65">
            Something went wrong on our end. Try again or head back to shore.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={reset}
              className="inline-flex cursor-pointer items-center rounded-full bg-gold px-6 py-3 font-semibold text-ink transition-transform duration-200 hover:scale-[1.03] active:scale-100"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex cursor-pointer items-center rounded-full border border-white/15 px-6 py-3 font-semibold text-pearl transition-colors hover:border-gold hover:text-gold"
            >
              Back to harbour
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
