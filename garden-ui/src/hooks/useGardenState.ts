import { useState, useEffect, useCallback } from "react"
import type { GardenState, Section } from "../types"

const EMPTY_STATE: GardenState = {
  page: { title: "Garden", layout: "wide", tabs: [] },
  sections: [],
  notifications: [],
  last_updated: null,
}

export function useGardenState() {
  const [state, setState] = useState<GardenState>(EMPTY_STATE)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Fetch initial snapshot
    fetch("/api/state")
      .then((r) => r.json())
      .then(setState)
      .catch(console.error)

    // Open SSE stream
    const es = new EventSource("/api/stream")

    es.onopen = () => setConnected(true)

    es.onmessage = (e) => {
      try {
        const updated = JSON.parse(e.data) as GardenState
        setState(updated)
      } catch {
        // ignore malformed frames
      }
    }

    es.onerror = () => setConnected(false)

    return () => {
      es.close()
      setConnected(false)
    }
  }, [])

  const writeSection = useCallback(
    async (sectionId: string, updatedData: unknown) => {
      setState((prev) => {
        const sections = prev.sections.map((s) =>
          s.id === sectionId ? { ...s, data: updatedData as Section["data"] } : s
        )
        return { ...prev, sections }
      })

      try {
        const current = await fetch("/api/state").then((r) => r.json()) as GardenState
        const sections = current.sections.map((s) =>
          s.id === sectionId ? { ...s, data: updatedData as Section["data"] } : s
        )
        await fetch("/api/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...current, sections }),
        })
      } catch (err) {
        console.error("Failed to write section", err)
      }
    },
    []
  )

  return { state, connected, writeSection }
}
