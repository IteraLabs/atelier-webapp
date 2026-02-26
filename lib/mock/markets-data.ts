// ---------------------------------------------------------------------------
// Mock data for Market Data Collector dashboard
// These will be replaced by API calls once the backend is available.
// ---------------------------------------------------------------------------

import type {
  MarketWorker,
  MarketEvent,
  LiveDataRow,
  SchemaColumn,
} from "@/types/markets"

// ─── Sparkline Generator ───────────────────────────────────────

export function generateSparkline(
  points = 30,
  base = 50,
  variance = 20,
): number[] {
  const data: number[] = []
  let val = base
  for (let i = 0; i < points; i++) {
    val += (Math.random() - 0.48) * variance
    val = Math.max(base * 0.3, Math.min(base * 2.2, val))
    data.push(val)
  }
  return data
}

// ─── Exchange Colors ───────────────────────────────────────────

export const EXCHANGE_COLORS: Record<string, string> = {
  Binance: "#F3BA2F",
  OKX: "#FFFFFF",
  Bybit: "#F7A600",
  dYdX: "#6966FF",
}

// ─── Workers ───────────────────────────────────────────────────

export const MOCK_WORKERS: MarketWorker[] = [
  {
    id: "w1",
    exchange: "Binance",
    symbol: "BTC-USDT",
    marketType: "perpetual",
    clock: "on_clock",
    resolution: "100ms",
    state: "streaming",
    datatypes: [
      "lob_snapshot",
      "lob_delta",
      "public_trades",
      "funding_rate",
      "open_interest",
      "liquidations",
    ],
    sinks: {
      terminal: { enabled: true, level: "debug", state: "streaming" },
      parquet: {
        enabled: true,
        path: "/data/btc_perp/",
        file: "{symbol}_{ts}.parq",
        rotation: "1h",
        state: "writing",
        size: "142 MB",
      },
      channel: {
        enabled: true,
        topic: "market.btc.perp",
        format: "msgpack",
        state: "backpressured",
        queue: 847,
      },
    },
    metrics: {
      msgPerSec: 3241,
      lobUpdates: 1802,
      tradesPerSec: 1439,
      latencyP99: 12,
      fundingRate: 0.0042,
      nextFunding: "03:42:18",
      openInterest: 18420000000,
      oiDelta: 2.3,
      liqVolume: 4200000,
    },
    uptime: "02:14:37",
  },
  {
    id: "w2",
    exchange: "OKX",
    symbol: "ETH-USDT",
    marketType: "perpetual",
    clock: "on_orderbook",
    resolution: null,
    state: "streaming",
    datatypes: [
      "lob_snapshot",
      "public_trades",
      "funding_rate",
      "open_interest",
    ],
    sinks: {
      terminal: { enabled: false },
      parquet: {
        enabled: true,
        path: "/data/eth_perp/",
        state: "writing",
        size: "87 MB",
      },
      channel: {
        enabled: true,
        topic: "market.eth.perp",
        state: "streaming",
        queue: 12,
      },
    },
    metrics: {
      msgPerSec: 1892,
      lobUpdates: 1240,
      tradesPerSec: 652,
      latencyP99: 18,
    },
    uptime: "02:14:37",
  },
  {
    id: "w3",
    exchange: "Bybit",
    symbol: "SOL-USDT",
    marketType: "spot",
    clock: "raw",
    resolution: null,
    state: "connecting",
    datatypes: ["lob_snapshot", "public_trades"],
    sinks: {
      terminal: { enabled: true, level: "trace", state: "idle" },
      parquet: { enabled: false },
      channel: { enabled: false },
    },
    metrics: {
      msgPerSec: 0,
      lobUpdates: 0,
      tradesPerSec: 0,
      latencyP99: 0,
    },
    uptime: "00:00:12",
  },
  {
    id: "w4",
    exchange: "Binance",
    symbol: "ETH-BTC",
    marketType: "spot",
    clock: "on_clock",
    resolution: "1s",
    state: "errored",
    datatypes: ["lob_snapshot", "lob_delta", "public_trades"],
    sinks: {
      terminal: { enabled: true, level: "error", state: "error" },
      parquet: {
        enabled: true,
        path: "/data/eth_btc/",
        state: "error",
        size: "23 MB",
      },
      channel: { enabled: false },
    },
    metrics: {
      msgPerSec: 0,
      lobUpdates: 0,
      tradesPerSec: 0,
      latencyP99: 0,
    },
    uptime: "01:42:03",
  },
  {
    id: "w5",
    exchange: "dYdX",
    symbol: "BTC-USD",
    marketType: "perpetual",
    clock: "on_clock",
    resolution: "500ms",
    state: "paused",
    datatypes: ["lob_snapshot", "public_trades", "funding_rate"],
    sinks: {
      terminal: { enabled: false },
      parquet: {
        enabled: true,
        path: "/data/dydx_btc/",
        state: "idle",
        size: "56 MB",
      },
      channel: { enabled: false },
    },
    metrics: {
      msgPerSec: 0,
      lobUpdates: 0,
      tradesPerSec: 0,
      latencyP99: 0,
    },
    uptime: "00:45:22",
  },
  {
    id: "w6",
    exchange: "OKX",
    symbol: "DOGE-USDT",
    marketType: "perpetual",
    clock: "raw",
    resolution: null,
    state: "streaming",
    datatypes: ["lob_snapshot", "public_trades", "liquidations"],
    sinks: {
      terminal: { enabled: true, level: "info", state: "streaming" },
      parquet: {
        enabled: true,
        path: "/data/doge_perp/",
        state: "writing",
        size: "34 MB",
      },
      channel: { enabled: false },
    },
    metrics: {
      msgPerSec: 876,
      lobUpdates: 412,
      tradesPerSec: 464,
      latencyP99: 24,
    },
    uptime: "01:12:45",
  },
]

