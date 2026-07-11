import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import { Container } from '@/shared/ui/Container';
import { JsonLd } from '@/shared/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import { studioConfig } from '@/content/data/config';
import {
  TOPICS, getAllPosts, getPost, getPostsByTopic, getSeriesNav, isTopic, type LearnTopic,
} from '@/features/learn/learn';
import { ChapterRail } from '@/features/learn/ChapterRail';

export function generateStaticParams() {
  return getAllPosts().map((m) => ({ topic: m.topic, slug: m.slug }));
}

export const dynamicParams = false;

type Params = Promise<{ topic: string; slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { topic, slug } = await params;
  if (!isTopic(topic)) return {};
  const post = getPost(topic, slug);
  if (!post) return {};
  return pageMetadata(post.meta.title, post.meta.description, `/lab/${topic}/${slug}`);
}

const mdxOptions = {
  mdxOptions: {
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, { theme: 'github-dark-dimmed', keepBackground: false }],
    ] as never[],
  },
};

export default async function LabArticlePage({ params }: { params: Params }) {
  const { topic, slug } = await params;
  if (!isTopic(topic)) notFound();
  const post = getPost(topic as LearnTopic, slug);
  if (!post) notFound();
  const { meta, content } = post;
  const { prev, next } = getSeriesNav(meta);
  const railChapters = meta.series
    ? getPostsByTopic(topic as LearnTopic)
        .filter((m) => m.series === meta.series)
        .map((m) => ({ part: m.part ?? 0, slug: m.slug, title: m.title }))
    : [];

  return (
    <section className="frost-panel relative min-h-screen pt-24 pb-20 md:pt-32 md:pb-24">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TechArticle',
          headline: meta.title,
          description: meta.description,
          dateModified: meta.updated,
          author: { '@type': 'Person', name: studioConfig.founderName },
          url: `${studioConfig.siteUrl}/lab/${topic}/${slug}`,
        }}
      />
      <Container className="max-w-[860px]">
        {/* Way back home — always visible, always obvious */}
        <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-pearl/60">
          <Link
            href="/lab"
            className="inline-flex items-center gap-1.5 font-semibold text-gold transition-transform hover:-translate-x-0.5"
          >
            <ArrowLeft size={15} />
            Dev Lab
          </Link>
          <span aria-hidden>/</span>
          <Link href={`/lab/${topic}`} className="hover:text-gold">{TOPICS[topic].label}</Link>
          <span aria-hidden>/</span>
          <span className="truncate text-pearl/80">{meta.title}</span>
        </nav>

        {meta.series && typeof meta.part === 'number' && (
          <ChapterRail
            series={meta.series}
            topic={topic}
            part={meta.part}
            chapters={railChapters}
          />
        )}

        <header className="mb-10">
          {meta.series && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">
              {meta.series.replace(/-/g, ' ')}
              {typeof meta.part === 'number' && ` — Chapter ${meta.part}`}
            </p>
          )}
          <h1 className="text-3xl font-bold sm:text-4xl">{meta.title}</h1>
          <p className="mt-3 text-pearl/65">{meta.description}</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-pearl/55">
            {meta.level && <span className="capitalize">{meta.level}</span>}
            {meta.unityVersion && <span>Unity {meta.unityVersion}</span>}
            <span>Updated {meta.updated}</span>
            {meta.packageRepo && (
              <a
                href={meta.packageRepo}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-gold hover:underline"
              >
                Get the package on GitHub →
              </a>
            )}
          </div>
        </header>

        <article className="prose learn-prose max-w-none">
          <MDXRemote source={content} options={mdxOptions} />
        </article>

        {/* Series navigation — first chapter points back to the package card,
            last chapter suggests the next package. */}
        {meta.series && (
          <nav
            aria-label="Series navigation"
            className="mt-14 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 text-sm sm:flex-row"
          >
            {prev ? (
              <Link href={`/lab/${prev.topic}/${prev.slug}`} className="text-pearl/70 hover:text-gold">
                ← Ch. {prev.part}: {prev.title}
              </Link>
            ) : (
              <Link href="/lab" className="text-pearl/70 hover:text-gold">
                ← This tutorial&apos;s package lives in the Dev Lab
              </Link>
            )}
            {next ? (
              <Link href={`/lab/${next.topic}/${next.slug}`} className="text-right text-pearl/70 hover:text-gold">
                Ch. {next.part}: {next.title} →
              </Link>
            ) : (
              <Link href="/lab" className="text-right font-semibold text-gold hover:underline">
                Series complete — pick your next package →
              </Link>
            )}
          </nav>
        )}
      </Container>
    </section>
  );
}
