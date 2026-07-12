import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypePrettyCode from 'rehype-pretty-code';
import { Container } from '@/shared/ui/Container';
import { JsonLd } from '@/shared/seo/JsonLd';
import { pageMetadata } from '@/lib/seo/metadata';
import { studioConfig } from '@/content/data/config';
import {
  TOPICS, getAllPosts, getPost, getPostsByTopic, getSeriesNav, isTopic, type LearnTopic,
} from '@/features/learn/learn';
import { ShellSidebar } from '@/features/learn/ShellSidebar';
import { PageToc, type TocHeading } from '@/features/learn/PageToc';
import { TeacherToggle } from '@/features/learn/teacher';
import { learnMdxComponents } from '@/features/learn/mdx-components';

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
    remarkPlugins: [remarkGfm] as never[],
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, { theme: 'github-dark-dimmed', keepBackground: false }],
    ] as never[],
  },
};

/** Mirror rehype-slug (github-slugger) closely enough for TOC anchors. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

function extractHeadings(mdx: string): TocHeading[] {
  const out: TocHeading[] = [];
  for (const m of mdx.matchAll(/^## (.+)$/gm)) {
    const text = m[1].replace(/`/g, '').trim();
    out.push({ id: slugify(text), text });
  }
  return out;
}

export default async function LabArticlePage({ params }: { params: Params }) {
  const { topic, slug } = await params;
  if (!isTopic(topic)) notFound();
  const post = getPost(topic as LearnTopic, slug);
  if (!post) notFound();
  const { meta, content } = post;
  const { prev, next } = getSeriesNav(meta);
  const seriesPosts = meta.series
    ? getPostsByTopic(topic as LearnTopic).filter((m) => m.series === meta.series)
    : [];
  const railChapters = seriesPosts.map((m) => ({ part: m.part ?? 0, slug: m.slug, title: m.title }));
  const seriesTitle =
    seriesPosts.find((m) => m.seriesTitle)?.seriesTitle ?? meta.series?.replace(/-/g, ' ') ?? '';
  const headings = extractHeadings(content);

  return (
    <section className="relative min-h-screen pt-20 pb-36 sm:pb-20">
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
      {/* Shell header — sticks under the NavBar so the teacher toggle is always in reach */}
      <div className="shell-header sticky top-20 z-40 border-b border-white/5 bg-[rgba(22,11,50,0.7)] backdrop-blur-xl backdrop-saturate-150">
        <Container className="flex min-h-12 items-center justify-between gap-2 py-1.5">
          <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden whitespace-nowrap text-sm text-pearl/60">
            <Link
              href="/lab"
              className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-gold transition-transform hover:-translate-x-0.5"
            >
              <ArrowLeft size={15} />
              Dev Lab
            </Link>
            <span aria-hidden className="hidden sm:inline">/</span>
            <Link href={`/lab/${topic}`} className="hidden shrink-0 hover:text-gold sm:inline">{TOPICS[topic].label}</Link>
            <span aria-hidden>/</span>
            <span className="truncate text-pearl/80">{meta.title}</span>
          </nav>
          <TeacherToggle />
        </Container>
      </div>

      <Container className="pt-8">

        <div className="grid gap-10 xl:grid-cols-[220px_minmax(0,1fr)_180px] lg:grid-cols-[minmax(0,1fr)_180px]">
          {meta.series && typeof meta.part === 'number' ? (
            <ShellSidebar
              series={meta.series}
              seriesTitle={seriesTitle}
              topic={topic}
              part={meta.part}
              chapters={railChapters}
            />
          ) : (
            <div className="hidden xl:block" />
          )}

          <div className="min-w-0 max-w-[820px]">
            <header className="mb-10">
              {meta.series && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">
                  {seriesTitle}
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
              <MDXRemote source={content} options={mdxOptions} components={learnMdxComponents} />
            </article>

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
          </div>

          <PageToc headings={headings} />
        </div>
      </Container>
    </section>
  );
}
