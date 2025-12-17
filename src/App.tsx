import { useState } from 'react'
import { Calculator, TrendUp, TrendDown, Check, Warning, ChartBar } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

type RunnerType = {
  name: string
  os: 'Ubuntu' | 'Windows' | 'macOS'
  pricePerMinute: number
}

const GITHUB_HOSTED_RUNNERS: RunnerType[] = [
  { name: 'Ubuntu (2-core)', os: 'Ubuntu', pricePerMinute: 0.008 },
  { name: 'Ubuntu (4-core)', os: 'Ubuntu', pricePerMinute: 0.016 },
  { name: 'Ubuntu (8-core)', os: 'Ubuntu', pricePerMinute: 0.032 },
  { name: 'Ubuntu (16-core)', os: 'Ubuntu', pricePerMinute: 0.064 },
  { name: 'Ubuntu (64-core)', os: 'Ubuntu', pricePerMinute: 0.256 },
  { name: 'Windows (2-core)', os: 'Windows', pricePerMinute: 0.016 },
  { name: 'Windows (4-core)', os: 'Windows', pricePerMinute: 0.032 },
  { name: 'Windows (8-core)', os: 'Windows', pricePerMinute: 0.064 },
  { name: 'Windows (16-core)', os: 'Windows', pricePerMinute: 0.128 },
  { name: 'Windows (64-core)', os: 'Windows', pricePerMinute: 0.512 },
  { name: 'macOS (3-core)', os: 'macOS', pricePerMinute: 0.08 },
  { name: 'macOS (6-core M1)', os: 'macOS', pricePerMinute: 0.16 },
  { name: 'macOS (12-core M1)', os: 'macOS', pricePerMinute: 0.32 },
]

