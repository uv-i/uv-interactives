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
    return [
      { source: '/i/:slug', destination: '/i/:slug/index.html' },
      { source: '/priya-dinesh', destination: '/i/priya-dinesh/index.html' },   // short share link (fresh for WhatsApp's preview cache)
    ];
  },
  // ponytail: unlisted, not secret — noindex keeps them out of search; anyone with the link can open them.
  async headers() {
    const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
    return [{ source: '/i/:path*', headers: noindex }, { source: '/priya-dinesh', headers: noindex }];
  },
};

export default nextConfig;
