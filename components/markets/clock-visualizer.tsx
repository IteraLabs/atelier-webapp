"use client"

import { useRef, useEffect } from "react"
import type { ClockType } from "@/types/markets"

interface ClockVisualizerProps {
  clockType: ClockType
  resolution: string | null
}

export function ClockVisualizer({ clockType, resolution }: ClockVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    let offset = 0

    const orange = "#f97316"
    const cyan = "#06b6d4"
    const border = "#1e1e1e"

    function draw() {
      ctx!.clearRect(0, 0, w, h)

      // baseline
      ctx!.strokeStyle = border
      ctx!.lineWidth = 1
      ctx!.beginPath()
      ctx!.moveTo(0, h / 2)
      ctx!.lineTo(w, h / 2)
      ctx!.stroke()

      if (clockType === "on_clock") {
        const spacing = 40
        const numTicks = Math.ceil(w / spacing) + 2
        for (let i = 0; i < numTicks; i++) {
          const x = ((i * spacing - offset) % w + w) % w
          ctx!.strokeStyle = orange + "80"
          ctx!.lineWidth = 1
          ctx!.beginPath()
          ctx!.moveTo(x, h / 2 - 6)
          ctx!.lineTo(x, h / 2 + 6)
          ctx!.stroke()
          ctx!.fillStyle = orange
          ctx!.beginPath()
          ctx!.arc(x, h / 2, 2.5, 0, Math.PI * 2)
          ctx!.fill()
        }
        offset = (offset + 0.5) % spacing
      } else if (clockType === "on_orderbook") {
        const ticks = [30, 55, 110, 140, 195, 230, 270, 320, 380, 410, 450, 490, 530, 570]
        for (const tx of ticks) {
          const x = ((tx - offset * 3) % w + w) % w
          ctx!.strokeStyle = cyan + "80"
          ctx!.lineWidth = 1
          ctx!.beginPath()
          ctx!.moveTo(x, h / 2 - 8)
          ctx!.lineTo(x, h / 2 + 8)
          ctx!.stroke()
          ctx!.fillStyle = cyan
          ctx!.beginPath()
          ctx!.arc(x, h / 2, 3, 0, Math.PI * 2)
          ctx!.fill()
        }
        offset = (offset + 0.3) % 200
      } else {
        // raw — continuous flow
        const gradient = ctx!.createLinearGradient(0, 0, w, 0)
        gradient.addColorStop(0, "transparent")
        gradient.addColorStop(((offset * 2) % w) / w, orange + "60")
        gradient.addColorStop(1, "transparent")
        ctx!.strokeStyle = gradient
        ctx!.lineWidth = 2
        ctx!.beginPath()
        ctx!.moveTo(0, h / 2)
        ctx!.lineTo(w, h / 2)
        ctx!.stroke()
        offset = (offset + 1) % (w / 2)
      }

      frameRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(frameRef.current)
  }, [clockType])

  const pillColor = clockType === "on_orderbook" ? "text-cyan-500 bg-cyan-500/10 border-cyan-500/25" : "text-orange-500 bg-orange-500/10 border-orange-500/25"
  const pillLabel =
    clockType === "on_clock"
      ? `ON_CLOCK(${resolution})`
      : clockType === "on_orderbook"
        ? "ON_ORDERBOOK"
        : "RAW"

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="text-[11px] font-mono tracking-[0.15em] uppercase text-neutral-500">
          CLOCK HEARTBEAT
        </div>
        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono tracking-[0.05em] uppercase border rounded-sm ${pillColor}`}>
          {pillLabel}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={32}
        className="w-full rounded-sm"
        style={{ height: 32 }}
      />
    </div>
  )
}
