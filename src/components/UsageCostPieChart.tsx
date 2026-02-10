import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { formatWorkflowName, formatCurrency } from '@/utils/usageCsvService'

type ChartDataItem = {
  name: string
  cost: number
  minutes: number
  runs: number
}

type UsageCostPieChartProps = {
  data: ChartDataItem[]
  totalCost: number
}

// OKLCH-based color palette for consistent theming
const COLORS = [
  'oklch(0.65 0.18 25)',   // Orange
  'oklch(0.65 0.15 250)',  // Blue
  'oklch(0.65 0.15 150)',  // Green
  'oklch(0.65 0.15 300)',  // Purple
  'oklch(0.65 0.15 50)',   // Yellow
  'oklch(0.65 0.15 200)',  // Cyan
  'oklch(0.65 0.15 350)',  // Pink
  'oklch(0.55 0.12 25)',   // Dark Orange
  'oklch(0.55 0.12 250)',  // Dark Blue
  'oklch(0.55 0.12 150)',  // Dark Green
]

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartDataItem }> }) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-card-foreground mb-1">{formatWorkflowName(data.name)}</p>
      <div className="space-y-0.5 text-muted-foreground">
        <p>Cost: <span className="text-card-foreground font-medium">{formatCurrency(data.cost)}</span></p>
        <p>Minutes: <span className="text-card-foreground">{data.minutes.toLocaleString()}</span></p>
        <p>Runs: <span className="text-card-foreground">{data.runs.toLocaleString()}</span></p>
      </div>
    </div>
  )
}

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload) return null

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {payload.slice(0, 6).map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5 text-xs">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground truncate max-w-24">
            {formatWorkflowName(entry.value)}
          </span>
        </div>
      ))}
      {payload.length > 6 && (
        <span className="text-xs text-muted-foreground">+{payload.length - 6} more</span>
      )}
    </div>
  )
}

export function UsageCostPieChart({ data, totalCost }: UsageCostPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No data to display
      </div>
    )
  }

  return (
    <div className="h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="cost"
            nameKey="name"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '-20px' }}>
        <div className="text-center">
          <p className="text-2xl font-bold text-card-foreground">{formatCurrency(totalCost)}</p>
          <p className="text-xs text-muted-foreground">Total Cost</p>
        </div>
      </div>
    </div>
  )
}
