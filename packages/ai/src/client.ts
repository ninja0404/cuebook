import Anthropic from "@anthropic-ai/sdk"

// Thin Anthropic client factory. We own retry / caching / observability here
// rather than reaching for a framework (tech-stack: no LangChain).
// Caller passes the validated key from @cuebook/config.
export function createAnthropic(apiKey: string): Anthropic {
  return new Anthropic({ apiKey })
}
