import { z } from "zod"

// Environment variable schema. Validated at process startup in each runtime.
// Fail fast: a missing/invalid var throws here — never silently defaults.
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database
  DATABASE_URL: z.string().url(),

  // AI
  ANTHROPIC_API_KEY: z.string().min(1),

  // Cache (optional until wired)
  REDIS_URL: z.string().url().optional(),
})

export type Env = z.infer<typeof envSchema>

// Parse & validate once at startup. Throws with readable issues on failure.
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source)
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n")
    throw new Error(`Invalid environment variables:\n${issues}`)
  }
  return parsed.data
}
