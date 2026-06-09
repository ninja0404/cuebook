import { loadEnv } from "@cuebook/config"

// Worker entry — home for long-running tasks Next can't do (request-response,
// time-limited): the AI supply pipeline (ingestion/) and settlement / invalidation
// monitoring (settlement/). See tech-stack §2.1. Schedulers mount here as they land.
function main() {
  const env = loadEnv()
  // Boot log (replaced by structured pino logging later).
  console.log(`[worker] booted in ${env.NODE_ENV}`)
  // TODO: register ingestion + settlement schedulers (after data-source work / §11-A)
}

main()
