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
} from "lucide-react"

// --- Dummy data -----------------------------------------------------------

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

const eventTimestamps = [
  { time: "09:30:01.234", type: "buy", price: 4182.50, size: 120, intensity: 0.42 },
  { time: "09:30:01.456", type: "sell", price: 4182.25, size: 85, intensity: 0.45 },
  { time: "09:30:01.891", type: "buy", price: 4182.75, size: 200, intensity: 0.71 },
  { time: "09:30:02.012", type: "buy", price: 4183.00, size: 340, intensity: 1.12 },
  { time: "09:30:02.134", type: "sell", price: 4182.50, size: 150, intensity: 1.58 },
  { time: "09:30:02.567", type: "buy", price: 4182.75, size: 95, intensity: 1.34 },
  { time: "09:30:03.210", type: "sell", price: 4182.25, size: 180, intensity: 0.98 },
  { time: "09:30:03.892", type: "buy", price: 4182.50, size: 110, intensity: 0.87 },
  { time: "09:30:04.456", type: "sell", price: 4182.00, size: 260, intensity: 0.76 },
  { time: "09:30:05.123", type: "buy", price: 4182.25, size: 75, intensity: 0.64 },
]

const branchingMatrix = [
  [0.32, 0.18, 0.05],
  [0.21, 0.41, 0.12],
  [0.08, 0.14, 0.28],
]

const diagnosticMetrics = [
  { label: "Log-Likelihood", value: "-2,847.32" },
  { label: "AIC", value: "5,706.64" },
  { label: "BIC", value: "5,738.21" },
  { label: "KS Statistic", value: "0.0234" },
  { label: "KS p-value", value: "0.847" },
  { label: "Ljung-Box p-value", value: "0.623" },
]

// --- Sparkline SVG helper -------------------------------------------------

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

