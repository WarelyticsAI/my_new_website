import type { MetadataRoute } from "next"
import { SITE, PROFILE_IMAGE, CONTENT_UPDATED } from "@/lib/content"

/**
 * Sitemap.
 *
 * `lastModified` uses the real content date, not `new Date()`. A build timestamp tells
 * every crawler the page changed on every deploy, which trains them to distrust the
 * signal — and freshness is one of the few levers that genuinely affects both ranking and
 * AI citation rates.
 *
 * The `images` entry is what gets the portrait into Google Images, which is a separate
 * index from web search and a second surface where the photo can appear.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      lastModified: new Date(CONTENT_UPDATED),
      changeFrequency: "monthly",
      priority: 1,
      images: [`${SITE.url}${PROFILE_IMAGE.src}`],
    },
  ]
}
