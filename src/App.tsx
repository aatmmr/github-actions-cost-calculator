import { useMemo, useState, useRef } from 'react'
import { Calculator, TrendUp, Check, Warning, ChartBar, ListChecks, SquaresFour, Coins, ArrowsLeftRight, Clock, Hourglass, CalendarCheck, CalendarBlank, ArrowRight, GithubLogo, Export, Upload } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { exportSelectionToCsv, parseSelectionFromCsv, downloadCsv } from '@/utils/runnerSelectionCsvService'
import { UsageAnalysis } from '@/components/UsageAnalysis'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar, AppView } from '@/components/AppSidebar'
import {
  GITHUB_HOSTED_RUNNERS,
  GITHUB_PLANS,
  MINUTES_IN_WEEK,
  MINUTES_IN_MONTH,
  DEFAULT_RUNNER_IDS,
  type RunnerType,
  type GitHubPlan,
} from '@/data/runners'

type RunnerType = {
  id: string
  name: string
  os: 'Linux' | 'Windows' | 'macOS'
  pricePerMinute: number
  category: 'standard' | 'x64-large' | 'arm64-large' | 'gpu'
  imageLabels?: string[]
}

type GitHubPlan = {
  id: 'enterprise' | 'team' | 'free'
  name: string
  includedMinutes: number
  budgetUsd: number
}

