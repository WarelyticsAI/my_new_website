import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */

  // Enable React strict mode for better development warnings
  reactStrictMode: true,

  // Suppress hydration warnings in production
  ...(process.env.NODE_ENV === "production" && {
    compiler: {
      removeConsole: {
        exclude: ["error", "warn"],
      },
    },
  }),

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    // 90 is here for the portrait: it is fine pen-and-ink cross-hatching, which is the
    // worst case for lossy compression — at 68 the linework picks up visible ringing.
    // Next 16 rejects any `quality` prop not present in this allowlist.
    qualities: [68, 75, 90],
    deviceSizes: [480, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  /**
   * No redirects.
   *
   * The upstream project carried permanent 301s from /mypic.png and /mypic.jpg to
   * /profile.jpg, because both old paths had been indexed by Google against *that* domain
   * and the redirect preserved the accumulated image ranking. Those paths were never
   * indexed against this domain, so the redirects transfer nothing here and were removed
   * rather than inherited as cargo cult.
   *
   * If you rename an asset after this site has been indexed, add a 301 here at that point
   * — use `statusCode: 301` rather than `permanent: true`, which Next.js maps to 308.
   */

  // Security headers + asset caching
  async headers() {
    return [
      /**
       * Caching for the portrait and the icon set.
       *
       * THIS USED TO BE `max-age=31536000, immutable` AND IT WAS A BUG. `immutable` is a
       * promise to the browser that the bytes at this URL will never change, so it does not
       * revalidate — not on reload, not for a year. That is only safe when the filename
       * changes whenever the content does (a content hash, which Next does for its own
       * bundles). These filenames are stable and referenced from manifest.json and
       * layout.tsx, so replacing an icon left every previous visitor — including whoever
       * replaced it — pinned to the old bytes with no way to notice.
       *
       * An hour of freshness plus a week of `stale-while-revalidate` keeps the performance
       * benefit for repeat views (served instantly from cache) while guaranteeing an icon
       * swap propagates on its own within the hour.
       *
       * If you ever want `immutable` back, version the filenames instead — profile-2.webp,
       * icon-192-v2.png — and update the references in the same commit.
       */
      {
        source:
          "/:file(profile.webp|favicon.ico|icon0.svg|icon1.png|apple-icon.png|icon-192.png|icon-512.png)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=604800" },
        ],
      },
      /**
       * The AI-facing text files are edited by hand and should never be served stale to a
       * crawler, but re-fetching them constantly is wasteful — an hour is the balance.
       */
      {
        source: "/:file(llms.txt|llms-full.txt)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, must-revalidate" },
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Content-Security-Policy replaces the long-deprecated X-XSS-Protection
          // header (ignored by every current browser). 'unsafe-inline' is required
          // for the JSON-LD script and Next.js's inline bootstrap; 'unsafe-eval' is
          // needed by the dev overlay only, so it is omitted in production.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              process.env.NODE_ENV === "production"
                ? "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com"
                : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob:",
              // Vercel serves Speed Insights / Web Analytics from these hosts when enabled.
              // Listing them now means turning either on later does not silently break under
              // CSP — a failure mode that produces no visible error, only missing data.
              "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ]
  },
}

export default nextConfig
