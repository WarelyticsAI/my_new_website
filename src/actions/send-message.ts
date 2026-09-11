"use server"

import { headers } from "next/headers"
import { Resend } from "resend"
import { getEnv } from "@/lib/env"
import { SITE } from "@/lib/content"

interface SendMessageResult {
  success: boolean
  error?: string
}

/**
 * Best-effort, per-instance rate limiting.
 *
 * IMPORTANT: this Map lives in the memory of a single serverless instance. It is
 * lost on cold start and is not shared between concurrent instances, so it slows
 * down casual repeat submissions but is NOT a durable abuse control. Back it with
 * Upstash Redis (or an equivalent shared store) before relying on it as one.
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 3 // 3 messages per minute

function checkRateLimit(identifier: string): { allowed: boolean; error?: string } {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  // Clean up old records periodically
  if (rateLimitStore.size > 1000) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetAt < now) {
        rateLimitStore.delete(key)
      }
    }
  }

  if (!record || record.resetAt < now) {
    // Create new record
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    })
    return { allowed: true }
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    const waitSeconds = Math.ceil((record.resetAt - now) / 1000)
    return {
      allowed: false,
      error: `Too many messages. Please wait ${waitSeconds} seconds before trying again.`,
    }
  }

  // Increment counter
  record.count++
  return { allowed: true }
}

const createResendClient = () => {
  try {
    const env = getEnv()
    return new Resend(env.RESEND_API_KEY)
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to initialize Resend client:", error)
    }
    return null
  }
}

const resend = createResendClient()

const sanitizeMessage = (value: string) => value.replace(/\u0000/g, "").trim()

// Server actions always run on Node, so escape HTML entities directly.
const escapeHtmlSafe = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\//g, "&#x2F;")

// Resolve the client IP from proxy headers (Vercel / most hosts set these).
const getClientIdentifier = async (): Promise<string> => {
  try {
    const headerList = await headers()
    const forwarded = headerList.get("x-forwarded-for")
    const ip = forwarded?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "unknown"
    return `msg:${ip}`
  } catch {
    return "msg:unknown"
  }
}

// Convert File to base64 for email attachment
const fileToBase64 = async (file: File): Promise<string> => {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  return buffer.toString("base64")
}

// Magic bytes signatures for file type validation
const FILE_SIGNATURES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/gif": [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header (WebP starts with RIFF....WEBP)
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]], // %PDF
}

// Server-side file validation with magic bytes checking
const validateAttachmentServerSide = async (
  file: File,
): Promise<{ valid: boolean; error?: string }> => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ]

  // Check file size first
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File size exceeds 5MB limit.",
    }
  }

  // Check MIME type (client-provided, can be spoofed)
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Only images (JPEG, PNG, GIF, WebP) and PDF files are allowed.",
    }
  }

  // Validate magic bytes (server-side security check)
  try {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer.slice(0, 12)) // Read first 12 bytes

    // Normalize MIME type (image/jpg -> image/jpeg)
    const normalizedType = file.type === "image/jpg" ? "image/jpeg" : file.type
    const signatures = FILE_SIGNATURES[normalizedType]

    if (!signatures) {
      return {
        valid: false,
        error: "Unsupported file type.",
      }
    }

    // Check if file starts with any valid signature
    const isValidSignature = signatures.some((signature) =>
      signature.every((byte, index) => bytes[index] === byte),
    )

    // Special case for WebP: check for WEBP at offset 8
    if (normalizedType === "image/webp" && isValidSignature) {
      const webpMarker = [0x57, 0x45, 0x42, 0x50] // WEBP
      const hasWebpMarker = webpMarker.every((byte, index) => bytes[index + 8] === byte)
      if (!hasWebpMarker) {
        return {
          valid: false,
          error: "Invalid WebP file format.",
        }
      }
    }

    if (!isValidSignature) {
      return {
        valid: false,
        error: "File content does not match its extension. Possible security risk detected.",
      }
    }

    return { valid: true }
  } catch (error) {
    console.error("Error validating file magic bytes:", error)
    return {
      valid: false,
      error: "Failed to validate file. Please try again.",
    }
  }
}

export async function sendAnonymousMessage(formData: FormData): Promise<SendMessageResult> {
  // Rate limit per client IP — best effort only, see rateLimitStore above.
  const identifier = await getClientIdentifier()

  const rateLimitCheck = checkRateLimit(identifier)
  if (!rateLimitCheck.allowed) {
    return { success: false, error: rateLimitCheck.error }
  }

  const rawMessage = formData.get("message")

  if (typeof rawMessage !== "string") {
    return { success: false, error: "Message is required." }
  }

  const sanitized = sanitizeMessage(rawMessage)

  if (!sanitized) {
    return { success: false, error: "Message is required." }
  }

  if (!resend) {
    console.error("Resend client is not initialized. Check environment variables.")
    return { success: false, error: "Configuration error: email service is unavailable." }
  }

  // Handle attachment if present
  const attachment = formData.get("attachment") as File | null
  let attachmentData = null

  if (attachment && attachment.size > 0) {
    // Server-side validation with magic bytes checking
    const validation = await validateAttachmentServerSide(attachment)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    try {
      const content = await fileToBase64(attachment)
      attachmentData = {
        filename: attachment.name,
        content: content,
      }
    } catch (error) {
      console.error("Error processing attachment", error)
      return { success: false, error: "Failed to process attachment. Please try again." }
    }
  }

  // Use IST (Indian Standard Time) timezone
  const now = new Date()
  const istFormatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const istTimeFormatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })

  const formattedDate = istFormatter.format(now)
  const formattedTime = istTimeFormatter.format(now)

  try {
    const escaped = escapeHtmlSafe(sanitized)
    const env = getEnv()
    const recipient = env.RECIPIENT_EMAIL

    interface EmailAttachment {
      filename: string
      content: string
    }

    interface EmailPayload {
      from: string
      to: string
      subject: string
      replyTo: string
      text: string
      html: string
      attachments?: EmailAttachment[]
    }

    const emailPayload: EmailPayload = {
      from: `Anonymous Message <${SITE.email}>`,
      to: recipient,
      subject: attachmentData
        ? "🔐 Anonymous message received (with attachment)"
        : "🔐 Anonymous message received",
      replyTo: SITE.email,
      text: `New anonymous message received on ${formattedDate} at ${formattedTime} IST.\n\n${sanitized}${attachmentData ? `\n\nAttachment: ${attachmentData.filename}` : ""}`,
      html: `
        <div style="margin:0 auto; padding:20px; max-width:600px; font-family:'Inter', 'Segoe UI', Tahoma, sans-serif; background-color:#0f1115; color:#f6f8fb; border-radius:16px;">
          <header style="text-align:center; padding-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.08);">
            <h1 style="margin:0; font-size:1.75rem;">🔐 Anonymous Dispatch</h1>
            <p style="margin-top:8px; font-size:0.95rem; color:#9aa5b1;">Someone sent you a confidential note${attachmentData ? " with an attachment" : ""}.</p>
          </header>
          <article style="margin:24px 0; padding:18px; border-radius:12px; background:linear-gradient(135deg, rgba(37,99,235,0.12), rgba(109,40,217,0.12)); border:1px solid rgba(59,130,246,0.25);">
            <p style="margin:0; white-space:pre-wrap; line-height:1.7; font-size:1rem;">${escaped}</p>
          </article>
          ${
            attachmentData
              ? `<div style="margin:16px 0; padding:12px; border-radius:8px; background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.2);">
            <p style="margin:0; font-size:0.9rem; color:#9aa5b1;">📎 Attachment: <strong style="color:#f6f8fb;">${attachmentData.filename}</strong></p>
          </div>`
              : ""
          }
          <footer style="font-size:0.85rem; color:#9aa5b1;">
            <p style="margin:0;">Received on <strong>${formattedDate}</strong> at <strong>${formattedTime} IST</strong>.</p>
          </footer>
        </div>
      `,
    }

    // Add attachment if present
    if (attachmentData) {
      emailPayload.attachments = [attachmentData]
    }

    const { error } = await resend.emails.send(emailPayload)

    if (error) {
      console.error("Resend email error", error)
      return { success: false, error: "Failed to send your message. Please try again shortly." }
    }

    return { success: true }
  } catch (error) {
    console.error("Unexpected error while sending anonymous message", error)
    return { success: false, error: "Failed to send your message. Please try again shortly." }
  }
}
