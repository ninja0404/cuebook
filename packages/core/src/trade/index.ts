// Trade (paper) — low-pressure validation, NOT real execution.
// Required at creation: direction + invalidation + time window (so it can settle).
// Scoring = calibration, not P&L (see PRD §7.2, decision §11-A — confirm before
// finalizing fields).

export type TradeDirection = "long" | "short" | "uncertain"
export type TradeStatus = "open" | "active" | "settled"

export interface PaperTrade {
  readonly id: string
  readonly direction: TradeDirection
  readonly status: TradeStatus
}
