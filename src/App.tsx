import { useMemo, useState } from 'react'
import { Calculator, TrendUp, Check, Warning, ChartBar, ListChecks, SquaresFour, Coins, ArrowsLeftRight, Clock, Hourglass, CalendarCheck, CalendarBlank, ArrowRight } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

type RunnerType = {
  id: string
  name: string
  os: 'Linux' | 'Windows' | 'macOS'
  pricePerMinute: number
  category: 'standard' | 'x64-large' | 'arm64-large' | 'gpu'
}

const GITHUB_HOSTED_RUNNERS: RunnerType[] = [
  // Standard GitHub-hosted runners (2026 pricing)
  { id: 'linux_slim', name: 'Linux 1-core (slim)', os: 'Linux', pricePerMinute: 0.002, category: 'standard' },
  { id: 'linux', name: 'Linux 2-core', os: 'Linux', pricePerMinute: 0.006, category: 'standard' },
  { id: 'windows', name: 'Windows 2-core', os: 'Windows', pricePerMinute: 0.010, category: 'standard' },
  { id: 'macos', name: 'macOS 3-core/4-core', os: 'macOS', pricePerMinute: 0.062, category: 'standard' },

  // x64-powered larger runners (2026 pricing)
  { id: 'linux_2_core_advanced', name: 'Linux 2-core (advanced)', os: 'Linux', pricePerMinute: 0.006, category: 'x64-large' },
  { id: 'linux_4_core', name: 'Linux 4-core', os: 'Linux', pricePerMinute: 0.012, category: 'x64-large' },
  { id: 'linux_8_core', name: 'Linux 8-core', os: 'Linux', pricePerMinute: 0.022, category: 'x64-large' },
  { id: 'linux_16_core', name: 'Linux 16-core', os: 'Linux', pricePerMinute: 0.042, category: 'x64-large' },
  { id: 'linux_32_core', name: 'Linux 32-core', os: 'Linux', pricePerMinute: 0.082, category: 'x64-large' },
  { id: 'linux_64_core', name: 'Linux 64-core', os: 'Linux', pricePerMinute: 0.162, category: 'x64-large' },
  { id: 'linux_96_core', name: 'Linux 96-core', os: 'Linux', pricePerMinute: 0.252, category: 'x64-large' },
  { id: 'windows_4_core', name: 'Windows 4-core', os: 'Windows', pricePerMinute: 0.022, category: 'x64-large' },
  { id: 'windows_8_core', name: 'Windows 8-core', os: 'Windows', pricePerMinute: 0.042, category: 'x64-large' },
  { id: 'windows_16_core', name: 'Windows 16-core', os: 'Windows', pricePerMinute: 0.082, category: 'x64-large' },
  { id: 'windows_32_core', name: 'Windows 32-core', os: 'Windows', pricePerMinute: 0.162, category: 'x64-large' },
  { id: 'windows_64_core', name: 'Windows 64-core', os: 'Windows', pricePerMinute: 0.322, category: 'x64-large' },
  { id: 'windows_96_core', name: 'Windows 96-core', os: 'Windows', pricePerMinute: 0.552, category: 'x64-large' },
  { id: 'macos_l', name: 'macOS 12-core', os: 'macOS', pricePerMinute: 0.077, category: 'x64-large' },

  // arm64-powered larger runners (2026 pricing)
  { id: 'linux_2_core_arm', name: 'Linux 2-core (ARM)', os: 'Linux', pricePerMinute: 0.005, category: 'arm64-large' },
  { id: 'linux_4_core_arm', name: 'Linux 4-core (ARM)', os: 'Linux', pricePerMinute: 0.008, category: 'arm64-large' },
  { id: 'linux_8_core_arm', name: 'Linux 8-core (ARM)', os: 'Linux', pricePerMinute: 0.014, category: 'arm64-large' },
  { id: 'linux_16_core_arm', name: 'Linux 16-core (ARM)', os: 'Linux', pricePerMinute: 0.026, category: 'arm64-large' },
  { id: 'linux_32_core_arm', name: 'Linux 32-core (ARM)', os: 'Linux', pricePerMinute: 0.050, category: 'arm64-large' },
  { id: 'linux_64_core_arm', name: 'Linux 64-core (ARM)', os: 'Linux', pricePerMinute: 0.098, category: 'arm64-large' },
  { id: 'windows_2_core_arm', name: 'Windows 2-core (ARM)', os: 'Windows', pricePerMinute: 0.008, category: 'arm64-large' },
  { id: 'windows_4_core_arm', name: 'Windows 4-core (ARM)', os: 'Windows', pricePerMinute: 0.014, category: 'arm64-large' },
  { id: 'windows_8_core_arm', name: 'Windows 8-core (ARM)', os: 'Windows', pricePerMinute: 0.026, category: 'arm64-large' },
  { id: 'windows_16_core_arm', name: 'Windows 16-core (ARM)', os: 'Windows', pricePerMinute: 0.050, category: 'arm64-large' },
  { id: 'windows_32_core_arm', name: 'Windows 32-core (ARM)', os: 'Windows', pricePerMinute: 0.098, category: 'arm64-large' },
  { id: 'windows_64_core_arm', name: 'Windows 64-core (ARM)', os: 'Windows', pricePerMinute: 0.194, category: 'arm64-large' },
  { id: 'macos_xl', name: 'macOS 5-core (M2 Pro)', os: 'macOS', pricePerMinute: 0.102, category: 'arm64-large' },

  // GPU-powered runners (2026 pricing)
  { id: 'linux_4_core_gpu', name: 'Linux 4-core (GPU)', os: 'Linux', pricePerMinute: 0.052, category: 'gpu' },
  { id: 'windows_4_core_gpu', name: 'Windows 4-core (GPU)', os: 'Windows', pricePerMinute: 0.102, category: 'gpu' },
]

