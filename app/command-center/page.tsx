"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import PlotlyChart from "@/components/plotly-chart"

export default function CommandCenterPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Agent Status Overview */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">AGENT ALLOCATION</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-mono">190</div>
                <div className="text-xs text-neutral-500">Active Field</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-mono">990</div>
                <div className="text-xs text-neutral-500">Undercover</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white font-mono">290</div>
                <div className="text-xs text-neutral-500">Training</div>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { id: "G-078W", name: "VENGEFUL SPIRIT", status: "active" },
                { id: "G-079X", name: "OBSIDIAN SENTINEL", status: "standby" },
                { id: "G-080Y", name: "GHOSTLY FURY", status: "active" },
                { id: "G-081Z", name: "CURSED REVENANT", status: "compromised" },
              ].map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-2 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${agent.status === "active"
                        ? "bg-white"
                        : agent.status === "standby"
                          ? "bg-neutral-500"
                          : "bg-red-500"
                        }`}
                    ></div>
                    <div>
                      <div className="text-xs text-white font-mono">{agent.id}</div>
                      <div className="text-xs text-neutral-500">{agent.name}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">ACTIVITY LOG</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {[
                {
                  time: "25/06/2025 09:29",
                  agent: "gh0st_Fire",
                  action: "completed mission in",
                  location: "Berlin",
                  target: "zer0_Nigh",
                },
                {
                  time: "25/06/2025 08:12",
                  agent: "dr4g0n_V3in",
                  action: "extracted high-value target in",
                  location: "Cairo",
                  target: null,
                },
                {
                  time: "24/06/2025 22:55",
                  agent: "sn4ke_Sh4de",
                  action: "lost communication in",
                  location: "Havana",
                  target: null,
                },
                {
                  time: "24/06/2025 21:33",
                  agent: "ph4nt0m_R4ven",
                  action: "initiated surveillance in",
                  location: "Tokyo",
                  target: null,
                },
                {
                  time: "24/06/2025 19:45",
                  agent: "v0id_Walk3r",
                  action: "compromised security in",
                  location: "Moscow",
                  target: "d4rk_M4trix",
                },
              ].map((log, index) => (
                <div
                  key={index}
                  className="text-xs border-l-2 border-orange-500 pl-3 hover:bg-neutral-800 p-2 rounded transition-colors"
                >
                  <div className="text-neutral-500 font-mono">{log.time}</div>
                  <div className="text-white">
                    Agent <span className="text-orange-500 font-mono">{log.agent}</span> {log.action}{" "}
                    <span className="text-white font-mono">{log.location}</span>
                    {log.target && (
                      <span>
                        {" "}
                        with agent <span className="text-orange-500 font-mono">{log.target}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Encrypted Chat Activity */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              ENCRYPTED CHAT ACTIVITY
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {/* Wireframe Sphere */}
            <div className="relative w-32 h-32 mb-4">
              <div className="absolute inset-0 border-2 border-white rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute inset-2 border border-white rounded-full opacity-40"></div>
              <div className="absolute inset-4 border border-white rounded-full opacity-20"></div>
              {/* Grid lines */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-px bg-white opacity-30"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-px h-full bg-white opacity-30"></div>
              </div>
            </div>

            <div className="text-xs text-neutral-500 space-y-1 w-full font-mono">
              <div className="flex justify-between">
                <span># 2025-06-17 14:23 UTC</span>
              </div>
              <div className="text-white">{"> [AGT:gh0stfire] ::: INIT >> ^^^ loading secure channel"}</div>
              <div className="text-orange-500">{"> CH#2 | 1231.9082464.500...xR3"}</div>
              <div className="text-white">{"> KEY LOCKED"}</div>
              <div className="text-neutral-400">
                {'> MSG >> "...mission override initiated... awaiting delta node clearance"'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mission Activity Chart — Plotly */}
        <Card className="lg:col-span-8 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">
              MISSION ACTIVITY OVERVIEW
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PlotlyChart
              data={[
                {
                  x: ["Jan 28", "Feb 04", "Feb 11", "Feb 14", "Feb 18", "Feb 21", "Feb 25", "Feb 28"],
                  y: [300, 340, 320, 370, 360, 380, 340, 390],
                  type: "scatter",
                  mode: "lines + scatter",
                  line: { color: "#f97316", width: 2 },
                  name: "Active",
                },
                {
                  x: ["Jan 28", "Feb 04", "Feb 11", "Feb 14", "Feb 18", "Feb 21", "Feb 25", "Feb 28"],
                  y: [260, 270, 280, 290, 280, 270, 290, 300],
                  type: "scatter",
                  mode: "lines",
                  line: { color: "#ffffff", width: 2, dash: "dash" },
                  name: "Passive",
                },
              ]}
              layout={{
                autosize: true,
                height: 192,
                margin: { l: 35, r: 10, t: 5, b: 30 },
                paper_bgcolor: "transparent",
                plot_bgcolor: "transparent",
                font: {
                  family: "monospace",
                  color: "#737373",
                  size: 11,
                },
                xaxis: {
                  showgrid: true,
                  gridcolor: "rgba(64, 64, 64, 0.2)",
                  gridwidth: 1,
                  zeroline: false,
                  tickfont: { family: "monospace", size: 11, color: "#737373" },
                },
                yaxis: {
                  showgrid: true,
                  gridcolor: "rgba(64, 64, 64, 0.2)",
                  gridwidth: 1,
                  zeroline: false,
                  range: [200, 500],
                  dtick: 100,
                  tickfont: { family: "monospace", size: 11, color: "#737373" },
                },
                showlegend: false,
                hovermode: "x unified",
                hoverlabel: {
                  bgcolor: "#262626",
                  bordercolor: "#f97316",
                  font: { color: "#ffffff", family: "monospace", size: 11 },
                },
              }}
              config={{
                displayModeBar: false,
                responsive: true,
              }}
              style={{ width: "100%", height: "192px" }}
            />
          </CardContent>
        </Card>

        {/* Mission Information */}
        <Card className="lg:col-span-4 bg-neutral-900 border-neutral-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-neutral-300 tracking-wider">MISSION INFORMATION</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-xs text-white font-medium">Successful Missions</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">High Risk Mission</span>
                    <span className="text-white font-bold font-mono">190</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Medium Risk Mission</span>
                    <span className="text-white font-bold font-mono">426</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Low Risk Mission</span>
                    <span className="text-white font-bold font-mono">920</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-red-500 font-medium">Failed Missions</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">High Risk Mission</span>
                    <span className="text-white font-bold font-mono">190</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Medium Risk Mission</span>
                    <span className="text-white font-bold font-mono">426</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Low Risk Mission</span>
                    <span className="text-white font-bold font-mono">920</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