function App() {
  const [costInput, setCostInput] = useState('')
  const [timeUnit, setTimeUnit] = useState<'minute' | 'hour'>('hour')

  const selfHostedCostPerMinute = costInput
    ? timeUnit === 'minute'
      ? parseFloat(costInput)
      : parseFloat(costInput) / 60
    : null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(value)
  }

  const calculateDifference = (githubPrice: number, selfHostedPrice: number) => {
    const difference = selfHostedPrice - githubPrice
    const percentageDiff = (difference / githubPrice) * 100
    return { difference, percentageDiff }
  }

  const getOSBadgeColor = (os: string) => {
    switch (os) {
      case 'Ubuntu':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'Windows':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'macOS':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getOSChartColor = (os: string) => {
    switch (os) {
      case 'Ubuntu':
        return 'oklch(0.70 0.15 40)'
      case 'Windows':
        return 'oklch(0.60 0.20 240)'
      case 'macOS':
        return 'oklch(0.50 0.05 250)'
      default:
        return 'oklch(0.50 0.05 250)'
    }
  }

  const chartData = selfHostedCostPerMinute !== null ? GITHUB_HOSTED_RUNNERS.map(runner => ({
    name: runner.name,
    os: runner.os,
    'GitHub-hosted': runner.pricePerMinute,
    'Self-hosted': selfHostedCostPerMinute,
    difference: selfHostedCostPerMinute - runner.pricePerMinute,
  })) : []

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const difference = data.difference
      const isSavings = difference < 0
      const percentageDiff = (difference / data['GitHub-hosted']) * 100

      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              GitHub-hosted: <span className="font-medium text-foreground">{formatCurrency(data['GitHub-hosted'])}/min</span>
            </p>
            <p className="text-muted-foreground">
              Self-hosted: <span className="font-medium text-foreground">{formatCurrency(data['Self-hosted'])}/min</span>
            </p>
            <Separator className="my-2" />
            <p className={isSavings ? 'text-success font-semibold' : 'text-destructive font-semibold'}>
              {isSavings ? 'Savings' : 'Extra cost'}: {formatCurrency(Math.abs(difference))}/min
            </p>
            <p className={isSavings ? 'text-success text-xs' : 'text-destructive text-xs'}>
              ({isSavings ? '-' : '+'}{Math.abs(percentageDiff).toFixed(1)}%)
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Calculator size={36} weight="duotone" className="text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
              GitHub Actions Cost Calculator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Compare the cost of GitHub-hosted runners vs. self-hosted infrastructure
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Self-Hosted Infrastructure Cost</CardTitle>
            <CardDescription>
              Enter your infrastructure cost to compare against GitHub-hosted runners
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="time-unit" className="text-base font-medium">
                  Time Unit
                </Label>
                <RadioGroup
                  id="time-unit"
                  value={timeUnit}
                  onValueChange={(value) => setTimeUnit(value as 'minute' | 'hour')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minute" id="minute" />
                    <Label htmlFor="minute" className="cursor-pointer font-normal">
                      Per Minute
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hour" id="hour" />
                    <Label htmlFor="hour" className="cursor-pointer font-normal">
                      Per Hour
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost-input" className="text-base font-medium">
                  Infrastructure Cost (USD)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="cost-input"
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder={timeUnit === 'minute' ? '0.0100' : '0.6000'}
                    value={costInput}
                    onChange={(e) => setCostInput(e.target.value)}
                    className="pl-7 text-lg h-12"
                  />
                </div>
                {selfHostedCostPerMinute !== null && (
                  <p className="text-sm text-muted-foreground">
                    Cost per minute: {formatCurrency(selfHostedCostPerMinute)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {selfHostedCostPerMinute !== null && (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ChartBar size={24} weight="duotone" className="text-primary" />
                <CardTitle className="text-2xl">Visual Comparison</CardTitle>
              </div>
              <CardDescription>
                Cost per minute comparison across all runner types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 250)" opacity={0.3} />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fill: 'oklch(0.45 0.02 250)', fontSize: 12 }}
                  />
                  <YAxis
                    label={{ value: 'Cost per minute (USD)', angle: -90, position: 'insideLeft', style: { fill: 'oklch(0.45 0.02 250)' } }}
                    tick={{ fill: 'oklch(0.45 0.02 250)', fontSize: 12 }}
                    tickFormatter={(value) => `$${value.toFixed(3)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="square"
                  />
                  <Bar dataKey="GitHub-hosted" name="GitHub-hosted" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getOSChartColor(entry.os)} />
                    ))}
                  </Bar>
                  <Bar dataKey="Self-hosted" name="Self-hosted" fill="oklch(0.70 0.15 210)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'oklch(0.70 0.15 40)' }} />
                  <span className="text-sm text-muted-foreground">Ubuntu</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'oklch(0.60 0.20 240)' }} />
                  <span className="text-sm text-muted-foreground">Windows</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'oklch(0.50 0.05 250)' }} />
                  <span className="text-sm text-muted-foreground">macOS</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Cost Comparison</CardTitle>
            <CardDescription>
              GitHub-hosted runner pricing for 2026 vs. your self-hosted costs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {GITHUB_HOSTED_RUNNERS.map((runner, index) => {
                const showSeparator =
                  index > 0 && runner.os !== GITHUB_HOSTED_RUNNERS[index - 1].os

                return (
                  <div key={runner.name}>
                    {showSeparator && <Separator className="my-6" />}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getOSBadgeColor(runner.os)}
                          >
                            {runner.os}
                          </Badge>
                          <h3 className="font-semibold text-lg">{runner.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          GitHub-hosted: {formatCurrency(runner.pricePerMinute)}/min
                        </p>
                      </div>

                      {selfHostedCostPerMinute !== null && (
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Self-hosted cost
                            </p>
                            <p className="font-semibold text-lg tabular-nums">
                              {formatCurrency(selfHostedCostPerMinute)}/min
                            </p>
                          </div>
                          <div className="w-px h-12 bg-border" />
                          <div className="text-right min-w-[140px]">
                            {(() => {
                              const { difference, percentageDiff } =
                                calculateDifference(
                                  runner.pricePerMinute,
                                  selfHostedCostPerMinute
                                )
                              const isSavings = difference < 0
                              const isNeutral = Math.abs(percentageDiff) < 5

                              return (
                                <div
                                  className={`space-y-1 ${
                                    isSavings
                                      ? 'text-success'
                                      : isNeutral
                                        ? 'text-warning'
                                        : 'text-destructive'
                                  }`}
                                >
                                  <div className="flex items-center justify-end gap-1">
                                    {isSavings ? (
                                      <Check size={18} weight="bold" />
                                    ) : isNeutral ? (
                                      <Warning size={18} weight="bold" />
                                    ) : (
                                      <TrendUp size={18} weight="bold" />
                                    )}
                                    <p className="font-bold text-lg tabular-nums">
                                      {isSavings ? '' : '+'}
                                      {formatCurrency(Math.abs(difference))}
                                    </p>
                                  </div>
                                  <p className="text-sm font-medium tabular-nums">
                                    {isSavings
                                      ? `${Math.abs(percentageDiff).toFixed(1)}% savings`
                                      : isNeutral
                                        ? `${percentageDiff.toFixed(1)}% difference`
                                        : `${percentageDiff.toFixed(1)}% more`}
                                  </p>
                                </div>
                              )
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {selfHostedCostPerMinute === null && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Enter your self-hosted infrastructure cost above to see the comparison</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-accent/20 bg-accent/5">
          <CardHeader>
            <CardTitle className="text-xl">About This Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              This calculator helps you compare the cost of GitHub-hosted runners versus
              self-hosted infrastructure for GitHub Actions workflows.
            </p>
            <p>
              GitHub-hosted runner pricing shown is based on the official 2026 rates from{' '}
              <a
                href="https://docs.github.com/en/billing/reference/actions-runner-pricing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-medium"
              >
                GitHub's documentation
              </a>
              .
            </p>
            <p>
              Self-hosted costs should include infrastructure expenses (compute, storage,
              networking) divided by expected usage to determine your per-minute or per-hour
              rate.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App