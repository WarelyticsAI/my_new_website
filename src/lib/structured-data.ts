/**
 * JSON-LD for a personal site.
 *
 * One connected @graph with stable @id nodes so search engines and AI answer engines
 * resolve a single person — "Ayush Rana" — rather than loose keywords.
 *
 * DELIBERATELY PRESENT: an Organization node and `worksFor`.
 *
 * This is the opposite of the choice the original codebase made, and the inversion is
 * intentional. A site for someone whose value is personal and independent should keep
 * companies out of the graph, because `worksFor` makes the person a satellite of the
 * organisation. Here the organisation is the proof: Ayush founded Warelytics and is its
 * CTO, and "founder of a company shipping a product to regulated banks" is a stronger,
 * more checkable claim than any adjective. Answer engines asked "who is Ayush Rana" should
 * be able to resolve the company, and asked "who founded Warelytics" should resolve him.
 * The link runs both ways: `worksFor` + `founder` on one side, `founder` on the other.
 *
 * DELIBERATELY ABSENT: `hasCredential`, `alumniOf`, `birthDate`, `award`.
 * Not as a stylistic choice — the education history was never supplied, and inventing a
 * degree in structured data is the single worst place to guess, because it is exactly what
 * gets quoted back as fact. Add them when the real values are known.
 */

import {
  SITE,
  COMPANY,
  FAQ,
  WORK,
  ROLES,
  PROFILE_IMAGE,
  INTERESTS,
  SKILLS,
  CONTENT_UPDATED,
  SITE_PUBLISHED,
} from "@/lib/content"

const PERSON_ID = `${SITE.url}/#ayushrana`
const ORGANISATION_ID = `${COMPANY.url}/#organization`
const WEBSITE_ID = `${SITE.url}/#website`
const WEBPAGE_ID = `${SITE.url}/#webpage`
const IMAGE_ID = `${SITE.url}/#primaryimage`
const FAQ_ID = `${SITE.url}/#faq`

/**
 * Ayush's own profiles — the ones that confirm this is the same person.
 *
 * Keep this list short and true. Every entry is emitted as `rel="me"` and as `sameAs`, and
 * a dead or wrong link actively weakens entity resolution rather than padding it.
 *
 * TODO(ayush): add GitHub and X here once the usernames are known.
 */
export const SAME_AS = [
  "https://www.linkedin.com/in/ayush-rana-87b158200/",
  "https://warelytics.ai",
]

/**
 * Subjects Ayush genuinely knows about. Ordered deliberately: the governed-AI cluster
 * first, because that is the niche he should be resolvable for, then the general AI and
 * data engineering terms, then the automotive background that explains the rest.
 */
const KNOWS_ABOUT = [
  "Governed Artificial Intelligence",
  "Privacy-Preserving Machine Learning",
  "AI Auditability",
  "Agentic AI",
  "Large Language Models",
  "Retrieval-Augmented Generation",
  "AI Evaluation",
  "Enterprise Architecture",
  "Data Residency",
  "Data Governance",
  "Regulatory Compliance Technology",
  "Digital Personal Data Protection Act",
  "Data Engineering",
  "Change Data Capture",
  "PostgreSQL",
  "Apache Kafka",
  "Cloud Infrastructure",
  "On-Premise Deployment",
  "Software Architecture",
  "Full-Stack Development",
  "Angular",
  "Java",
  "TypeScript",
  "Amazon Web Services",
]

