// ---------------------------------------------------------------------------
// ForecastChart — history + forecast step-function with confidence band
// ---------------------------------------------------------------------------

interface ForecastChartProps {
  history: number[]
  forecast: number[]
  showFailureBand?: boolean
}

export function ForecastChart({
  history,
  forecast,
  showFailureBand = false,
}: ForecastChartProps) {
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
