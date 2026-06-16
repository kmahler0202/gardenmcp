import type { Section } from "@/types"

interface Props {
  section: Section
}

export function TextBlock({ section }: Props) {
  const content = (section.data.content as string) ?? ""

  return (
    <div>
      {section.title && (
        <h3 className="text-sm font-semibold text-foreground mb-2">{section.title}</h3>
      )}
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  )
}
