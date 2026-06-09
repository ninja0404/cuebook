// Cue — an AI-generated, sourced narrative card. The visible unit of /bet.
// Quality gate before `published`: judgment + source + asset-mechanism required.
// The full output shape is ported from the prior AI-synthesis validation
// once confirmed (see PRD §7.1). Placeholder aggregate for now.

export type CueStatus = "candidate" | "vetted" | "published" | "rejected" | "archived"

export interface Cue {
  readonly id: string
  readonly status: CueStatus
}