// ─── Events ────────────────────────────────────────────────────

export const MOCK_EVENTS: MarketEvent[] = [
  {
    ts: "14:23:41.892",
    worker: "w1",
    level: "info",
    msg: "Parquet file rotated → btc_perp_20260226_1423.parq (142 MB)",
  },
  {
    ts: "14:23:38.104",
    worker: "w4",
    level: "error",
    msg: "WebSocket connection dropped. Reconnect attempt 3/5 failed.",
  },
  {
    ts: "14:23:35.221",
    worker: "w2",
    level: "info",
    msg: "Funding rate update received: 0.0031% (next in 03:42:18)",
  },
  {
    ts: "14:23:32.017",
    worker: "w3",
    level: "warn",
    msg: "WebSocket connecting... attempt 2/5",
  },
  {
    ts: "14:23:28.443",
    worker: "w1",
    level: "info",
    msg: "Channel sink backpressure detected. Queue depth: 847",
  },
  {
    ts: "14:23:25.110",
    worker: "w6",
    level: "info",
    msg: "Liquidation event: 124,000 DOGE long @ 0.1823",
  },
  {
    ts: "14:23:21.889",
    worker: "w4",
    level: "error",
    msg: "Sink error: Parquet write failed — disk I/O timeout",
  },
  {
    ts: "14:23:18.002",
    worker: "w2",
    level: "info",
    msg: "Worker started. Subscribed to 4 datatypes on OKX ETH-USDT Perp",
  },
]

// ─── Live Data Rows ────────────────────────────────────────────

export const MOCK_LIVE_ROWS: LiveDataRow[] = [
  {
    ts: "14:23:41.892",
    bid: "97,842.30",
    ask: "97,842.80",
    spread: "0.50",
    trades: 14,
    volume: "2.341",
    funding: "0.0042%",
    oi: "18.42B",
  },
  {
    ts: "14:23:41.792",
    bid: "97,841.90",
    ask: "97,842.50",
    spread: "0.60",
    trades: 8,
    volume: "1.102",
    funding: "0.0042%",
    oi: "18.42B",
  },
  {
    ts: "14:23:41.692",
    bid: "97,842.10",
    ask: "97,842.70",
    spread: "0.60",
    trades: 22,
    volume: "4.887",
    funding: "0.0042%",
    oi: "18.41B",
  },
  {
    ts: "14:23:41.592",
    bid: "97,841.50",
    ask: "97,842.20",
    spread: "0.70",
    trades: 5,
    volume: "0.891",
    funding: "0.0042%",
    oi: "18.41B",
  },
  {
    ts: "14:23:41.492",
    bid: "97,842.00",
    ask: "97,842.40",
    spread: "0.40",
    trades: 31,
    volume: "6.224",
    funding: "0.0042%",
    oi: "18.41B",
  },
  {
    ts: "14:23:41.392",
    bid: "97,841.70",
    ask: "97,842.30",
    spread: "0.60",
    trades: 11,
    volume: "1.773",
    funding: "0.0042%",
    oi: "18.40B",
  },
]

// ─── Schema Columns ────────────────────────────────────────────

export const SCHEMA_COLUMNS: SchemaColumn[] = [
  {
    name: "timestamp",
    type: "i64",
    desc: "Clock tick timestamp (μs since epoch)",
  },
  { name: "exchange", type: "str", desc: "Exchange identifier" },
  { name: "symbol", type: "str", desc: "Trading pair" },
  { name: "bid_prices", type: "Vec<f64>", desc: "Best bid prices (depth N)" },
  { name: "bid_sizes", type: "Vec<f64>", desc: "Best bid quantities" },
  { name: "ask_prices", type: "Vec<f64>", desc: "Best ask prices (depth N)" },
  { name: "ask_sizes", type: "Vec<f64>", desc: "Best ask quantities" },
  {
    name: "trades",
    type: "Vec<Trade>",
    desc: "Trades within memory window",
  },
  {
    name: "funding_rate",
    type: "Option<f64>",
    desc: "Latest funding rate",
  },
  {
    name: "open_interest",
    type: "Option<f64>",
    desc: "Latest open interest (USD)",
  },
  {
    name: "liquidations",
    type: "Vec<Liq>",
    desc: "Liquidation events since last tick",
  },
]

// ─── Worker name lookup ────────────────────────────────────────

export const WORKER_NAMES: Record<string, string> = {
  w1: "BTC-USDT",
  w2: "ETH-USDT",
  w3: "SOL-USDT",
  w4: "ETH-BTC",
  w5: "BTC-USD",
  w6: "DOGE-USDT",
}
