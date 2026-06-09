import { router } from "./trpc"

// Root router. Feature routers (bet / room / frame / trade) mount here as they land.
export const appRouter = router({})

export type AppRouter = typeof appRouter
