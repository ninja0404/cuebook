import { appRouter } from "@cuebook/api"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

// tRPC over Next — the web app's BFF entry. Mounts the shared appRouter so web
// (and later mobile) consume one typed surface. See tech-stack §2.1.
function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
  })
}

export { handler as GET, handler as POST }
