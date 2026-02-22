// ---------------------------------------------------------------------------
// StepChart — step-function intensity chart with grid overlay
// ---------------------------------------------------------------------------

interface StepChartProps {
  data: number[]
  width?: number
  height?: number
  color?: string
}

export function StepChart({
  data,
  width = 600,
  height = 140,
  color = "#f97316",
}: StepChartProps) {
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
