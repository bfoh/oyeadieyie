/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    /* Photographs the office uploads live in Vercel Blob, on a per-store
       hostname. Allow-listing it lets them go through the optimiser like
       everything in public/, rather than being served at full size by a
       plain <img>. */
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },

  /**
   * Files under public/ bypass the image optimiser and are served with
   * `Cache-Control: public, max-age=0` by default, so a returning visitor
   * re-validates the hero still and the 21 MB enstoolment film on every
   * visit. These are content-stable: when the media changes, change the
   * filename.
   */
  async headers() {
    return [
      {
        source: '/:path*.(mp4|webm|jpg|jpeg|png|svg|ico|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        /* The press pack is rebuilt in place whenever the photography or the
           biography changes, so it is cached for a day, not a year. */
        source: '/press/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
    ];
  },
};
export default nextConfig;