const PLATFORM_FEE_PER_MINUTE = 0.002 // GitHub Actions cloud platform fee for self-hosted runners from Mar 1, 2026
const MINUTES_IN_WEEK = 7 * 24 * 60
const MINUTES_IN_MONTH = 30 * 24 * 60 // simplified 30-day month for comparison

function App() {
  const [costInput, setCostInput] = useState('')
  const [timeUnit, setTimeUnit] = useState<'minute' | 'hour' | 'week' | 'month'>('hour')
  const [selectedRunners, setSelectedRunners] = useState<string[]>(
    () => GITHUB_HOSTED_RUNNERS.map((runner) => runner.id)
  )

  const parsedInput = costInput ? parseFloat(costInput) : null

  const baseSelfHostedCostPerMinute = parsedInput !== null
    ? (() => {
        switch (timeUnit) {
          case 'minute':
            return parsedInput
          case 'hour':
            return parsedInput / 60
          case 'week':
            return parsedInput / MINUTES_IN_WEEK
          case 'month':
            return parsedInput / MINUTES_IN_MONTH
          default:
            return parsedInput
        }
      })()
    : null

  const selfHostedCostPerMinute =
    baseSelfHostedCostPerMinute !== null
      ? baseSelfHostedCostPerMinute + PLATFORM_FEE_PER_MINUTE
      : null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(value)
  }

  const calculateDifference = (githubPrice: number, selfHostedPrice: number) => {
    const difference = selfHostedPrice - githubPrice
    const percentageDiff = (difference / githubPrice) * 100
    return { difference, percentageDiff }
  }

  const getOSBadgeColor = (os: string) => {
    switch (os) {
      case 'Linux':
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
      case 'Linux':
        return 'oklch(0.70 0.15 40)'
      case 'Windows':
        return 'oklch(0.60 0.20 240)'
      case 'macOS':
        return 'oklch(0.50 0.05 250)'
      default:
        return 'oklch(0.50 0.05 250)'
    }
  }

  const filteredRunners = useMemo(
    () => GITHUB_HOSTED_RUNNERS.filter((runner) => selectedRunners.includes(runner.id)),
    [selectedRunners]
  )

  const chartData = selfHostedCostPerMinute !== null
    ? filteredRunners.map((runner) => ({
        name: runner.name,
        os: runner.os,
        'GitHub-hosted': runner.pricePerMinute,
        'Self-hosted': selfHostedCostPerMinute,
        difference: selfHostedCostPerMinute - runner.pricePerMinute,
      }))
    : []

  const exampleDurations = [1, 10, 15, 20, 30]

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
            <p className="text-xs text-muted-foreground">
              Includes {formatCurrency(baseSelfHostedCostPerMinute ?? 0)} infra + {formatCurrency(PLATFORM_FEE_PER_MINUTE)} fee
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
                  className="flex gap-4 flex-wrap"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minute" id="minute" />
                    <Label htmlFor="minute" className="cursor-pointer font-normal inline-flex items-center gap-2">
                      <Clock size={16} weight="duotone" className="text-muted-foreground" />
                      Per Minute
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hour" id="hour" />
                    <Label htmlFor="hour" className="cursor-pointer font-normal inline-flex items-center gap-2">
                      <Hourglass size={16} weight="duotone" className="text-muted-foreground" />
                      Per Hour
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="week" id="week" />
                    <Label htmlFor="week" className="cursor-pointer font-normal inline-flex items-center gap-2">
                      <CalendarCheck size={16} weight="duotone" className="text-muted-foreground" />
                      Per Week
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="month" id="month" />
                    <Label htmlFor="month" className="cursor-pointer font-normal inline-flex items-center gap-2">
                      <CalendarBlank size={16} weight="duotone" className="text-muted-foreground" />
                      Per Month
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] items-center">
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
                      placeholder={
                        timeUnit === 'minute'
                          ? '0.010'
                          : timeUnit === 'hour'
                            ? '0.600'
                            : timeUnit === 'week'
                              ? '10.000'
                              : '50.000'
                      }
                      value={costInput}
                      onChange={(e) => setCostInput(e.target.value)}
                      className="pl-7 text-lg h-12"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add the cost for a single runner for the selected time unit.
                  </p>
                </div>

                <div className="hidden md:flex items-center justify-center text-muted-foreground">
                  <ArrowRight size={28} weight="duotone" className="text-primary" />
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-medium">Calculated total (/min)</Label>
                  <div className="flex h-12 items-center rounded-md border bg-muted/50 px-3 text-lg font-semibold text-foreground">
                    {selfHostedCostPerMinute !== null ? formatCurrency(selfHostedCostPerMinute) : '—'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(baseSelfHostedCostPerMinute ?? 0)} infra + {formatCurrency(PLATFORM_FEE_PER_MINUTE)} platform fee
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="select" className="space-y-6">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="select">
              <ListChecks weight="duotone" />
              Select Runners
            </TabsTrigger>
            <TabsTrigger value="visual">
              <SquaresFour weight="duotone" />
              Visual Comparison
            </TabsTrigger>
            <TabsTrigger value="examples">
              <Coins weight="duotone" />
              Example Costs
            </TabsTrigger>
            <TabsTrigger value="comparison">
              <ArrowsLeftRight weight="duotone" />
              Cost Comparison
            </TabsTrigger>
          </TabsList>

          <TabsContent value="select">
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-2xl">Select GitHub-hosted runners</CardTitle>
                    <CardDescription>
                      Toggle which runners appear in the chart and comparison (2026 pricing)
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRunners(GITHUB_HOSTED_RUNNERS.map((r) => r.id))}
                    >
                      Select all
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRunners([])}
                    >
                      Deselect all
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Linux', 'Windows', 'macOS'].map((os) => {
                  const runnersForOS = GITHUB_HOSTED_RUNNERS.filter((runner) => runner.os === os)

                  return (
                    <div key={os} className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getOSBadgeColor(os)}>
                            {os}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{runnersForOS.length} runners</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Toggle to include in comparison</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSelectedRunners((prev) => {
                                const withOs = new Set(prev)
                                runnersForOS.forEach((r) => withOs.add(r.id))
                                return Array.from(withOs)
                              })
                            }
                          >
                            Select all {os}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSelectedRunners((prev) => prev.filter((id) => !runnersForOS.some((r) => r.id === id)))
                            }
                          >
                            Deselect all {os}
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {runnersForOS.map((runner) => {
                          const checked = selectedRunners.includes(runner.id)
                          return (
                            <label
                              key={runner.id}
                              className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 hover:border-primary/50 hover:shadow-sm cursor-pointer"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={(value) => {
                                  setSelectedRunners((prev) => {
                                    const isChecked = value === true
                                    if (isChecked) {
                                      return prev.includes(runner.id) ? prev : [...prev, runner.id]
                                    }
                                    return prev.filter((id) => id !== runner.id)
                                  })
                                }}
                                aria-label={`Toggle ${runner.name}`}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium leading-tight">{runner.name}</span>
                                <span className="text-xs text-muted-foreground">{formatCurrency(runner.pricePerMinute)}/min</span>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visual">
            {selfHostedCostPerMinute !== null ? (
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
                      <span className="text-sm text-muted-foreground">Linux</span>
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
            ) : (
              <Card className="shadow-lg">
                <CardContent className="py-10 text-center text-muted-foreground">
                  Enter your self-hosted cost to see the visual comparison.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="examples">
            {selfHostedCostPerMinute !== null ? (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">Example workflow costs</CardTitle>
                  <CardDescription>
                    Estimated cost for selected runners at common job durations (includes platform fee for self-hosted)
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse min-w-[720px]">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th className="py-2 pr-4 font-medium">Runner</th>
                        <th className="py-2 px-2 font-medium text-right">Delta vs self-hosted</th>
                        {exampleDurations.map((mins) => (
                          <th key={mins} className="py-2 px-2 font-medium text-right">{mins} min</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr className="bg-muted/40">
                        <td className="py-3 pr-4 font-semibold text-foreground">Self-hosted (incl. fee)</td>
                        <td className="py-3 px-2 text-right tabular-nums text-muted-foreground">—</td>
                        {exampleDurations.map((mins) => (
                          <td key={mins} className="py-3 px-2 text-right tabular-nums">{formatCurrency(selfHostedCostPerMinute * mins)}</td>
                        ))}
                      </tr>
                      {filteredRunners.map((runner) => (
                        <tr key={runner.id}>
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getOSBadgeColor(runner.os)}>{runner.os}</Badge>
                              <span className="font-medium text-foreground">{runner.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right tabular-nums">
                            {(() => {
                              const diff = runner.pricePerMinute - selfHostedCostPerMinute
                              const isCheaper = diff < 0
                              const isNeutral = Math.abs(diff) < 0.0005
                              const color = isCheaper ? 'text-success' : isNeutral ? 'text-muted-foreground' : 'text-destructive'
                              const icon = isCheaper ? '↓' : isNeutral ? '•' : '↑'
                              const pct = (diff / selfHostedCostPerMinute) * 100
                              return (
                                <span className={`inline-flex items-center justify-end gap-2 ${color}`}>
                                  <span className="font-semibold">{icon}</span>
                                  <span className="tabular-nums">{formatCurrency(Math.abs(diff))}/min</span>
                                  <span className="text-xs tabular-nums">({isCheaper ? '-' : '+'}{Math.abs(pct).toFixed(1)}%)</span>
                                </span>
                              )
                            })()}
                          </td>
                          {exampleDurations.map((mins) => (
                            <td key={mins} className="py-3 px-2 text-right tabular-nums">{formatCurrency(runner.pricePerMinute * mins)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredRunners.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center mt-4">Select at least one GitHub-hosted runner to see examples.</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg">
                <CardContent className="py-10 text-center text-muted-foreground">
                  Enter your self-hosted cost to see example workflow costs.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="comparison">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Cost Comparison</CardTitle>
                <CardDescription>
                  GitHub-hosted runner pricing for 2026 vs. your self-hosted costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRunners.map((runner, index) => {
                    const showSeparator =
                      index > 0 && runner.os !== filteredRunners[index - 1].os

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
                                  Self-hosted cost (incl. platform fee)
                                </p>
                                <p className="font-semibold text-lg tabular-nums">
                                  {formatCurrency(selfHostedCostPerMinute)}/min
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(baseSelfHostedCostPerMinute ?? 0)} infra + {formatCurrency(PLATFORM_FEE_PER_MINUTE)} fee
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

                {selfHostedCostPerMinute !== null && filteredRunners.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Select at least one GitHub-hosted runner to compare.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
            <p>
              A $0.002/min GitHub Actions platform fee (effective Mar 1, 2026) is automatically
              added to self-hosted costs in this calculator.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App