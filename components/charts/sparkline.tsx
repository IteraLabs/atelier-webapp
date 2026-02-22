// ---------------------------------------------------------------------------
// Sparkline — compact inline SVG area chart
// ---------------------------------------------------------------------------

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  fillOpacity?: number
}

export function Sparkline({
  data,
  width = 320,
  height = 48,
  color = "#f97316",
  fillOpacity = 0.15,
}: SparklineProps) {
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
