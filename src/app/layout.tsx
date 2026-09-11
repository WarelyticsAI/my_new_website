import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans, Sora, JetBrains_Mono } from "next/font/google"
import "@/app/globals.css"
import { Toaster } from "@/components/ui/sonner"
import { ErrorBoundary } from "@/components/error-boundary"
import {
  SITE,
  COMPANY,
  PORTFOLIO_THEME_COLOR,
  PROFILE_IMAGE,
  SHARE_IMAGE,
  CONTENT_UPDATED,
} from "@/lib/content"
import { buildStructuredData, SAME_AS } from "@/lib/structured-data"

/**
 * Type stack, chosen to sit with the dark instrument-panel palette: Sora is geometric and
 * slightly technical for display, Plus Jakarta Sans is a neutral workhorse for body, and
 * JetBrains Mono carries the labels and the clock.
 */
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans-var",
  subsets: ["latin"],
  display: "swap",
})

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-var",
  subsets: ["latin"],
  display: "swap",
})

const title = SITE.name
const description = SITE.shortSummary

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: title,
    template: `%s · ${SITE.name}`,
  },
  description,
  /**
   * Keywords carry almost no direct ranking weight now, but they remain a cheap, honest
   * statement of what the page is about for the crawlers and answer engines that still
   * parse them. Every entry here is something the page genuinely supports.
   */
  keywords: [
    "Ayush Rana",
    "Ayush Rana AI engineer",
    "Ayush Rana Warelytics",
    "Warelytics",
    "Warelytics AI Solutions",
    "Daufx",
    "governed AI",
    "auditable AI",
    "privacy-preserving AI",
    "AI data analyst",
    "agentic AI",
    "enterprise architecture",
    "on-premise AI",
    "DPDP compliance",
    "RBI SEBI IRDAI analytics",
    "AI engineer India",
    "Bhopal",
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "technology",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "profile",
    firstName: "Ayush",
    lastName: "Rana",
    gender: "male",
    locale: "en_IN",
    url: SITE.url,
    title,
    description,
    siteName: SITE.name,
    images: [
      {
        url: SHARE_IMAGE.src,
        width: SHARE_IMAGE.width,
        height: SHARE_IMAGE.height,
        alt: `${SITE.name} — ${SITE.role}`,
      },
      {
        url: PROFILE_IMAGE.src,
        width: PROFILE_IMAGE.width,
        height: PROFILE_IMAGE.height,
        alt: PROFILE_IMAGE.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    // TODO(ayush): add `creator` and `site` here once you have an X handle.
    images: [
      { url: "/twitter-image.jpg", alt: `${SITE.name} — ${SITE.role}` },
      { url: PROFILE_IMAGE.src, alt: PROFILE_IMAGE.alt },
    ],
  },
  /**
   * `max-image-preview: large` is the directive that permits a large image in search
   * results and Google Discover — without it, a photo is capped at a thumbnail no matter
   * how good the structured data is. `max-snippet: -1` removes the text-length cap, which
   * matters for AI Overviews and answer engines that quote a passage.
   *
   * These are set at the TOP level, not only under googleBot, so Bing, DuckDuckGo, Yandex
   * and every other engine honouring the robots standard applies them too.
   */
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: SITE.url,
    languages: { "en-IN": SITE.url, "x-default": SITE.url },
  },
  // Publication metadata read by crawlers, social platforms, and answer engines.
  other: {
    "profile:first_name": "Ayush",
    "profile:last_name": "Rana",
    "article:author": SITE.url,
    "article:modified_time": CONTENT_UPDATED,
    // Dublin Core — still read by some indexers and library systems.
    "DC.title": `${SITE.name} — ${SITE.role}`,
    "DC.creator": SITE.name,
    "DC.date.modified": CONTENT_UPDATED,
    "DC.language": "en",
    // Names the company explicitly for consumers that read plain meta over JSON-LD.
    "business:contact_data:website": COMPANY.url,
  },
  applicationName: SITE.name,
  appleWebApp: { title: SITE.name, statusBarStyle: "black-translucent" },
  manifest: "/manifest.json",
  /**
   * Search-engine ownership verification. Set whichever tokens you have as env vars.
   * Google Search Console is the one that also unlocks Knowledge Panel claiming, so it is
   * the highest priority; Bing Webmaster Tools feeds Bing, DuckDuckGo and Copilot.
   */
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    other: {
      ...(process.env.NEXT_PUBLIC_BING_VERIFICATION
        ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION }
        : {}),
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/icon1.png", type: "image/png", sizes: "256x256" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
}

export const viewport: Viewport = {
  themeColor: PORTFOLIO_THEME_COLOR,
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  // Must match the palette in globals.css, or form controls and scrollbars render light
  // against a near-black page.
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const structuredData = buildStructuredData()

  return (
    <html lang="en-IN">
      <head>
        {/* Entity graph — plain script tag so it is present in the initial server-rendered
            HTML for every crawler and AI answer engine, with no client hydration needed. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${jakarta.variable} ${sora.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {/* rel=me identity links — confirm profile ownership for entity/knowledge-graph */}
        {SAME_AS.map((href) => (
          <link key={href} rel="me" href={href} />
        ))}
        <ErrorBoundary>{children}</ErrorBoundary>
        <Toaster position="top-center" richColors closeButton theme="dark" />
      </body>
    </html>
  )
}
