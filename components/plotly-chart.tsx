"use client"

import { useRef, useEffect, useState } from "react"

interface PlotlyChartProps {
  data: any[]
  layout?: any
  config?: any
  className?: string
  style?: React.CSSProperties
}

export default function PlotlyChart({ data, layout, config, className, style }: PlotlyChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [Plotly, setPlotly] = useState<any>(null)

  useEffect(() => {
    import("plotly.js-basic-dist-min").then((mod) => setPlotly(mod.default ?? mod))
  }, [])

  useEffect(() => {
    if (!chartRef.current || !Plotly) return

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
  }, [data, layout, config, Plotly])

  return <div ref={chartRef} className={className} style={style} />
}
