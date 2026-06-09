import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

// Pooled DB client factory. Caller passes the validated connection string
// (from @cuebook/config loadEnv) — keeps this module free of startup side effects.
export function createDb(connectionString: string) {
  const queryClient = postgres(connectionString)
  return drizzle(queryClient)
}

export type Database = ReturnType<typeof createDb>
