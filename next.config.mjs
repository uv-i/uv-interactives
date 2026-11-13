/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow importing GLSL-ish shader chunks as raw strings if needed later.
  // Three.js ships ESM; transpile for safety across versions.
  transpilePackages: ['three'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Private invitations: static sites in public/i/<slug>/ (built by gamepipe). Next doesn't serve a folder's
  // index.html, so map the clean URL to it; the page carries <base href> so its relative assets resolve.
  async rewrites() {
    return [{ source: '/i/:slug', destination: '/i/:slug/index.html' }];
  },
  // ponytail: unlisted, not secret — noindex keeps them out of search; anyone with the link can open them.
  async headers() {
    return [{ source: '/i/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
};

export default nextConfig;
