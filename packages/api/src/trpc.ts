import { initTRPC } from "@trpc/server"

// tRPC context — request-scoped dependencies (user, db) injected per call.
// Placeholder shape until auth / db wiring lands.
export interface Context {
  readonly userId?: string
}

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
