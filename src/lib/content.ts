/**
 * Single source of truth for everything this site says.
 *
 * WHAT THIS SITE IS
 * A personal site for Ayush Rana. Unlike a pure "the person stands alone" personal site,
 * the company affiliation here is load-bearing: being the founder and CTO of a real,
 * registered company that ships a real product to regulated customers IS the credential.
 * So Warelytics and Daufx are named plainly, and the JSON-LD carries an Organization node
 * and `worksFor`. Removing them would delete the strongest verifiable fact on the page.
 *
 * ACCURACY RULE (inherited, and worth keeping)
 * Two kinds of statement live here, with different bars:
 *  - First-person facts about Ayush's own life and work. He is the source. State them
 *    plainly, in his voice, without inflation.
 *  - Claims of outside validation (an award, a certification, a customer count, a metric).
 *    These need something checkable, because a reader can and will look. If there isn't
 *    one, leave it out.
 *
 * Anything marked TODO is a genuine gap, not a placeholder to ship. Product claims below
 * are sourced from warelytics.ai, which is Ayush's own published copy.
 *
 * The visible page, the crawlable profile, and the JSON-LD all generate from this file,
 * so anything wrong here is published three times and fed to AI answer engines.
 */

export const SITE = {
  name: "Ayush Rana",
  /**
   * The production domain. Everything canonical derives from `url` — metadataBase, the
   * canonical tag, every JSON-LD @id, the sitemap, the image sitemap entry, and the
   * OpenGraph URLs.
   *
   * MUST match whichever hostname is set as primary in Vercel. If you make www the primary
   * domain there and leave the apex here, the canonical tag will point at a URL that
   * 301-redirects, which is a self-inflicted ranking problem: search engines follow the
   * redirect and then find a canonical pointing back at the redirecting URL.
   *
   * Note this is NOT an environment variable, deliberately. Changing domain means editing
   * this file and committing, not setting something in Vercel.
   */
  domain: "ayush-rana.com",
  url: "https://ayush-rana.com",
  /**
   * What he is. Both halves are accurate and both are doing work: "AI engineer" is the
   * capability a buyer searches for, "founder & CTO" is the proof he has shipped it.
   */
  role: "AI Engineer · Founder & CTO",
  tagline: "I build AI for the places that can't just call an API.",
  /** The one-line version, used where there is room for exactly one sentence. */
  hook: "Governed AI for regulated industries. Every answer comes with a receipt.",
  /**
   * First person, on purpose — third person is how a brand writes about itself, and this
   * is a person's own site.
   *
   * The balance to hold: he is genuinely an engineer (three years of full-stack and cloud
   * work at KPIT in Angular, Java and AWS) and genuinely a founder (Warelytics, a
   * registered company building a real product). Neither needs inflating.
   *
   * DEPLOYMENT STATUS — do not upgrade this without checking.
   * Daufx is in active development. It is NOT in production, NOT live with customers, and
   * has no published deployments. An earlier draft said "in production" and it was wrong.
   * This matters more here than on a typical portfolio: the buyer is a regulated financial
   * institution, "in production" implies live customer data under audit, and procurement
   * will ask for references the moment they read it. Overclaiming costs the deal and the
   * credibility. Say "in development" until there is a real deployment to point at.
   *
   * NOTE: an earlier draft framed the KPIT years as "automotive software" and leaned on a
   * safety-critical narrative. That was inferred from KPIT being an automotive engineering
   * firm and it was wrong at the role level — the actual stack was Angular, AWS and Java,
   * which is enterprise web and cloud application work. Do not reintroduce the embedded or
   * safety-critical framing; it is not what he did.
   */
  summary:
    "I'm Ayush Rana. I build AI systems for places where \"the model said so\" is not an acceptable answer — banks, NBFCs, insurers, anyone whose numbers have to survive an audit. I founded Warelytics, where I'm building Daufx: an AI data analyst that answers questions in plain English, never lets a raw row leave the customer's infrastructure, and seals every analysis with a replayable cryptographic attestation. Before that I spent three years at KPIT building web and cloud applications in Angular, Java and AWS — enterprise software with real users behind it, which is where I learned that shipping a feature is the easy part and standing behind it afterwards is the actual job.",
  /** Short version for meta descriptions and cards, still first person. */
  shortSummary:
    "I build governed AI for regulated industries — private by architecture, auditable by design. Founder & CTO at Warelytics, previously a software engineer at KPIT.",
  email: "ayush.tech8187@gmail.com",
  /**
   * Deliberately empty rather than invented.
   * Every consumer of this field guards on truthiness, so the WhatsApp link, the call
   * link, and the JSON-LD `telephone` property all disappear cleanly while it is blank.
   * TODO(ayush): add in E.164 form ("+919xxxxxxxxx") if you want to be reachable by phone.
   *
   * The `as string` is load-bearing, not noise. This object is `as const`, which would
   * otherwise narrow the type to the literal `""` — and because `""` is falsy, TypeScript
   * then proves every `SITE.phone ? …` branch unreachable and types the contents as
   * `never`, so `SITE.phone.replace(…)` fails to compile. Widening to `string` keeps the
   * guarded branches valid code that starts working the moment a real number is filled in.
   */
  phone: "" as string,
  phoneDisplay: "" as string,
  location: "India",
  homeCity: "Bhopal",
  region: "Madhya Pradesh",
  countryCode: "IN",
  /** TODO(ayush): confirm. Assumed from an Indian professional context — correct if wrong. */
  languages: ["English", "Hindi"],
  /**
   * Deliberately absent: birthDate and age.
   *
   * The original site derived an age from a birth date, which suits a 21-year-old whose
   * youth is part of the story. It does not suit someone selling infrastructure to banks,
   * where age is at best irrelevant and at worst a reason to be discounted. Nothing on the
   * site references it.
   */
} as const

