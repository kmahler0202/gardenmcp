import { cn } from "@/lib/utils"

interface RowProps {
  gap?: number
  align?: "start" | "center" | "end" | "stretch"
  className?: string
  children: React.ReactNode
}

export function Row({ gap = 4, align = "center", className, children }: RowProps) {
  const alignClass = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  }[align]

  return (
    <div
      className={cn("flex flex-row", alignClass, className)}
      style={{ gap: `${gap * 0.25}rem` }}
    >
      {children}
    </div>
  )
}
