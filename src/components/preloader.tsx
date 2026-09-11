"use client"

import { useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { SITE } from "@/lib/content"

// Greetings in the languages Ayush speaks, plus a few for flavour.
const GREETINGS = ["Hello", "नमस्ते", "Namaskar", "Hola", "こんにちは", "Hey"]

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  const greetRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const seen = sessionStorage.getItem("ar-intro-seen") === "1"

      // Skip the show for reduced-motion or repeat visits within the session.
      if (reduce || seen) {
        gsap.set(root.current, { display: "none" })
        onComplete()
        return
      }
      sessionStorage.setItem("ar-intro-seen", "1")

      const counter = { v: 0 }
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(root.current, { display: "none" })
          onComplete()
        },
      })

      // Cycle greetings
      GREETINGS.forEach((g, i) => {
        tl.call(
          () => {
            if (greetRef.current) greetRef.current.textContent = g
          },
          [],
          i * 0.24,
        )
        tl.fromTo(
          greetRef.current,
          { yPercent: 40, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.18, ease: "power2.out" },
          i * 0.24,
        )
      })

      // Count 0 -> 100 in sync
      tl.to(
        counter,
        {
          v: 100,
          duration: GREETINGS.length * 0.24 + 0.3,
          ease: "power1.inOut",
          onUpdate: () => {
            if (countRef.current) countRef.current.textContent = String(Math.round(counter.v))
          },
        },
        0,
      )

      // Progress line
      tl.fromTo(
        ".pl-line",
        { scaleX: 0 },
        { scaleX: 1, duration: GREETINGS.length * 0.24 + 0.3, ease: "power1.inOut" },
        0,
      )

      // Curtain reveal
      tl.to(".pl-inner", { opacity: 0, duration: 0.3, ease: "power2.in" }, ">")
      tl.to(root.current, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, ">-0.05")
    },
    { scope: root },
  )

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[300] flex flex-col justify-between bg-ink px-6 py-6 text-paper sm:px-10 sm:py-8"
      aria-hidden="true"
    >
      <div className="pl-inner flex flex-1 flex-col justify-between">
        <div className="flex justify-between">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-paper/60">
            {SITE.name}
          </span>
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-paper/60">
            Loading
          </span>
        </div>

        <div className="flex items-center">
          <span ref={greetRef} className="text-5xl font-semibold tracking-tight sm:text-7xl">
            Hello
          </span>
        </div>

        <div className="flex items-end justify-between">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-paper/60">
            Welcome
          </span>
          <span className="font-mono text-6xl font-medium tabular-nums sm:text-8xl">
            <span ref={countRef}>0</span>
            <span className="text-paper/40">%</span>
          </span>
        </div>
      </div>

      {/* progress line pinned to bottom */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-paper/10">
        <div className="pl-line h-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
      </div>
    </div>
  )
}
