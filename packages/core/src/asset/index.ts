// Asset — a tradable instrument, the anchor that narratives map onto.
// Abstracted across categories from day one so we are not locked to crypto.
// See PRD §4.

export type AssetCategory = "crypto" | "stock" | "macro"

export interface Asset {
  readonly symbol: string
  readonly category: AssetCategory
  readonly venue?: string
}
