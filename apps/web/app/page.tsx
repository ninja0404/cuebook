import { APP_NAME } from "@cuebook/config"

// Placeholder home. Real /bet feed, Room, /frame, /trade routes land per PRD §6.
export default function HomePage() {
  return (
    <main className="shell">
      <p className="kicker">{APP_NAME}</p>
      <h1>Before the trade, get the Cue.</h1>
      <p className="sub">交易前认知网络 · 脚手架就绪，等待 /bet · /frame · /trade 落地。</p>
    </main>
  )
}