export function buildStructuredData() {
  /**
   * The portrait, as the page's representative image.
   *
   * Three things make it eligible to become the entity image: `representativeOfPage: true`,
   * real pixel dimensions that match the file on disk, and descriptive text. A favicon can
   * never win this slot; a large, described photo can.
   */
  const primaryImage = {
    "@type": "ImageObject",
    "@id": IMAGE_ID,
    url: `${SITE.url}${PROFILE_IMAGE.src}`,
    contentUrl: `${SITE.url}${PROFILE_IMAGE.src}`,
    width: PROFILE_IMAGE.width,
    height: PROFILE_IMAGE.height,
    caption: PROFILE_IMAGE.caption,
    description: PROFILE_IMAGE.caption,
    name: `${SITE.name} — portrait`,
    representativeOfPage: true,
    creditText: SITE.name,
    creator: { "@id": PERSON_ID },
    copyrightNotice: `© ${SITE.name}. All rights reserved.`,
    license: SITE.url,
    acquireLicensePage: SITE.url,
    thumbnailUrl: `${SITE.url}${PROFILE_IMAGE.src}`,
  }

  /**
   * Warelytics as a first-class entity.
   *
   * Two reasons this earns its place. First, it makes "who founded Warelytics" and "who is
   * Ayush Rana" resolve to each other, which is how a knowledge graph builds confidence in
   * a person who is not otherwise famous. Second, the company has an independent web
   * presence at warelytics.ai, so the claim is externally checkable — which is the only
   * kind of claim worth putting in structured data.
   */
  const organisation = {
    "@type": "Organization",
    "@id": ORGANISATION_ID,
    name: COMPANY.name,
    alternateName: [COMPANY.shortName, COMPANY.product],
    url: COMPANY.url,
    description: COMPANY.what,
    foundingDate: COMPANY.since,
    founder: { "@id": PERSON_ID },
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.homeCity,
      addressRegion: SITE.region,
      addressCountry: SITE.countryCode,
    },
    areaServed: { "@type": "Country", name: SITE.location },
    knowsAbout: KNOWS_ABOUT.slice(0, 12),
  }

  const person = {
    "@type": "Person",
    "@id": PERSON_ID,
    name: SITE.name,
    alternateName: ["Ayush", "Ayush Rana Warelytics"],
    givenName: "Ayush",
    familyName: "Rana",
    description: SITE.summary,
    disambiguatingDescription:
      "AI engineer and founder of Warelytics AI Solutions in Bhopal, India. Builds governed, auditable AI analytics for regulated financial institutions. Previously an automotive software engineer at KPIT in Pune.",
    url: SITE.url,
    mainEntityOfPage: { "@id": WEBPAGE_ID },
    image: { "@id": IMAGE_ID },
    /**
     * Accurate on both counts, and both are load-bearing. "AI Engineer" is the term a
     * buyer or recruiter actually searches; "Founder" and "Chief Technology Officer" are
     * the evidence that the first term is earned.
     */
    jobTitle: ["AI Engineer", "Founder", "Chief Technology Officer"],
    worksFor: { "@id": ORGANISATION_ID },
    // `founder` here and on the Organization node: the reciprocal link is what lets a
    // graph treat the two entities as connected rather than coincidentally similar.
    founderOf: { "@id": ORGANISATION_ID },
    nationality: { "@type": "Country", name: SITE.location },
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.homeCity,
      addressRegion: SITE.region,
      addressCountry: SITE.countryCode,
    },
    email: `mailto:${SITE.email}`,
    // Omitted entirely rather than emitted empty — an empty telephone property is worse
    // than no property, because consumers may surface it as a blank contact method.
    ...(SITE.phone ? { telephone: SITE.phone } : {}),
    knowsLanguage: [...SITE.languages],
    knowsAbout: KNOWS_ABOUT,
    interestIn: INTERESTS.map((interest) => interest.title),
    sameAs: SAME_AS,
    homeLocation: {
      "@type": "Place",
      name: `${SITE.homeCity}, ${SITE.region}, India`,
    },
    hasOccupation: {
      "@type": "Occupation",
      name: "AI Engineer",
      occupationLocation: { "@type": "Country", name: SITE.location },
      skills: KNOWS_ABOUT.join(", "),
    },
    subjectOf: { "@id": FAQ_ID },
    skills: SKILLS.flatMap((group) => group.skills),
  }

  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE.url,
    name: SITE.name,
    alternateName: [SITE.domain],
    description: SITE.shortSummary,
    inLanguage: "en",
    publisher: { "@id": PERSON_ID },
    about: { "@id": PERSON_ID },
    copyrightHolder: { "@id": PERSON_ID },
    datePublished: SITE_PUBLISHED,
    dateModified: CONTENT_UPDATED,
  }

  /**
   * WebPage + ProfilePage.
   *
   * Google's ProfilePage spec requires `dateCreated` and `dateModified` and expects
   * `mainEntity` to be the person the page is about. Both dates come from real constants
   * rather than `new Date()`: a build timestamp would claim the content changed every time
   * the site is deployed, a freshness signal that did not happen.
   */
  const webpage = {
    "@type": ["WebPage", "ProfilePage"],
    "@id": WEBPAGE_ID,
    url: SITE.url,
    name: `${SITE.name} — ${SITE.role}`,
    description: SITE.summary,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
    mainEntity: { "@id": PERSON_ID },
    primaryImageOfPage: { "@id": IMAGE_ID },
    image: { "@id": IMAGE_ID },
    inLanguage: "en",
    dateCreated: SITE_PUBLISHED,
    datePublished: SITE_PUBLISHED,
    dateModified: CONTENT_UPDATED,
    significantLink: [
      COMPANY.url,
      ...WORK.map((item) => item.url).filter((url): url is string => Boolean(url)),
    ].filter((url, index, all) => all.indexOf(url) === index),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "h2", "h3"],
    },
  }

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE.url }],
  }

  /**
   * Employment history as OrganizationRole nodes.
   *
   * This is what lets an answer engine state "he was at KPIT from 2023 to 2026" with a
   * date range rather than inferring it from prose. Only the company, title and dates go
   * in — the descriptive bullets stay in the visible and crawlable layers, because
   * structured data is for facts a machine should treat as authoritative.
   */
  const roleNodes = ROLES.map((role, index) => ({
    "@type": "OrganizationRole",
    "@id": `${SITE.url}/#role-${index}`,
    roleName: role.title,
    startDate: role.start,
    ...(role.end === "Present" ? {} : { endDate: role.end }),
    member: { "@id": PERSON_ID },
    ...(role.company === COMPANY.name
      ? { memberOf: { "@id": ORGANISATION_ID } }
      : {
          memberOf: {
            "@type": "Organization",
            name: role.company,
            ...(role.url ? { url: role.url } : {}),
          },
        }),
  }))

  // FAQPage — the answer-engine core. Mirrors the human-readable FAQ so AI Overviews,
  // ChatGPT, Perplexity and Gemini can quote canonical answers.
  const faqPage = {
    "@type": "FAQPage",
    "@id": FAQ_ID,
    url: `${SITE.url}/#faq`,
    name: `Frequently Asked Questions about ${SITE.name}`,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
    dateModified: CONTENT_UPDATED,
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      answerCount: 1,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
        dateCreated: CONTENT_UPDATED,
        author: { "@id": PERSON_ID },
        inLanguage: "en",
      },
      author: { "@id": PERSON_ID },
    })),
  }

  /**
   * Each piece of work as a discrete, citable node linked back to the person.
   *
   * Typed as CreativeWork rather than SoftwareApplication so no `offers` or
   * `aggregateRating` is expected — these are portfolio entries, not priced app listings.
   */
  const workNodes = WORK.map((project) => ({
    "@type": "CreativeWork",
    "@id": `${SITE.url}/#work-${project.id}`,
    name: project.name,
    headline: project.tagline,
    description: project.description,
    ...(project.url ? { url: project.url, sameAs: project.url } : {}),
    keywords: project.stack.join(", "),
    // The real state of the work. Several of these are in pilot or in design, so asserting
    // a publication date would overclaim.
    creativeWorkStatus: project.status,
    dateCreated: project.year,
    inLanguage: "en",
    creator: { "@id": PERSON_ID },
    author: { "@id": PERSON_ID },
    about: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
    // One-line extractable claim. Generative engines lift short, self-contained statements
    // far more readily than a paragraph.
    abstract: `${project.name} — ${project.tagline}. ${project.status}.`,
    genre: project.category,
  }))

  return {
    "@context": "https://schema.org",
    "@graph": [
      primaryImage,
      person,
      organisation,
      website,
      webpage,
      breadcrumb,
      faqPage,
      ...roleNodes,
      ...workNodes,
    ],
  }
}
