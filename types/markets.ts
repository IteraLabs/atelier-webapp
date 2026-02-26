// ---------------------------------------------------------------------------
// Market Data Collector — Domain Types
// ---------------------------------------------------------------------------

export type WorkerState =
  | "streaming"
  | "connected"
  | "writing"
  | "connecting"
  | "backpressured"
  | "paused"
  | "configured"
  | "idle"
  | "stopped"
  | "errored"
  | "error"

export type ClockType = "on_clock" | "on_orderbook" | "raw"

export type MarketType = "perpetual" | "spot"

export type SinkState =
  | "streaming"
  | "writing"
  | "backpressured"
  | "idle"
  | "error"
  | "stopped"

export type EventLevel = "info" | "warn" | "error" | "debug" | "trace"

export type MarketView = "monitor" | "config"

// ─── Sink Configuration ────────────────────────────────────────

export interface SinkConfig {
  enabled: boolean
  state?: SinkState
  level?: string
  path?: string
  file?: string
  rotation?: string
  size?: string
  topic?: string
  format?: string
  queue?: number
}

export interface WorkerSinks {
  terminal: SinkConfig
  parquet: SinkConfig
  channel: SinkConfig
}

// ─── Worker Metrics ────────────────────────────────────────────

export interface WorkerMetrics {
  msgPerSec: number
  lobUpdates: number
  tradesPerSec: number
  latencyP99: number
  fundingRate?: number
  nextFunding?: string
  openInterest?: number
  oiDelta?: number
  liqVolume?: number
}

// ─── Market Worker ─────────────────────────────────────────────

export interface MarketWorker {
  id: string
  exchange: string
  symbol: string
  marketType: MarketType
  clock: ClockType
  resolution: string | null
  state: WorkerState
  datatypes: string[]
  sinks: WorkerSinks
  metrics: WorkerMetrics
  uptime: string
}

// ─── Events ────────────────────────────────────────────────────

export interface MarketEvent {
  ts: string
  worker: string
  level: EventLevel
  msg: string
}

// ─── Live Data ─────────────────────────────────────────────────

export interface LiveDataRow {
  ts: string
  bid: string
  ask: string
  spread: string
  trades: number
  volume: string
  funding: string
  oi: string
}

// ─── Schema ────────────────────────────────────────────────────

export interface SchemaColumn {
  name: string
  type: string
  desc: string
}
