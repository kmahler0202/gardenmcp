import type { Section } from "@/types"

interface Props {
  section: Section
}

export function FeedItem({ section }: Props) {
  const items = (section.data.items as { title?: string; description?: string; url?: string }[]) ?? []

  return (
    <div>
      {section.title && (
        <h3 className="text-sm font-semibold text-foreground mb-3">{section.title}</h3>
      )}
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No feed items</p>
        ) : (
          items.map((item, i) => (
            <div key={i} className="rounded-md border border-border/50 bg-card px-3 py-2.5">
              <p className="text-sm font-medium text-foreground">{item.title ?? "Untitled"}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
              )}
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline mt-1 inline-block"
                >
                  {item.url}
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
