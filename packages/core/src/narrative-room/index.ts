// Narrative Room — the central cognitive object. Everything hangs off it:
// cues, frames, trades, assets, evidence, signals. See PRD §4.
// Heat state drives ranking & display.

export type RoomHeat = "emerging" | "moving" | "leading" | "fading"

export interface NarrativeRoom {
  readonly id: string
  readonly heat: RoomHeat
}
