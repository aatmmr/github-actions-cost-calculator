import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatWorkflowName, formatCurrency } from '@/utils/usageCsvService'

type ChartDataItem = {
  name: string
  cost: number
  minutes: number
  runs: number
}

type UsageCostBarChartProps = {
  data: ChartDataItem[]
  groupingMode: 'workflow' | 'job'
}

// OKLCH-based color palette
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

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: ChartDataItem }>; label?: string }) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-card-foreground mb-1">{label}</p>
      <div className="space-y-0.5 text-muted-foreground">
        <p>Cost: <span className="text-card-foreground font-medium">{formatCurrency(data.cost)}</span></p>
        <p>Minutes: <span className="text-card-foreground">{data.minutes.toLocaleString()}</span></p>
        <p>Runs: <span className="text-card-foreground">{data.runs.toLocaleString()}</span></p>
      </div>
    </div>
  )
}

export function UsageCostBarChart({ data, groupingMode }: UsageCostBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        No data to display
      </div>
    )
  }

  // For bar chart, format names for display and limit to top items
  const chartData = data.slice(0, 10).map((item) => ({
    ...item,
    displayName: groupingMode === 'workflow' 
      ? formatWorkflowName(item.name)
      : item.name.length > 20 ? item.name.slice(0, 20) + '…' : item.name,
  }))

  // Use horizontal layout if names are long
  const isHorizontal = chartData.some(d => d.displayName.length > 15)
  const chartHeight = isHorizontal ? Math.max(300, chartData.length * 40) : 300

  if (isHorizontal) {
    return (
      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={true} vertical={false} />
            <XAxis 
              type="number"
              tickFormatter={(value) => `$${value.toFixed(2)}`}
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis
              type="category"
              dataKey="displayName"
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              width={90}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-muted)', opacity: 0.1 }} />
            <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="displayName"
            stroke="var(--color-muted-foreground)"
            fontSize={11}
            angle={-45}
            textAnchor="end"
            height={60}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(value) => `$${value.toFixed(2)}`}
            stroke="var(--color-muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-muted)', opacity: 0.1 }} />
          <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
