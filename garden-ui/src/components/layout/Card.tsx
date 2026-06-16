import { cn } from "@/lib/utils"
import {
  Card as ShadCard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface CardProps {
  title?: string
  className?: string
  children: React.ReactNode
}

export function Card({ title, className, children }: CardProps) {
  return (
    <ShadCard className={cn("border-border/50", className)}>
      {title && (
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : "pt-6"}>{children}</CardContent>
    </ShadCard>
  )
}
