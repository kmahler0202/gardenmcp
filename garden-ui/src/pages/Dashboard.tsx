import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { SectionRenderer } from "@/components/sections/SectionRenderer"
import { useGardenState } from "@/hooks/useGardenState"
import type { Notification, Section } from "@/types"
import { cn } from "@/lib/utils"

function NotificationBanner({ n }: { n: Notification }) {
  const styles = {
    info: "bg-blue-950/60 border-blue-800/50 text-blue-200",
    warning: "bg-yellow-950/60 border-yellow-800/50 text-yellow-200",
    error: "bg-red-950/60 border-red-800/50 text-red-200",
    success: "bg-emerald-950/60 border-emerald-800/50 text-emerald-200",
  }

  return (
    <div className={cn("rounded-md border px-3 py-2 text-sm", styles[n.level] ?? styles.info)}>
      {n.message}
    </div>
  )
}

function sortSections(sections: Section[]) {
  return [...sections].sort((a, b) => {
    const aOrder = a.order ?? Infinity
    const bOrder = b.order ?? Infinity
    return aOrder - bOrder
  })
}

export default function Dashboard() {
  const { state, connected, writeSection } = useGardenState()
  const { page, sections, notifications } = state

  const sorted = sortSections(sections)
  const aboveTabs = sorted.filter(
    (s) => !s.tab || !page.tabs.includes(s.tab)
  )
  const tabSections = Object.fromEntries(
    page.tabs.map((tab) => [tab, sorted.filter((s) => s.tab === tab)])
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <h1 className="text-base font-semibold tracking-tight text-foreground">
            {page.title || "Garden"}
          </h1>
          <span
            className={cn(
              "size-2 rounded-full",
              connected ? "bg-emerald-500" : "bg-muted-foreground/30"
            )}
            title={connected ? "Live" : "Connecting…"}
          />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 space-y-4">
        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((n) => (
              <NotificationBanner key={n.id} n={n} />
            ))}
          </div>
        )}

        {/* Above-tab sections */}
        {aboveTabs.length > 0 && (
          <div className="space-y-4">
            {aboveTabs.map((section) => (
              <SectionRenderer
                key={section.id}
                section={section}
                onWrite={writeSection}
              />
            ))}
          </div>
        )}

        {/* Tabs */}
        {page.tabs.length > 0 && (
          <>
            {aboveTabs.length > 0 && <Separator className="opacity-30" />}
            <Tabs defaultValue={page.tabs[0]}>
              <TabsList className="bg-muted/40 border border-border/40">
                {page.tabs.map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              {page.tabs.map((tab) => (
                <TabsContent key={tab} value={tab} className="mt-4 space-y-4">
                  {(tabSections[tab] ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground/60 italic py-8 text-center">
                      This tab is empty.
                    </p>
                  ) : (
                    (tabSections[tab] ?? []).map((section) => (
                      <SectionRenderer
                        key={section.id}
                        section={section}
                        onWrite={writeSection}
                      />
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}

        {/* Empty state */}
        {sections.length === 0 && notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-3">
            <div className="text-4xl">🌱</div>
            <p className="text-muted-foreground text-sm">
              Your garden is empty. Ask Claude to add something.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
