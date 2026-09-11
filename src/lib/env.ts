/**
 * Environment variable validation and type-safe access
 * Validates required environment variables at runtime
 */

interface EnvironmentConfig {
  RESEND_API_KEY: string
  RECIPIENT_EMAIL: string
  NODE_ENV: "development" | "production" | "test"
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "EnvironmentError"
  }
}

/**
 * Validates and returns typed environment variables
 * @throws {EnvironmentError} If required variables are missing
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const requiredVars = ["RESEND_API_KEY", "RECIPIENT_EMAIL"] as const

  const missing: string[] = []

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  if (missing.length > 0) {
    throw new EnvironmentError(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please copy .env.example to .env and fill in the values.",
    )
  }

  // Validate email format
  const email = process.env.RECIPIENT_EMAIL!
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new EnvironmentError(`Invalid RECIPIENT_EMAIL format: ${email}`)
  }

  return {
    RESEND_API_KEY: process.env.RESEND_API_KEY!,
    RECIPIENT_EMAIL: process.env.RECIPIENT_EMAIL!,
    NODE_ENV: (process.env.NODE_ENV as EnvironmentConfig["NODE_ENV"]) || "development",
  }
}

// Export a singleton instance for consistent access
let cachedConfig: EnvironmentConfig | null = null

export function getEnv(): EnvironmentConfig {
  if (!cachedConfig) {
    try {
      cachedConfig = getEnvironmentConfig()
    } catch (error) {
      // Log error and re-throw with context
      if (process.env.NODE_ENV !== "production") {
        console.error("Failed to load environment configuration:", error)
      }
      throw error
    }
  }
  return cachedConfig
}

// Reset cached config (useful for testing)
export function resetEnvCache(): void {
  cachedConfig = null
}
