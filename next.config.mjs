/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow importing GLSL-ish shader chunks as raw strings if needed later.
  // Three.js ships ESM; transpile for safety across versions.
  transpilePackages: ['three'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
