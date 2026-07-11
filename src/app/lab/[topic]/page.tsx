import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Container } from '@/shared/ui/Container';
import { pageMetadata } from '@/lib/seo/metadata';
import { TOPICS, getPostsByTopic, isTopic, type LearnMeta, type LearnTopic } from '@/features/learn/learn';

export function generateStaticParams() {
  return (Object.keys(TOPICS) as LearnTopic[])
    .filter((t) => getPostsByTopic(t).length > 0)
    .map((topic) => ({ topic }));
}

export const dynamicParams = false;

export async function generateMetadata(
  { params }: { params: Promise<{ topic: string }> },
): Promise<Metadata> {
  const { topic } = await params;
  if (!isTopic(topic)) return {};
  const t = TOPICS[topic];
  return pageMetadata(`${t.label} Tutorials`, t.blurb, `/lab/${topic}`);
}

function PostRow({ m }: { m: LearnMeta }) {
  return (
    <Link
      href={`/lab/${m.topic}/${m.slug}`}
      className="group flex items-baseline justify-between gap-4 rounded-xl border border-transparent px-4 py-3 transition-colors hover:border-gold/40 hover:bg-violet/10"
    >
      <span>
        {typeof m.part === 'number' && (
          <span className="mr-3 text-xs font-semibold uppercase tracking-widest text-gold">
            Ch. {m.part}
          </span>
        )}
        <span className="font-semibold text-pearl group-hover:text-gold">{m.title}</span>
        <span className="ml-3 hidden text-sm text-pearl/55 sm:inline">{m.description}</span>
      </span>
      {m.level && <span className="shrink-0 text-xs text-pearl/50">{m.level}</span>}
    </Link>
  );
}

export default async function LabTopicPage(
  { params }: { params: Promise<{ topic: string }> },
) {
  const { topic } = await params;
  if (!isTopic(topic)) notFound();
  const posts = getPostsByTopic(topic);
  if (posts.length === 0) notFound();

  const series = new Map<string, LearnMeta[]>();
  const standalone: LearnMeta[] = [];
  for (const m of posts) {
    if (m.series) (series.get(m.series) ?? series.set(m.series, []).get(m.series)!).push(m);
    else standalone.push(m);
  }

  return (
    <section className="frost-panel relative min-h-screen pt-24 pb-20 md:pt-32 md:pb-24">
      <Container>
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-pearl/60">
          <Link href="/lab" className="hover:text-gold">Dev Lab</Link>
          <span className="mx-2">/</span>
          <span className="text-pearl">{TOPICS[topic].label}</span>
        </nav>
        <h1 className="text-3xl font-bold sm:text-4xl">{TOPICS[topic].label} tutorials</h1>
        <p className="mt-3 max-w-2xl text-pearl/65">{TOPICS[topic].blurb}</p>

        <div className="mt-12 space-y-12">
          {[...series.entries()].map(([name, chapters]) => (
            <div key={name}>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gold">
                Series — {name.replace(/-/g, ' ')}
              </h2>
              <div className="space-y-1">
                {chapters
                  .slice()
                  .sort((a, b) => (a.part ?? 0) - (b.part ?? 0))
                  .map((m) => <PostRow key={m.slug} m={m} />)}
              </div>
            </div>
          ))}
          {standalone.length > 0 && (
            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gold">
                Standalone
              </h2>
              <div className="space-y-1">
                {standalone.map((m) => <PostRow key={m.slug} m={m} />)}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
