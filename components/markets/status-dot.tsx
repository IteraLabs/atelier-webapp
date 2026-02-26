import { cn } from "@/lib/utils"
import type { WorkerState, SinkState } from "@/types/markets"

const stateColorMap: Record<string, string> = {
  streaming: "bg-green-500",
  connected: "bg-green-500",
  writing: "bg-green-500",
  connecting: "bg-amber-500",
  backpressured: "bg-amber-500",
  paused: "bg-amber-500",
  configured: "bg-neutral-500",
  idle: "bg-neutral-500",
  stopped: "bg-neutral-600",
  errored: "bg-red-500",
  error: "bg-red-500",
}

const pulseStates = new Set(["streaming", "connecting"])

interface StatusDotProps {
  status: WorkerState | SinkState | string
  size?: "sm" | "md" | "lg"
  className?: string
}

export function StatusDot({ status, size = "sm", className }: StatusDotProps) {
  const colorClass = stateColorMap[status] ?? "bg-neutral-500"
  const shouldPulse = pulseStates.has(status)

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  }

  return (
    <span
      className={cn(
        "inline-block rounded-full shrink-0",
        colorClass,
        sizeClasses[size],
        shouldPulse && "animate-pulse",
        className,
      )}
    />
  )
}
