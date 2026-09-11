import Link from "next/link"
import type { Metadata } from "next"
import { SITE } from "@/lib/content"

/**
 * Custom 404.
 *
 * Worth having on a site whose whole purpose is being found: search engines and AI crawlers
 * do land on stale or mistyped URLs, and Next.js's unstyled default reads as a broken site.
 * `noindex` keeps the 404 itself out of the index while still returning a real 404 status.
 */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <main className="grain relative flex min-h-[100dvh] w-full flex-col items-center justify-center bg-paper px-6 text-ink">
      <div className="relative z-10 w-full max-w-md text-center">
        <p className="mono-label mb-4">Error 404</p>

        <h1 className="font-display text-[clamp(3rem,12vw,6rem)] font-extrabold leading-none tracking-[-0.03em] text-accent">
          404
        </h1>

        <p className="mt-5 text-pretty text-base leading-relaxed text-ink-soft">
          This page doesn&apos;t exist — or it did once and doesn&apos;t any more.
        </p>

        <Link
          href="/"
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-accent"
        >
          Back to {SITE.domain}
        </Link>
      </div>
    </main>
  )
}