/**
 * Companies. Named because for Ayush they are credentials, not borrowed identity.
 *
 * Employment history is presented as work he did, not as institutions that validate him —
 * but a recognisable engineering firm is worth naming, because it is checkable.
 */
export const COMPANY = {
  name: "Warelytics AI Solutions Pvt. Ltd.",
  shortName: "Warelytics",
  url: "https://warelytics.ai",
  product: "Daufx",
  role: "Founder & Chief Technology Officer",
  since: "2025-09",
  sinceLabel: "September 2025",
  location: "Bhopal, Madhya Pradesh, India",
  /** One sentence a stranger can understand, taken from the product's own positioning. */
  what: "A governed AI data analyst for regulated financial institutions — private by architecture, auditable by design, live on the customer's own data.",
} as const

export interface Role {
  company: string
  title: string
  start: string
  end: string | "Present"
  location: string
  /** "Hybrid" | "On-site" | "Remote" — shown because it is on the public profile anyway. */
  arrangement?: string
  summary: string
  highlights: string[]
  /** Named technologies, so the crawlable layer states them rather than implying them. */
  stack?: string[]
  url?: string
}

/**
 * Work history.
 *
 * The KPIT stack (Angular, AWS, Java) is the important correction here. It rules out the
 * embedded/automotive reading that KPIT's industry invites: this was enterprise web and
 * cloud application development at an automotive engineering firm, not vehicle software.
 *
 * TODO(ayush): LinkedIn shows "+2 skills" on the Software Engineer role beyond Angular and
 * AWS, and "+1 skill" on the Intern role beyond Java and Angular. Add them.
 *
 * TODO(ayush): the highlights below are honest but generic, because no specific projects
 * were supplied. Two or three concrete things you shipped — with a number attached, even a
 * rough one like users served, records processed, or latency improved — would do more for
 * this page than anything else remaining on the list.
 */
