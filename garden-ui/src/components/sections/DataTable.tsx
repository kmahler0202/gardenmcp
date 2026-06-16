import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Section } from "@/types"

interface Props {
  section: Section
}

export function DataTable({ section }: Props) {
  const rows: Record<string, unknown>[] = (section.data.rows as Record<string, unknown>[]) ?? []
  const columns: string[] = rows.length > 0 ? Object.keys(rows[0]) : []

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">No data</p>
    )
  }

  return (
    <div>
      {section.title && (
        <h3 className="text-sm font-semibold text-foreground mb-3">{section.title}</h3>
      )}
      <div className="rounded-md border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              {columns.map((col) => (
                <TableHead
                  key={col}
                  className="text-xs text-muted-foreground uppercase tracking-wide h-9"
                >
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i} className="border-border/50 hover:bg-muted/30">
                {columns.map((col) => (
                  <TableCell key={col} className="text-sm py-2">
                    {String(row[col] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
