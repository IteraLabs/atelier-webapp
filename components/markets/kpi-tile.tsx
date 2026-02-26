import { Card, CardContent } from "@/components/ui/card"
import { Sparkline } from "@/components/charts"
import { cn } from "@/lib/utils"

interface KpiTileProps {
  label: string
  value: string
  unit?: string
  sparkData?: number[]
  color?: string
  className?: string
}

export function KpiTile({
  label,
  value,
  unit,
  sparkData,
  color = "#f97316",
  className,
}: KpiTileProps) {
  return (
    <Card className={cn("bg-neutral-900 border-neutral-700 flex-1 min-w-0", className)}>
      <CardContent className="p-3.5">
        <div className="text-[10px] font-mono tracking-[0.12em] uppercase text-neutral-500 mb-1.5">
          {label}
        </div>
        <div className="flex items-baseline gap-1 mb-2">
          <span
            className="text-[26px] font-mono font-bold leading-none"
            style={{ color }}
          >
            {value}
          </span>
          {unit && (
            <span className="text-[11px] font-mono text-neutral-500">
              {unit}
            </span>
          )}
        </div>
        {sparkData && sparkData.length > 0 && (
          <Sparkline
            data={sparkData}
            width={140}
            height={24}
            color={color}
            fillOpacity={0.08}
          />
        )}
      </CardContent>
    </Card>
  )
}
