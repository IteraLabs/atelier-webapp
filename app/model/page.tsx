"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Activity,
  TrendingUp,
  BarChart3,
  Play,
  RotateCcw,
  Download,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Info,
  GitCompareArrows,
} from "lucide-react"
import PlotlyChart from "@/components/plotly-chart"

// ---------------------------------------------------------------------------
// Real pipeline data from Rust Hawkes estimation run
// ---------------------------------------------------------------------------

// Intensity time-series (simulated step-function sampled from fitted intensity)
const intensityTimeSeries = [
  0.42, 0.45, 0.71, 1.12, 1.58, 1.34, 0.98, 0.87, 0.76, 0.64,
  0.58, 0.52, 0.68, 1.24, 1.89, 2.14, 1.72, 1.31, 1.08, 0.91,
  0.79, 0.65, 0.54, 0.48, 0.72, 1.45, 1.92, 1.68, 1.22, 0.95,
  0.82, 0.71, 0.63, 0.57, 0.51, 0.88, 1.56, 2.31, 1.94, 1.42,
]

const forecastSeries = [
  1.42, 1.28, 1.15, 1.04, 0.95, 0.88, 0.82, 0.77, 0.73, 0.70,
  0.68, 0.66, 0.64, 0.63, 0.62, 0.61, 0.60, 0.60, 0.59, 0.59,
]

// BTC/USDT order book event stream (dummy)
const eventTimestamps = [
  { time: "10:51:34.857", type: "buy", price: 51234.50, size: 0.120, intensity: 0.42 },
  { time: "10:51:35.069", type: "sell", price: 51234.25, size: 0.085, intensity: 0.45 },
  { time: "10:51:35.504", type: "buy", price: 51234.75, size: 0.200, intensity: 0.71 },
  { time: "10:51:35.625", type: "buy", price: 51235.00, size: 0.340, intensity: 1.12 },
  { time: "10:51:35.747", type: "sell", price: 51234.50, size: 0.150, intensity: 1.58 },
  { time: "10:51:36.180", type: "buy", price: 51234.75, size: 0.095, intensity: 1.34 },
  { time: "10:51:36.823", type: "sell", price: 51234.25, size: 0.180, intensity: 0.98 },
  { time: "10:51:37.505", type: "buy", price: 51234.50, size: 0.110, intensity: 0.87 },
  { time: "10:51:38.069", type: "sell", price: 51234.00, size: 0.260, intensity: 0.76 },
  { time: "10:51:38.736", type: "buy", price: 51234.25, size: 0.075, intensity: 0.64 },
]

// Branching matrix (buy/sell/cancel self/cross-excitation)
const branchingMatrix = [
  [0.27, 0.15, 0.04],
  [0.18, 0.31, 0.09],
  [0.06, 0.11, 0.22],
]

// Forecast vs Actual comparison (from pipeline Section 9)
const forecastVsActual = [
  { i: 1, actualDt: 1.0, forecastDt: 1211.28, diff: -1210.28 },
  { i: 2, actualDt: 4.0, forecastDt: 1480.61, diff: -1476.61 },
  { i: 3, actualDt: 5.0, forecastDt: 1619.54, diff: -1614.54 },
  { i: 4, actualDt: 6.0, forecastDt: 1722.20, diff: -1716.20 },
  { i: 5, actualDt: 7.0, forecastDt: 2424.84, diff: -2417.84 },
  { i: 6, actualDt: 8.0, forecastDt: 2934.18, diff: -2926.18 },
  { i: 7, actualDt: 9.0, forecastDt: 4271.47, diff: -4262.47 },
  { i: 8, actualDt: 11.0, forecastDt: 4709.46, diff: -4698.46 },
  { i: 9, actualDt: 12.0, forecastDt: 5012.15, diff: -5000.15 },
  { i: 10, actualDt: 21.0, forecastDt: 5215.13, diff: -5194.13 },
  { i: 11, actualDt: 22.0, forecastDt: 5280.02, diff: -5258.02 },
  { i: 12, actualDt: 54.0, forecastDt: 5558.15, diff: -5504.15 },
  { i: 13, actualDt: 62.0, forecastDt: 6319.73, diff: -6257.73 },
  { i: 14, actualDt: 150.0, forecastDt: 7069.78, diff: -6919.78 },
  { i: 15, actualDt: 214.0, forecastDt: 8344.19, diff: -8130.19 },
  { i: 16, actualDt: 220.0, forecastDt: 8619.67, diff: -8399.67 },
  { i: 17, actualDt: 221.0, forecastDt: 8732.21, diff: -8511.21 },
  { i: 18, actualDt: 223.0, forecastDt: 9414.92, diff: -9191.92 },
  { i: 19, actualDt: 399.0, forecastDt: 9433.92, diff: -9034.92 },
  { i: 20, actualDt: 2145.0, forecastDt: 9724.63, diff: -7579.63 },
]

// Diagnostics from pipeline
const diagnosticMetrics = [
  { label: "Log-Likelihood", value: "-58,589.63" },
  { label: "AIC", value: "117,185.26" },
  { label: "BIC", value: "117,207.24" },
  { label: "Residuals Mean", value: "1.000076" },
  { label: "Residuals Std Dev", value: "1.075846" },
  { label: "Compensator Ratio", value: "1.0001" },
]

// --- Failure event log -------------------------------------------------------

type FailureSeverity = "critical" | "warning" | "info"

interface FailureEvent {
  id: string
  timestamp: string
  type: string
  severity: FailureSeverity
  message: string
  detail: string
  resolved: boolean
}

const failureEvents: FailureEvent[] = [
  {
    id: "F-001",
    timestamp: "2026-02-18 10:52:11",
    type: "Forecast Accuracy",
    severity: "critical",
    message: "Hawkes forecast MAE = 5,265.20ms vs actual mean gap 189.70ms (27.8x overshoot)",
    detail: "All 20 test-set forecasts overestimate inter-arrival times by orders of magnitude. Mean forecast gap = 5,454.90ms vs mean actual = 189.70ms. Hawkes MAE is 153.7% worse than Poisson baseline.",
    resolved: false,
  },
  {
    id: "F-002",
    timestamp: "2026-02-18 10:51:58",
    type: "Model Comparison",
    severity: "warning",
    message: "Poisson baseline outperforms Hawkes on out-of-sample forecasting",
    detail: "Poisson MAE = 2,075.66ms, RMSE = 2,324.63ms vs Hawkes MAE = 5,265.20ms, RMSE = 5,888.47ms. Despite Hawkes winning on in-sample fit (AIC lower by 25,531), it fails on forward prediction.",
    resolved: false,
  },
  {
    id: "F-003",
    timestamp: "2026-02-18 10:51:34",
    type: "Data Gap",
    severity: "warning",
    message: "Large timestamp gaps detected in trade arrivals",
    detail: "2 gaps exceeding 5.0s threshold: index 337 (5,249ms), index 3715 (5,047ms). May affect intensity estimation near gap boundaries.",
    resolved: false,
  },
  {
    id: "F-004",
    timestamp: "2026-02-18 10:51:34",
    type: "Data Quality",
    severity: "info",
    message: "8,857 duplicate timestamps removed from 20,102 raw trades",
    detail: "Source: bybit/btcusdt/trades_bybit_20260218_105134.846.parquet. Duplicates removed before inter-arrival computation. 11,245 unique arrivals retained.",
    resolved: true,
  },
  {
    id: "F-005",
    timestamp: "2026-02-17 16:42:10",
    type: "MLE Convergence",
    severity: "critical",
    message: "Previous run: MLE failed after 100,000 iterations (gradient norm 3.183e+0)",
    detail: "Resolved by adjusting heuristic initialization. Current run converged in 20,994 iterations.",
    resolved: true,
  },
]

