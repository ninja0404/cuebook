// Reputation — credibility accrued from settled samples, not post count or likes.
// Dimensions: hit-rate, calibration, early-spotter, frame reach. See PRD §7.3.
// Only settled samples score (anti-gaming).

export interface Reputation {
  readonly userId: string
}
