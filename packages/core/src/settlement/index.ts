// Settlement — immutable record of a Trade's outcome (price / event / time window).
// Append-only; the physical substrate of "cognitive memory". Feeds Reputation.
// See PRD §7.2, tech-stack event-log principle.

export interface Settlement {
  readonly id: string
  readonly tradeId: string
}
