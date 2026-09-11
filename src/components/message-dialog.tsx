"use client"

import { useEffect, useRef, useState, type ComponentProps, type FormEvent } from "react"
import * as RDialog from "@radix-ui/react-dialog"
import { AnimatePresence, motion } from "framer-motion"
import confetti from "canvas-confetti"
import { Check, Loader2, Lock, Paperclip, Send, X } from "lucide-react"
import { toast } from "sonner"
import { sendAnonymousMessage } from "@/actions/send-message"

const MAX = 1000
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024
const ACCEPTED_TYPES = "image/jpeg,image/png,image/gif,image/webp,application/pdf"
type Status = "idle" | "sending" | "success"

const PROMPTS = [
  { label: "Say hi 👋", text: "Hey Ayush! " },
  { label: "Work together 🤝", text: "I'd like to talk about working together on " },
  { label: "About Daufx 🔐", text: "I had a question about Daufx — " },
]

export function MessageDialog({ className, children, ...rest }: ComponentProps<"button">) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [attachment, setAttachment] = useState<File | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => textareaRef.current?.focus(), 120)
      return () => clearTimeout(t)
    }
  }, [open])

  const applyPrompt = (text: string) => {
    setMessage(text)
    requestAnimationFrame(() => {
      const el = textareaRef.current
      if (el) {
        el.focus()
        el.setSelectionRange(text.length, text.length)
      }
    })
  }

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault()
    const trimmed = message.trim()
    if (!trimmed || status !== "idle") {
      if (!trimmed) textareaRef.current?.focus()
      return
    }
    setStatus("sending")
    try {
      const formData = new FormData()
      formData.append("message", trimmed)
      if (attachment) formData.append("attachment", attachment)
      const result = await sendAnonymousMessage(formData)
      if (result.success) {
        setStatus("success")
        toast.success("Message sent — thank you!")
        confetti({
          particleCount: 70,
          spread: 65,
          startVelocity: 38,
          origin: { y: 0.7 },
          colors: ["#dd3b00", "#17140d", "#3f7d5a"],
          scalar: 0.9,
        })
        setTimeout(() => {
          setOpen(false)
        }, 1500)
      } else {
        setStatus("idle")
        toast.error(result.error ?? "Failed to send your message. Please try again.")
        textareaRef.current?.focus()
      }
    } catch {
      setStatus("idle")
      toast.error("Network error — check your connection and try again.")
      textareaRef.current?.focus()
    }
  }

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      // reset after the close animation
      setTimeout(() => {
        setStatus("idle")
        setMessage("")
        setAttachment(null)
        if (fileRef.current) fileRef.current.value = ""
      }, 250)
    }
  }

  const handleFilePick = (file: File | null) => {
    if (!file) {
      setAttachment(null)
      return
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      toast.error("File size exceeds the 5MB limit.")
      if (fileRef.current) fileRef.current.value = ""
      return
    }
    if (!ACCEPTED_TYPES.split(",").includes(file.type)) {
      toast.error("Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed.")
      if (fileRef.current) fileRef.current.value = ""
      return
    }
    setAttachment(file)
  }

  const clearAttachment = () => {
    setAttachment(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  const pct = Math.min(100, (message.length / MAX) * 100)

  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)} {...rest}>
        {children}
      </button>

      {mounted && (
        <RDialog.Root open={open} onOpenChange={handleOpenChange}>
          <RDialog.Portal forceMount>
            <AnimatePresence>
              {open && (
                <div key="wrap">
                  <RDialog.Overlay asChild forceMount>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="fixed inset-0 z-[200] bg-ink/40 backdrop-blur-[3px]"
                    />
                  </RDialog.Overlay>

                  <RDialog.Content asChild forceMount>
                    <motion.div
                      style={{ x: "-50%", y: "-50%" }}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 320, damping: 26 }}
                      className="fixed left-1/2 top-1/2 z-[200] w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-2xl border border-hairline bg-paper-2 p-6 shadow-[0_40px_90px_-30px_rgba(23,20,13,0.5)]"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <RDialog.Title className="flex items-center gap-2 text-lg font-semibold text-ink">
                            <Lock className="h-4 w-4 text-accent" />
                            Drop me a line
                          </RDialog.Title>
                          <RDialog.Description className="mt-1 text-sm text-ink-soft">
                            Anonymous. No account, no trace straight to my inbox.
                          </RDialog.Description>
                        </div>
                        <RDialog.Close className="grid h-8 w-8 place-items-center rounded-full text-ink-faint transition-colors hover:bg-ink/5 hover:text-ink">
                          <X className="h-4 w-4" />
                        </RDialog.Close>
                      </div>

                      {/* Prompt chips */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {PROMPTS.map((p) => (
                          <motion.button
                            key={p.label}
                            type="button"
                            whileTap={{ scale: 0.94 }}
                            whileHover={{ y: -2 }}
                            onClick={() => applyPrompt(p.text)}
                            className="rounded-full border border-hairline bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
                          >
                            {p.label}
                          </motion.button>
                        ))}
                      </div>

                      <form onSubmit={handleSubmit} className="mt-3">
                        <div className="relative">
                          <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
                            onKeyDown={(e) => {
                              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit()
                            }}
                            rows={5}
                            disabled={status !== "idle"}
                            placeholder="Type your message…"
                            className="w-full resize-none rounded-xl border border-hairline bg-paper p-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent disabled:opacity-60"
                          />
                          {/* animated fill bar */}
                          <div className="mt-1.5 flex items-center gap-2">
                            <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-ink/10">
                              <motion.div
                                className="h-full rounded-full"
                                style={{
                                  background: pct > 90 ? "var(--color-accent)" : "var(--color-ink)",
                                }}
                                animate={{ width: `${pct}%` }}
                                transition={{ type: "spring", stiffness: 200, damping: 30 }}
                              />
                            </div>
                            <span className="font-mono text-[10px] tabular-nums text-ink-faint">
                              {message.length}/{MAX}
                            </span>
                          </div>
                        </div>

                        {/* Attachment — optional. The server re-validates size, MIME
                            type and magic bytes before anything is emailed. */}
                        <div className="mt-3">
                          <input
                            ref={fileRef}
                            type="file"
                            accept={ACCEPTED_TYPES}
                            className="sr-only"
                            onChange={(e) => handleFilePick(e.target.files?.[0] ?? null)}
                          />
                          {attachment ? (
                            <div className="flex items-center gap-2 rounded-lg border border-hairline bg-paper px-3 py-2">
                              <Paperclip className="h-3.5 w-3.5 shrink-0 text-accent" />
                              <span className="min-w-0 flex-1 truncate text-xs text-ink-soft">
                                {attachment.name}
                              </span>
                              <span className="shrink-0 font-mono text-[10px] tabular-nums text-ink-faint">
                                {(attachment.size / 1024).toFixed(0)} KB
                              </span>
                              <button
                                type="button"
                                onClick={clearAttachment}
                                disabled={status !== "idle"}
                                aria-label={`Remove attachment ${attachment.name}`}
                                className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-ink-faint transition-colors hover:bg-ink/5 hover:text-ink"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => fileRef.current?.click()}
                              disabled={status !== "idle"}
                              className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
                            >
                              <Paperclip className="h-3.5 w-3.5" />
                              Attach a file
                            </button>
                          )}
                        </div>

                        {/* Send button — state machine */}
                        <div className="relative mt-4">
                          <motion.button
                            type="submit"
                            disabled={status !== "idle"}
                            whileTap={status === "idle" ? { scale: 0.97 } : undefined}
                            animate={{
                              backgroundColor: status === "success" ? "#3f7d5a" : "#17140d",
                            }}
                            className="relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl text-sm font-semibold text-paper"
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              {status === "idle" && (
                                <motion.span
                                  key="idle"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="flex items-center gap-2"
                                >
                                  Send note <Send className="h-4 w-4" />
                                </motion.span>
                              )}
                              {status === "sending" && (
                                <motion.span
                                  key="sending"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="flex items-center gap-2"
                                >
                                  <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                                </motion.span>
                              )}
                              {status === "success" && (
                                <motion.span
                                  key="success"
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex items-center gap-2"
                                >
                                  <Check className="h-4 w-4" /> Sent — thank you!
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.button>

                          {/* paper-plane fly-off */}
                          <AnimatePresence>
                            {status === "success" && (
                              <motion.span
                                key="plane"
                                initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                                animate={{ opacity: 0, x: 220, y: -120, rotate: 25 }}
                                transition={{ duration: 0.9, ease: "easeOut" }}
                                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-paper"
                              >
                                <Send className="h-5 w-5" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </form>
                    </motion.div>
                  </RDialog.Content>
                </div>
              )}
            </AnimatePresence>
          </RDialog.Portal>
        </RDialog.Root>
      )}
    </>
  )
}
