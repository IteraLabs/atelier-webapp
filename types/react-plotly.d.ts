declare module "react-plotly.js" {
  import { Component } from "react"

  interface PlotParams {
    data: Plotly.Data[]
    layout?: Partial<Plotly.Layout>
    config?: Partial<Plotly.Config>
    className?: string
    style?: React.CSSProperties
    [key: string]: any
  }

  export default class Plot extends Component<PlotParams> { }
}