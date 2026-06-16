export interface TodoItem {
  id: number
  text: string
  done: boolean
  priority: "high" | "normal" | "low"
  due_date?: string
  source?: string
}

export interface Section {
  id: string
  type: string
  title?: string
  tab?: string
  order?: number | null
  data: Record<string, unknown>
}

export interface Notification {
  id: string
  message: string
  level: "info" | "warning" | "error" | "success"
  ts: string
}

export interface PageConfig {
  title: string
  layout: string
  tabs: string[]
}

export interface GardenState {
  page: PageConfig
  sections: Section[]
  notifications: Notification[]
  last_updated: string | null
}