export const ROLES: Role[] = [
  {
    company: COMPANY.name,
    title: COMPANY.role,
    start: "2025-09",
    end: "Present",
    location: COMPANY.location,
    summary:
      "I founded Warelytics to solve one problem properly: regulated firms want AI analytics and cannot legally paste their data into a public model. Daufx is the answer — it runs inside the customer's boundary, shows the planning model only masked schema and aggregates, and seals every analysis with an attestation the compliance team can replay.",
    highlights: [
      "Designed the privacy bridge: sensitive data is cleaned, profiled and analysed by local models on customer infrastructure; the cloud planning model never receives a raw row.",
      "Built the attestation layer — every analysis emits a hash-chained record of plan, code, tools and outputs, replayable on demand.",
      "Shipped connectors for PostgreSQL, MySQL, S3-compatible object storage, Azure, Kafka and flat files, with change-data-capture so answers reflect live state rather than stale exports.",
      "Deployment across managed cloud, customer VPC in AWS/Azure India regions, and fully air-gapped on-premise, with SSO/SAML, column-level access control, BYOK encryption and SIEM audit export.",
      "Targeted the compliance surface deliberately: RBI, SEBI and IRDAI reporting, and the DPDP Rules notified in November 2025 with full compliance due May 2027.",
    ],
    url: COMPANY.url,
  },
  {
    company: "KPIT",
    title: "Software Engineer",
    start: "2023-10",
    end: "2026-01",
    location: "Pune, Maharashtra, India",
    arrangement: "Hybrid",
    summary:
      "Full-stack and cloud application engineering — Angular on the front, Java and AWS services behind it. Two and a bit years of building software other people depended on, inside a large engineering organisation with the review cycles and release discipline that implies.",
    highlights: [
      "Built and maintained Angular front-ends for internal and customer-facing applications.",
      "Worked across AWS services for hosting, storage and integration, and on the Java services behind the UI.",
      "Delivered inside an enterprise process: code review, structured releases, and long-lived codebases where the person maintaining your work in a year might not be you.",
    ],
    stack: ["Angular", "AWS", "Java", "TypeScript"],
  },
  {
    company: "KPIT",
    title: "Intern",
    start: "2023-01",
    end: "2023-09",
    location: "Pune, Maharashtra, India",
    arrangement: "On-site",
    summary:
      "Nine months learning to write software that other people have to read. Java and Angular, on real codebases rather than exercises — which is a different experience from either, and the reason the graduate role came next.",
    highlights: [
      "Java and Angular development on production codebases.",
      "First exposure to working inside an established engineering team and its conventions.",
    ],
    stack: ["Java", "Angular"],
  },
]

/**
 * When the CONTENT of this site last genuinely changed (ISO date).
 *
 * Bump this when you edit facts above — not on every deploy. It feeds `dateModified` in
 * the JSON-LD, and answer engines weight freshness heavily. Using a build timestamp would
 * claim freshness that never happened, which is both dishonest and detectable.
 */
export const CONTENT_UPDATED = "2026-09-12"

/** When this site first published. Required by Google's ProfilePage spec. */
export const SITE_PUBLISHED = "2026-09-11"

/**
 * Browser and PWA theme colour (address bar, task switcher, splash).
 * Must match the page background. Update this and `theme_color` +
 * `background_color` in manifest.json together whenever the background changes,
 * or the browser chrome will clash with the page.
 */
export const PORTFOLIO_THEME_COLOR = "#080b0a"

/**
 * The portrait, declared once. Search engines validate the width/height they are given
 * against the real file, so these numbers must match the asset on disk exactly — a
 * mismatch costs entity-image eligibility outright.
 *
 * Current asset: an illustrated pen-and-ink portrait, cropped to its circular vignette with
 * a transparent background, 1000x1000. Generated from the 1179x896 original by
 * `.claude/make-circle.py`, which measures the circle from the pixels rather than guessing:
 * it found diameter 778 horizontally and 780 vertically, centred at (591.5, 418.5). The
 * crop excludes the generator watermark that sat in the bottom-right of the original.
 *
 * Transparent, not black-backed, so it sits on the page background rather than carrying its
 * own near-black square. WebP rather than PNG because the cross-hatching and halftone
 * dotting is high-frequency noise that PNG stores terribly — 307 KB against 1.78 MB for
 * pixel-identical output.
 *
 * NOTE(ayush): an illustration is a legitimate choice and this one suits the palette, but
 * be aware of the tradeoff. Google picks a Knowledge Panel image by matching a real person
 * to photographs from authoritative sources, and an illustration is much less likely to be
 * matched. If entity-image ranking matters to you later, a photograph is the stronger asset;
 * the illustration can stay as the visible hero either way. Using the same image here and
 * on LinkedIn also strengthens the sameAs identity signal, so keep them in step.
 */
