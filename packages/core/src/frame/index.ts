// Frame — a user-authored opinion unit. Never a loose post: must attach to a
// narrative / asset / trade / evidence / time-window / checkpoint. See PRD §4, E3.

export type FrameStatus = "draft" | "published" | "linked"

export interface Frame {
  readonly id: string
  readonly status: FrameStatus
}
