// ---------------------------------------------------------------------------
// FailureTimeline — horizontal severity dot chart for failure events
// ---------------------------------------------------------------------------

import type { FailureEvent, FailureSeverity } from "@/types/model"

interface FailureTimelineProps {
  events: FailureEvent[]
}

export function FailureTimeline({ events }: FailureTimelineProps) {
  const width = 600
  const height = 60
  const total = events.length
  const colW = width / Math.max(total, 1)
  const severityColor: Record<FailureSeverity, string> = { critical: "#ef4444", warning: "#f97316", info: "#3b82f6" }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#404040" strokeWidth="0.5" />
      {events.map((e, i) => {
        const x = i * colW + colW / 2
        const c = severityColor[e.severity]
        return (
          <g key={e.id}>
            <circle cx={x} cy={height / 2} r={e.severity === "critical" ? 6 : 4} fill={c} opacity={e.resolved ? 0.35 : 0.9} />
            {e.resolved && <line x1={x - 3} y1={height / 2 - 3} x2={x + 3} y2={height / 2 + 3} stroke="#a3a3a3" strokeWidth="1.5" />}
            <text x={x} y={height / 2 + 18} textAnchor="middle" fill="#737373" fontSize="7" fontFamily="monospace">{e.id}</text>
          </g>
        )
      })}
    </svg>
  )
}