// --- Step chart for intensity (matches Hawkes step-function look) ---------

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
  const min = 0
  const range = max - min || 1
  const stepW = width / data.length

  const pathParts: string[] = []
  data.forEach((v, i) => {
    const x = i * stepW
    const y = height - ((v - min) / range) * (height - 8) - 4
    if (i === 0) {
      pathParts.push(`M ${x},${y}`)
    } else {
      pathParts.push(`H ${x} V ${y}`)
    }
  })
  pathParts.push(`H ${width}`)

  // Area fill
  const areaPath = pathParts.join(" ") + ` V ${height} H 0 Z`

  // Grid lines
  const gridLines = [0.25, 0.5, 0.75, 1.0].map((f) => {
    const y = height - f * (height - 8) - 4
    const label = (min + f * range).toFixed(1)
    return { y, label }
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

// --- Forecast chart (step + dashed confidence band) -----------------------

function ForecastChart({
  history,
  forecast,
}: {
  history: number[]
  forecast: number[]
}) {
  const all = [...history.slice(-20), ...forecast]
  const max = Math.max(...all) * 1.15
  const width = 600
  const height = 140
  const total = history.slice(-20).length + forecast.length
  const stepW = width / total

  const toY = (v: number) => height - (v / max) * (height - 8) - 4

  // History path
  const histSlice = history.slice(-20)
  let histPath = ""
  histSlice.forEach((v, i) => {
    const x = i * stepW
    const y = toY(v)
    histPath += i === 0 ? `M ${x},${y}` : ` H ${x} V ${y}`
  })

  // Forecast path
  const fStart = histSlice.length
  let fcPath = `M ${(fStart - 1) * stepW},${toY(histSlice[histSlice.length - 1])}`
  forecast.forEach((v, i) => {
    const x = (fStart + i) * stepW
    const y = toY(v)
    fcPath += ` H ${x} V ${y}`
  })
  fcPath += ` H ${width}`

  // Confidence bands (upper/lower)
  const upperBand = forecast.map((v) => v * 1.35)
  const lowerBand = forecast.map((v) => v * 0.7)

  let bandPath = `M ${(fStart - 1) * stepW},${toY(upperBand[0] || forecast[0])}`
  upperBand.forEach((v, i) => {
    const x = (fStart + i) * stepW
    bandPath += ` L ${x},${toY(v)}`
  })
  bandPath += ` L ${width},${toY(upperBand[upperBand.length - 1])}`
  lowerBand
    .slice()
    .reverse()
    .forEach((v, i) => {
      const x = (fStart + lowerBand.length - 1 - i) * stepW
      bandPath += ` L ${x},${toY(v)}`
    })
  bandPath += " Z"

  // Divider
  const divX = fStart * stepW

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      {[0.25, 0.5, 0.75].map((f, i) => (
        <line
          key={i}
          x1={0}
          y1={height - f * (height - 8) - 4}
          x2={width}
          y2={height - f * (height - 8) - 4}
          stroke="#404040"
          strokeWidth="0.5"
          strokeDasharray="4 4"
        />
      ))}
      <line x1={divX} y1={0} x2={divX} y2={height} stroke="#525252" strokeWidth="1" strokeDasharray="4 2" />
      <path d={bandPath} fill="#f97316" opacity={0.08} />
      <path d={histPath} fill="none" stroke="#ffffff" strokeWidth="1.5" />
      <path d={fcPath} fill="none" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 3" />
    </svg>
  )
}

// ===========================================================================
// Main page
// ===========================================================================

export default function ModelPage() {
  const [mu, setMu] = useState("0.45")
  const [alpha, setAlpha] = useState("0.68")
  const [beta, setBeta] = useState("1.24")
  const [horizon, setHorizon] = useState("20")
  const [modelStatus, setModelStatus] = useState<"idle" | "running" | "fitted">("fitted")

  const handleFit = () => {
    setModelStatus("running")
    setTimeout(() => setModelStatus("fitted"), 1200)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wider">HAWKES PROCESS MODEL</h1>
          <p className="text-sm text-neutral-400">Market microstructure forecasting and intensity estimation</p>
        </div>
        <div className="flex gap-2">
          <Badge
            className={
              modelStatus === "fitted"
                ? "bg-emerald-500/20 text-emerald-400"
                : modelStatus === "running"
                  ? "bg-orange-500/20 text-orange-400 animate-pulse"
                  : "bg-neutral-500/20 text-neutral-300"
            }
          >
            {modelStatus === "fitted" ? "MODEL FITTED" : modelStatus === "running" ? "FITTING..." : "NOT FITTED"}
          </Badge>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={handleFit}
            disabled={modelStatus === "running"}
          >
            <Play className="w-4 h-4 mr-2" />
            Fit Model
          </Button>
          <Button
            variant="outline"
            className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent"
            onClick={() => setModelStatus("idle")}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "BASELINE INTENSITY",
            value: "0.45",
            unit: "events/s",
            icon: Activity,
            change: "+2.3%",
            dir: "up" as const,
          },
          {
            label: "BRANCHING RATIO",
            value: "0.548",
            unit: "",
            icon: Zap,
            change: "-1.1%",
            dir: "down" as const,
          },
          {
            label: "HALF-LIFE",
            value: "0.56s",
            unit: "",
            icon: Clock,
            change: "0.0%",
            dir: "flat" as const,
          },
          {
            label: "FORECAST HORIZON",
            value: `${horizon}`,
            unit: "steps",
            icon: TrendingUp,
            change: "",
            dir: "flat" as const,
          },
        ].map((kpi) => (
          <Card key={kpi.label} className="bg-neutral-900 border-neutral-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-neutral-400 tracking-wider">{kpi.label}</p>
                  <p className="text-2xl font-bold text-white font-mono">
                    {kpi.value}
                    {kpi.unit && <span className="text-xs text-neutral-500 ml-1">{kpi.unit}</span>}
                  </p>
                  {kpi.change && (
                    <span
                      className={`text-xs font-mono ${
                        kpi.dir === "up"
                          ? "text-emerald-400"
                          : kpi.dir === "down"
                            ? "text-red-400"
                            : "text-neutral-500"
                      }`}
                    >
                      {kpi.dir === "up" && <ArrowUpRight className="inline w-3 h-3 mr-0.5" />}
                      {kpi.dir === "down" && <ArrowDownRight className="inline w-3 h-3 mr-0.5" />}
                      {kpi.dir === "flat" && <Minus className="inline w-3 h-3 mr-0.5" />}
                      {kpi.change}
                    </span>
                  )}
                </div>
                <kpi.icon className="w-8 h-8 text-neutral-600" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content in tabs */}
      <Tabs defaultValue="parameters" className="space-y-4">
        <TabsList className="bg-neutral-800 border border-neutral-700">
          <TabsTrigger
            value="parameters"
            className="text-neutral-400 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
          >
            Parameters
          </TabsTrigger>
          <TabsTrigger
            value="intensity"
            className="text-neutral-400 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
          >
            Intensity
          </TabsTrigger>
          <TabsTrigger
            value="forecast"
            className="text-neutral-400 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
          >
            Forecast
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="text-neutral-400 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
          >
            Events
          </TabsTrigger>
        </TabsList>

        {/* ---- PARAMETERS TAB ---- */}
        <TabsContent value="parameters">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Parameters */}
            <Card className="lg:col-span-5 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
                  INPUT PARAMETERS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-neutral-400 tracking-wider block mb-1">
                      BASELINE INTENSITY (mu)
                    </label>
                    <Input
                      value={mu}
                      onChange={(e) => setMu(e.target.value)}
                      className="bg-neutral-800 border-neutral-600 text-white font-mono"
                    />
                    <p className="text-xs text-neutral-500 mt-1">Background event arrival rate</p>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 tracking-wider block mb-1">
                      EXCITATION (alpha)
                    </label>
                    <Input
                      value={alpha}
                      onChange={(e) => setAlpha(e.target.value)}
                      className="bg-neutral-800 border-neutral-600 text-white font-mono"
                    />
                    <p className="text-xs text-neutral-500 mt-1">Jump size of the intensity per event</p>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 tracking-wider block mb-1">
                      DECAY RATE (beta)
                    </label>
                    <Input
                      value={beta}
                      onChange={(e) => setBeta(e.target.value)}
                      className="bg-neutral-800 border-neutral-600 text-white font-mono"
                    />
                    <p className="text-xs text-neutral-500 mt-1">Exponential decay speed of excitation</p>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 tracking-wider block mb-1">
                      FORECAST HORIZON (steps)
                    </label>
                    <Input
                      value={horizon}
                      onChange={(e) => setHorizon(e.target.value)}
                      className="bg-neutral-800 border-neutral-600 text-white font-mono"
                    />
                    <p className="text-xs text-neutral-500 mt-1">Number of forward steps to project</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-neutral-700">
                  <Button
                    className="bg-orange-500 hover:bg-orange-600 text-white flex-1"
                    onClick={handleFit}
                    disabled={modelStatus === "running"}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Fit Model
                  </Button>
                  <Button
                    variant="outline"
                    className="border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-300 bg-transparent"
                    onClick={() => {
                      setMu("0.45")
                      setAlpha("0.68")
                      setBeta("1.24")
                      setHorizon("20")
                    }}
                  >
                    Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Fitting Results */}
            <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
                  ESTIMATION RESULTS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { param: "mu", est: "0.4512", se: "0.0234", ci: "[0.4053, 0.4971]" },
                    { param: "alpha", est: "0.6783", se: "0.0412", ci: "[0.5975, 0.7591]" },
                    { param: "beta", est: "1.2381", se: "0.0587", ci: "[1.1231, 1.3531]" },
                  ].map((row) => (
                    <div key={row.param} className="p-3 bg-neutral-800 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-orange-500 font-mono font-bold">{row.param}</span>
                        <span className="text-sm text-white font-mono font-bold">{row.est}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Std. Error</span>
                        <span className="text-neutral-300 font-mono">{row.se}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">95% CI</span>
                        <span className="text-neutral-300 font-mono">{row.ci}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-neutral-700">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-neutral-400">Branching Ratio (alpha/beta)</span>
                    <span className="text-white font-mono font-bold">0.548</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: "54.8%" }} />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {"< 1.0 indicates a stationary (stable) process"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Branching Matrix & Diagnostics */}
            <Card className="lg:col-span-3 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
                  MODEL DIAGNOSTICS
                </CardTitle>
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
                          <div
                            key={j}
                            className="w-14 h-8 flex items-center justify-center rounded text-xs font-mono"
                            style={{
                              backgroundColor: `rgba(249, 115, 22, ${v * 0.8})`,
                              color: v > 0.25 ? "#fff" : "#a3a3a3",
                            }}
                          >
                            {v.toFixed(2)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- INTENSITY TAB ---- */}
        <TabsContent value="intensity">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-8 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
                    CONDITIONAL INTENSITY FUNCTION
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge className="bg-orange-500/20 text-orange-400">Live</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-neutral-400 hover:text-orange-500 h-7 w-7"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-36 relative">
                  <StepChart data={intensityTimeSeries} />
                </div>
                <div className="flex justify-between text-xs text-neutral-500 mt-2 font-mono">
                  <span>09:30:00</span>
                  <span>09:30:20</span>
                  <span>09:30:40</span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-orange-500 inline-block" /> Intensity
                  </span>
                  <span>Peak: <span className="text-white font-mono">2.31</span></span>
                  <span>Mean: <span className="text-white font-mono">1.02</span></span>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
                  INTENSITY STATISTICS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Current Rate", value: "1.42", unit: "ev/s" },
                  { label: "Mean Intensity", value: "1.02", unit: "ev/s" },
                  { label: "Peak Intensity", value: "2.31", unit: "ev/s" },
                  { label: "Std Deviation", value: "0.48", unit: "" },
                  { label: "Total Events", value: "1,847", unit: "" },
                  { label: "Avg Inter-arrival", value: "0.54s", unit: "" },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">{s.label}</span>
                    <span className="text-white font-mono font-bold">
                      {s.value}
                      {s.unit && <span className="text-neutral-500 ml-1 font-normal">{s.unit}</span>}
                    </span>
                  </div>
                ))}
                <div className="pt-3 border-t border-neutral-700">
                  <p className="text-xs text-neutral-400 mb-2">MINI SPARKLINE (30s)</p>
                  <Sparkline data={intensityTimeSeries} width={240} height={32} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- FORECAST TAB ---- */}
        <TabsContent value="forecast">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-8 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
                    INTENSITY FORECAST
                  </CardTitle>
                  <div className="flex items-center gap-4 text-xs text-neutral-400">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-0.5 bg-white inline-block" /> History
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-0.5 bg-orange-500 inline-block border-dashed" /> Forecast
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-2 bg-orange-500/20 inline-block rounded-sm" /> 95% CI
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-36 relative">
                  <ForecastChart history={intensityTimeSeries} forecast={forecastSeries} />
                </div>
                <div className="flex justify-between text-xs text-neutral-500 mt-2 font-mono">
                  <span>t-20</span>
                  <span>t (now)</span>
                  <span>t+{horizon}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
                  FORECAST SUMMARY
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Horizon", value: `${horizon} steps` },
                  { label: "Forecast Mean", value: "0.78 ev/s" },
                  { label: "Forecast Std", value: "0.22" },
                  { label: "95% CI Upper", value: "1.19 ev/s" },
                  { label: "95% CI Lower", value: "0.42 ev/s" },
                  { label: "Convergence", value: "0.60 ev/s" },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-neutral-400">{item.label}</span>
                    <span className="text-white font-mono">{item.value}</span>
                  </div>
                ))}

                <div className="pt-3 border-t border-neutral-700 space-y-2">
                  <p className="text-xs text-neutral-400 tracking-wider">EXPECTED EVENT COUNTS</p>
                  {[
                    { window: "Next 1s", count: "1.42" },
                    { window: "Next 5s", count: "5.18" },
                    { window: "Next 10s", count: "8.74" },
                    { window: "Next 30s", count: "21.30" },
                  ].map((row) => (
                    <div key={row.window} className="flex justify-between text-xs">
                      <span className="text-neutral-400">{row.window}</span>
                      <span className="text-white font-mono">{row.count}</span>
                    </div>
                  ))}
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
                  <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
                    ORDER BOOK EVENT STREAM
                  </CardTitle>
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
                        <tr
                          key={i}
                          className="border-b border-neutral-800 hover:bg-neutral-800 transition-colors"
                        >
                          <td className="py-2 pr-4 text-neutral-300 font-mono">{evt.time}</td>
                          <td className="py-2 pr-4">
                            <Badge
                              className={
                                evt.type === "buy"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-red-500/20 text-red-400"
                              }
                            >
                              {evt.type.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-2 pr-4 text-right text-white font-mono">{evt.price.toFixed(2)}</td>
                          <td className="py-2 pr-4 text-right text-neutral-300 font-mono">{evt.size}</td>
                          <td className="py-2 text-right">
                            <span
                              className={`font-mono ${
                                evt.intensity > 1.2
                                  ? "text-orange-400"
                                  : evt.intensity > 0.8
                                    ? "text-white"
                                    : "text-neutral-400"
                              }`}
                            >
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
                <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
                  EVENT DISTRIBUTION
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-xs text-neutral-400 tracking-wider">BY EVENT TYPE</p>
                  {[
                    { type: "Buy Orders", count: 923, pct: 50 },
                    { type: "Sell Orders", count: 741, pct: 40 },
                    { type: "Cancellations", count: 183, pct: 10 },
                  ].map((d) => (
                    <div key={d.type} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-300">{d.type}</span>
                        <span className="text-white font-mono">{d.count}</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-1.5">
                        <div
                          className="bg-orange-500 h-1.5 rounded-full"
                          style={{ width: `${d.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-neutral-700 space-y-2">
                  <p className="text-xs text-neutral-400 tracking-wider">INTER-ARRIVAL TIMES</p>
                  {[
                    { label: "Mean", value: "0.542s" },
                    { label: "Median", value: "0.387s" },
                    { label: "Min", value: "0.003s" },
                    { label: "Max", value: "4.218s" },
                    { label: "Skewness", value: "2.14" },
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
