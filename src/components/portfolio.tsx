"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { FaLinkedinIn, FaWhatsapp } from "react-icons/fa6"
import { FiGlobe, FiMail } from "react-icons/fi"
import type { IconType } from "react-icons"
import { COMPANY, PROFILE_IMAGE, SITE } from "@/lib/content"
import { Preloader } from "@/components/preloader"
import { StatusBar } from "@/components/status-bar"

gsap.registerPlugin(useGSAP)

/**
 * Cycled in the hero after "I'm". First and last entries must match — the GSAP loop steps
 * through the list then resets to the top, and a mismatch shows as a visible jump.
 */
const ROTATORS = [
  "an AI engineer",
  "a founder",
  "a systems person",
  "usefully paranoid",
  "an AI engineer",
]
const DOMAINS = ["Governed AI", "Agentic systems", "Data platforms", "Full-stack"]
const MARQUEE = ["Governed AI", "Attested", "On-prem", "Agentic", "Auditable", "Regulated"]

interface Social {
  label: string
  /** Shown next to the icon. An icon alone cannot say which of two links it is. */
  short: string
  href: string
  Icon: IconType
  /**
   * Filled rather than outlined. Exactly one entry should set this: it is the primary
   * action, and a row where everything is emphasised is a row where nothing is.
   */
  primary?: boolean
}

/**
 * Only links that exist, each with a visible text label.
 *
 * These were icon-only in the first pass, which failed for a concrete reason: a LinkedIn
 * mark and a company-site mark sitting next to each other are two small monochrome glyphs,
 * and nothing tells a visitor which is which until they hover — or at all, on touch, where
 * there is no hover. Labels cost one line of layout and remove the guess.
 *
 * The WhatsApp entry appears only once SITE.phone is filled in.
 *
 * TODO(ayush): add GitHub and X here once the usernames are known.
 */
const SOCIALS: Social[] = [
  {
    label: "Ayush Rana on LinkedIn",
    short: "LinkedIn",
    href: "https://www.linkedin.com/in/ayush-rana-87b158200/",
    Icon: FaLinkedinIn,
    primary: true,
  },
  {
    label: `${COMPANY.shortName} — ${COMPANY.product}`,
    short: "warelytics.ai",
    href: COMPANY.url,
    Icon: FiGlobe,
  },
  { label: `Email ${SITE.name}`, short: "Email", href: `mailto:${SITE.email}`, Icon: FiMail },
  ...(SITE.phone
    ? [
        {
          label: "WhatsApp",
          short: "WhatsApp",
          href: `https://wa.me/${SITE.phone.replace("+", "")}`,
          Icon: FaWhatsapp,
        },
      ]
    : []),
]

function SplitWord({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split("").map((c, i) => (
        <span key={i} className="char-mask">
          <span className="char">{c}</span>
        </span>
      ))}
    </span>
  )
}

