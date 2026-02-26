"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusDot } from "@/components/markets/status-dot"
import { ExchangeBadge } from "@/components/markets/exchange-badge"
import { KpiTile } from "@/components/markets/kpi-tile"
import { SinkPill } from "@/components/markets/sink-pill"
import { ClockVisualizer } from "@/components/markets/clock-visualizer"
import { generateSparkline, SCHEMA_COLUMNS } from "@/lib/mock/markets-data"
import type { MarketWorker, MarketView } from "@/types/markets"

// ─── Section Header ────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-mono tracking-[0.15em] uppercase text-neutral-500 mb-3">
      {children}
    </div>
  )
}

// ─── Monitoring View ───────────────────────────────────────────

function MonitoringView({ worker }: { worker: MarketWorker }) {
  const spark1 = useRef(generateSparkline(30, worker.metrics.msgPerSec, 400)).current
  const spark2 = useRef(generateSparkline(30, worker.metrics.lobUpdates, 200)).current
  const spark3 = useRef(generateSparkline(30, worker.metrics.tradesPerSec, 150)).current
  const spark4 = useRef(generateSparkline(30, worker.metrics.latencyP99, 5)).current

  const clockPillColor =
    worker.clock === "on_orderbook"
      ? "text-cyan-500 bg-cyan-500/10 border-cyan-500/25"
      : "text-orange-500 bg-orange-500/10 border-orange-500/25"

  const clockLabel =
    worker.clock === "on_clock"
      ? `on_clock(${worker.resolution})`
      : worker.clock

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <StatusDot status={worker.state} size="md" />
          <ExchangeBadge name={worker.exchange} />
          <span className="text-base font-mono text-neutral-200 font-bold">
            {worker.symbol}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-orange-500 bg-orange-500/10 border border-orange-500/25 rounded-sm uppercase">
            {worker.marketType}
          </span>
          <span
            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono border rounded-sm uppercase ${clockPillColor}`}
          >
            {clockLabel}
          </span>
          <span className="text-[11px] font-mono text-neutral-500">
            UP {worker.uptime}
          </span>
        </div>
        <div className="flex gap-2">
          {["PAUSE", "STOP", "RESTART", "EDIT"].map((a) => (
            <Button
              key={a}
              variant="outline"
              size="sm"
              className="h-7 px-3 text-[10px] font-mono tracking-[0.08em] uppercase border-neutral-700 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent"
            >
              {a}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="flex gap-3">
        <KpiTile
          label="Messages/s"
          value={worker.metrics.msgPerSec.toLocaleString()}
          sparkData={spark1}
          color="#f97316"
        />
        <KpiTile
          label="LOB Updates/s"
          value={worker.metrics.lobUpdates.toLocaleString()}
          sparkData={spark2}
          color="#06b6d4"
        />
        <KpiTile
          label="Trades/s"
          value={worker.metrics.tradesPerSec.toLocaleString()}
          sparkData={spark3}
          color="#22c55e"
        />
        <KpiTile
          label="Latency p99"
          value={String(worker.metrics.latencyP99)}
          unit="ms"
          sparkData={spark4}
          color={worker.metrics.latencyP99 > 50 ? "#ef4444" : "#f59e0b"}
        />
      </div>

      {/* Perp-specific metrics */}
      {worker.marketType === "perpetual" && worker.metrics.fundingRate != null && (
        <div className="flex gap-3">
          <Card className="flex-1 bg-neutral-900 border-neutral-700">
            <CardContent className="p-3">
              <div className="flex justify-between items-baseline">
                <div>
                  <div className="text-[10px] font-mono text-neutral-500 tracking-[0.1em] mb-1">
                    FUNDING RATE
                  </div>
                  <span
                    className={`text-xl font-mono ${
                      worker.metrics.fundingRate! > 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {worker.metrics.fundingRate! > 0 ? "+" : ""}
                    {worker.metrics.fundingRate}%
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-neutral-500 tracking-[0.1em] mb-1">
                    NEXT RESET
                  </div>
                  <span className="text-base font-mono text-orange-500">
                    {worker.metrics.nextFunding}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1 bg-neutral-900 border-neutral-700">
            <CardContent className="p-3">
              <div className="flex justify-between items-baseline">
                <div>
                  <div className="text-[10px] font-mono text-neutral-500 tracking-[0.1em] mb-1">
                    OPEN INTEREST
                  </div>
                  <span className="text-xl font-mono text-neutral-200">
                    $18.42B
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-neutral-500 tracking-[0.1em] mb-1">
                    Δ 24H
                  </div>
                  <span className="text-base font-mono text-green-500">
                    +{worker.metrics.oiDelta}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-[0.8] bg-neutral-900 border-neutral-700">
            <CardContent className="p-3">
              <div className="text-[10px] font-mono text-neutral-500 tracking-[0.1em] mb-1">
                LIQUIDATIONS (1H)
              </div>
              <span className="text-xl font-mono text-red-500">$4.2M</span>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sink Status */}
      <div>
        <SectionHeader>SINK STATUS</SectionHeader>
        <div className="flex gap-2.5">
          <SinkPill name="Terminal" config={worker.sinks.terminal} />
          <SinkPill name="Parquet" config={worker.sinks.parquet} />
          <SinkPill name="Channel" config={worker.sinks.channel} />
        </div>
      </div>

      {/* Clock Heartbeat */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardContent className="p-3">
          <ClockVisualizer clockType={worker.clock} resolution={worker.resolution} />
        </CardContent>
      </Card>

      {/* Subscribed Datatypes */}
      <div>
        <SectionHeader>SUBSCRIBED DATATYPES</SectionHeader>
        <div className="flex gap-1.5 flex-wrap">
          {worker.datatypes.map((dt) => (
            <span
              key={dt}
              className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-neutral-200 bg-neutral-900 border border-neutral-700 rounded-sm uppercase tracking-[0.05em]"
            >
              {dt.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Config View ───────────────────────────────────────────────

function ConfigView() {
  const [marketType, setMarketType] = useState<"spot" | "perpetual">("perpetual")
  const [clockType, setClockType] = useState<"raw" | "on_clock" | "on_orderbook">("on_clock")
  const [datatypes, setDatatypes] = useState({
    lob_snapshot: true,
    lob_delta: true,
    public_trades: true,
    funding_rate: true,
    open_interest: false,
    liquidations: false,
  })
  const [lobDepth, setLobDepth] = useState(10)

  const Toggle = ({
    label,
    checked,
    onChange,
    disabled,
  }: {
    label: string
    checked: boolean
    onChange: () => void
    disabled?: boolean
  }) => (
    <label
      className={`flex items-center gap-2 cursor-pointer text-xs font-mono text-neutral-200 ${
        disabled ? "opacity-30 cursor-default" : ""
      }`}
    >
      <span
        className={`w-3.5 h-3.5 border rounded-sm flex items-center justify-center ${
          checked
            ? "border-orange-500 bg-orange-500/20"
            : "border-neutral-500 bg-transparent"
        }`}
        onClick={(e) => {
          if (!disabled) {
            e.preventDefault()
            onChange()
          }
        }}
      >
        {checked && <span className="text-orange-500 text-[10px]">✓</span>}
      </span>
      {label}
    </label>
  )

  const ClockButton = ({
    type,
    label,
  }: {
    type: "raw" | "on_clock" | "on_orderbook"
    label: string
  }) => (
    <button
      onClick={() => setClockType(type)}
      className={`flex-1 py-2 px-3 text-[11px] font-mono tracking-[0.08em] uppercase rounded-sm border transition-colors cursor-pointer ${
        clockType === type
          ? "bg-orange-500/20 border-orange-500 text-orange-500"
          : "bg-transparent border-neutral-700 text-neutral-500 hover:text-neutral-400"
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Identity */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardContent className="p-4">
          <SectionHeader>IDENTITY</SectionHeader>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-[10px] font-mono text-neutral-500 tracking-[0.1em] uppercase block mb-1">
                EXCHANGE
              </label>
              <div className="py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-sm font-mono text-xs text-neutral-200">
                Binance ▾
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-mono text-neutral-500 tracking-[0.1em] uppercase block mb-1">
                SYMBOL
              </label>
              <div className="py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-sm font-mono text-xs text-neutral-200">
                BTC-USDT
              </div>
            </div>
            <div className="flex-[0.6]">
              <label className="text-[10px] font-mono text-neutral-500 tracking-[0.1em] uppercase block mb-1">
                MARKET
              </label>
              <div className="flex border border-neutral-800 rounded-sm overflow-hidden">
                {(["spot", "perpetual"] as const).map((mt) => (
                  <button
                    key={mt}
                    onClick={() => setMarketType(mt)}
                    className={`flex-1 py-2 px-2 text-[10px] font-mono tracking-[0.08em] uppercase cursor-pointer border-none ${
                      marketType === mt
                        ? "bg-orange-500/20 text-orange-500"
                        : "bg-neutral-950 text-neutral-500"
                    } ${mt === "spot" ? "border-r border-r-neutral-800" : ""}`}
                  >
                    {mt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DataTypes */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardContent className="p-4">
          <SectionHeader>DATATYPES</SectionHeader>
          <div className="flex gap-4 flex-wrap">
            <Toggle
              label="LOB Snapshots"
              checked={datatypes.lob_snapshot}
              onChange={() =>
                setDatatypes((d) => ({ ...d, lob_snapshot: !d.lob_snapshot }))
              }
            />
            <Toggle
              label="LOB Deltas"
              checked={datatypes.lob_delta}
              onChange={() =>
                setDatatypes((d) => ({ ...d, lob_delta: !d.lob_delta }))
              }
            />
            <Toggle
              label="Public Trades"
              checked={datatypes.public_trades}
              onChange={() =>
                setDatatypes((d) => ({
                  ...d,
                  public_trades: !d.public_trades,
                }))
              }
            />
            <Toggle
              label="Funding Rates"
              checked={datatypes.funding_rate}
              onChange={() =>
                setDatatypes((d) => ({
                  ...d,
                  funding_rate: !d.funding_rate,
                }))
              }
              disabled={marketType === "spot"}
            />
            <Toggle
              label="Open Interest"
              checked={datatypes.open_interest}
              onChange={() =>
                setDatatypes((d) => ({
                  ...d,
                  open_interest: !d.open_interest,
                }))
              }
              disabled={marketType === "spot"}
            />
            <Toggle
              label="Liquidations"
              checked={datatypes.liquidations}
              onChange={() =>
                setDatatypes((d) => ({
                  ...d,
                  liquidations: !d.liquidations,
                }))
              }
              disabled={marketType === "spot"}
            />
          </div>
          {datatypes.lob_snapshot && (
            <div className="mt-3">
              <label className="text-[10px] font-mono text-neutral-500 tracking-[0.1em]">
                LOB DEPTH
              </label>
              <div className="flex gap-2 mt-1">
                {[5, 10, 20, 50].map((d) => (
                  <button
                    key={d}
                    onClick={() => setLobDepth(d)}
                    className={`py-1 px-3 text-[11px] font-mono rounded-sm border cursor-pointer ${
                      d === lobDepth
                        ? "bg-orange-500/20 border-orange-500 text-orange-500"
                        : "bg-transparent border-neutral-700 text-neutral-500"
                    }`}
                  >
                    Top-{d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clock Definition */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardContent className="p-4">
          <SectionHeader>CLOCK DEFINITION</SectionHeader>
          <div className="flex gap-2 mb-4">
            <ClockButton type="raw" label="Raw" />
            <ClockButton type="on_clock" label="on_clock" />
            <ClockButton type="on_orderbook" label="on_orderbook" />
          </div>

          {clockType === "raw" && (
            <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-sm text-[11px] font-mono text-neutral-500 leading-relaxed">
              Events stored at arrival time. No synchronization applied. Each
              datatype stream is written independently as events are received.
            </div>
          )}

          {clockType === "on_clock" && (
            <div>
              <div className="flex gap-2 mb-2.5">
                <div className="flex-[0.4]">
                  <label className="text-[10px] font-mono text-neutral-500 tracking-[0.1em] block mb-1">
                    RESOLUTION
                  </label>
                  <div className="py-2 px-3 bg-neutral-950 border border-orange-500/40 rounded-sm font-mono text-[13px] text-orange-500">
                    100
                  </div>
                </div>
                <div className="flex-[0.3]">
                  <label className="text-[10px] font-mono text-neutral-500 tracking-[0.1em] block mb-1">
                    UNIT
                  </label>
                  <div className="py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-sm font-mono text-xs text-neutral-200">
                    ms ▾
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-sm text-[11px] font-mono text-neutral-500 leading-relaxed">
                Every <span className="text-orange-500">100ms</span>, the
                latest state of all subscribed datatypes is emitted as a
                synchronized row. Orderbook snapshots reflect the most recent
                state at the tick boundary.
              </div>
            </div>
          )}

          {clockType === "on_orderbook" && (
            <div>
              <div className="flex gap-2 mb-2.5">
                <div className="flex-[0.4]">
                  <label className="text-[10px] font-mono text-neutral-500 tracking-[0.1em] block mb-1">
                    MEMORY
                  </label>
                  <div className="py-2 px-3 bg-neutral-950 border border-cyan-500/40 rounded-sm font-mono text-[13px] text-cyan-500">
                    500
                  </div>
                </div>
                <div className="flex-[0.3]">
                  <label className="text-[10px] font-mono text-neutral-500 tracking-[0.1em] block mb-1">
                    UNIT
                  </label>
                  <div className="py-2 px-3 bg-neutral-950 border border-neutral-800 rounded-sm font-mono text-xs text-neutral-200">
                    ms ▾
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-sm text-[11px] font-mono text-neutral-500 leading-relaxed">
                Each orderbook event triggers emission. Public trades are
                included with a lookback of{" "}
                <span className="text-cyan-500">500ms</span>. Funding, OI, and
                liquidations emit their latest known value.
              </div>
            </div>
          )}

          {/* Schema Preview */}
          <div className="mt-4">
            <SectionHeader>LIVE SCHEMA PREVIEW</SectionHeader>
            <div className="bg-neutral-950 border border-neutral-800 rounded-sm overflow-hidden">
              <div className="grid grid-cols-[140px_100px_1fr] text-[10px] font-mono">
                <div className="px-2.5 py-1.5 border-b border-neutral-800 text-orange-500 tracking-[0.1em]">
                  COLUMN
                </div>
                <div className="px-2.5 py-1.5 border-b border-neutral-800 text-orange-500 tracking-[0.1em]">
                  TYPE
                </div>
                <div className="px-2.5 py-1.5 border-b border-neutral-800 text-orange-500 tracking-[0.1em]">
                  DESCRIPTION
                </div>
                {SCHEMA_COLUMNS.slice(0, 7).map((col, i) => (
                  <div key={i} className="contents">
                    <div className="px-2.5 py-1 border-b border-neutral-800/20 text-neutral-200">
                      {col.name}
                    </div>
                    <div className="px-2.5 py-1 border-b border-neutral-800/20 text-cyan-500">
                      {col.type}
                    </div>
                    <div className="px-2.5 py-1 border-b border-neutral-800/20 text-neutral-500">
                      {col.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sinks */}
      <Card className="bg-neutral-900 border-neutral-700">
        <CardContent className="p-4">
          <SectionHeader>DATA SINKS</SectionHeader>
          <div className="flex gap-3">
            {/* Terminal Sink */}
            <div className="flex-1 p-3 bg-neutral-950 border border-green-500/20 rounded-sm">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-3.5 h-3.5 border border-green-500 rounded-sm flex items-center justify-center bg-green-500/20">
                  <span className="text-green-500 text-[10px]">✓</span>
                </span>
                <span className="text-[11px] font-mono text-neutral-200 tracking-[0.08em] uppercase">
                  Terminal
                </span>
              </div>
              <label className="text-[10px] font-mono text-neutral-500 block mb-1">
                LEVEL
              </label>
              <div className="py-1.5 px-2.5 bg-neutral-900 border border-neutral-800 rounded-sm font-mono text-[11px] text-neutral-200">
                Debug ▾
              </div>
            </div>

            {/* Parquet Sink */}
            <div className="flex-[1.4] p-3 bg-neutral-950 border border-green-500/20 rounded-sm">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-3.5 h-3.5 border border-green-500 rounded-sm flex items-center justify-center bg-green-500/20">
                  <span className="text-green-500 text-[10px]">✓</span>
                </span>
                <span className="text-[11px] font-mono text-neutral-200 tracking-[0.08em] uppercase">
                  Parquet
                </span>
              </div>
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <label className="text-[10px] font-mono text-neutral-500 block mb-1">
                    PATH
                  </label>
                  <div className="py-1.5 px-2.5 bg-neutral-900 border border-neutral-800 rounded-sm font-mono text-[10px] text-neutral-200">
                    /data/btc_perp/
                  </div>
                </div>
                <div className="flex-[0.5]">
                  <label className="text-[10px] font-mono text-neutral-500 block mb-1">
                    ROTATION
                  </label>
                  <div className="py-1.5 px-2.5 bg-neutral-900 border border-neutral-800 rounded-sm font-mono text-[11px] text-neutral-200">
                    1h ▾
                  </div>
                </div>
              </div>
              <label className="text-[10px] font-mono text-neutral-500 block mb-1">
                FILE TEMPLATE
              </label>
              <div className="py-1.5 px-2.5 bg-neutral-900 border border-neutral-800 rounded-sm font-mono text-[10px] text-orange-500">
                {"{symbol}_{ts}.parq"}
              </div>
            </div>

            {/* Channel Sink (disabled) */}
            <div className="flex-1 p-3 bg-neutral-950 border border-neutral-800 rounded-sm opacity-50">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-3.5 h-3.5 border border-neutral-500 rounded-sm" />
                <span className="text-[11px] font-mono text-neutral-500 tracking-[0.08em] uppercase">
                  Channel
                </span>
              </div>
              <label className="text-[10px] font-mono text-neutral-500 block mb-1">
                TOPIC
              </label>
              <div className="py-1.5 px-2.5 bg-neutral-900 border border-neutral-800 rounded-sm font-mono text-[11px] text-neutral-500">
                —
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deploy Button */}
      <Button className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-neutral-950 text-[13px] font-mono tracking-[0.15em] uppercase font-bold shadow-[0_0_20px_rgba(249,115,22,0.25)]">
        ▶ DEPLOY MARKET WORKER
      </Button>
    </div>
  )
}

// ─── Center Stage ──────────────────────────────────────────────

interface CenterStageProps {
  worker: MarketWorker
  view: MarketView
  onViewChange: (view: MarketView) => void
}

export function CenterStage({ worker, view }: CenterStageProps) {
  return (
    <div className="flex-1 overflow-auto p-5">
      {view === "config" ? (
        <ConfigView />
      ) : (
        <MonitoringView worker={worker} />
      )}
    </div>
  )
}
