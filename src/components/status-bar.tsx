"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import NumberFlow from "@number-flow/react"

interface Clock {
  h: number
  m: number
  s: number
  available: boolean
  activity: string
}

function activityFor(hour: number): string {
  if (hour < 6) return "Asleep, probably"
  if (hour < 9) return "Coffee, then inbox"
  if (hour < 13) return "Heads-down building"
  if (hour < 14) return "Away — lunch"
  if (hour < 18) return "Calls and code"
  if (hour < 21) return "Shipping something"
  return "Late-night architecture"
}

function useClock(): Clock {
  const [c, setC] = useState<Clock>({ h: 0, m: 0, s: 0, available: true, activity: "" })
  useEffect(() => {
    const tick = () => {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).formatToParts(new Date())
      const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? "0")
      const h = get("hour")
      setC({
        h,
        m: get("minute"),
        s: get("second"),
        available: h >= 8 && h < 23,
        activity: activityFor(h),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return c
}

const numberFormat = { minimumIntegerDigits: 2 } as const

export function StatusBar() {
  const { h, m, s, available, activity } = useClock()
  const [open, setOpen] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.97 }}
        className="chip px-3 py-1.5"
        aria-label={`${available ? "Available" : "Away"} — local time ${h}:${m} IST`}
      >
        {/* Live equalizer */}
        <span className="flex h-3.5 items-end gap-[2px]" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="eq-bar w-[2px] rounded-full"
              style={{
                height: "100%",
                background: available ? "var(--color-accent)" : "var(--color-ink-faint)",
                animationDelay: `${i * 0.13}s`,
                animationPlayState: available ? "running" : "paused",
              }}
            />
          ))}
        </span>

        <span className="text-xs font-medium text-ink-soft">
          {available ? "Available" : "Away"}
        </span>

        <span className="flex items-center font-mono text-xs tabular-nums text-ink">
          <NumberFlow value={h} format={numberFormat} trend={0} />
          <span className="mx-[1px] text-ink-faint">:</span>
          <NumberFlow value={m} format={numberFormat} trend={0} />
          <span className="mx-[1px] text-ink-faint">:</span>
          <NumberFlow value={s} format={numberFormat} trend={0} className="text-ink-faint" />
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 340, damping: 26 }}
            className="absolute right-0 top-[calc(100%+8px)] z-[90] w-60 origin-top-right rounded-xl border border-hairline bg-paper-2/95 p-3.5 shadow-[0_18px_40px_-18px_rgba(23,20,13,0.35)] backdrop-blur"
          >
            <div className="flex items-center justify-between">
              <span className="mono-label">Live · India</span>
              <span className="flex items-center gap-1.5">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${available ? "bg-signal" : "bg-ink-faint"}`}
                />
                <span className="text-[0.7rem] font-medium text-ink-soft">
                  {available ? "Online" : "Offline"}
                </span>
              </span>
            </div>
            <p className="mt-2 font-display text-lg italic leading-tight text-ink">{activity}</p>
            <div className="mt-2 flex items-baseline gap-1 font-mono text-2xl tabular-nums text-ink">
              <NumberFlow value={h} format={numberFormat} trend={0} />
              <span className="text-ink-faint">:</span>
              <NumberFlow value={m} format={numberFormat} trend={0} />
              <span className="text-ink-faint">:</span>
              <NumberFlow value={s} format={numberFormat} trend={0} className="text-accent" />
              <span className="ml-1 text-xs text-ink-faint">IST</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
