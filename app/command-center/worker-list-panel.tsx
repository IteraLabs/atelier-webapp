"use client"

import { StatusDot } from "@/components/markets/status-dot"
import { ExchangeBadge } from "@/components/markets/exchange-badge"
import type { MarketWorker, MarketView } from "@/types/markets"

// ─── Worker Card ───────────────────────────────────────────────

function WorkerCard({
  worker,
  selected,
  onClick,
}: {
  worker: MarketWorker
  selected: boolean
  onClick: () => void
}) {
  const clockLabel =
    worker.clock === "on_clock"
      ? `on_clock(${worker.resolution})`
      : worker.clock === "on_orderbook"
        ? "on_orderbook"
        : "raw"

  const clockColor =
    worker.clock === "on_orderbook"
      ? "text-cyan-500 bg-cyan-500/10 border-cyan-500/25"
      : "text-orange-500 bg-orange-500/10 border-orange-500/25"

  return (
    <div
      onClick={onClick}
      className={`px-3 py-2.5 cursor-pointer border-b border-neutral-800 transition-colors ${
        selected
          ? "border-l-2 border-l-orange-500 bg-orange-500/[0.03]"
          : "border-l-2 border-l-transparent hover:bg-neutral-800/50"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <StatusDot status={worker.state} />
        <ExchangeBadge name={worker.exchange} />
        <span
          className={`text-xs font-mono ${
            selected ? "text-neutral-200 font-semibold" : "text-neutral-500"
          }`}
        >
          {worker.exchange}
        </span>
      </div>
      <div className="ml-9">
        <div className="text-[13px] font-mono text-neutral-200 font-semibold mb-1">
          {worker.symbol}{" "}
          <span className="text-[10px] text-neutral-500 font-normal uppercase">
            {worker.marketType}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 text-[9px] font-mono tracking-[0.05em] uppercase border rounded-sm ${clockColor}`}
          >
            {clockLabel}
          </span>
          {worker.state === "streaming" && (
            <span className="text-[10px] font-mono text-neutral-500">
              ↓ {worker.metrics.msgPerSec.toLocaleString()} msg/s
            </span>
          )}
          {worker.state === "errored" && (
            <span className="text-[10px] font-mono text-red-500">
              ✕ ERROR
            </span>
          )}
          {worker.state === "connecting" && (
            <span className="text-[10px] font-mono text-amber-500">
              ◌ CONNECTING
            </span>
          )}
          {worker.state === "paused" && (
            <span className="text-[10px] font-mono text-amber-500">
              ❚❚ PAUSED
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Worker List Panel ─────────────────────────────────────────

interface WorkerListPanelProps {
  workers: MarketWorker[]
  selectedId: string
  onSelect: (id: string) => void
  onNewWorker: () => void
  view: MarketView
}

export function WorkerListPanel({
  workers,
  selectedId,
  onSelect,
  view,
}: WorkerListPanelProps) {
  const activeCount = workers.filter(
    (w) => w.state === "streaming",
  ).length
  const errorCount = workers.filter(
    (w) => w.state === "errored",
  ).length

  return (
    <div className="w-60 shrink-0 border-r border-neutral-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-3 border-b border-neutral-800">
        <div className="text-[11px] font-mono tracking-[0.15em] uppercase text-neutral-500 mb-2">
          WORKER FLEET
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono text-orange-500 bg-orange-500/10 border border-orange-500/25 rounded-sm uppercase cursor-pointer">
            ALL ({workers.length})
          </span>
          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono text-green-500 bg-green-500/10 border border-green-500/25 rounded-sm uppercase cursor-pointer">
            LIVE ({activeCount})
          </span>
          <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-mono text-red-500 bg-red-500/10 border border-red-500/25 rounded-sm uppercase cursor-pointer">
            ERR ({errorCount})
          </span>
        </div>
      </div>

      {/* Worker List */}
      <div className="flex-1 overflow-auto">
        {workers.map((w) => (
          <WorkerCard
            key={w.id}
            worker={w}
            selected={selectedId === w.id && view === "monitor"}
            onClick={() => onSelect(w.id)}
          />
        ))}
      </div>
    </div>
  )
}