const GITHUB_HOSTED_RUNNERS: RunnerType[] = [
  // Standard GitHub-hosted runners (2026 pricing)
  { id: 'linux_slim', name: 'Linux 1-core (slim)', os: 'Linux', pricePerMinute: 0.002, category: 'standard', imageLabels: ['ubuntu-slim'] },
  { id: 'linux', name: 'Linux 2-core', os: 'Linux', pricePerMinute: 0.006, category: 'standard' },
  { id: 'windows', name: 'Windows 2-core', os: 'Windows', pricePerMinute: 0.010, category: 'standard' },
  { id: 'macos', name: 'macOS 3-core/4-core', os: 'macOS', pricePerMinute: 0.062, category: 'standard', imageLabels: ['macos-latest'] },

  // x64-powered larger runners (2026 pricing)
  { id: 'linux_2_core_advanced', name: 'Linux 2-core (advanced)', os: 'Linux', pricePerMinute: 0.006, category: 'x64-large' },
  { id: 'linux_4_core', name: 'Linux 4-core', os: 'Linux', pricePerMinute: 0.012, category: 'x64-large', imageLabels: ['ubuntu-latest'] },
  { id: 'linux_8_core', name: 'Linux 8-core', os: 'Linux', pricePerMinute: 0.022, category: 'x64-large' },
  { id: 'linux_16_core', name: 'Linux 16-core', os: 'Linux', pricePerMinute: 0.042, category: 'x64-large' },
  { id: 'linux_32_core', name: 'Linux 32-core', os: 'Linux', pricePerMinute: 0.082, category: 'x64-large' },
  { id: 'linux_64_core', name: 'Linux 64-core', os: 'Linux', pricePerMinute: 0.162, category: 'x64-large' },
  { id: 'linux_96_core', name: 'Linux 96-core', os: 'Linux', pricePerMinute: 0.252, category: 'x64-large' },
  { id: 'windows_4_core', name: 'Windows 4-core', os: 'Windows', pricePerMinute: 0.022, category: 'x64-large', imageLabels: ['windows-latest'] },
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

const DEFAULT_RUNNER_OVERVIEW = GITHUB_HOSTED_RUNNERS.filter(
  (runner) => runner.imageLabels && runner.imageLabels.length > 0
)

const DEFAULT_RUNNER_IDS = DEFAULT_RUNNER_OVERVIEW.map((runner) => runner.id)

const MINUTES_IN_WEEK = 7 * 24 * 60
const MINUTES_IN_MONTH = 30 * 24 * 60 // simplified 30-day month for comparison

const GITHUB_PLANS: GitHubPlan[] = [
  { id: 'enterprise', name: 'Enterprise', includedMinutes: 50000, budgetUsd: 400 },
  { id: 'team', name: 'Team', includedMinutes: 3000, budgetUsd: 24 },
  { id: 'free', name: 'Free', includedMinutes: 2000, budgetUsd: 16 },
]

function App() {
  const [currentView, setCurrentView] = useState<AppView>({ section: 'calculator', tab: 'select' })
  const [inputMode, setInputMode] = useState<'cost' | 'minutes'>('cost')
  const [monthlyMinutes, setMonthlyMinutes] = useState('')
  const [costInput, setCostInput] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<GitHubPlan['id']>('enterprise')
  const [timeUnit, setTimeUnit] = useState<'minute' | 'hour' | 'week' | 'month'>('hour')
  const [selectedRunners, setSelectedRunners] = useState<string[]>(
    () => GITHUB_HOSTED_RUNNERS.map((runner) => runner.id)
  )
  const [usagePercent, setUsagePercent] = useState(100)
  const [invalidRunnerIds, setInvalidRunnerIds] = useState<string[]>([])
  const [showInvalidIdsModal, setShowInvalidIdsModal] = useState(false)
  const [csvError, setCsvError] = useState<string>('')
  const [showCsvErrorModal, setShowCsvErrorModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parsedInput = costInput ? parseFloat(costInput) : null

  // Helper to generate a cross-platform compatible timestamp for filenames
  const formatTimestampForFilename = () => {
    return new Date().toISOString().split('T').join('_').replace(/[:.]/g, '-').slice(0, 19)
  }

  // Handler for exporting selected runners to CSV
  const handleExport = () => {
    const filename = `runner-selection-${formatTimestampForFilename()}.csv`
    const csvContent = exportSelectionToCsv(selectedRunners, GITHUB_HOSTED_RUNNERS)
    downloadCsv(csvContent, filename)
  }

  // Handler for importing runner selection from CSV
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string
        const validRunnerIds = GITHUB_HOSTED_RUNNERS.map(r => r.id)
        const { validIds, invalidIds } = parseSelectionFromCsv(csvContent, validRunnerIds)

        // Update selection with valid IDs
        setSelectedRunners(validIds)

        // Show modal if there are invalid IDs
        if (invalidIds.length > 0) {
          setInvalidRunnerIds(invalidIds)
          setShowInvalidIdsModal(true)
        }
      } catch (error) {
        setCsvError(error instanceof Error ? error.message : 'Unknown error occurred while parsing CSV')
        setShowCsvErrorModal(true)
      }
    }
    reader.readAsText(file)

    // Reset file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const planDetails = useMemo(
    () => GITHUB_PLANS.find((plan) => plan.id === selectedPlan),
    [selectedPlan]
  )

  const calculatePlanMinutes = (pricePerMinute: number) => {
    if (!planDetails) return null
    return Math.floor(planDetails.budgetUsd / pricePerMinute)
  }

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

  // Usage percentage increases the calculated price per minute
  const selfHostedCostPerMinute = baseSelfHostedCostPerMinute !== null && usagePercent > 0
    ? baseSelfHostedCostPerMinute / (usagePercent / 100)
    : null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(value)
  }

  const formatCurrencyUsd2 = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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

  const parsedMinutes = useMemo(() => {
    if (!monthlyMinutes) return null
    const parsed = Number(monthlyMinutes)
    const isValid =
      Number.isFinite(parsed) &&
      Number.isInteger(parsed) &&
      parsed > 0 &&
      parsed <= Number.MAX_SAFE_INTEGER
    return isValid ? parsed : null
  }, [monthlyMinutes])

  const monthlyCostData = useMemo(() => {
    if (parsedMinutes === null) return []
    
    return filteredRunners.map(runner => ({
      ...runner,
      monthlyCost: runner.pricePerMinute * parsedMinutes,
    })).sort((a, b) => a.monthlyCost - b.monthlyCost)
  }, [filteredRunners, parsedMinutes])

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
      const planMinutes = calculatePlanMinutes(data['GitHub-hosted'])

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
              Infrastructure: {formatCurrency(baseSelfHostedCostPerMinute ?? 0)}
            </p>
            {planMinutes !== null && (
              <p className="text-xs text-muted-foreground">
                Plan coverage: {planMinutes.toLocaleString()} min
              </p>
            )}
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
    <SidebarProvider defaultOpen={true}>
      <AppSidebar currentView={currentView} onNavigate={setCurrentView} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2">
            <Calculator size={24} weight="duotone" className="text-primary" />
            <h1 className="text-lg md:text-xl font-bold text-primary tracking-tight">
              GitHub Actions Cost Calculator
            </h1>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-6xl mx-auto space-y-6">

        {currentView.section === 'usage' ? (
          <UsageAnalysis />
        ) : (
          <>

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
                <Label htmlFor="github-plan" className="text-base font-medium">
                  GitHub Plan
                </Label>
                <RadioGroup
                  id="github-plan"
                  value={selectedPlan}
                  onValueChange={(value) => setSelectedPlan(value as GitHubPlan['id'])}
                  className="grid gap-3 md:grid-cols-3"
                >
                  {GITHUB_PLANS.map((plan) => (
                    <label
                      key={plan.id}
                      className="flex cursor-pointer flex-col gap-1 rounded-lg border bg-card px-4 py-3 shadow-sm transition hover:border-primary/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value={plan.id} id={plan.id} />
                          <span className="font-semibold text-foreground">{plan.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs font-semibold">
                          {plan.includedMinutes.toLocaleString()} min
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Budget: ${plan.budgetUsd.toFixed(0)}</p>
                    </label>
                  ))}
                </RadioGroup>
                {planDetails && (
                  <p className="text-xs text-muted-foreground">
                    {planDetails.name} plan includes {planDetails.includedMinutes.toLocaleString()} build minutes (${planDetails.budgetUsd.toFixed(0)} value).
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="input-mode" className="text-base font-medium">
                  Input Mode
                </Label>
                <RadioGroup
                  id="input-mode"
                  value={inputMode}
                  onValueChange={(value) => setInputMode(value as 'cost' | 'minutes')}
                  className="flex gap-4 flex-wrap"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cost" id="cost" />
                    <Label htmlFor="cost" className="cursor-pointer font-normal inline-flex items-center gap-2">
                      <Coins size={16} weight="duotone" className="text-muted-foreground" />
                      Runner Cost
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minutes" id="minutes" />
                    <Label htmlFor="minutes" className="cursor-pointer font-normal inline-flex items-center gap-2">
                      <Clock size={16} weight="duotone" className="text-muted-foreground" />
                      Build Minutes
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {inputMode === 'cost' && (
              <>
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

              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-start gap-6 w-full">
                  <div className="space-y-2 flex-1 min-w-[240px] md:basis-[30%]">
                    <Label htmlFor="cost-input" className="text-base font-medium">
                      Infrastructure Cost (USD)
                    </Label>
                    <div className="relative w-full">
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
                    <p className="text-xs text-muted-foreground mt-1">
                      Add the cost for a single runner for the selected time unit.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 items-start pt-1">
                    <Label htmlFor="usage-percent" className="text-base font-medium">Usage Rate (%)</Label>
                    <div className="flex items-center gap-3">
                    <ArrowRight size={20} weight="duotone" className="text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <Input
                        id="usage-percent"
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        value={usagePercent}
                        onChange={(e) => setUsagePercent(Number(e.target.value))}
                        className="w-16 text-center text-lg h-12 px-2"
                        aria-label="Usage Percentage"
                      />
                      <span className="text-base font-medium text-muted-foreground">%</span>
                    </div>
                    <ArrowRight size={20} weight="duotone" className="text-muted-foreground" />
                  </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Relative usage of this runner.
                    </p>
                  </div>

                  <div className="space-y-2 flex-1 min-w-[200px] md:basis-[30%]">
                    <Label className="text-base font-medium">Calculated Cost (/min)</Label>
                    <div className="flex h-12 items-center rounded-md border bg-muted/50 px-3 text-lg font-semibold text-foreground min-w-[180px]">
                      {selfHostedCostPerMinute !== null ? formatCurrency(selfHostedCostPerMinute) : '—'}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      The effective cost per minute based on your input and usage percentage.
                    </p>
                  </div>
                </div>
              </div>
              </>
              )}

              {inputMode === 'minutes' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly-minutes" className="text-base font-medium">
                    Monthly Build Minutes
                  </Label>
                  <Input
                    id="monthly-minutes"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g., 10000"
                    value={monthlyMinutes}
                    onChange={(e) => setMonthlyMinutes(e.target.value)}
                    className="text-lg h-12"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter your estimated monthly workflow minutes
                  </p>
                  {monthlyMinutes && parsedMinutes === null && (
                    <p className="text-xs text-destructive mt-1">
                      Please enter a valid positive number of minutes
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base font-medium">Quick Select</Label>
                  <div className="flex flex-wrap gap-2">
                    {[1000, 5000, 10000, 50000, 100000].map((minutes) => (
                      <Button
                        key={minutes}
                        variant="outline"
                        size="sm"
                        onClick={() => setMonthlyMinutes(minutes.toString())}
                        className="font-medium"
                      >
                        {minutes.toLocaleString()}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              )}
            </div>
          </CardContent>
        </Card>

        {currentView.tab === 'select' && (
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-2xl">Select GitHub-hosted runners</CardTitle>
                    <CardDescription>
                      Toggle which runners appear in the chart and comparison (2026 pricing)
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRunners(GITHUB_HOSTED_RUNNERS.map((r) => r.id))}
                    >
                      Select all
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRunners(DEFAULT_RUNNER_IDS)}
                    >
                      Select Default Runners
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRunners([])}
                    >
                      Deselect all
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      disabled={selectedRunners.length === 0}
                    >
                      <Export weight="duotone" className="mr-1" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload weight="duotone" className="mr-1" />
                      Import
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleImport}
                      style={{ display: 'none' }}
                    />
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
                          const planMinutes = calculatePlanMinutes(runner.pricePerMinute)
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
                              <div className="flex flex-col gap-1">
                                <div className="flex items-start justify-between gap-2">
                                  <span className="font-medium leading-tight">{runner.name}</span>
                                  {runner.imageLabels && runner.imageLabels.length > 0 && (
                                    <div className="flex flex-wrap items-center justify-end gap-1">
                                      {runner.imageLabels.map((label) => (
                                        <Badge key={label} variant="secondary" className="text-[10px]">
                                          {label}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">{formatCurrency(runner.pricePerMinute)}/min</span>
                                {planMinutes !== null && (
                                  <span className="text-[11px] text-muted-foreground">Included Minutes: {planMinutes.toLocaleString()}</span>
                                )}
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
        )}

        {currentView.tab === 'visual' && (
            selfHostedCostPerMinute !== null ? (
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
            )
        )}

        {currentView.tab === 'examples' && (
            selfHostedCostPerMinute !== null ? (
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
                            {planDetails && (
                              <p className="text-[11px] text-muted-foreground mt-1">
                                Included Minutes: {calculatePlanMinutes(runner.pricePerMinute)?.toLocaleString()}
                              </p>
                            )}
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
            )
        )}

        {currentView.tab === 'comparison' && (
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
                            {planDetails && (
                              <p className="text-xs text-muted-foreground">
                                Included Minutes available: {calculatePlanMinutes(runner.pricePerMinute)?.toLocaleString()}
                              </p>
                            )}
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
                                  The effective cost per minute based on your input
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
        )}

        {inputMode === 'minutes' && monthlyCostData.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ChartBar size={24} weight="duotone" className="text-primary" />
                <CardTitle className="text-2xl">Monthly Cost Comparison</CardTitle>
              </div>
              <CardDescription>
                Estimated monthly cost for {parsedMinutes?.toLocaleString()} build minutes across all selected runners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-3 pr-4 font-medium text-muted-foreground">Runner</th>
                      <th className="py-3 px-4 font-medium text-muted-foreground">OS</th>
                      <th className="py-3 px-4 font-medium text-muted-foreground text-right">Per Minute</th>
                      <th className="py-3 px-4 font-medium text-muted-foreground text-right">Monthly Cost</th>
                      <th className="py-3 px-4 font-medium text-muted-foreground text-right">vs. Cheapest</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {monthlyCostData.map((runner, index) => {
                      const isLowest = index === 0
                      const costDiff = isLowest ? 0 : runner.monthlyCost - monthlyCostData[0].monthlyCost
                      
                      return (
                        <tr key={runner.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 pr-4">
                            <span className="font-medium text-foreground">{runner.name}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={getOSBadgeColor(runner.os)}>
                              {runner.os}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums text-foreground">
                            {formatCurrency(runner.pricePerMinute)}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums font-semibold text-foreground">
                            {formatCurrencyUsd2(runner.monthlyCost)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isLowest ? (
                              <div className="inline-flex items-center gap-1.5 text-success font-semibold">
                                <Check size={16} weight="bold" />
                                <span>Lowest</span>
                              </div>
                            ) : (
                              <span className="text-destructive font-medium tabular-nums">
                                +{formatCurrencyUsd2(costDiff)}
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

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

        <Card className="shadow-lg">
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-6">
            <a
              href="https://github.com/aatmmr/github-actions-cost-calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              <GithubLogo size={22} weight="duotone" />
              Help adding some ✨
            </a>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <img
                src="https://github.com/aatmmr.png?size=80"
                alt="GitHub avatar for aatmmr"
                className="h-10 w-10 rounded-full border border-border"
                loading="lazy"
              />
              <div className="leading-tight">
                <p className="font-semibold text-foreground">Built with ✨ by</p>
                <a
                  href="https://github.com/aatmmr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  @aatmmr
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Modal for displaying invalid runner IDs */}
      <Dialog open={showInvalidIdsModal} onOpenChange={setShowInvalidIdsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unsupported Runners</DialogTitle>
            <DialogDescription>
              The following runner IDs from your CSV file are not recognized or supported:
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto rounded-md border p-4">
            <ul className="list-disc list-inside space-y-1">
              {invalidRunnerIds.map((id) => (
                <li key={id} className="text-sm font-mono">
                  {id}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowInvalidIdsModal(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal for displaying CSV parsing errors */}
      <Dialog open={showCsvErrorModal} onOpenChange={setShowCsvErrorModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>CSV Import Error</DialogTitle>
            <DialogDescription>
              There was an error parsing your CSV file:
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border p-4 bg-muted">
            <p className="text-sm text-destructive">{csvError}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCsvErrorModal(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
        )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default App