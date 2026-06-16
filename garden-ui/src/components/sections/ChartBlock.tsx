import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { Section } from "@/types"

interface Props {
  section: Section
}

const CHART_COLORS = [
  "oklch(0.488 0.243 264.376)",
  "oklch(0.696 0.17 162.48)",
  "oklch(0.769 0.188 70.08)",
  "oklch(0.627 0.265 303.9)",
  "oklch(0.645 0.246 16.439)",
]

const AXIS_STYLE = { fill: "oklch(0.65 0 0)", fontSize: 12 }
const GRID_STYLE = { stroke: "oklch(1 0 0 / 8%)" }
const TOOLTIP_STYLE = {
  backgroundColor: "oklch(0.145 0 0)",
  border: "1px solid oklch(1 0 0 / 10%)",
  borderRadius: "6px",
  color: "oklch(0.985 0 0)",
  fontSize: 12,
}

export function ChartBlock({ section }: Props) {
  const d = section.data as {
    chart_type?: string
    x_data?: (string | number)[]
    y_data?: number[]
    color?: string
    x_label?: string
    y_label?: string
  }

  const chartType = d.chart_type ?? "bar"
  const xData = d.x_data ?? []
  const yData = d.y_data ?? []
  const color = d.color ?? CHART_COLORS[0]

  const data = xData.map((x, i) => ({ name: String(x), value: yData[i] ?? 0 }))

  return (
    <div>
      {section.title && (
        <h3 className="text-sm font-semibold text-foreground mb-3">{section.title}</h3>
      )}
      <ResponsiveContainer width="100%" height={260}>
        {chartType === "pie" ? (
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        ) : chartType === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" {...GRID_STYLE} />
            <XAxis dataKey="name" tick={AXIS_STYLE} label={d.x_label ? { value: d.x_label, position: "insideBottom", offset: -4, ...AXIS_STYLE } : undefined} />
            <YAxis tick={AXIS_STYLE} label={d.y_label ? { value: d.y_label, angle: -90, position: "insideLeft", ...AXIS_STYLE } : undefined} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        ) : chartType === "area" ? (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" {...GRID_STYLE} />
            <XAxis dataKey="name" tick={AXIS_STYLE} />
            <YAxis tick={AXIS_STYLE} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} />
          </AreaChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" {...GRID_STYLE} />
            <XAxis dataKey="name" tick={AXIS_STYLE} />
            <YAxis tick={AXIS_STYLE} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
