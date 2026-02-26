import { cn } from "@/lib/utils"
import { EXCHANGE_COLORS } from "@/lib/mock/markets-data"

interface ExchangeBadgeProps {
  name: string
  className?: string
}

export function ExchangeBadge({ name, className }: ExchangeBadgeProps) {
  const color = EXCHANGE_COLORS[name] ?? "#f97316"

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-5 h-5 rounded-sm text-[9px] font-mono font-bold shrink-0",
        className,
      )}
      style={{
        background: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {name[0]}
    </span>
  )
}
