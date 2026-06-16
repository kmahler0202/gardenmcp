import { cn } from "@/lib/utils"

interface StackProps {
  gap?: number
  className?: string
  children: React.ReactNode
}

export function Stack({ gap = 4, className, children }: StackProps) {
  return (
    <div
      className={cn("flex flex-col", className)}
      style={{ gap: `${gap * 0.25}rem` }}
    >
      {children}
    </div>
  )
}
