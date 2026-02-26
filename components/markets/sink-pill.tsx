import { StatusDot } from "./status-dot"
import type { SinkConfig } from "@/types/markets"

const stateColors: Record<string, string> = {
  streaming: "#22c55e",
  writing: "#22c55e",
  backpressured: "#f59e0b",
  idle: "#737373",
  error: "#ef4444",
  stopped: "#525252",
}

interface SinkPillProps {
  name: string
  config: SinkConfig
}

export function SinkPill({ name, config }: SinkPillProps) {
  if (!config.enabled) return null

  const color = stateColors[config.state ?? "idle"] ?? "#737373"

  return (
    <div
      className="flex items-center gap-2 px-3.5 py-2 rounded-sm flex-1 min-w-0"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}30`,
      }}
    >
      <StatusDot status={config.state ?? "idle"} size="sm" />
      <span className="text-[11px] font-mono text-neutral-200 uppercase tracking-[0.08em]">
        {name}
      </span>
      <span className="text-[10px] font-mono text-neutral-500">
        {config.state}
      </span>
      {config.size && (
        <span className="text-[10px] font-mono text-neutral-500 ml-auto">
          {config.size}
        </span>
      )}
      {config.queue !== undefined && (
        <span className="text-[10px] font-mono text-amber-500 ml-auto">
          queue: {config.queue}
        </span>
      )}
    </div>
  )
}
