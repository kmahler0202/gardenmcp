import { Badge } from "@/components/ui/badge"
import type { Section } from "@/types"

interface BadgeItem {
  label: string
  color?: string
}

interface Props {
  section: Section
}

const COLOR_VARIANT_MAP: Record<string, string> = {
  red: "destructive",
  blue: "default",
  green: "secondary",
  gray: "outline",
  grey: "outline",
}

export function BadgeRow({ section }: Props) {
  const items: BadgeItem[] = (section.data.items as BadgeItem[]) ?? []

  return (
    <div>
      {section.title && (
        <h3 className="text-sm font-semibold text-foreground mb-2">{section.title}</h3>
      )}
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => {
          const variant = (
            item.color
              ? COLOR_VARIANT_MAP[item.color.toLowerCase()] ?? "secondary"
              : "secondary"
          ) as "default" | "secondary" | "destructive" | "outline"

          return (
            <Badge key={i} variant={variant}>
              {item.label}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
