// ---------------------------------------------------------------------------
// Domain types for Hawkes process model and related data structures
// ---------------------------------------------------------------------------

export type FailureSeverity = "critical" | "warning" | "info"

export interface FailureEvent {
  id: string
  timestamp: string
  type: string
  severity: FailureSeverity
  message: string
  detail: string
  resolved: boolean
}

export interface EventTimestamp {
  time: string
  type: "buy" | "sell"
  price: number
  size: number
  intensity: number
}

export interface ForecastVsActual {
  i: number
  actualDt: number
  forecastDt: number
  diff: number
}

export interface DiagnosticMetric {
  label: string
  value: string
}

export type ModelStatus = "idle" | "running" | "fitted" | "failed"
