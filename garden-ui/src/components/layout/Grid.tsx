import { cn } from "@/lib/utils"

interface GridProps {
  cols?: number
  gap?: number
  className?: string
  children: React.ReactNode
}

export function Grid({ cols = 2, gap = 4, className, children }: GridProps) {
  return (
    <div
      className={cn("grid", className)}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: `${gap * 0.25}rem`,
      }}
    >
      {children}
    </div>
  )
}
