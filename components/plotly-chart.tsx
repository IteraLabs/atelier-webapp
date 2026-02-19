"use client"

import dynamic from "next/dynamic"
import type { ComponentType } from "react"

interface PlotlyChartProps {
  data: any[]
  layout?: any
  config?: any
  className?: string
  style?: React.CSSProperties
}

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
}) as ComponentType<PlotlyChartProps>

export default function PlotlyChart({ data, layout, config, className, style }: PlotlyChartProps) {
  return <Plot data={data} layout={layout} config={config} className={className} style={style} />
}