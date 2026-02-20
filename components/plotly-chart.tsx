"use client"

import { useRef, useEffect } from "react"

interface PlotlyChartProps {
  data: any[]
  layout?: any
  config?: any
  className?: string
  style?: React.CSSProperties
}

export default function PlotlyChart({ data, layout, config, className, style }: PlotlyChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const Plotly = (window as any).Plotly
    if (!Plotly || !chartRef.current) return

    Plotly.newPlot(chartRef.current, data, layout, config)

    const resizeObserver = new ResizeObserver(() => {
      if (chartRef.current) {
        Plotly.Plots.resize(chartRef.current)
      }
    })
    resizeObserver.observe(chartRef.current)

    return () => {
      resizeObserver.disconnect()
      if (chartRef.current) {
        Plotly.purge(chartRef.current)
      }
    }
  }, [data, layout, config])

  return <div ref={chartRef} className={className} style={style} />
}