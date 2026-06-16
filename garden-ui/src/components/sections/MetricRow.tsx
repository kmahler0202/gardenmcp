import { cn } from "@/lib/utils"
import type { Section } from "@/types"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricItem {
  label: string
  value: string | number
  delta?: string | number
}

interface Props {
  section: Section
}

function parseDelta(delta: string | number | undefined) {
  if (delta === undefined || delta === null || delta === "") return null
  const str = String(delta)
  const num = parseFloat(str)
  if (isNaN(num)) return { num: 0, str }
  return { num, str }
}

export function MetricRow({ section }: Props) {
  const items: MetricItem[] = (section.data.items as MetricItem[]) ?? []

  return (
    <div>
      {section.title && (
        <h3 className="text-sm font-semibold text-foreground mb-3">{section.title}</h3>
      )}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${Math.max(items.length, 1)}, minmax(0, 1fr))` }}
      >
        {items.map((metric, i) => {
          const delta = parseDelta(metric.delta)
          const isPositive = delta && delta.num > 0
          const isNegative = delta && delta.num < 0

          return (
            <div
              key={i}
              className="rounded-lg border border-border/50 bg-card px-4 py-3 flex flex-col gap-1"
            >
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {metric.label}
              </span>
              <span className="text-2xl font-semibold text-foreground tabular-nums">
                {metric.value}
              </span>
              {delta && (
                <span
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    isPositive && "text-emerald-400",
                    isNegative && "text-destructive",
                    !isPositive && !isNegative && "text-muted-foreground"
                  )}
                >
                  {isPositive ? <TrendingUp className="size-3" /> : isNegative ? <TrendingDown className="size-3" /> : <Minus className="size-3" />}
                  {delta.str}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
