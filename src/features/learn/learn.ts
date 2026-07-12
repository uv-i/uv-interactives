import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

/* ── Learn content engine ────────────────────────────────────────────────
   Layout: src/content/learn/<topic>/<series>/<slug>.mdx  (preferred)
           src/content/learn/<topic>/<slug>.mdx           (flat, still supported)
   Slugs are filename-based — moving a file between layouts never changes URLs.

   Module boundaries (keep them):
   - CONTENT SOURCE (loadTopic/readPost): the only code that touches fs.
   - DOMAIN (getPostsByTopic/getSeriesList/getSeriesNav): pure functions over
     loaded data. Swapping fs for a CMS later = replace loadTopic only (DIP).
   Server-only; pages consume via the exported functions, never fs directly.   */

export const TOPICS = {
  unity:  { label: 'Unity',  blurb: 'Engine workflows, scenes, terrain, gameplay systems.' },
  csharp: { label: 'C#',     blurb: 'Language fundamentals to patterns — taught through games.' },
  uefn:   { label: 'UEFN',   blurb: 'Unreal Editor for Fortnite — islands and devices.' },
  verse:  { label: 'Verse',  blurb: 'Fortnite’s Verse language, from zero.' },
  // Future product line: maths, science, english, java, typescript, system-design, dsa.
} as const;

export type LearnTopic = keyof typeof TOPICS;

export interface LearnMeta {
  topic: LearnTopic;
  slug: string;
  title: string;
  description: string;
  /** Tutorial series id — chapters share it. */
  series?: string;
  /** Human display name for the series (set once, on chapter 0). */
  seriesTitle?: string;
  /** Chapter number within the series (0 = prerequisites/setup). */
  part?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  unityVersion?: string;
  /** GitHub repo of the paired teaching package. */
  packageRepo?: string;
  updated: string; // ISO date
  draft?: boolean;
}

export interface LearnPost {
  meta: LearnMeta;
  content: string; // raw MDX body
}

const ROOT = path.join(process.cwd(), 'src', 'content', 'learn');
const IS_PROD = process.env.NODE_ENV === 'production';

export function isTopic(t: string): t is LearnTopic {
  return t in TOPICS;
}

/* ── Content source ─────────────────────────────────────────────────── */

function readPost(topic: LearnTopic, relFile: string): LearnPost {
  const raw = fs.readFileSync(path.join(ROOT, topic, relFile), 'utf8');
  const { data, content } = matter(raw);
  const slug = path.basename(relFile).replace(/\.mdx?$/, '');
  return {
    meta: {
      topic,
      slug,
      title: String(data.title ?? slug),
      description: String(data.description ?? ''),
      series: data.series ? String(data.series) : undefined,
      seriesTitle: data.seriesTitle ? String(data.seriesTitle) : undefined,
      part: typeof data.part === 'number' ? data.part : undefined,
      level: data.level,
      unityVersion: data.unityVersion ? String(data.unityVersion) : undefined,
      packageRepo: data.packageRepo ? String(data.packageRepo) : undefined,
      updated: String(data.updated ?? new Date().toISOString().slice(0, 10)),
      draft: data.draft === true,
    },
    content,
  };
}

/** Parse cache — a static build touches every chapter dozens of times
 *  (generateStaticParams, per-page series nav, sitemap, home, dev lab).
 *  Prod-only: dev must re-read so MDX edits show without a restart. */
const topicCache = new Map<LearnTopic, LearnPost[]>();

function loadTopic(topic: LearnTopic): LearnPost[] {
  if (IS_PROD && topicCache.has(topic)) return topicCache.get(topic)!;

  const dir = path.join(ROOT, topic);
  const posts: LearnPost[] = [];
  if (fs.existsSync(dir)) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
        posts.push(readPost(topic, entry.name));
      } else if (entry.isDirectory()) {
        for (const f of fs.readdirSync(path.join(dir, entry.name))) {
          if (/\.mdx?$/.test(f)) posts.push(readPost(topic, path.join(entry.name, f)));
        }
      }
    }
  }
  if (IS_PROD) topicCache.set(topic, posts);
  return posts;
}

/* ── Domain queries (pure over loaded data) ─────────────────────────── */

/** Drafts are dev-only; production never serves them. */
function visible(m: LearnMeta): boolean {
  return !m.draft || !IS_PROD;
}

export function getPostsByTopic(topic: LearnTopic): LearnMeta[] {
  return loadTopic(topic)
    .map((p) => p.meta)
    .filter(visible)
    .sort((a, b) =>
      a.series && a.series === b.series
        ? (a.part ?? 0) - (b.part ?? 0)
        : a.updated < b.updated ? 1 : -1,
    );
}

export function getAllPosts(): LearnMeta[] {
  return (Object.keys(TOPICS) as LearnTopic[]).flatMap(getPostsByTopic);
}

export function getPost(topic: LearnTopic, slug: string): LearnPost | null {
  const post = loadTopic(topic).find((p) => p.meta.slug === slug);
  if (!post || !visible(post.meta)) return null;
  return post;
}

export interface SeriesInfo {
  series: string;
  title: string;
  topic: LearnTopic;
  chapters: number;
  firstSlug: string;
  packageRepo?: string;
  level?: string;
  description: string;
  chapterRefs: { part: number; slug: string; title: string }[];
}

/** All tutorial series, one entry each (chapter 0 provides title/description). */
export function getSeriesList(): SeriesInfo[] {
  const map = new Map<string, LearnMeta[]>();
  for (const m of getAllPosts()) {
    if (!m.series) continue;
    const list = map.get(m.series) ?? [];
    list.push(m);
    map.set(m.series, list);
  }
  return [...map.entries()].map(([series, list]) => {
    const sorted = [...list].sort((a, b) => (a.part ?? 0) - (b.part ?? 0));
    const first = sorted[0];
    return {
      series,
      title: first.seriesTitle ?? series.replace(/-/g, ' '),
      topic: first.topic,
      chapters: sorted.length,
      firstSlug: first.slug,
      packageRepo: first.packageRepo,
      level: first.level,
      description: first.description,
      chapterRefs: sorted.map((m) => ({ part: m.part ?? 0, slug: m.slug, title: m.title })),
    };
  });
}

/** Prev/next chapter within the same series (by part order). */
export function getSeriesNav(meta: LearnMeta): { prev: LearnMeta | null; next: LearnMeta | null } {
  if (!meta.series) return { prev: null, next: null };
  const chapters = getPostsByTopic(meta.topic)
    .filter((m) => m.series === meta.series)
    .sort((a, b) => (a.part ?? 0) - (b.part ?? 0));
  const i = chapters.findIndex((m) => m.slug === meta.slug);
  return {
    prev: i > 0 ? chapters[i - 1] : null,
    next: i >= 0 && i < chapters.length - 1 ? chapters[i + 1] : null,
  };
}
