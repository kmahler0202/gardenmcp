import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Section, TodoItem } from "@/types"
import { Trash2, Plus } from "lucide-react"

interface Props {
  section: Section
  onWrite: (id: string, data: unknown) => Promise<void>
}

const PRIORITY_ORDER = { high: 0, normal: 1, low: 2 } as const

export function TodoList({ section, onWrite }: Props) {
  const data = section.data as { items: TodoItem[]; next_id: number }
  const items: TodoItem[] = data.items ?? []
  const nextId: number = data.next_id ?? (Math.max(0, ...items.map((i) => i.id)) + 1)

  const [newText, setNewText] = useState("")
  const [adding, setAdding] = useState(false)

  const sorted = [...items].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1)
  })

  function toggle(id: number, done: boolean) {
    const updated = items.map((i) => (i.id === id ? { ...i, done } : i))
    void onWrite(section.id, { ...data, items: updated })
  }

  function deleteItem(id: number) {
    const updated = items.filter((i) => i.id !== id)
    void onWrite(section.id, { ...data, items: updated })
  }

  function addItem() {
    const text = newText.trim()
    if (!text) return
    const newItem: TodoItem = { id: nextId, text, done: false, priority: "normal" }
    void onWrite(section.id, {
      ...data,
      items: [...items, newItem],
      next_id: nextId + 1,
    })
    setNewText("")
    setAdding(false)
  }

  return (
    <div className="space-y-1">
      {section.title && (
        <h3 className="text-sm font-semibold text-foreground mb-3">{section.title}</h3>
      )}

      {sorted.map((item) => (
        <div
          key={item.id}
          className="group flex items-start gap-3 rounded-md px-2 py-1.5 hover:bg-muted/40 transition-colors"
        >
          <Checkbox
            id={`todo-${section.id}-${item.id}`}
            checked={item.done}
            onCheckedChange={(checked) => toggle(item.id, !!checked)}
            className="mt-0.5 shrink-0"
          />
          <label
            htmlFor={`todo-${section.id}-${item.id}`}
            className={cn(
              "flex-1 cursor-pointer text-sm leading-snug",
              item.done ? "line-through text-muted-foreground" : "text-foreground"
            )}
          >
            <span className="flex items-center gap-1.5">
              {item.priority === "high" && !item.done && (
                <span className="size-1.5 rounded-full bg-destructive shrink-0" />
              )}
              {item.priority === "low" && !item.done && (
                <span className="size-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
              )}
              {item.text}
            </span>
            {(item.due_date || item.source) && (
              <span className="block mt-0.5 text-xs text-muted-foreground">
                {item.due_date && <span>📅 {item.due_date}</span>}
                {item.due_date && item.source && <span> · </span>}
                {item.source && <span className="italic">{item.source}</span>}
              </span>
            )}
          </label>
          <Button
            variant="ghost"
            size="icon-xs"
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={() => deleteItem(item.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ))}

      {adding ? (
        <div className="flex gap-2 mt-2 px-2">
          <Input
            autoFocus
            placeholder="New todo…"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addItem()
              if (e.key === "Escape") { setAdding(false); setNewText("") }
            }}
            className="h-7 text-sm"
          />
          <Button size="sm" onClick={addItem} className="h-7 shrink-0">Add</Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 shrink-0"
            onClick={() => { setAdding(false); setNewText("") }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 mt-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/40 w-full"
        >
          <Plus className="size-3.5" />
          Add todo
        </button>
      )}
    </div>
  )
}