export const PROFILE_IMAGE = {
  src: "/profile.webp",
  width: 1000,
  height: 1000,
  /**
   * Descriptive alt text. Google's image guidance is explicit that nearby descriptive text
   * is how it decides what an image shows and which searches it belongs to — a bare name
   * tells it nothing. It says "illustrated portrait" because it is one; describing an
   * illustration as a photograph is the kind of small inaccuracy this file exists to avoid.
   */
  alt: "Illustrated pen-and-ink portrait of Ayush Rana, AI engineer and founder of Warelytics, Bhopal, India",
  caption:
    "Ayush Rana — AI engineer, founder and CTO of Warelytics AI Solutions, Bhopal, India. Illustrated portrait.",
} as const

/**
 * Social share card — what appears when the link is pasted into LinkedIn or WhatsApp.
 *
 * 1200x630 is the summary_large_image slot; anything else gets cropped differently by each
 * platform. Generated by `.claude/make-circle.py`: the circular portrait composited onto the
 * page background colour, positioned left of centre.
 *
 * Deliberately opaque, unlike PROFILE_IMAGE. Each platform composites an alpha image against
 * its own background, and against a light theme this artwork's white fill would vanish.
 *
 * TODO(ayush): the card is portrait-only. Adding your name and role as text beside it would
 * convert better — the layout already leaves room on the right for exactly that.
 */
export const SHARE_IMAGE = {
  src: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
} as const

export interface Interest {
  title: string
  detail: string
}

/**
 * What Ayush actually cares about. This is what stops a portfolio reading like a CV.
 * First person throughout.
 */
export const INTERESTS: Interest[] = [
  {
    title: "AI that can be audited",
    detail:
      "The interesting engineering problem in AI right now is not capability, it is accountability. Anyone can get a model to produce a number. Producing a number you can hand to a regulator, with a record of exactly how it was derived, is a different job.",
  },
  {
    title: "Systems with hard constraints",
    detail:
      "I like requirements that cannot be negotiated with. Data residency, air-gapped networks, audit trails, a security review you either pass or fail — constraints make a lot of the design decisions for you, and I would rather have them than a blank page.",
  },
  {
    title: "Local and small models",
    detail:
      "A lot of what people reach for a frontier API to do can be done by a small model running on the customer's own hardware, for a fraction of the cost and none of the data-exit problem. Working out which is which is most of the value.",
  },
  {
    title: "Data that arrives broken",
    detail:
      "Real enterprise data is inconsistent, badly typed, and contradicts itself across systems. Profiling and grading it honestly before anyone builds on top is unglamorous and it is where most AI projects quietly fail.",
  },
  {
    title: "Building the company as well as the product",
    detail:
      "Deciding what not to build, what an evaluation has to prove before anyone signs, and how to survive a bank's security review are engineering problems too. They just have different failure modes.",
  },
  {
    title: "Explaining hard things simply",
    detail:
      "If a compliance officer with no ML background cannot follow how a number was produced, the architecture is not finished. That constraint has improved my systems more than any framework.",
  },
]

export type WorkCategory = "Product" | "Platform" | "Engineering"

export interface WorkItem {
  id: string
  name: string
  category: WorkCategory
  tagline: string
  /** First person. What he made and why — not a product pitch. */
  description: string
  stack: string[]
  url?: string
  year: string
  featured: boolean
  /** Honest state of the thing. Never imply something is finished when it isn't. */
  status: string
}

/**
 * Things Ayush has built.
 *
 * Sourced from warelytics.ai — his own published product copy — plus his stated role
 * history. Nothing here asserts a customer name, a revenue figure, or a certification,
 * because none of those were verifiable at the time of writing.
 *
 * TODO(ayush): if wellytics.health is yours, it belongs here and it is the strongest entry
 * you have — 20+ hospital deployments and 15,000+ patient records are exactly the kind of
 * checkable, specific numbers this page is short of. It was left out because the
 * connection could not be confirmed.
 */
