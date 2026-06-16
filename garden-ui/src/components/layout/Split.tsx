import { cn } from "@/lib/utils"

interface SplitProps {
  ratio?: number
  gap?: number
  className?: string
  left: React.ReactNode
  right: React.ReactNode
}

export function Split({ ratio = 0.5, gap = 4, className, left, right }: SplitProps) {
  const leftFr = ratio
  const rightFr = 1 - ratio

  return (
    <div
      className={cn("grid", className)}
      style={{
        gridTemplateColumns: `${leftFr}fr ${rightFr}fr`,
        gap: `${gap * 0.25}rem`,
      }}
    >
      <div>{left}</div>
      <div>{right}</div>
    </div>
  )
}