// --- SVG helper components ---------------------------------------------------

function Sparkline({
  data,
  width = 320,
  height = 48,
  color = "#f97316",
  fillOpacity = 0.15,
}: {
  data: number[]
  width?: number
  height?: number
  color?: string
  fillOpacity?: number
}) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * (height - 4) - 2
      return `${x},${y}`
    })
    .join(" ")
  const areaPoints = `0,${height} ${points} ${width},${height}`

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polygon points={areaPoints} fill={color} opacity={fillOpacity} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

function StepChart({
  data,
  width = 600,
  height = 140,
  color = "#f97316",
}: {
  data: number[]
  width?: number
  height?: number
  color?: string
}) {
  const max = Math.max(...data) * 1.1
  const range = max || 1
  const stepW = width / data.length

  const pathParts: string[] = []
  data.forEach((v, i) => {
    const x = i * stepW
    const y = height - (v / range) * (height - 8) - 4
    if (i === 0) pathParts.push(`M ${x},${y}`)
    else pathParts.push(`H ${x} V ${y}`)
  })
  pathParts.push(`H ${width}`)
  const areaPath = pathParts.join(" ") + ` V ${height} H 0 Z`

  const gridLines = [0.25, 0.5, 0.75, 1.0].map((f) => {
    const y = height - f * (height - 8) - 4
    return { y, label: (f * range).toFixed(1) }
  })

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      {gridLines.map((g, i) => (
        <line key={i} x1={0} y1={g.y} x2={width} y2={g.y} stroke="#404040" strokeWidth="0.5" strokeDasharray="4 4" />
      ))}
      <path d={areaPath} fill={color} opacity={0.12} />
      <path d={pathParts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

function ForecastChart({
  history,
  forecast,
  showFailureBand = false,
}: {
  history: number[]
  forecast: number[]
  showFailureBand?: boolean
}) {
  const all = [...history.slice(-20), ...forecast]
  const max = Math.max(...all) * 1.15
  const width = 600
  const height = 140
  const total = history.slice(-20).length + forecast.length
  const stepW = width / total
  const toY = (v: number) => height - (v / max) * (height - 8) - 4

  const histSlice = history.slice(-20)
  let histPath = ""
  histSlice.forEach((v, i) => {
    const x = i * stepW
    const y = toY(v)
    histPath += i === 0 ? `M ${x},${y}` : ` H ${x} V ${y}`
  })

  const fStart = histSlice.length
  let fcPath = `M ${(fStart - 1) * stepW},${toY(histSlice[histSlice.length - 1])}`
  forecast.forEach((v, i) => {
    const x = (fStart + i) * stepW
    fcPath += ` H ${x} V ${toY(v)}`
  })
  fcPath += ` H ${width}`

  const upperBand = forecast.map((v) => v * 1.35)
  const lowerBand = forecast.map((v) => v * 0.7)

  let bandPath = `M ${(fStart - 1) * stepW},${toY(upperBand[0] || forecast[0])}`
  upperBand.forEach((v, i) => {
    bandPath += ` L ${(fStart + i) * stepW},${toY(v)}`
  })
  bandPath += ` L ${width},${toY(upperBand[upperBand.length - 1])}`
  lowerBand.slice().reverse().forEach((v, i) => {
    bandPath += ` L ${(fStart + lowerBand.length - 1 - i) * stepW},${toY(v)}`
  })
  bandPath += " Z"

  const divX = fStart * stepW

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      {[0.25, 0.5, 0.75].map((f, i) => (
        <line key={i} x1={0} y1={height - f * (height - 8) - 4} x2={width} y2={height - f * (height - 8) - 4} stroke="#404040" strokeWidth="0.5" strokeDasharray="4 4" />
      ))}
      <line x1={divX} y1={0} x2={divX} y2={height} stroke="#525252" strokeWidth="1" strokeDasharray="4 2" />
      <path d={bandPath} fill={showFailureBand ? "#ef4444" : "#f97316"} opacity={showFailureBand ? 0.12 : 0.08} />
      <path d={histPath} fill="none" stroke="#ffffff" strokeWidth="1.5" />
      <path d={fcPath} fill="none" stroke={showFailureBand ? "#ef4444" : "#f97316"} strokeWidth="1.5" strokeDasharray="6 3" />
      {showFailureBand && (
        <>
          <line x1={divX} y1={0} x2={divX} y2={height} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2" />
          <text x={divX + 6} y={14} fill="#ef4444" fontSize="10" fontFamily="monospace">DEGRADED</text>
        </>
      )}
    </svg>
  )
}

function FailureTimeline({ events }: { events: FailureEvent[] }) {
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

// ===========================================================================
// Main page component
// ===========================================================================

export default function ModelPage() {
  const [mu, setMu] = useState("3.770e-3")
  const [alpha, setAlpha] = useState("9.425e-4")
  const [beta, setBeta] = useState("4.712e-3")
  const [horizon, setHorizon] = useState("20")
  const [modelStatus, setModelStatus] = useState<"idle" | "running" | "fitted" | "failed">("fitted")

  const handleFit = () => {
    setModelStatus("running")
    setTimeout(() => setModelStatus("fitted"), 1500)
  }

  const activeFailures = failureEvents.filter((e) => !e.resolved)
  const resolvedFailures = failureEvents.filter((e) => e.resolved)
  const criticalCount = activeFailures.filter((e) => e.severity === "critical").length
  const warningCount = activeFailures.filter((e) => e.severity === "warning").length

  // Forecast failure: model converged but forecast accuracy is terrible
  const forecastFailed = true

  const severityIcon = (s: FailureSeverity) => {
    if (s === "critical") return <XCircle className="w-4 h-4 text-red-400 shrink-0" />
    if (s === "warning") return <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
    return <Info className="w-4 h-4 text-blue-400 shrink-0" />
  }

  const severityBadge = (s: FailureSeverity) => {
    if (s === "critical") return <Badge className="bg-red-500/20 text-red-400">CRITICAL</Badge>
    if (s === "warning") return <Badge className="bg-orange-500/20 text-orange-400">WARNING</Badge>
    return <Badge className="bg-blue-500/20 text-blue-400">INFO</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider">HAWKES PROCESS MODEL</h1>
          <p className="text-sm text-neutral-400">
            BTC/USDT market microstructure &middot; bybit &middot; 2026-02-18 10:51 UTC
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge
            className={
              modelStatus === "fitted"
                ? "bg-emerald-500/20 text-emerald-400"
                : modelStatus === "running"
                  ? "bg-orange-500/20 text-orange-400 animate-pulse"
                  : modelStatus === "failed"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-neutral-500/20 text-neutral-300"
            }
          >
            {modelStatus === "fitted" ? "CONVERGED" : modelStatus === "running" ? "FITTING..." : modelStatus === "failed" ? "CONVERGENCE FAILED" : "NOT FITTED"}
          </Badge>
          {forecastFailed && (
            <Badge className="bg-red-500/20 text-red-400">
              <AlertTriangle className="w-3 h-3 mr-1" />
              FORECAST FAILURE
            </Badge>
          )}
          {activeFailures.length > 0 && (
            <Badge className="bg-orange-500/20 text-orange-400">
              {activeFailures.length} ACTIVE {activeFailures.length === 1 ? "ALERT" : "ALERTS"}
            </Badge>
          )}
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={handleFit} disabled={modelStatus === "running"}>
            <Play className="w-4 h-4 mr-2" />
            Fit Model
          </Button>
          <Button variant="outline" className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent" onClick={() => setModelStatus("idle")}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Forecast failure banner */}
      {forecastFailed && (
        <Card className="bg-red-500/5 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-400">Forecast Failure: Hawkes predictions overestimate inter-arrival times by 27.8x</p>
                <p className="text-xs text-neutral-400 mt-1">
                  MAE = 5,265.20ms vs mean actual gap = 189.70ms. Poisson baseline outperforms Hawkes on out-of-sample
                  prediction (Poisson MAE = 2,075.66ms). Despite strong in-sample fit (LR test rejects Poisson at p {"<"} 0.05),
                  the excitation structure does not improve forward forecasting.
                </p>
              </div>
              <Badge className="bg-red-500/20 text-red-400 shrink-0">CRITICAL</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: "STATIONARY RATE", value: "4.714", unit: "ev/s", icon: Activity, change: "", dir: "flat" as const, status: "normal" as const },
          { label: "BRANCHING RATIO", value: "0.531", unit: "", icon: Zap, change: "stable", dir: "flat" as const, status: "normal" as const },
          { label: "MEAN GAP", value: "212.15", unit: "ms", icon: Clock, change: "", dir: "flat" as const, status: "normal" as const },
          { label: "ITERATIONS", value: "20,994", unit: "", icon: BarChart3, change: "converged", dir: "up" as const, status: "normal" as const },
          { label: "FORECAST MAE", value: "5,265", unit: "ms", icon: TrendingUp, change: "27.8x actual", dir: "up" as const, status: "critical" as const },
          { label: "ACTIVE ALERTS", value: `${activeFailures.length}`, unit: "", icon: AlertTriangle, change: criticalCount > 0 ? `${criticalCount} critical` : "", dir: "up" as const, status: (criticalCount > 0 ? "critical" : warningCount > 0 ? "warning" : "normal") as "critical" | "warning" | "normal" },
        ].map((kpi) => (
          <Card key={kpi.label} className={`bg-neutral-900 ${kpi.status === "critical" ? "border-red-500/40" : kpi.status === "warning" ? "border-orange-500/40" : "border-neutral-700"}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-400 tracking-wider">{kpi.label}</p>
                  <p className={`text-2xl font-bold font-mono ${kpi.status === "critical" ? "text-red-400" : "text-white"}`}>
                    {kpi.value}
                    {kpi.unit && <span className="text-xs text-neutral-500 ml-1">{kpi.unit}</span>}
                  </p>
                  {kpi.change && (
                    <span className={`text-xs font-mono ${kpi.status === "critical" ? "text-red-400" : kpi.dir === "up" ? "text-emerald-400" : kpi.dir === "down" ? "text-red-400" : "text-neutral-500"}`}>
                      {kpi.status !== "critical" && kpi.dir === "up" && <ArrowUpRight className="inline w-3 h-3 mr-0.5" />}
                      {kpi.status !== "critical" && kpi.dir === "down" && <ArrowDownRight className="inline w-3 h-3 mr-0.5" />}
                      {kpi.status !== "critical" && kpi.dir === "flat" && <Minus className="inline w-3 h-3 mr-0.5" />}
                      {kpi.status === "critical" && <XCircle className="inline w-3 h-3 mr-0.5" />}
                      {kpi.change}
                    </span>
                  )}
                </div>
                <kpi.icon className={`w-8 h-8 ${kpi.status === "critical" ? "text-red-500/40" : "text-neutral-600"}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main tabs */}
      <Tabs defaultValue="parameters" className="space-y-4">
        <TabsList className="bg-neutral-800 border border-neutral-700">
          <TabsTrigger value="parameters" className="text-neutral-400 data-[state=active]:bg-orange-500 data-[state=active]:text-white">Parameters</TabsTrigger>
          <TabsTrigger value="intensity" className="text-neutral-400 data-[state=active]:bg-orange-500 data-[state=active]:text-white">Intensity</TabsTrigger>
          <TabsTrigger value="forecast" className="text-neutral-400 data-[state=active]:bg-orange-500 data-[state=active]:text-white relative">
            Forecast
            {forecastFailed && <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full">!</span>}
          </TabsTrigger>
          <TabsTrigger value="comparison" className="text-neutral-400 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <GitCompareArrows className="w-3.5 h-3.5 mr-1.5" />
            Hawkes vs Poisson
          </TabsTrigger>
          <TabsTrigger value="failures" className="text-neutral-400 data-[state=active]:bg-orange-500 data-[state=active]:text-white relative">
            Failures
            {activeFailures.length > 0 && <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full">{activeFailures.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="events" className="text-neutral-400 data-[state=active]:bg-orange-500 data-[state=active]:text-white">Events</TabsTrigger>
        </TabsList>

        {/* ---- PARAMETERS TAB ---- */}
        <TabsContent value="parameters">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input parameters */}
            <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">INPUT PARAMETERS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { label: "BASELINE INTENSITY (mu)", value: mu, setter: setMu, hint: "Background event arrival rate (ev/ms)" },
                    { label: "EXCITATION (alpha)", value: alpha, setter: setAlpha, hint: "Jump size of intensity per event" },
                    { label: "DECAY RATE (beta)", value: beta, setter: setBeta, hint: "Exponential decay speed of excitation (1/ms)" },
                    { label: "FORECAST HORIZON (steps)", value: horizon, setter: setHorizon, hint: "Number of forward inter-arrivals to predict" },
                  ].map((p) => (
                    <div key={p.label}>
                      <label className="text-xs text-neutral-400 tracking-wider block mb-1">{p.label}</label>
                      <Input value={p.value} onChange={(e) => p.setter(e.target.value)} className="bg-neutral-800 border-neutral-600 text-white font-mono" />
                      <p className="text-xs text-neutral-500 mt-1">{p.hint}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t border-neutral-700">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white flex-1" onClick={handleFit} disabled={modelStatus === "running"}>
                    <Play className="w-4 h-4 mr-2" />Fit Model
                  </Button>
                  <Button variant="outline" className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent" onClick={() => { setMu("3.770e-3"); setAlpha("9.425e-4"); setBeta("4.712e-3"); setHorizon("20") }}>
                    Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Estimation results */}
            <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">ESTIMATION RESULTS</CardTitle>
                  <Badge className="bg-emerald-500/20 text-emerald-400">CONVERGED</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { param: "mu (ev/ms)", est: "0.00221043", desc: "Baseline intensity" },
                    { param: "alpha", est: "0.05237599", desc: "Excitation magnitude" },
                    { param: "beta (1/ms)", est: "0.09862705", desc: "Decay rate" },
                  ].map((row) => (
                    <div key={row.param} className="p-3 bg-neutral-800 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-orange-500 font-mono font-bold">{row.param}</span>
                        <span className="text-sm text-white font-mono font-bold">{row.est}</span>
                      </div>
                      <p className="text-xs text-neutral-500">{row.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-neutral-700">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">Branching Ratio (alpha/beta)</span>
                    <span className="text-white font-mono font-bold">0.531051</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: "53.1%" }} />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">{"< 1.0 indicates a stationary (stable) process"}</p>
                </div>
                <div className="pt-3 border-t border-neutral-700 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Iterations</span>
                    <span className="text-emerald-400 font-mono">20,994</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Converged</span>
                    <span className="text-emerald-400 font-mono">true</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Stationary Rate (ev/ms)</span>
                    <span className="text-white font-mono">0.00471358</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Stationary Mean Gap</span>
                    <span className="text-white font-mono">212.153 ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagnostics + Data Pipeline */}
            <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">DIAGNOSTICS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {diagnosticMetrics.map((m) => (
                    <div key={m.label} className="flex justify-between text-xs">
                      <span className="text-neutral-400">{m.label}</span>
                      <span className="text-white font-mono">{m.value}</span>
                    </div>
                  ))}
                </div>
                <div className="p-2 bg-emerald-500/5 border border-emerald-500/20 rounded">
                  <p className="text-xs text-emerald-400">
                    Residuals mean = 1.000 and compensator ratio = 1.0001, consistent with Exp(1) under correct specification.
                  </p>
                </div>
                <div className="pt-3 border-t border-neutral-700">
                  <p className="text-xs text-neutral-400 tracking-wider mb-2">BRANCHING MATRIX</p>
                  <div className="space-y-1">
                    <div className="flex gap-1 text-xs text-neutral-500 pl-14">
                      <span className="w-14 text-center">Buy</span>
                      <span className="w-14 text-center">Sell</span>
                      <span className="w-14 text-center">Cancel</span>
                    </div>
                    {["Buy", "Sell", "Cancel"].map((label, i) => (
                      <div key={label} className="flex items-center gap-1">
                        <span className="text-xs text-neutral-500 w-14 text-right pr-2">{label}</span>
                        {branchingMatrix[i].map((v, j) => (
                          <div key={j} className="w-14 h-8 flex items-center justify-center rounded text-xs font-mono" style={{ backgroundColor: `rgba(249, 115, 22, ${v * 0.8})`, color: v > 0.25 ? "#fff" : "#a3a3a3" }}>
                            {v.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-3 border-t border-neutral-700 space-y-2">
                  <p className="text-xs text-neutral-400 tracking-wider">DATA PIPELINE</p>
                  {[
                    { label: "Source", value: "bybit/btcusdt" },
                    { label: "Raw Trades", value: "20,102" },
                    { label: "Duplicates Removed", value: "8,857" },
                    { label: "Unique Arrivals", value: "11,245" },
                    { label: "Training Set", value: "11,225" },
                    { label: "Test Set", value: "20" },
                    { label: "Observation Window", value: "2,383.9s" },
                    { label: "Large Gaps (>5s)", value: "2" },
                  ].map((s) => (
                    <div key={s.label} className="flex justify-between text-xs">
                      <span className="text-neutral-400">{s.label}</span>
                      <span className="text-white font-mono">{s.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- INTENSITY TAB ---- */}
        <TabsContent value="intensity">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Conditional Intensity Function — Hawkes λ(t) */}
            <Card className="lg:col-span-8 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
                    CONDITIONAL INTENSITY FUNCTION
                  </CardTitle>
                  <div className="flex gap-2">
                    <span className="text-[10px] tracking-wider text-orange-500 bg-orange-500/10 border border-orange-500/25 px-2.5 py-0.5 rounded">
                      LIVE
                    </span>
                    <span className="text-[10px] tracking-wider text-neutral-400 bg-neutral-400/10 border border-neutral-400/20 px-2.5 py-0.5 rounded">
                      λ(t)
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  // ── DATA VARIABLES ─────────────────────────────────
                  // Replace these with your live data source.
                  // Everything below reads ONLY from these variables.

                  // Fine grid: smooth continuous curve
                  const tGrid = Array.from({ length: 801 }, (_, i) => i * 0.05)
                  const lambdaGrid = tGrid.map(t => {
                    // Placeholder: synthetic Hawkes intensity
                    const events = [1.2, 2.1, 4.5, 4.8, 5.2, 9.3, 10.1, 10.5, 10.8, 11.2, 11.5, 16.4, 17.1, 20.2, 20.5, 20.8, 21.1, 21.4, 21.8, 22.3, 27.5, 28.1, 28.4, 31.2, 31.5, 31.8, 32.3, 36.8, 37.2, 38.5, 39.1, 39.3, 39.5, 39.7, 39.9]
                    let lam = 0.3
                    for (const ti of events) { if (ti < t) lam += 0.8 * Math.exp(-1.2 * (t - ti)) }
                    return lam
                  })

                  // Integer-period samples for data point markers
                  const sampleEvents = [1.2, 2.1, 4.5, 4.8, 5.2, 9.3, 10.1, 10.5, 10.8, 11.2, 11.5, 16.4, 17.1, 20.2, 20.5, 20.8, 21.1, 21.4, 21.8, 22.3, 27.5, 28.1, 28.4, 31.2, 31.5, 31.8, 32.3, 36.8, 37.2, 38.5, 39.1, 39.3, 39.5, 39.7, 39.9]
                  const T_MAX = 40
                  const intT = Array.from({ length: T_MAX }, (_, i) => i)
                  const intLambda = intT.map(t => {
                    const mid = t + 0.5
                    let lam = 0.3
                    for (const ti of sampleEvents) { if (ti < mid) lam += 0.8 * Math.exp(-1.2 * (mid - ti)) }
                    return lam
                  })
                  const intEvents = intT.map(t =>
                    sampleEvents.filter(e => e >= t && e < t + 1).length
                  )

                  // Heatstrip (high-res sampling)
                  const heatRes = 400
                  const heatT = Array.from({ length: heatRes }, (_, i) => (i / heatRes) * T_MAX)
                  const heatLambda = heatT.map(t => {
                    let lam = 0.3
                    for (const ti of sampleEvents) { if (ti < t) lam += 0.8 * Math.exp(-1.2 * (t - ti)) }
                    return lam
                  })

                  // Kernel traces (first 20 events)
                  const kernelData = sampleEvents.slice(0, 20).map(ti => ({
                    x: tGrid,
                    y: tGrid.map(t => t < ti ? null : 0.8 * Math.exp(-1.2 * (t - ti))),
                    type: "scatter" as const,
                    mode: "lines" as const,
                    line: { color: "rgba(249, 115, 22, 0.22)", width: 1.0 },
                    connectgaps: false,
                    showlegend: false,
                    hoverinfo: "skip" as const,
                    xaxis: "x",
                    yaxis: "y",
                  }))

                  // ── COMPUTED STATS ─────────────────────────────────
                  const peak = Math.max(...lambdaGrid)
                  const mean = lambdaGrid.reduce((a, b) => a + b, 0) / lambdaGrid.length
                  const totalEvents = intEvents.reduce((a, b) => a + b, 0)

                  // ── THEME ──────────────────────────────────────────
                  const orange = "#f97316"
                  const font = { family: "monospace", color: "#737373", size: 11 }
                  const gridColor = "rgba(64, 64, 64, 0.25)"

                  // ── TRACES ─────────────────────────────────────────
                  const traces: any[] = [
                    // Heatstrip (top panel)
                    {
                      x: heatT,
                      y: [""],
                      z: [heatLambda],
                      type: "heatmap",
                      colorscale: [
                        [0, "#111111"], [0.1, "#1f1108"], [0.25, "#3d1f0a"],
                        [0.4, "#6b3410"], [0.55, "#b45309"], [0.7, "#f97316"],
                        [0.85, "#fb923c"], [1.0, "#fdba74"],
                      ],
                      showscale: false,
                      hovertemplate: "t = %{x:.1f}   λ = %{z:.2f}<extra></extra>",
                      xaxis: "x",
                      yaxis: "y2",
                    },
                    // Kernel traces
                    ...kernelData,
                    // Smooth λ(t) curve
                    {
                      x: tGrid,
                      y: lambdaGrid,
                      type: "scatter",
                      mode: "lines",
                      fill: "tozeroy",
                      fillcolor: "rgba(249, 115, 22, 0.06)",
                      line: { color: orange, width: 2 },
                      name: "λ(t)",
                      hoverinfo: "skip",
                      xaxis: "x",
                      yaxis: "y",
                    },
                    // Data point markers at integer t
                    {
                      x: intT,
                      y: intLambda,
                      customdata: intT.map((_, i) => [intEvents[i]]),
                      type: "scatter",
                      mode: "markers",
                      marker: {
                        size: 5,
                        color: orange,
                        symbol: "circle",
                        line: { width: 1, color: "#171717" },
                      },
                      name: "Samples",
                      hovertemplate:
                        "<b>t</b> = %{x}" +
                        "<br><b>λ</b> = %{y:.3f}" +
                        "<br><b>events</b> = %{customdata[0]}" +
                        "<extra></extra>",
                      xaxis: "x",
                      yaxis: "y",
                    },
                  ]

                  const tickVals = Array.from({ length: 9 }, (_, i) => i * 5)

                  return (
                    <>
                      <PlotlyChart
                        data={traces}
                        layout={{
                          autosize: true,
                          height: 320,
                          paper_bgcolor: "transparent",
                          plot_bgcolor: "transparent",
                          font: font,
                          showlegend: false,
                          hovermode: "closest",
                          hoverlabel: {
                            bgcolor: "#1a1a1a",
                            bordercolor: orange,
                            font: { color: "#e5e5e5", family: "monospace", size: 11 },
                          },
                          margin: { l: 45, r: 20, t: 8, b: 35 },
                          xaxis: {
                            showgrid: true,
                            gridcolor: gridColor,
                            gridwidth: 1,
                            zeroline: false,
                            range: [0, T_MAX],
                            tickfont: font,
                            tickvals: tickVals,
                            ticktext: tickVals.map(v => `t=${v}`),
                            domain: [0, 1],
                            anchor: "y",
                          },
                          yaxis: {
                            showgrid: true,
                            gridcolor: gridColor,
                            gridwidth: 1,
                            zeroline: false,
                            range: [0, peak * 1.15],
                            tickfont: font,
                            title: { text: "λ(t)", font: { ...font, size: 10, color: "#525252" }, standoff: 8 },
                            domain: [0, 0.72],
                          },
                          yaxis2: {
                            domain: [0.80, 1.0],
                            showgrid: false,
                            showticklabels: false,
                            zeroline: false,
                            fixedrange: true,
                          },
                          annotations: [
                            {
                              x: 0.005, y: 0.78, xref: "paper", yref: "paper",
                              text: [
                                `<span style="color:${orange}"><b>━</b></span> λ(t)`,
                                `<span style="color:rgba(249,115,22,0.35)"><b>━</b></span> kernels`,
                                `<span style="color:${orange}"><b>●</b></span> t, λ, events`,
                                `<b>▓</b> intensity`,
                              ].join("    "),
                              showarrow: false,
                              font: { family: "monospace", size: 10, color: "#525252" },
                              xanchor: "left",
                            },
                          ],
                        }}
                        config={{ displayModeBar: false, responsive: true }}
                        style={{ width: "100%", height: "320px" }}
                      />
                      <div className="flex gap-6 mt-2 text-[10px] tracking-wider text-neutral-600 font-mono">
                        <span>μ = <span className="text-neutral-500">0.3</span></span>
                        <span>α = <span className="text-neutral-500">0.8</span></span>
                        <span>β = <span className="text-neutral-500">1.2</span></span>
                        <span>Peak: <span className="text-neutral-500">{peak.toFixed(2)}</span></span>
                        <span>Mean: <span className="text-neutral-500">{mean.toFixed(2)}</span></span>
                        <span>Events: <span className="text-neutral-500">{totalEvents}</span></span>
                      </div>
                    </>
                  )
                })()}
              </CardContent>
            </Card>

            <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">INTERARRIVAL STATISTICS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Count (gaps)", value: "11,224", unit: "" },
                  { label: "Mean", value: "212.205", unit: "ms" },
                  { label: "Std Deviation", value: "432.488", unit: "ms" },
                  { label: "Variance", value: "187,045.70", unit: "ms\u00B2" },
                  { label: "Min", value: "1.000", unit: "ms" },
                  { label: "Max", value: "5,249.000", unit: "ms" },
                  { label: "Skewness", value: "3.8572", unit: "" },
                  { label: "Excess Kurtosis", value: "21.4833", unit: "" },
                  { label: "CV (sigma/mu)", value: "2.0381", unit: "" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">{s.label}</span>
                    <span className="text-white font-mono font-bold">{s.value}{s.unit && <span className="text-neutral-500 ml-1 font-normal">{s.unit}</span>}</span>
                  </div>
                ))}
                <div className="pt-3 border-t border-neutral-700">
                  <div className="p-2 bg-orange-500/5 border border-orange-500/20 rounded">
                    <p className="text-xs text-orange-400">CV &gt; 1 indicates clustering (super-Poisson), consistent with Hawkes excitation.</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-neutral-700">
                  <p className="text-xs text-neutral-400 mb-2">MINI SPARKLINE</p>
                  <Sparkline data={intensityTimeSeries} width={240} height={32} />
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* ---- FORECAST TAB ---- */}
        <TabsContent value="forecast">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className={`lg:col-span-8 bg-neutral-900 ${forecastFailed ? "border-red-500/30" : "border-neutral-700"}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">FORECAST vs ACTUAL COMPARISON</CardTitle>
                  <div className="flex items-center gap-2">
                    {forecastFailed && <Badge className="bg-red-500/20 text-red-400">DEGRADED</Badge>}
                    <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-orange-500 h-7 w-7"><Download className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {forecastFailed && (
                  <div className="p-3 bg-red-500/5 border border-red-500/20 rounded mb-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <p className="text-xs text-red-400">
                        Forecast massively overestimates inter-arrival times. Mean forecast gap = 5,454.90ms vs mean actual = 189.70ms.
                      </p>
                    </div>
                  </div>
                )}
                {/* Forecast vs Actual table */}
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-xs">
                    <thead className="sticky top-0 bg-neutral-900">
                      <tr className="text-neutral-500 border-b border-neutral-700">
                        <th className="text-left py-2 pr-4 font-medium">STEP</th>
                        <th className="text-right py-2 pr-4 font-medium">ACTUAL (ms)</th>
                        <th className="text-right py-2 pr-4 font-medium">FORECAST (ms)</th>
                        <th className="text-right py-2 font-medium">DIFF (ms)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecastVsActual.map((row) => (
                        <tr key={row.i} className="border-b border-neutral-800 hover:bg-neutral-800 transition-colors">
                          <td className="py-1.5 pr-4 text-neutral-400 font-mono">{row.i}</td>
                          <td className="py-1.5 pr-4 text-right text-white font-mono">{row.actualDt.toFixed(1)}</td>
                          <td className="py-1.5 pr-4 text-right text-orange-400 font-mono">{row.forecastDt.toFixed(2)}</td>
                          <td className={`py-1.5 text-right font-mono ${row.diff < 0 ? "text-red-400" : "text-emerald-400"}`}>{row.diff.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="h-36 relative mt-4">
                  <ForecastChart history={intensityTimeSeries} forecast={forecastSeries} showFailureBand={forecastFailed} />
                </div>
                <div className="flex justify-between text-xs text-neutral-500 mt-2 font-mono">
                  <span>t-20</span><span>t (now)</span><span>t+{horizon}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">FORECAST ERROR METRICS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "MAE", value: "5,265.20", unit: "ms", critical: true },
                  { label: "RMSE", value: "5,888.47", unit: "ms", critical: true },
                  { label: "Mean Actual Gap", value: "189.70", unit: "ms", critical: false },
                  { label: "Mean Forecast Gap", value: "5,454.90", unit: "ms", critical: true },
                  { label: "Overestimation Factor", value: "28.8x", unit: "", critical: true },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-neutral-400">{item.label}</span>
                    <span className={`font-mono font-bold ${item.critical ? "text-red-400" : "text-white"}`}>
                      {item.value}{item.unit && <span className="text-neutral-500 ml-1 font-normal">{item.unit}</span>}
                    </span>
                  </div>
                ))}

                <div className="pt-3 border-t border-neutral-700">
                  <div className="p-3 bg-red-500/5 border border-red-500/20 rounded space-y-2">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-xs text-red-400 font-medium">FORECAST UNRELIABLE</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      All 20 test predictions overestimate the true inter-arrival times. The Hawkes model captures in-sample clustering
                      but fails to generalize out-of-sample for this test window.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-700 space-y-2">
                  <p className="text-xs text-neutral-400 tracking-wider">COMPENSATOR DIAGNOSTIC</p>
                  {[
                    { label: "Lambda(T) at last train", value: "11,224.86" },
                    { label: "Expected (n-1)", value: "11,224" },
                    { label: "Ratio Lambda(T)/(n-1)", value: "1.0001" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-xs">
                      <span className="text-neutral-400">{row.label}</span>
                      <span className="text-white font-mono">{row.value}</span>
                    </div>
                  ))}
                  <div className="p-2 bg-emerald-500/5 border border-emerald-500/20 rounded">
                    <p className="text-xs text-emerald-400">Ratio near 1.0 confirms correct in-sample specification.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- HAWKES vs POISSON TAB ---- */}
        <TabsContent value="comparison">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Model comparison table */}
            <Card className="lg:col-span-8 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">MODEL COMPARISON: HAWKES vs POISSON</CardTitle>
                  <Badge className="bg-orange-500/20 text-orange-400">SECTION 14-17</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* In-sample comparison */}
                <div>
                  <p className="text-xs text-neutral-400 tracking-wider mb-3">IN-SAMPLE FIT</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-neutral-500 border-b border-neutral-700">
                          <th className="text-left py-2 pr-4 font-medium">METRIC</th>
                          <th className="text-right py-2 pr-4 font-medium">HAWKES</th>
                          <th className="text-right py-2 pr-4 font-medium">POISSON</th>
                          <th className="text-right py-2 font-medium">DELTA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { metric: "Log-Likelihood", hawkes: "-58,589.63", poisson: "-71,357.18", delta: "+12,767.55", favor: "hawkes" },
                          { metric: "AIC", hawkes: "117,185.26", poisson: "142,716.36", delta: "-25,531.10", favor: "hawkes" },
                          { metric: "BIC", hawkes: "117,207.24", poisson: "142,723.69", delta: "-25,516.45", favor: "hawkes" },
                          { metric: "Parameters", hawkes: "3", poisson: "1", delta: "+2", favor: "neutral" },
                          { metric: "Residuals Mean", hawkes: "1.0001", poisson: "1.0000", delta: "+0.0001", favor: "neutral" },
                          { metric: "Residuals Std Dev", hawkes: "1.0758", poisson: "2.0381", delta: "-0.9623", favor: "hawkes" },
                        ].map((row) => (
                          <tr key={row.metric} className="border-b border-neutral-800">
                            <td className="py-2 pr-4 text-neutral-300">{row.metric}</td>
                            <td className={`py-2 pr-4 text-right font-mono ${row.favor === "hawkes" ? "text-emerald-400" : "text-white"}`}>{row.hawkes}</td>
                            <td className={`py-2 pr-4 text-right font-mono ${row.favor === "poisson" ? "text-emerald-400" : "text-white"}`}>{row.poisson}</td>
                            <td className="py-2 text-right font-mono text-neutral-400">{row.delta}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 p-2 bg-emerald-500/5 border border-emerald-500/20 rounded">
                    <p className="text-xs text-emerald-400">AIC and BIC both favor Hawkes by &gt;25,000. In-sample fit is significantly better.</p>
                  </div>
                </div>

                {/* Likelihood Ratio Test */}
                <div className="pt-3 border-t border-neutral-700">
                  <p className="text-xs text-neutral-400 tracking-wider mb-3">LIKELIHOOD RATIO TEST</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "LR Statistic", value: "25,535.10" },
                      { label: "Degrees of Freedom", value: "2" },
                      { label: "Critical Value (5%)", value: "5.991" },
                      { label: "Decision", value: "REJECT H\u2080" },
                    ].map((s) => (
                      <div key={s.label} className="p-3 bg-neutral-800 rounded">
                        <p className="text-xs text-neutral-500 mb-1">{s.label}</p>
                        <p className={`text-sm font-mono font-bold ${s.label === "Decision" ? "text-emerald-400" : "text-white"}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-2 bg-emerald-500/5 border border-emerald-500/20 rounded">
                    <p className="text-xs text-emerald-400">
                      LR = 25,535.10 &gt;&gt; 5.991: Hawkes excitation is statistically significant at the 5% level.
                    </p>
                  </div>
                </div>

                {/* Out-of-sample forecast comparison */}
                <div className="pt-3 border-t border-neutral-700">
                  <p className="text-xs text-neutral-400 tracking-wider mb-3">OUT-OF-SAMPLE FORECAST (20 steps)</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-neutral-500 border-b border-neutral-700">
                          <th className="text-left py-2 pr-4 font-medium">METRIC</th>
                          <th className="text-right py-2 pr-4 font-medium">HAWKES</th>
                          <th className="text-right py-2 pr-4 font-medium">POISSON</th>
                          <th className="text-right py-2 font-medium">WINNER</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { metric: "MAE (ms)", hawkes: "5,265.20", poisson: "2,075.66", winner: "Poisson" },
                          { metric: "RMSE (ms)", hawkes: "5,888.47", poisson: "2,324.63", winner: "Poisson" },
                          { metric: "Mean Forecast Gap (ms)", hawkes: "5,454.90", poisson: "2,265.36", winner: "Poisson" },
                          { metric: "Mean Actual Gap (ms)", hawkes: "189.70", poisson: "189.70", winner: "-" },
                        ].map((row) => (
                          <tr key={row.metric} className="border-b border-neutral-800">
                            <td className="py-2 pr-4 text-neutral-300">{row.metric}</td>
                            <td className={`py-2 pr-4 text-right font-mono ${row.winner === "Hawkes" ? "text-emerald-400" : row.winner === "Poisson" ? "text-red-400" : "text-white"}`}>{row.hawkes}</td>
                            <td className={`py-2 pr-4 text-right font-mono ${row.winner === "Poisson" ? "text-emerald-400" : row.winner === "Hawkes" ? "text-red-400" : "text-white"}`}>{row.poisson}</td>
                            <td className="py-2 text-right">
                              {row.winner !== "-" ? (
                                <Badge className={row.winner === "Poisson" ? "bg-blue-500/20 text-blue-400" : "bg-orange-500/20 text-orange-400"}>{row.winner}</Badge>
                              ) : (
                                <span className="text-neutral-500 font-mono">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-red-400 font-medium">Hawkes MAE is 153.7% worse than Poisson</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          Despite capturing statistically significant excitation in-sample, the Hawkes model over-projects
                          clustering into the forecast window. The simpler Poisson model provides more accurate point forecasts
                          for this test period.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Side panel: Poisson baseline details */}
            <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">POISSON BASELINE</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-neutral-400 tracking-wider">ESTIMATION</p>
                  {[
                    { label: "Lambda (ev/ms)", value: "0.00471242" },
                    { label: "Mean Gap (ms)", value: "212.205185" },
                    { label: "Log-Likelihood", value: "-71,357.18" },
                    { label: "AIC", value: "142,716.36" },
                    { label: "BIC", value: "142,723.69" },
                    { label: "Parameters", value: "1" },
                  ].map((s) => (
                    <div key={s.label} className="flex justify-between text-xs">
                      <span className="text-neutral-400">{s.label}</span>
                      <span className="text-white font-mono">{s.value}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-neutral-700 space-y-2">
                  <p className="text-xs text-neutral-400 tracking-wider">GOODNESS-OF-FIT</p>
                  {[
                    { label: "Residuals Count", value: "11,224" },
                    { label: "Residuals Mean", value: "1.000000" },
                    { label: "Residuals Std Dev", value: "2.038064" },
                  ].map((s) => (
                    <div key={s.label} className="flex justify-between text-xs">
                      <span className="text-neutral-400">{s.label}</span>
                      <span className="text-white font-mono">{s.value}</span>
                    </div>
                  ))}
                  <div className="p-2 bg-orange-500/5 border border-orange-500/20 rounded">
                    <p className="text-xs text-orange-400">
                      Poisson residuals std = 2.038 (expected 1.0 under correct specification). The high std suggests the Poisson model
                      is misspecified in-sample despite better forecasting.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-700 space-y-2">
                  <p className="text-xs text-neutral-400 tracking-wider">KEY TAKEAWAY</p>
                  <div className="p-3 bg-neutral-800 rounded space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-xs text-emerald-400">In-sample: Hawkes wins</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="text-xs text-red-400">Out-of-sample: Poisson wins</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-2">
                      This suggests the excitation structure may be overfitting to in-sample clustering patterns
                      that do not persist into the test window.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-700">
                  <p className="text-xs text-neutral-400 mb-2">HAWKES IMPROVEMENT OVER POISSON</p>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">MAE</span>
                        <span className="text-red-400 font-mono font-bold">-153.7%</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: "100%" }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-neutral-400">RMSE</span>
                        <span className="text-red-400 font-mono font-bold">-153.3%</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-1.5">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: "100%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- FAILURES TAB ---- */}
        <TabsContent value="failures">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-8 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">FAILURE EVENT LOG</CardTitle>
                  <div className="flex gap-2">
                    {criticalCount > 0 && <Badge className="bg-red-500/20 text-red-400">{criticalCount} CRITICAL</Badge>}
                    {warningCount > 0 && <Badge className="bg-orange-500/20 text-orange-400">{warningCount} WARNING</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeFailures.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-red-400 tracking-wider font-medium">ACTIVE FAILURES</p>
                    {activeFailures.map((evt) => (
                      <div key={evt.id} className={`p-4 rounded border ${evt.severity === "critical" ? "bg-red-500/5 border-red-500/20" : "bg-orange-500/5 border-orange-500/20"}`}>
                        <div className="flex items-start gap-3">
                          {severityIcon(evt.severity)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-mono text-neutral-500">{evt.id}</span>
                              {severityBadge(evt.severity)}
                              <Badge className="bg-neutral-800 text-neutral-300">{evt.type}</Badge>
                            </div>
                            <p className="text-sm text-white mb-1">{evt.message}</p>
                            <p className="text-xs text-neutral-400">{evt.detail}</p>
                            <p className="text-xs text-neutral-500 font-mono mt-2">{evt.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {resolvedFailures.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-neutral-700">
                    <p className="text-xs text-neutral-500 tracking-wider font-medium">RESOLVED</p>
                    {resolvedFailures.map((evt) => (
                      <div key={evt.id} className="p-4 rounded border bg-neutral-800/50 border-neutral-700 opacity-70">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-mono text-neutral-500">{evt.id}</span>
                              {severityBadge(evt.severity)}
                              <Badge className="bg-neutral-800 text-neutral-400">{evt.type}</Badge>
                              <Badge className="bg-emerald-500/20 text-emerald-400">RESOLVED</Badge>
                            </div>
                            <p className="text-sm text-neutral-300 mb-1">{evt.message}</p>
                            <p className="text-xs text-neutral-500">{evt.detail}</p>
                            <p className="text-xs text-neutral-600 font-mono mt-2">{evt.timestamp}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">FAILURE SUMMARY</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {[
                    { label: "Total Events", value: failureEvents.length, color: "text-white" },
                    { label: "Active", value: activeFailures.length, color: "text-red-400" },
                    { label: "Resolved", value: resolvedFailures.length, color: "text-emerald-400" },
                    { label: "Critical", value: failureEvents.filter((e) => e.severity === "critical").length, color: "text-red-400" },
                    { label: "Warnings", value: failureEvents.filter((e) => e.severity === "warning").length, color: "text-orange-400" },
                    { label: "Informational", value: failureEvents.filter((e) => e.severity === "info").length, color: "text-blue-400" },
                  ].map((s) => (
                    <div key={s.label} className="flex justify-between text-xs">
                      <span className="text-neutral-400">{s.label}</span>
                      <span className={`font-mono font-bold ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-neutral-700 space-y-3">
                  <p className="text-xs text-neutral-400 tracking-wider">SEVERITY DISTRIBUTION</p>
                  {[
                    { label: "Critical", count: failureEvents.filter((e) => e.severity === "critical").length, total: failureEvents.length, color: "bg-red-500" },
                    { label: "Warning", count: failureEvents.filter((e) => e.severity === "warning").length, total: failureEvents.length, color: "bg-orange-500" },
                    { label: "Info", count: failureEvents.filter((e) => e.severity === "info").length, total: failureEvents.length, color: "bg-blue-500" },
                  ].map((d) => (
                    <div key={d.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-300">{d.label}</span>
                        <span className="text-white font-mono">{d.count}</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-1.5">
                        <div className={`${d.color} h-1.5 rounded-full`} style={{ width: `${(d.count / d.total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-neutral-700">
                  <p className="text-xs text-neutral-400 tracking-wider mb-2">FAILURE TIMELINE</p>
                  <FailureTimeline events={failureEvents} />
                  <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Critical</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Warning</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Info</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- EVENTS TAB ---- */}
        <TabsContent value="events">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-8 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">ORDER BOOK EVENT STREAM</CardTitle>
                  <Badge className="bg-emerald-500/20 text-emerald-400 animate-pulse">STREAMING</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-neutral-500 border-b border-neutral-700">
                        <th className="text-left py-2 pr-4 font-medium">TIMESTAMP</th>
                        <th className="text-left py-2 pr-4 font-medium">SIDE</th>
                        <th className="text-right py-2 pr-4 font-medium">PRICE</th>
                        <th className="text-right py-2 pr-4 font-medium">SIZE</th>
                        <th className="text-right py-2 font-medium">INTENSITY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventTimestamps.map((evt, i) => (
                        <tr key={i} className="border-b border-neutral-800 hover:bg-neutral-800 transition-colors">
                          <td className="py-2 pr-4 text-neutral-300 font-mono">{evt.time}</td>
                          <td className="py-2 pr-4">
                            <Badge className={evt.type === "buy" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>
                              {evt.type.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-2 pr-4 text-right text-white font-mono">{evt.price.toFixed(2)}</td>
                          <td className="py-2 pr-4 text-right text-neutral-300 font-mono">{evt.size.toFixed(3)}</td>
                          <td className="py-2 text-right">
                            <span className={`font-mono ${evt.intensity > 1.2 ? "text-orange-400" : evt.intensity > 0.8 ? "text-white" : "text-neutral-400"}`}>
                              {evt.intensity.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">EVENT DISTRIBUTION</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-xs text-neutral-400 tracking-wider">BY EVENT TYPE</p>
                  {[
                    { type: "Buy Orders", count: 5846, pct: 52 },
                    { type: "Sell Orders", count: 4521, pct: 40 },
                    { type: "Cancellations", count: 878, pct: 8 },
                  ].map((d) => (
                    <div key={d.type} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-300">{d.type}</span>
                        <span className="text-white font-mono">{d.count.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-1.5">
                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${d.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-neutral-700 space-y-2">
                  <p className="text-xs text-neutral-400 tracking-wider">INTER-ARRIVAL TIMES</p>
                  {[
                    { label: "Mean", value: "212.21ms" },
                    { label: "Median", value: "98.00ms" },
                    { label: "Min", value: "1.00ms" },
                    { label: "Max", value: "5,249ms" },
                    { label: "Skewness", value: "3.8572" },
                  ].map((s) => (
                    <div key={s.label} className="flex justify-between text-xs">
                      <span className="text-neutral-400">{s.label}</span>
                      <span className="text-white font-mono">{s.value}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-neutral-700">
                  <p className="text-xs text-neutral-400 mb-2">ARRIVAL RATE (1 min)</p>
                  <Sparkline data={intensityTimeSeries.slice(0, 20)} width={240} height={32} color="#f97316" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
