"use client"

import dynamic from "next/dynamic"

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

export default function PlotlyChart({ data, layout, config, className, style }: any) {
  return <Plot data={data} layout={layout} config={config} className={className} style={style} />
}