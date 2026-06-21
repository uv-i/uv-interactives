/**
 * Renders a JSON-LD object as a script tag. Server-component friendly.
 * Pass any plain object from lib/seo/jsonld.ts.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe; no user-controlled HTML.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
