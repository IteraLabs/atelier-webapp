"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { MOCK_LIVE_ROWS, SCHEMA_COLUMNS } from "@/lib/mock/markets-data"
import type { MarketWorker } from "@/types/markets"

// ─── Section Header ────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-mono tracking-[0.15em] uppercase text-neutral-500 mb-3">
      {children}
    </div>
  )
}

// ─── Tab Button ────────────────────────────────────────────────

function TabButton({
  id,
  label,
  active,
  onClick,
}: {
  id: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`py-2 px-3.5 text-[10px] font-mono tracking-[0.1em] uppercase cursor-pointer border-b-2 transition-colors ${
        active
          ? "bg-orange-500/10 border-b-orange-500 text-orange-500"
          : "border-b-transparent text-neutral-500 hover:text-neutral-400"
      }`}
    >
      {label}
    </button>
  )
}

// ─── Inspector Panel ───────────────────────────────────────────

interface InspectorPanelProps {
  worker: MarketWorker
  onClose: () => void
}

export function InspectorPanel({ worker, onClose }: InspectorPanelProps) {
  const [tab, setTab] = useState<"live" | "sinks" | "schema">("live")

  return (
    <div className="w-80 shrink-0 border-l border-neutral-800 flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-[11px] font-mono tracking-[0.15em] uppercase text-neutral-500">
          INSPECTOR
        </span>
        <button
          onClick={onClose}
          className="text-neutral-500 hover:text-neutral-400 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-800 mb-3">
        <TabButton
          id="live"
          label="Live Data"
          active={tab === "live"}
          onClick={() => setTab("live")}
        />
        <TabButton
          id="sinks"
          label="Sink Health"
          active={tab === "sinks"}
          onClick={() => setTab("sinks")}
        />
        <TabButton
          id="schema"
          label="Schema"
          active={tab === "schema"}
          onClick={() => setTab("schema")}
        />
      </div>

      {/* Live Data Tab */}
      {tab === "live" && (
        <div className="overflow-auto flex-1 text-[10px] font-mono">
          <SectionHeader>SYNCHRONIZED ROWS — LAST 6 TICKS</SectionHeader>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["TS", "BID", "ASK", "SPRD", "TRDS", "VOL", "FUND", "OI"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-1.5 py-1.5 text-left border-b border-neutral-800 text-orange-500 text-[9px] tracking-[0.1em] whitespace-nowrap font-normal"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {MOCK_LIVE_ROWS.map((row, i) => (
                  <tr
                    key={i}
                    className={i === 0 ? "bg-orange-500/[0.03]" : ""}
                  >
                    <td className="px-1.5 py-1 border-b border-neutral-800/20 text-neutral-500 whitespace-nowrap">
                      {row.ts}
                    </td>
                    <td className="px-1.5 py-1 border-b border-neutral-800/20 text-green-500">
                      {row.bid}
                    </td>
                    <td className="px-1.5 py-1 border-b border-neutral-800/20 text-red-500">
                      {row.ask}
                    </td>
                    <td className="px-1.5 py-1 border-b border-neutral-800/20 text-neutral-200">
                      {row.spread}
                    </td>
                    <td className="px-1.5 py-1 border-b border-neutral-800/20 text-amber-500">
                      {row.trades}
                    </td>
                    <td className="px-1.5 py-1 border-b border-neutral-800/20 text-neutral-200">
                      {row.volume}
                    </td>
                    <td className="px-1.5 py-1 border-b border-neutral-800/20 text-green-500">
                      {row.funding}
                    </td>
                    <td className="px-1.5 py-1 border-b border-neutral-800/20 text-neutral-500">
                      {row.oi}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sinks Tab */}
      {tab === "sinks" && (
        <div className="flex-1 overflow-auto">
          <SectionHeader>PARQUET SINK</SectionHeader>
          <Card className="bg-neutral-900 border-neutral-700 mb-3">
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-2.5 text-[11px] font-mono">
                <div>
                  <div className="text-neutral-500 text-[10px] mb-0.5">
                    CURRENT FILE
                  </div>
                  <div className="text-neutral-200">
                    btc_perp_20260226_1423.parq
                  </div>
                </div>
                <div>
                  <div className="text-neutral-500 text-[10px] mb-0.5">
                    BYTES WRITTEN
                  </div>
                  <div className="text-orange-500">142.3 MB</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-[10px] mb-0.5">
                    ROWS WRITTEN
                  </div>
                  <div className="text-neutral-200">1,842,031</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-[10px] mb-0.5">
                    ROTATION IN
                  </div>
                  <div className="text-amber-500">36:42</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-[10px] mb-0.5">
                    WRITE LATENCY (p50)
                  </div>
                  <div className="text-green-500">0.8ms</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-[10px] mb-0.5">
                    WRITE LATENCY (p99)
                  </div>
                  <div className="text-amber-500">4.2ms</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <SectionHeader>CHANNEL SINK</SectionHeader>
          <Card className="bg-neutral-900 border-neutral-700">
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-2.5 text-[11px] font-mono">
                <div>
                  <div className="text-neutral-500 text-[10px] mb-0.5">
                    TOPIC
                  </div>
                  <div className="text-neutral-200">market.btc.perp</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-[10px] mb-0.5">
                    QUEUE DEPTH
                  </div>
                  <div className="text-amber-500">847</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-[10px] mb-0.5">
                    THROUGHPUT
                  </div>
                  <div className="text-neutral-200">2,841 msg/s</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-[10px] mb-0.5">
                    STATUS
                  </div>
                  <div className="text-amber-500">BACKPRESSURED</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Schema Tab */}
      {tab === "schema" && (
        <div className="flex-1 overflow-auto">
          <SectionHeader>OUTPUT SCHEMA</SectionHeader>
          <div className="text-[10px] font-mono">
            {SCHEMA_COLUMNS.map((col, i) => (
              <div
                key={i}
                className="flex gap-2 py-1.5 border-b border-neutral-800/20"
              >
                <span className="text-neutral-200 min-w-[110px]">
                  {col.name}
                </span>
                <span className="text-cyan-500 min-w-[80px]">{col.type}</span>
                <span className="text-neutral-500">{col.desc}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button className="py-1.5 px-3.5 bg-transparent border border-neutral-700 rounded-sm text-[10px] font-mono text-neutral-500 cursor-pointer tracking-[0.08em] hover:text-neutral-400 hover:border-neutral-600">
              EXPORT AS JSON
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