export function Portfolio() {
  const container = useRef<HTMLElement>(null)
  const rotatorRef = useRef<HTMLSpanElement>(null)
  const portraitRef = useRef<HTMLDivElement>(null)
  const [revealed, setRevealed] = useState(false)

  // Pre-reveal hidden states
  useGSAP(
    () => {
      gsap.set(".char", { yPercent: 120 })
      gsap.set(".reveal-item", { opacity: 0, y: 24 })
      gsap.set(".portrait-img", { clipPath: "inset(100% 0% 0% 0%)", scale: 1.2 })
    },
    { scope: container },
  )

  // Entrance choreography
  useGSAP(
    () => {
      if (!revealed) return
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

      if (reduce) {
        // Real final states, not shortened durations — the elements start hidden, so
        // skipping the timeline without this would leave the page blank.
        gsap.set(".char", { yPercent: 0 })
        gsap.set(".reveal-item", { opacity: 1, y: 0 })
        gsap.set(".portrait-img", { clipPath: "inset(0%)", scale: 1 })
      } else {
        const tl = gsap.timeline()
        tl.to(".portrait-img", {
          clipPath: "inset(0%)",
          scale: 1,
          duration: 1.1,
          ease: "expo.out",
        })
          .to(
            ".char",
            { yPercent: 0, duration: 0.9, ease: "power4.out", stagger: { each: 0.04 } },
            "-=0.9",
          )
          .to(
            ".reveal-item",
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.07 },
            "-=0.6",
          )

        // Rotating descriptor
        const rotator = rotatorRef.current
        if (rotator) {
          const step = 1.2
          const cycle = gsap.timeline({ repeat: -1, delay: 1.2 })
          for (let i = 1; i <= ROTATORS.length; i++) {
            cycle.to(rotator, {
              y: `-${i * step}em`,
              duration: 0.55,
              ease: "power3.inOut",
              delay: 1.4,
            })
          }
          cycle.set(rotator, { y: 0 })
        }

        gsap.to(".marquee-track", { xPercent: -50, duration: 26, ease: "none", repeat: -1 })
      }
    },
    { dependencies: [revealed], scope: container },
  )

  // Portrait cursor tilt + magnetic buttons (desktop, fine pointer)
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!window.matchMedia("(pointer: fine)").matches) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const cleaners: Array<() => void> = []

    document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" })
      const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" })
      const move = (e: MouseEvent) => {
        const r = el.getBoundingClientRect()
        xTo((e.clientX - (r.left + r.width / 2)) * 0.4)
        yTo((e.clientY - (r.top + r.height / 2)) * 0.4)
      }
      const leave = () => {
        xTo(0)
        yTo(0)
      }
      el.addEventListener("mousemove", move)
      el.addEventListener("mouseleave", leave)
      cleaners.push(() => {
        el.removeEventListener("mousemove", move)
        el.removeEventListener("mouseleave", leave)
      })
    })

    const portrait = portraitRef.current
    if (portrait) {
      const rotX = gsap.quickTo(portrait, "rotationX", { duration: 0.6, ease: "power3" })
      const rotY = gsap.quickTo(portrait, "rotationY", { duration: 0.6, ease: "power3" })
      const move = (e: MouseEvent) => {
        const r = portrait.getBoundingClientRect()
        const px = (e.clientX - (r.left + r.width / 2)) / r.width
        const py = (e.clientY - (r.top + r.height / 2)) / r.height
        rotY(px * 10)
        rotX(-py * 10)
      }
      const leave = () => {
        rotX(0)
        rotY(0)
      }
      portrait.addEventListener("mousemove", move)
      portrait.addEventListener("mouseleave", leave)
      cleaners.push(() => {
        portrait.removeEventListener("mousemove", move)
        portrait.removeEventListener("mouseleave", leave)
      })
    }

    return () => cleaners.forEach((c) => c())
  }, [revealed])

  return (
    <>
      <Preloader onComplete={() => setRevealed(true)} />

      {/*
        `min-h` rather than a fixed `h-[100dvh] overflow-hidden`.

        The original clipped to exactly one viewport height and hid the overflow, which
        looks intentional on a tall display and silently truncates on anything shorter —
        a 13" laptop, a browser with devtools docked, or any window that is not full
        height. The contact links and social row were the first things to disappear, and
        because the overflow was hidden there was no scrollbar to hint that content
        existed. Letting the page grow costs nothing on a tall screen (the content still
        fits in one view) and makes it reachable everywhere else.
      */}
      <main
        ref={container}
        className="grain bloom gridlines relative flex min-h-[100dvh] w-full flex-col bg-paper text-ink"
      >
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-5 py-6 sm:px-8 lg:gap-10 lg:px-10">
          {/* Top bar */}
          <header className="reveal-item relative z-50 flex items-center justify-between gap-4">
            <span className="font-display text-[1.1rem] font-bold tracking-tight text-ink">
              Ayush <span className="text-accent">Rana</span>
            </span>
            <StatusBar />
          </header>

          {/* Middle: content + portrait */}
          <div className="flex flex-1 flex-col-reverse items-center gap-8 lg:flex-row lg:gap-14">
            {/* Content */}
            <div className="flex w-full flex-col justify-center lg:flex-1">
              <p className="reveal-item mono-label mb-3 sm:mb-4">
                {SITE.role} · {SITE.location}
              </p>

              <h1 className="font-display cursor-default select-none leading-[0.85] tracking-[-0.03em]">
                <SplitWord
                  text="Ayush"
                  className="block text-[clamp(2.6rem,9vw,5.5rem)] font-semibold text-ink"
                />
                <SplitWord
                  text="Rana"
                  className="name-underline -mt-1 inline-block text-[clamp(3.2rem,13vw,8rem)] font-extrabold text-accent"
                />
              </h1>

              <div className="reveal-item mt-5 flex flex-wrap items-center gap-x-2 text-base text-ink-soft sm:text-lg">
                <span>I&apos;m</span>
                <span className="inline-block h-[1.2em] overflow-hidden align-bottom">
                  <span ref={rotatorRef} className="flex flex-col font-semibold text-ink">
                    {[...ROTATORS, ROTATORS[0]].map((w, i) => (
                      <span key={i} className="h-[1.2em] whitespace-nowrap leading-[1.2em]">
                        {w}
                      </span>
                    ))}
                  </span>
                </span>
              </div>

              <p className="reveal-item mt-4 max-w-md text-pretty text-sm leading-relaxed text-ink-soft">
                I build AI for the places that can&apos;t just call an API — banks, insurers, anyone
                whose numbers have to survive an audit. At {COMPANY.shortName} I&apos;m building{" "}
                {COMPANY.product}: ask it anything in plain English, your raw data never leaves your
                building, and every answer comes with a receipt.
              </p>

              <p className="reveal-item mt-4 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink-faint">
                {DOMAINS.join("  /  ")}
              </p>

              {/*
                One row of primary links, replacing the previous two-button call to action
                plus a row of small pills. The "Get in touch" button was a mailto, which the
                Email link already covers, so it was duplicate emphasis.

                LinkedIn is filled and the rest are outlined. That is a deliberate hierarchy
                rather than decoration: LinkedIn is the link a stranger evaluating him is most
                likely to want, and it is the one that carries verifiable history. See the
                `primary` flag on SOCIALS.

                Labels are visible, not icon-only: a LinkedIn mark and a globe sitting next to
                each other are two small monochrome glyphs, and on touch there is no hover to
                disambiguate them.
              */}
              <nav aria-label="Profiles and contact" className="reveal-item mt-7">
                <ul className="flex flex-wrap items-center gap-3">
                  {SOCIALS.map(({ label, short, href, Icon, primary }) => (
                    <li key={short}>
                      <a
                        data-magnetic
                        href={href}
                        target={href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        aria-label={label}
                        className={
                          primary
                            ? "group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-accent"
                            : "group inline-flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
                        }
                      >
                        <Icon
                          className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5"
                          aria-hidden
                        />
                        {short}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/*
              Portrait.

              The asset is a 1000x1000 WebP already cropped to its circular vignette with a
              transparent background, so the circle is baked into the image rather than
              masked in CSS. Notes for anyone changing this:

              - No `rounded-full` here on purpose. The alpha edge was rendered at 4x and
                downsampled, which antialiases more smoothly than a CSS mask; layering
                `border-radius` on top would clip that soft edge with a harder one and could
                leave a faint seam on non-integer widths.
              - No ring, no gradient caption overlay, no background. The image has no
                rectangle to outline any more, and a gradient would fade the page colour into
                itself.
              - `object-contain`, not `cover`. Source and container are both square, so
                neither crops — but `contain` means a future non-square replacement letterboxes
                instead of silently cutting someone's head off.
              - `quality={90}`, up from 68. Fine cross-hatching is the worst case for lossy
                compression; at 68 the linework picked up visible ringing. 90 must stay in the
                `qualities` allowlist in next.config.ts, which Next 16 enforces.
            */}
            <div
              className="w-full max-w-[15rem] shrink-0 [perspective:1200px] sm:max-w-[18rem] lg:w-[38%] lg:max-w-none"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div ref={portraitRef} className="relative" style={{ transformStyle: "preserve-3d" }}>
                <div className="portrait-img relative aspect-square w-full">
                  <Image
                    src={PROFILE_IMAGE.src}
                    alt={PROFILE_IMAGE.alt}
                    fill
                    priority
                    quality={90}
                    sizes="(max-width: 1024px) 18rem, 32rem"
                    className="object-contain object-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Marquee (desktop) — two identical flush groups for a seamless -50% loop */}
          <div className="reveal-item hidden overflow-hidden border-t border-hairline pt-3 lg:block">
            <div className="marquee-track flex w-max whitespace-nowrap">
              {[0, 1].map((group) => (
                <div key={group} className="flex shrink-0" aria-hidden={group === 1}>
                  {MARQUEE.map((w, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-7 pr-7 font-display text-lg font-medium text-ink-faint"
                    >
                      {w}
                      <span className="text-accent">/</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
