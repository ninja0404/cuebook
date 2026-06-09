import type { Config } from "drizzle-kit"

// drizzle-kit config for migrations. Schema path is live once tables exist (§11-A).
export default {
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
} satisfies Config
