"use client"

import { ChevronDown, ChevronRight } from "lucide-react"
import type { MarketEvent } from "@/types/markets"
import { WORKER_NAMES } from "@/lib/mock/markets-data"

const levelColors: Record<string, string> = {
  info: "text-neutral-500",
  warn: "text-amber-500",
  error: "text-red-500",
  debug: "text-neutral-600",
  trace: "text-neutral-600",
}

interface EventLogProps {
  events: MarketEvent[]
  collapsed: boolean
  onToggle: () => void
}

export function EventLog({ events, collapsed, onToggle }: EventLogProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex w-full justify-between items-center cursor-pointer py-2 group"
      >
        <span className="text-[11px] font-mono tracking-[0.15em] uppercase text-neutral-500">
          EVENT LOG
        </span>
        <span className="flex items-center gap-1 text-[10px] font-mono text-neutral-500 group-hover:text-neutral-400">
          {collapsed ? (
            <>
              <ChevronRight className="w-3 h-3" /> EXPAND
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" /> COLLAPSE
            </>
          )}
        </span>
      </button>
      {!collapsed && (
        <div className="max-h-40 overflow-auto text-[11px] font-mono">
          {events.map((e, i) => (
            <div
              key={i}
              className="flex gap-2.5 py-1.5 border-b border-neutral-800/60 items-baseline"
            >
              <span className="text-neutral-500 min-w-[90px] shrink-0">
                {e.ts}
              </span>
              <span
                className={`min-w-[40px] shrink-0 uppercase text-[9px] ${levelColors[e.level] ?? "text-neutral-500"}`}
              >
                {e.level}
              </span>
              <span className="inline-flex items-center px-1.5 py-0 text-[9px] font-mono text-orange-500 bg-orange-500/10 border border-orange-500/25 rounded-sm uppercase whitespace-nowrap">
                {WORKER_NAMES[e.worker] ?? e.worker}
              </span>
              <span
                className={
                  e.level === "error" ? "text-red-500" : "text-neutral-500"
                }
              >
                {e.msg}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
