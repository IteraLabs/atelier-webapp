"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { StatusDot } from "@/components/markets/status-dot"
import { EventLog } from "@/components/markets/event-log"
import { WorkerListPanel } from "./worker-list-panel"
import { CenterStage } from "./center-stage"
import { InspectorPanel } from "./inspector-panel"
import { MOCK_WORKERS, MOCK_EVENTS } from "@/lib/mock/markets-data"
import type { MarketView } from "@/types/markets"

export default function CommandCenterPage() {
  const [selectedWorkerId, setSelectedWorkerId] = useState(MOCK_WORKERS[0].id)
  const [view, setView] = useState<MarketView>("monitor")
  const [inspectorOpen, setInspectorOpen] = useState(true)
  const [logCollapsed, setLogCollapsed] = useState(false)
  const [blinkState, setBlinkState] = useState(true)

  const selectedWorker =
    MOCK_WORKERS.find((w) => w.id === selectedWorkerId) ?? MOCK_WORKERS[0]

  const activeCount = MOCK_WORKERS.filter(
    (w) => w.state === "streaming",
  ).length

  const worstState = MOCK_WORKERS.some((w) => w.state === "errored")
    ? "errored"
    : MOCK_WORKERS.some(
          (w) => w.state === "connecting" || w.state === "backpressured",
        )
      ? "connecting"
      : "streaming"

  const totalMsgSec = MOCK_WORKERS.reduce(
    (s, w) => s + w.metrics.msgPerSec,
    0,
  )

  useEffect(() => {
    const iv = setInterval(() => setBlinkState((b) => !b), 1000)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* ═══ TOP BAR ═══ */}
      <div className="flex items-center justify-between px-5 h-11 border-b border-neutral-800 bg-neutral-900 shrink-0">
        <div className="flex items-center gap-5">
          <span className="text-[11px] font-mono tracking-[0.12em] text-orange-500">
            MARKET DATA COLLECTOR
          </span>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <StatusDot status={worstState} />
            <span className="text-[11px] font-mono text-neutral-500">
              GLOBAL
            </span>
          </div>
          <div className="text-[11px] font-mono text-neutral-500">
            WORKERS:{" "}
            <span className="text-neutral-200">{activeCount}</span>
            <span className="text-neutral-600">/{MOCK_WORKERS.length}</span>
          </div>
          <div className="text-[11px] font-mono text-neutral-500">
            UP <span className="text-neutral-200">02:14:37</span>
          </div>
          <Button
            size="sm"
            onClick={() => setView("config")}
            className="h-7 px-3.5 bg-orange-500/10 border border-orange-500 text-orange-500 text-[11px] font-mono tracking-[0.1em] hover:bg-orange-500/20"
          >
            + NEW WORKER
          </Button>
        </div>
      </div>

      {/* ═══ MAIN BODY ═══ */}
      <div className="flex flex-1 overflow-hidden">
        {/* Worker List Sidebar */}
        <WorkerListPanel
          workers={MOCK_WORKERS}
          selectedId={selectedWorkerId}
          onSelect={(id) => {
            setSelectedWorkerId(id)
            setView("monitor")
          }}
          onNewWorker={() => setView("config")}
          view={view}
        />

        {/* Center + Event Log */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Breadcrumb */}
          <div className="px-5 py-2.5 border-b border-neutral-800 text-[11px] flex justify-between items-center shrink-0">
            <div className="font-mono">
              <span className="text-neutral-500">ATELIER</span>
              <span className="text-neutral-600"> ╱ </span>
              <span className="text-neutral-500">MARKETS</span>
              <span className="text-neutral-600"> ╱ </span>
              <span className="text-orange-500">
                {view === "config"
                  ? "NEW WORKER"
                  : `${selectedWorker.exchange} ${selectedWorker.symbol}`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-neutral-500">
                LAST UPDATE:{" "}
                {new Date().toISOString().slice(0, 19).replace("T", " ")} UTC
              </span>
              <span
                className="w-1.5 h-1.5 rounded-full bg-orange-500 transition-opacity"
                style={{ opacity: blinkState ? 1 : 0.3 }}
              />
            </div>
          </div>

          {/* Center Stage */}
          <CenterStage
            worker={selectedWorker}
            view={view}
            onViewChange={setView}
          />

          {/* Event Log */}
          <div className="px-5 pb-3 border-t border-neutral-800 shrink-0">
            <EventLog
              events={MOCK_EVENTS}
              collapsed={logCollapsed}
              onToggle={() => setLogCollapsed((c) => !c)}
            />
          </div>
        </div>

        {/* Inspector Panel */}
        {inspectorOpen && view === "monitor" && (
          <InspectorPanel
            worker={selectedWorker}
            onClose={() => setInspectorOpen(false)}
          />
        )}

        {/* Inspector collapsed toggle */}
        {!inspectorOpen && view === "monitor" && (
          <div
            onClick={() => setInspectorOpen(true)}
            className="w-7 border-l border-neutral-800 flex items-center justify-center cursor-pointer shrink-0 hover:bg-neutral-800/50"
            style={{ writingMode: "vertical-rl" }}
          >
            <span className="text-[10px] font-mono tracking-[0.1em] text-neutral-500">
              ◂ INSPECTOR
            </span>
          </div>
        )}
      </div>

      {/* ═══ BOTTOM BAR ═══ */}
      <div className="flex items-center justify-between px-5 h-8 border-t border-neutral-800 bg-neutral-900 text-[10px] font-mono text-neutral-500 shrink-0">
        <div className="flex gap-6">
          <span>
            AGGREGATE:{" "}
            <span className="text-orange-500">
              {totalMsgSec.toLocaleString()} msg/s
            </span>
          </span>
          <span>
            DISK WRITE: <span className="text-neutral-200">2.3 GB/hr</span>
          </span>
          <span>
            CHANNEL: <span className="text-neutral-200">4,733 msg/s</span>
          </span>
        </div>
        <div className="flex gap-6">
          <span>
            CPU: <span className="text-green-500">12%</span>
          </span>
          <span>
            MEM: <span className="text-neutral-200">847 MB</span>
          </span>
          <span>
            PARQUET: <span className="text-neutral-200">342 MB</span>
          </span>
        </div>
      </div>
    </div>
  )
}
