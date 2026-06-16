import type { ComponentType } from "react"
import type { Section } from "@/types"
import { TodoList } from "./TodoList"
import { MarkdownBlock } from "./MarkdownBlock"
import { MetricRow } from "./MetricRow"
import { ChartBlock } from "./ChartBlock"
import { DataTable } from "./DataTable"
import { TextBlock } from "./TextBlock"
import { BadgeRow } from "./BadgeRow"
import { FeedItem } from "./FeedItem"

interface SectionProps {
  section: Section
  onWrite: (id: string, data: unknown) => Promise<void>
}

const TYPE_MAP: Record<string, ComponentType<SectionProps>> = {
  todos: TodoList,
  markdown: MarkdownBlock,
  metrics: MetricRow,
  chart: ChartBlock,
  table: DataTable,
  text: TextBlock,
  badge_row: BadgeRow,
  feed: FeedItem,
}

function UnknownSection({ section }: { section: Section }) {
  return (
    <div className="rounded-md border border-dashed border-border/40 px-4 py-3 text-xs text-muted-foreground/60">
      Unknown section type: <span className="font-mono">{section.type}</span>
      {section.title && <span className="ml-1">({section.title})</span>}
    </div>
  )
}

export function SectionRenderer({ section, onWrite }: SectionProps) {
  const Component = TYPE_MAP[section.type]

  if (!Component) {
    return <UnknownSection section={section} />
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card px-5 py-4 shadow-sm">
      <Component section={section} onWrite={onWrite} />
    </div>
  )
}
