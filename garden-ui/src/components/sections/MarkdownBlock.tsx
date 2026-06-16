import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { Section } from "@/types"

interface Props {
  section: Section
}

export function MarkdownBlock({ section }: Props) {
  const content = (section.data.content as string) ?? ""

  return (
    <div>
      {section.title && (
        <h3 className="text-sm font-semibold text-foreground mb-3">{section.title}</h3>
      )}
      <div className="prose prose-sm prose-invert max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  )
}