export const WORK: WorkItem[] = [
  {
    id: "daufx",
    name: "Daufx",
    category: "Product",
    tagline: "An AI data analyst a compliance team will actually approve",
    description:
      "The thing I've spent the most time on. Analysts at regulated firms want to ask questions in plain English; their regulator wants every reported number to be reconstructable. Daufx does both. Sensitive data is profiled and analysed by local models inside the customer's own infrastructure, the cloud planning model only ever sees masked schema and aggregates, execution happens in a sandbox, and the whole run is sealed as a hash-chained attestation that can be replayed on demand. It connects straight to live databases with change-data-capture, so answers reflect reality rather than last month's export.",
    stack: [
      "Local + frontier LLMs",
      "Column-level PII masking",
      "Cryptographic attestation",
      "Change-data-capture",
      "PostgreSQL",
      "Kafka",
      "Sandboxed execution",
      "On-prem / VPC / air-gapped",
    ],
    url: COMPANY.url,
    year: "2026",
    featured: true,
    status: "In active development",
  },
  {
    id: "attestation-layer",
    name: "The attestation layer",
    category: "Platform",
    tagline: "Every answer carries a receipt",
    description:
      'The part I find most interesting. An analysis is not just its output — it is the plan, the generated code, the tools invoked, and the data version it ran against. Daufx hash-chains all of it into a tamper-evident record, so an examiner asking "how did you arrive at this figure" gets a replayable answer instead of somebody reconstructing it from memory and a spreadsheet. Audit preparation stops being archaeology.',
    stack: ["Hash chaining", "Replayable execution", "Audit trails", "Tamper evidence"],
    year: "2026",
    featured: true,
    status: "Shipping inside Daufx",
  },
  {
    id: "privacy-bridge",
    name: "The privacy bridge",
    category: "Platform",
    tagline: "Use a frontier model without letting it see the data",
    description:
      "Regulated firms are stuck: the good models are hosted, and their data is not allowed to leave. The bridge splits the problem — a local model does anything that requires touching real rows, and the hosted planning model receives only masked column names and aggregate shapes. It plans; the local side executes. The customer gets frontier-quality reasoning without a single raw row crossing their boundary, which is the difference between a security review passing and failing.",
    stack: ["Local inference", "Schema masking", "Aggregate-only planning", "Data residency"],
    year: "2026",
    featured: true,
    status: "Shipping inside Daufx",
  },
  {
    id: "sentinel",
    name: "Sentinel",
    category: "Product",
    tagline: "Analytics that doesn't wait to be asked",
    description:
      "Where this goes next. Instead of answering questions, Sentinel watches connected data, notices when something warrants investigation, and then generates and answers its own questions against live retrieval — pulling in outside context where it genuinely changes the analysis. Every question it asks itself is logged and attested exactly like a human-asked one, which is the only way a proactive system stays auditable.",
    stack: ["Agentic monitoring", "Live retrieval", "Attested runs", "Anomaly detection"],
    year: "2026",
    featured: false,
    status: "In design",
  },
  {
    id: "kpit",
    name: "Three years of enterprise software at KPIT",
    category: "Engineering",
    tagline: "Angular, Java and AWS, on codebases that outlive you",
    description:
      "Where I learned the craft. Full-stack and cloud work — Angular front-ends, Java services, AWS underneath — inside a large engineering organisation, which means code review, structured releases, and codebases that will still be running long after you have moved on. Nine months of it as an intern first. It is the least glamorous entry on this page and the reason the rest of it works: writing software that a stranger has to maintain teaches you more about design than any amount of building things alone.",
    stack: ["Angular", "Java", "AWS", "TypeScript"],
    year: "2023–2026",
    featured: false,
    status: "3 years, Pune",
  },
]

export interface SkillGroup {
  category: string
  skills: string[]
}

/**
 * What Ayush can actually do. Capability, not certificates.
 *
 * TODO(ayush): LinkedIn lists two more skills on the Warelytics role beyond "Agentic AI
 * Development" and "Enterprise Architecture", two more on the KPIT engineer role beyond
 * Angular and AWS, and one more on the intern role beyond Java and Angular. Add them.
 */
