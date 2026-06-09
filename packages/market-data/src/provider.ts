import type { Asset } from "@cuebook/core"

// A price observation at a point in time.
export interface PriceSnapshot {
  readonly asset: Asset
  readonly price: number
  readonly at: Date
}

// Unified market-data interface. Concrete providers (Binance WS, CoinGecko,
// Alpaca, Polygon) implement this — multi-source, pluggable. See tech-stack §4.
export interface MarketDataProvider {
  readonly name: string
  getPrice(asset: Asset): Promise<PriceSnapshot>
}
