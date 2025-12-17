import { useState } from 'react'
import { Calculator, TrendUp, TrendDown, Check, Warning } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

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