export const SKILLS: SkillGroup[] = [
  {
    category: "AI engineering",
    skills: [
      "Agentic AI development",
      "Retrieval-augmented generation",
      "Local & small-model deployment",
      "Prompt and context engineering",
      "Evaluation & guardrails",
      "Cost/latency optimisation",
    ],
  },
  {
    category: "Architecture",
    skills: [
      "Enterprise architecture",
      "Privacy-preserving system design",
      "Data residency & tenancy isolation",
      "Auditability & attestation",
      "API design",
    ],
  },
  {
    category: "Data",
    skills: [
      "PostgreSQL",
      "MySQL",
      "Kafka",
      "Change-data-capture",
      "Parquet & object storage",
      "Data profiling & quality grading",
    ],
  },
  {
    category: "Platform & deployment",
    skills: [
      "AWS",
      "Azure",
      "Docker",
      "On-premise & air-gapped delivery",
      "SSO/SAML & RBAC",
      "BYOK encryption",
    ],
  },
  {
    category: "Application engineering",
    skills: [
      "Angular",
      "TypeScript",
      "Java",
      "Full-stack development",
      "Enterprise release process",
    ],
  },
  {
    category: "Regulated delivery",
    skills: [
      "RBI / SEBI / IRDAI reporting context",
      "DPDP Act readiness",
      "Security review & vendor onboarding",
    ],
  },
]

export interface FaqItem {
  question: string
  answer: string
}

/**
 * Rendered in the crawlable layer AND emitted as FAQPage schema — these are the sentences
 * AI answer engines quote verbatim when someone asks about Ayush, so they carry the
 * highest accuracy bar on the site.
 *
 * Third person here, unlike the rest of the site: these answer questions *about* him, and
 * an answer engine needs to lift them cleanly.
 */
export const FAQ: FaqItem[] = [
  {
    question: "Who is Ayush Rana?",
    answer:
      "Ayush Rana is an AI engineer based in Bhopal, Madhya Pradesh, India, and the founder and Chief Technology Officer of Warelytics AI Solutions Pvt. Ltd. He builds governed AI systems for regulated industries — analytics that runs inside a customer's own infrastructure and produces auditable, reconstructable answers. Before founding Warelytics in September 2025 he spent three years at KPIT in Pune as a software engineer, building web and cloud applications in Angular, Java and AWS.",
  },
  {
    question: "What does Ayush Rana build?",
    answer:
      "Governed AI for organisations that cannot send their data to a public model. His main work is Daufx, an AI data analyst for banks, NBFCs and insurers: users ask questions in plain English, sensitive data is processed by local models inside the customer's own boundary, the hosted planning model only ever sees masked schema and aggregates, and every analysis is sealed as a replayable cryptographic attestation. He also designed the privacy bridge and attestation layer underneath it.",
  },
  {
    question: "What is Warelytics?",
    answer:
      "Warelytics AI Solutions Pvt. Ltd. is an AI company founded by Ayush Rana in September 2025, based in Bhopal, India. Its product, Daufx, is a governed AI data analyst for regulated financial institutions, currently in active development — designed to deploy in managed cloud, a customer's own VPC in AWS or Azure India regions, or fully air-gapped on-premise, with column-level PII masking and tamper-evident audit trails.",
  },
  {
    question: "Why does governed or auditable AI matter?",
    answer:
      "Because in regulated industries an answer without provenance is unusable. Indian regulators including the RBI, SEBI and IRDAI expect reported figures to be reconstructable, and the DPDP Rules notified in November 2025 carry penalties of up to ₹250 crore for security-safeguard failures with full compliance due by May 2027. Pasting data into a public AI tool is untracked third-party processing the firm remains liable for. Daufx exists so analysts get AI assistance without the firm taking on that exposure.",
  },
  {
    question: "What is Ayush Rana's background before AI?",
    answer:
      "Enterprise software engineering. He spent three years at KPIT in Pune, Maharashtra — nine months as an intern from January 2023, then as a software engineer from October 2023 to January 2026 — building web and cloud applications with Angular, Java and AWS. He credits that period with learning to write software other engineers have to maintain, and with the emphasis he now places on verification and reproducibility in AI systems.",
  },
  {
    question: "Is Ayush Rana available for consulting or contract work?",
    answer:
      "He is contactable through his site and through LinkedIn. His focus is Warelytics and Daufx, and the work he is most useful for is adjacent to it: privacy-preserving AI architecture, retrieval systems over messy enterprise data, and getting AI deployments through security and compliance review in regulated environments.",
  },
  {
    question: "How can I contact Ayush Rana?",
    answer:
      "By email at ayush.tech8187@gmail.com, or through LinkedIn. Both are linked from his site, along with the Warelytics company site at warelytics.ai.",
  },
]
