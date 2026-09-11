/**
 * The crawlable layer — everything about Ayush, in plain semantic HTML.
 *
 * The visible page is a single screen, which is deliberate and nearly text-free. Search
 * crawlers and AI answer engines (GPTBot, ClaudeBot, PerplexityBot, Google-Extended,
 * Gemini) read the raw server-rendered HTML and ignore CSS, so this server component
 * renders the full profile as real markup.
 *
 * It is `sr-only` — visually hidden, fully present in the DOM — which means screen-reader
 * users get the complete profile, every crawler indexes the real content, and the
 * single-screen design stays untouched. Never `display: none` this; that would hide it
 * from assistive technology and crawlers alike, which defeats both of its jobs.
 *
 * Voice: first person, because this is Ayush's own site. The FAQ is the one exception — it
 * answers questions *about* him so an answer engine can quote it cleanly.
 */

import { SITE, COMPANY, ROLES, INTERESTS, WORK, SKILLS, FAQ } from "@/lib/content"

/** "2025-09" -> "September 2025". Falls back to the raw string if it isn't a YYYY-MM. */
function formatMonth(value: string): string {
  if (value === "Present") return "Present"
  const match = /^(\d{4})-(\d{2})$/.exec(value)
  if (!match) return value
  const [, year, month] = match
  const name = new Date(Number(year), Number(month) - 1, 1).toLocaleString("en-GB", {
    month: "long",
  })
  return `${name} ${year}`
}

export function SeoContent() {
  return (
    <section aria-label={`About ${SITE.name}`} className="sr-only">
      <article>
        <header>
          <h2>{SITE.name}</h2>
          <p>{SITE.role}</p>
          <p>{SITE.summary}</p>
          <p>
            I&apos;m based in {SITE.homeCity}, {SITE.region}, India, and I speak{" "}
            {SITE.languages.join(" and ")}.
          </p>
        </header>

        <section aria-label="Current work">
          <h3>What I&apos;m doing now</h3>
          <p>
            I&apos;m the {COMPANY.role} of{" "}
            <a href={COMPANY.url} rel="noopener noreferrer">
              {COMPANY.name}
            </a>
            , which I founded in {COMPANY.sinceLabel} in {COMPANY.location}. {COMPANY.what}
          </p>
          <p>
            Our product is {COMPANY.product}, currently in active development. The short version:
            analysts get to ask questions in plain English, the firm&apos;s raw data never leaves
            its own infrastructure, and every answer arrives with a replayable record of how it was
            produced.
          </p>
        </section>

        <section aria-label="Work history">
          <h3>Where I&apos;ve worked</h3>
          <ul>
            {ROLES.map((role) => (
              <li key={`${role.company}-${role.title}`}>
                <h4>
                  {role.title} — {role.company}
                </h4>
                <p>
                  {formatMonth(role.start)} to {formatMonth(role.end)} · {role.location}
                  {role.arrangement ? ` · ${role.arrangement}` : ""}
                </p>
                <p>{role.summary}</p>
                <ul>
                  {role.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
                {role.stack?.length ? <p>Worked with: {role.stack.join(", ")}.</p> : null}
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Interests">
          <h3>What I&apos;m interested in</h3>
          <dl>
            {INTERESTS.map((interest) => (
              <div key={interest.title}>
                <dt>{interest.title}</dt>
                <dd>{interest.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-label="Things I have built">
          <h3>Things I&apos;ve built</h3>
          <ul>
            {WORK.map((item) => (
              <li key={item.id}>
                <h4>
                  {item.name} — {item.tagline} ({item.category}, {item.year})
                </h4>
                <p>Status: {item.status}.</p>
                <p>{item.description}</p>
                <p>Built with: {item.stack.join(", ")}.</p>
                {item.url ? (
                  <p>
                    <a href={item.url} rel="noopener noreferrer">
                      {item.name}
                    </a>
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Skills">
          <h3>What I can do</h3>
          {SKILLS.map((group) => (
            <div key={group.category}>
              <h4>{group.category}</h4>
              <ul>
                {group.skills.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section aria-label={`Frequently asked questions about ${SITE.name}`}>
          <h3>Questions people ask</h3>
          <dl>
            {FAQ.map((item) => (
              <div key={item.question}>
                <dt>{item.question}</dt>
                <dd>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-label={`Contact ${SITE.name}`}>
          <h3>Get in touch</h3>
          <address>
            <p>
              Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
            {/* Rendered only when a number exists, so a blank contact line never ships. */}
            {SITE.phone ? (
              <p>
                Phone or WhatsApp: <a href={`tel:${SITE.phone}`}>{SITE.phoneDisplay}</a>
              </p>
            ) : null}
            <p>
              Company:{" "}
              <a href={COMPANY.url} rel="noopener noreferrer">
                {COMPANY.url.replace("https://", "")}
              </a>
            </p>
            <p>
              Website:{" "}
              <a href={SITE.url} rel="noopener noreferrer">
                {SITE.domain}
              </a>
            </p>
            <p>
              LinkedIn:{" "}
              <a href="https://www.linkedin.com/in/ayush-rana-87b158200/" rel="noopener noreferrer">
                linkedin.com/in/ayush-rana-87b158200
              </a>
            </p>
          </address>
        </section>
      </article>
    </section>
  )
}
