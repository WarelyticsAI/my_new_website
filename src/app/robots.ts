import type { MetadataRoute } from "next"
import { PROFILE_IMAGE, SITE } from "@/lib/content"

// Explicitly welcome AI answer engines and generative crawlers (GEO/AEO).
// Being named-and-allowed signals that this content is safe to index and cite.
const AI_CRAWLERS = [
  "GPTBot", // OpenAI training / indexing
  "OAI-SearchBot", // ChatGPT search
  "ChatGPT-User", // ChatGPT live browsing
  "ClaudeBot", // Anthropic Claude
  "anthropic-ai",
  "Claude-Web",
  "PerplexityBot", // Perplexity indexing
  "Perplexity-User", // Perplexity live browsing
  "Google-Extended", // Gemini / Vertex training
  "GoogleOther",
  "Applebot", // Apple / Siri
  "Applebot-Extended",
  "Amazonbot",
  "Bytespider",
  "CCBot", // Common Crawl (feeds many LLMs)
  "cohere-ai",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "DuckAssistBot",
  "YouBot",
  "Diffbot", // feeds several knowledge-graph products
  "Timpibot",
  "Omgilibot",
  "MistralAI-User",
  "Kangaroo Bot",
  "AI2Bot",
  "Ai2Bot-Dolma",
  "SemrushBot-OCOB", // AI-visibility tooling
  "Firecrawl",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Explicitly allowing the portrait and the AI map alongside "/" — nothing here is
        // disallowed, and being explicit documents the intent for anyone auditing later.
        //
        // The portrait path comes from PROFILE_IMAGE rather than being written out. It was
        // hardcoded as "/profile.jpg" and silently went stale when the asset became
        // profile.webp, leaving robots.txt allowing a URL that 404s. Deriving it means the
        // two cannot drift again.
        allow: ["/", PROFILE_IMAGE.src, "/llms.txt"],
      },
      {
        userAgent: AI_CRAWLERS,
        allow: "/",
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
