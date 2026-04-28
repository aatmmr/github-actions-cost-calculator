import { useState, useMemo } from 'react'
import {
  COPILOT_MODELS,
  COPILOT_PLANS,
  COPILOT_PROVIDERS,
  AI_CREDIT_VALUE_USD,
  calculateTokenCost,
  estimateTokenCount,
  type CopilotModel,
  type CopilotPlanId,
} from '@/data/copilotModels'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts'
import { ArrowUp, ArrowDown, Coins, Robot, ChartBar, Table as TableIcon, TextT, ArrowsDownUp } from '@phosphor-icons/react'

export type CopilotTab = 'calculator' | 'prompt' | 'plans' | 'models'

interface CopilotCalculatorProps {
  activeTab: CopilotTab
  onTabChange: (tab: CopilotTab) => void
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatUsd(value: number, digits = 4): string {
  if (value === 0) return '$0.00'
  if (value < 0.0001) {
    return `$${value.toExponential(2)}`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits > 2 ? 2 : digits,
    maximumFractionDigits: digits,
  }).format(value)
}

function formatCredits(credits: number): string {
  if (credits === 0) return '0'
  if (credits < 0.01) return `<0.01`
  return credits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const TOKEN_MAX = 10_000_000

function TokenInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-xs text-muted-foreground">{value.toLocaleString()} tokens</span>
      </div>
      <Slider
        min={0}
        max={TOKEN_MAX}
        step={10000}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
      />
      <Input
        type="number"
        min={0}
        max={TOKEN_MAX}
        step={1000}
        value={value}
        onChange={(e) => {
          const v = Math.min(TOKEN_MAX, Math.max(0, Number(e.target.value) || 0))
          onChange(v)
        }}
        className="h-9"
      />
    </div>
  )
}

// ── Provider badge colors ─────────────────────────────────────────────────────
function providerColor(provider: string): string {
  switch (provider) {
    case 'OpenAI': return 'bg-emerald-100 text-emerald-800 border-emerald-300'
    case 'Anthropic': return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'Google': return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'xAI': return 'bg-purple-100 text-purple-800 border-purple-300'
    case 'GitHub': return 'bg-gray-100 text-gray-800 border-gray-300'
    default: return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

function providerChartColor(provider: string): string {
  switch (provider) {
    case 'OpenAI': return 'oklch(0.62 0.17 155)'
    case 'Anthropic': return 'oklch(0.65 0.18 45)'
    case 'Google': return 'oklch(0.57 0.19 250)'
    case 'xAI': return 'oklch(0.52 0.18 295)'
    case 'GitHub': return 'oklch(0.50 0.05 250)'
    default: return 'oklch(0.50 0.05 250)'
  }
}

function releaseStatusBadge(status: string) {
  switch (status) {
    case 'ga': return <Badge variant="outline" className="text-xs border-green-400 text-green-700">GA</Badge>
    case 'preview': return <Badge variant="outline" className="text-xs border-yellow-400 text-yellow-700">Preview</Badge>
    case 'beta': return <Badge variant="outline" className="text-xs border-blue-400 text-blue-700">Beta</Badge>
    default: return null
  }
}

// ── Token Calculator Tab ──────────────────────────────────────────────────────
function TokenCalculatorTab() {
  const [selectedModelId, setSelectedModelId] = useState<string>(COPILOT_MODELS[0].id)
  const [inputTokens, setInputTokens] = useState(100_000)
  const [outputTokens, setOutputTokens] = useState(10_000)
  const [cachedInputTokens, setCachedInputTokens] = useState(0)
  const [cacheWriteTokens, setCacheWriteTokens] = useState(0)
  const [selectedPlanId, setSelectedPlanId] = useState<CopilotPlanId>('pro')

  const selectedModel = useMemo(
    () => COPILOT_MODELS.find((m) => m.id === selectedModelId) ?? COPILOT_MODELS[0],
    [selectedModelId]
  )

  const isAnthropic = selectedModel.provider === 'Anthropic'

  const costs = useMemo(
    () =>
      calculateTokenCost(
        selectedModel,
        inputTokens,
        outputTokens,
        cachedInputTokens,
        isAnthropic ? cacheWriteTokens : 0
      ),
    [selectedModel, inputTokens, outputTokens, cachedInputTokens, cacheWriteTokens, isAnthropic]
  )

  const selectedPlan = useMemo(
    () => COPILOT_PLANS.find((p) => p.id === selectedPlanId) ?? COPILOT_PLANS[1],
    [selectedPlanId]
  )

  const fitsInPlan = costs.totalUsd <= selectedPlan.includedCreditsUsd

  return (
    <div className="space-y-6">
      {/* Model + Plan selectors */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Model</Label>
          <Select value={selectedModelId} onValueChange={setSelectedModelId}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {COPILOT_PROVIDERS.map((provider) => (
                <SelectGroup key={provider}>
                  <SelectLabel>{provider}</SelectLabel>
                  {COPILOT_MODELS.filter((m) => m.provider === provider).map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`text-xs border ${providerColor(selectedModel.provider)}`} variant="outline">
              {selectedModel.provider}
            </Badge>
            {releaseStatusBadge(selectedModel.releaseStatus)}
            <Badge variant="outline" className="text-xs capitalize">
              {selectedModel.category}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Copilot Plan (for comparison)</Label>
          <Select value={selectedPlanId} onValueChange={(v) => setSelectedPlanId(v as CopilotPlanId)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectContent>
              {COPILOT_PLANS.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} — {plan.isPerUser ? `$${plan.monthlyPriceUsd}/user/mo` : `$${plan.monthlyPriceUsd}/mo`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Included allowance: {formatUsd(selectedPlan.includedCreditsUsd, 2)} ({selectedPlan.includedCreditsUsd / AI_CREDIT_VALUE_USD} AI Credits)
          </p>
        </div>
      </div>

      <Separator />

      {/* Token inputs */}
      <div className="space-y-4">
        <h3 className="font-semibold text-base">Token Usage</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <TokenInput label="Input Tokens" value={inputTokens} onChange={setInputTokens} />
          <TokenInput label="Output Tokens" value={outputTokens} onChange={setOutputTokens} />
          <TokenInput label="Cached Input Tokens" value={cachedInputTokens} onChange={setCachedInputTokens} />
          {isAnthropic && (
            <TokenInput label="Cache Write Tokens (Anthropic)" value={cacheWriteTokens} onChange={setCacheWriteTokens} />
          )}
        </div>
      </div>

      <Separator />

      {/* Cost breakdown */}
      <div className="space-y-4">
        <h3 className="font-semibold text-base">Cost Breakdown</h3>
        <div className="rounded-lg border bg-muted/30 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-2 font-medium">Item</th>
                <th className="text-right px-4 py-2 font-medium">Tokens</th>
                <th className="text-right px-4 py-2 font-medium">Rate / 1M</th>
                <th className="text-right px-4 py-2 font-medium">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2">Input</td>
                <td className="text-right px-4 py-2 tabular-nums">{inputTokens.toLocaleString()}</td>
                <td className="text-right px-4 py-2 tabular-nums">{formatUsd(selectedModel.inputPricePerMillion)}</td>
                <td className="text-right px-4 py-2 tabular-nums font-medium">{formatUsd(costs.inputCostUsd)}</td>
              </tr>
              {cachedInputTokens > 0 && (
                <tr>
                  <td className="px-4 py-2">Cached Input</td>
                  <td className="text-right px-4 py-2 tabular-nums">{cachedInputTokens.toLocaleString()}</td>
                  <td className="text-right px-4 py-2 tabular-nums">{formatUsd(selectedModel.cachedInputPricePerMillion)}</td>
                  <td className="text-right px-4 py-2 tabular-nums font-medium">{formatUsd(costs.cachedInputCostUsd)}</td>
                </tr>
              )}
              {isAnthropic && cacheWriteTokens > 0 && (
                <tr>
                  <td className="px-4 py-2">Cache Write</td>
                  <td className="text-right px-4 py-2 tabular-nums">{cacheWriteTokens.toLocaleString()}</td>
                  <td className="text-right px-4 py-2 tabular-nums">{formatUsd(selectedModel.cacheWritePricePerMillion ?? 0)}</td>
                  <td className="text-right px-4 py-2 tabular-nums font-medium">{formatUsd(costs.cacheWriteCostUsd)}</td>
                </tr>
              )}
              <tr>
                <td className="px-4 py-2">Output</td>
                <td className="text-right px-4 py-2 tabular-nums">{outputTokens.toLocaleString()}</td>
                <td className="text-right px-4 py-2 tabular-nums">{formatUsd(selectedModel.outputPricePerMillion)}</td>
                <td className="text-right px-4 py-2 tabular-nums font-medium">{formatUsd(costs.outputCostUsd)}</td>
              </tr>
            </tbody>
            <tfoot className="border-t bg-muted/50 font-semibold">
              <tr>
                <td colSpan={3} className="px-4 py-3">Total</td>
                <td className="text-right px-4 py-3 tabular-nums">{formatUsd(costs.totalUsd)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4 text-center space-y-1">
            <p className="text-xs text-muted-foreground">Total Cost (USD)</p>
            <p className="text-2xl font-bold text-foreground">{formatUsd(costs.totalUsd, 4)}</p>
          </div>
          <div className="rounded-lg border p-4 text-center space-y-1">
            <p className="text-xs text-muted-foreground">AI Credits Used</p>
            <p className="text-2xl font-bold text-foreground">{formatCredits(costs.totalCredits)}</p>
            <p className="text-xs text-muted-foreground">1 Credit = $0.01</p>
          </div>
          <div className={`rounded-lg border p-4 text-center space-y-1 ${fitsInPlan ? 'border-green-400 bg-green-50 dark:bg-green-950/20' : 'border-red-400 bg-red-50 dark:bg-red-950/20'}`}>
            <p className="text-xs text-muted-foreground">{selectedPlan.name} Plan Allowance</p>
            <p className={`text-lg font-bold ${fitsInPlan ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {fitsInPlan ? '✓ Within allowance' : '✗ Exceeds allowance'}
            </p>
            <p className="text-xs text-muted-foreground">
              {fitsInPlan
                ? `${formatUsd(selectedPlan.includedCreditsUsd - costs.totalUsd, 2)} remaining`
                : `${formatUsd(costs.totalUsd - selectedPlan.includedCreditsUsd, 2)} overage`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Prompt Estimator Tab ─────────────────────────────────────────────────────
function PromptEstimatorTab() {
  const [promptText, setPromptText] = useState('')
  const [selectedModelId, setSelectedModelId] = useState<string>(COPILOT_MODELS[0].id)
  const [outputTokensRatio, setOutputTokensRatio] = useState(0.2)

  const selectedModel = useMemo(
    () => COPILOT_MODELS.find((m) => m.id === selectedModelId) ?? COPILOT_MODELS[0],
    [selectedModelId]
  )

  const estimatedInputTokens = useMemo(() => estimateTokenCount(promptText), [promptText])
  const estimatedOutputTokens = Math.ceil(estimatedInputTokens * outputTokensRatio)

  const costs = useMemo(
    () => calculateTokenCost(selectedModel, estimatedInputTokens, estimatedOutputTokens),
    [selectedModel, estimatedInputTokens, estimatedOutputTokens]
  )

  const handleClear = () => setPromptText('')

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Paste your prompt / instructions</Label>
          {promptText && (
            <Button variant="ghost" size="sm" onClick={handleClear} className="h-7 text-xs">
              Clear
            </Button>
          )}
        </div>
        <textarea
          className="w-full min-h-[180px] rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
          placeholder="Paste a system prompt, user message, or file contents here to estimate tokens and cost…"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Estimated using ~4 characters per token heuristic
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Model</Label>
          <Select value={selectedModelId} onValueChange={setSelectedModelId}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {COPILOT_PROVIDERS.map((provider) => (
                <SelectGroup key={provider}>
                  <SelectLabel>{provider}</SelectLabel>
                  {COPILOT_MODELS.filter((m) => m.provider === provider).map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Expected output ratio</Label>
            <span className="text-xs text-muted-foreground">{Math.round(outputTokensRatio * 100)}% of input</span>
          </div>
          <Slider
            min={0.05}
            max={2}
            step={0.05}
            value={[outputTokensRatio]}
            onValueChange={([v]) => setOutputTokensRatio(v)}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5% (brief)</span>
            <span>100% (equal)</span>
            <span>200% (verbose)</span>
          </div>
        </div>
      </div>

      <Separator />

      {promptText ? (
        <div className="space-y-4">
          <h3 className="font-semibold text-base">Estimated Usage & Cost</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Characters</p>
              <p className="text-xl font-bold">{promptText.length.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border p-4 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Est. Input Tokens</p>
              <p className="text-xl font-bold">{estimatedInputTokens.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border p-4 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Est. Output Tokens</p>
              <p className="text-xl font-bold">{estimatedOutputTokens.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border p-4 text-center space-y-1">
              <p className="text-xs text-muted-foreground">Est. Total Cost</p>
              <p className="text-xl font-bold">{formatUsd(costs.totalUsd, 4)}</p>
              <p className="text-xs text-muted-foreground">{formatCredits(costs.totalCredits)} credits</p>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2 font-medium">Item</th>
                  <th className="text-right px-4 py-2 font-medium">Tokens</th>
                  <th className="text-right px-4 py-2 font-medium">Cost (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-2">Input</td>
                  <td className="text-right px-4 py-2 tabular-nums">{estimatedInputTokens.toLocaleString()}</td>
                  <td className="text-right px-4 py-2 tabular-nums">{formatUsd(costs.inputCostUsd)}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Output</td>
                  <td className="text-right px-4 py-2 tabular-nums">{estimatedOutputTokens.toLocaleString()}</td>
                  <td className="text-right px-4 py-2 tabular-nums">{formatUsd(costs.outputCostUsd)}</td>
                </tr>
              </tbody>
              <tfoot className="border-t bg-muted/50 font-semibold">
                <tr>
                  <td colSpan={2} className="px-4 py-3">Total</td>
                  <td className="text-right px-4 py-3 tabular-nums">{formatUsd(costs.totalUsd)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Cost across models */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Cost across all models for this prompt</h4>
            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-3 py-2 font-medium">Model</th>
                    <th className="text-left px-3 py-2 font-medium">Provider</th>
                    <th className="text-right px-3 py-2 font-medium">Cost (USD)</th>
                    <th className="text-right px-3 py-2 font-medium">AI Credits</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {COPILOT_MODELS
                    .map((model) => ({
                      model,
                      cost: calculateTokenCost(model, estimatedInputTokens, estimatedOutputTokens),
                    }))
                    .sort((a, b) => a.cost.totalUsd - b.cost.totalUsd)
                    .map(({ model, cost }) => (
                      <tr key={model.id} className={model.id === selectedModelId ? 'bg-primary/5' : ''}>
                        <td className="px-3 py-2 font-medium">
                          {model.name}
                          {model.id === selectedModelId && (
                            <span className="ml-1 text-xs text-primary">(selected)</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <Badge className={`text-xs border ${providerColor(model.provider)}`} variant="outline">
                            {model.provider}
                          </Badge>
                        </td>
                        <td className="text-right px-3 py-2 tabular-nums">{formatUsd(cost.totalUsd, 4)}</td>
                        <td className="text-right px-3 py-2 tabular-nums">{formatCredits(cost.totalCredits)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <TextT size={40} weight="duotone" className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">Paste a prompt above to see token count and cost estimates</p>
        </div>
      )}
    </div>
  )
}

// ── Plan Comparison Tab ──────────────────────────────────────────────────────
function PlanComparisonTab() {
  const [selectedModelId, setSelectedModelId] = useState<string>(COPILOT_MODELS[0].id)
  const [inputTokens, setInputTokens] = useState(100_000)
  const [outputTokens, setOutputTokens] = useState(10_000)

  const selectedModel = useMemo(
    () => COPILOT_MODELS.find((m) => m.id === selectedModelId) ?? COPILOT_MODELS[0],
    [selectedModelId]
  )

  const tokenCost = useMemo(
    () => calculateTokenCost(selectedModel, inputTokens, outputTokens),
    [selectedModel, inputTokens, outputTokens]
  )

  const planData = useMemo(() => {
    return COPILOT_PLANS.map((plan) => {
      const overageUsd = Math.max(0, tokenCost.totalUsd - plan.includedCreditsUsd)
      const totalMonthlyUsd = plan.monthlyPriceUsd + overageUsd
      const fitsInAllowance = tokenCost.totalUsd <= plan.includedCreditsUsd
      return {
        name: plan.name,
        plan,
        overageUsd,
        totalMonthlyUsd,
        fitsInAllowance,
      }
    })
  }, [tokenCost])

  const bestValuePlan = useMemo(() => {
    return [...planData].sort((a, b) => a.totalMonthlyUsd - b.totalMonthlyUsd)[0]
  }, [planData])

  const chartData = planData.map((d) => ({
    name: d.name,
    'Plan Base': d.plan.monthlyPriceUsd,
    'Overage': d.overageUsd,
    isBest: d.name === bestValuePlan.name,
  }))

  const PLAN_COLORS = ['oklch(0.72 0.10 265)', 'oklch(0.62 0.17 155)', 'oklch(0.57 0.19 250)', 'oklch(0.65 0.18 45)', 'oklch(0.52 0.18 295)']

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Model</Label>
          <Select value={selectedModelId} onValueChange={setSelectedModelId}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {COPILOT_PROVIDERS.map((provider) => (
                <SelectGroup key={provider}>
                  <SelectLabel>{provider}</SelectLabel>
                  {COPILOT_MODELS.filter((m) => m.provider === provider).map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 text-sm">
          <p className="font-medium">Token Usage Cost: <span className="text-primary font-bold">{formatUsd(tokenCost.totalUsd, 4)}</span></p>
          <p className="text-muted-foreground text-xs">{inputTokens.toLocaleString()} input + {outputTokens.toLocaleString()} output tokens</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TokenInput label="Input Tokens" value={inputTokens} onChange={setInputTokens} />
        <TokenInput label="Output Tokens" value={outputTokens} onChange={setOutputTokens} />
      </div>

      <Separator />

      {/* Chart */}
      <div className="space-y-2">
        <h3 className="font-semibold text-base">Monthly Cost by Plan</h3>
        <p className="text-xs text-muted-foreground">
          Best value for your usage: <span className="font-semibold text-foreground">{bestValuePlan.name}</span>
          {' '}(${bestValuePlan.totalMonthlyUsd.toFixed(2)}/mo)
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number, name: string) => [formatUsd(value, 2), name]}
                contentStyle={{ fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Plan Base" stackId="a">
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={PLAN_COLORS[index % PLAN_COLORS.length]}
                    opacity={entry.isBest ? 1 : 0.6}
                  />
                ))}
              </Bar>
              <Bar dataKey="Overage" stackId="a" fill="oklch(0.60 0.20 15)" opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Separator />

      {/* Plan cards */}
      <div className="space-y-2">
        <h3 className="font-semibold text-base">Plan Details</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {planData.map((d) => {
            const isBest = d.name === bestValuePlan.name
            return (
              <div
                key={d.plan.id}
                className={`rounded-lg border p-4 space-y-2 transition-all ${isBest ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{d.plan.name}</span>
                  {isBest && <Badge className="text-xs bg-primary text-primary-foreground">Best Value</Badge>}
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Base: <span className="font-medium text-foreground">
                    {d.plan.isPerUser ? `$${d.plan.monthlyPriceUsd}/user/mo` : `$${d.plan.monthlyPriceUsd}/mo`}
                  </span></p>
                  <p>Allowance: <span className="font-medium text-foreground">{formatUsd(d.plan.includedCreditsUsd, 2)}</span></p>
                  <p>Overage: <span className={`font-medium ${d.overageUsd > 0 ? 'text-destructive' : 'text-foreground'}`}>{formatUsd(d.overageUsd, 2)}</span></p>
                  <Separator className="my-1" />
                  <p className="font-semibold text-foreground text-sm">Total: {formatUsd(d.totalMonthlyUsd, 2)}/mo</p>
                  {d.fitsInAllowance
                    ? <p className="text-green-600 dark:text-green-400">✓ Usage fits within allowance</p>
                    : <p className="text-red-600 dark:text-red-400">✗ Exceeds allowance by {formatUsd(d.overageUsd, 2)}</p>
                  }
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Breakeven info */}
      <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
        <h4 className="font-semibold text-sm">Breakeven Points</h4>
        <p className="text-xs text-muted-foreground">At what AI credit usage does upgrading to the next plan save money?</p>
        <div className="space-y-1 text-xs">
          {COPILOT_PLANS.slice(0, -1).map((plan, i) => {
            const nextPlan = COPILOT_PLANS[i + 1]
            // Breakeven: plan.monthlyPrice + overage = nextPlan.monthlyPrice
            // overage = nextPlan.monthlyPrice - plan.monthlyPrice
            // tokenCost = plan.includedCredits + overage
            const breakEvenUsageUsd =
              plan.includedCreditsUsd + (nextPlan.monthlyPriceUsd - plan.monthlyPriceUsd)
            return (
              <p key={plan.id}>
                <span className="font-medium">{plan.name} → {nextPlan.name}:</span>{' '}
                break even at {formatUsd(breakEvenUsageUsd, 2)} in AI credits/mo
                {' '}({Math.round(breakEvenUsageUsd / AI_CREDIT_VALUE_USD).toLocaleString()} credits)
              </p>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Model Comparison Tab ─────────────────────────────────────────────────────
type SortField = 'name' | 'provider' | 'inputCost' | 'outputCost' | 'totalCost'
type SortDir = 'asc' | 'desc'

function ModelComparisonTab() {
  const [inputTokens, setInputTokens] = useState(100_000)
  const [outputTokens, setOutputTokens] = useState(10_000)
  const [filterProvider, setFilterProvider] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('totalCost')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const modelData = useMemo(() => {
    return COPILOT_MODELS
      .filter((m) => filterProvider === 'all' || m.provider === filterProvider)
      .map((model) => ({
        model,
        costs: calculateTokenCost(model, inputTokens, outputTokens),
      }))
      .sort((a, b) => {
        let aVal: string | number, bVal: string | number
        switch (sortField) {
          case 'name': aVal = a.model.name; bVal = b.model.name; break
          case 'provider': aVal = a.model.provider; bVal = b.model.provider; break
          case 'inputCost': aVal = a.costs.inputCostUsd; bVal = b.costs.inputCostUsd; break
          case 'outputCost': aVal = a.costs.outputCostUsd; bVal = b.costs.outputCostUsd; break
          case 'totalCost': aVal = a.costs.totalUsd; bVal = b.costs.totalUsd; break
          default: aVal = a.costs.totalUsd; bVal = b.costs.totalUsd
        }
        const cmp = typeof aVal === 'string' ? aVal.localeCompare(bVal as string) : (aVal as number) - (bVal as number)
        return sortDir === 'asc' ? cmp : -cmp
      })
  }, [inputTokens, outputTokens, filterProvider, sortField, sortDir])

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowsDownUp size={12} className="inline ml-1 opacity-40" />
    return sortDir === 'asc'
      ? <ArrowUp size={12} className="inline ml-1 text-primary" />
      : <ArrowDown size={12} className="inline ml-1 text-primary" />
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <TokenInput label="Input Tokens" value={inputTokens} onChange={setInputTokens} />
        <TokenInput label="Output Tokens" value={outputTokens} onChange={setOutputTokens} />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Label className="text-sm font-medium">Filter by Provider:</Label>
        <div className="flex gap-2 flex-wrap">
          {['all', ...COPILOT_PROVIDERS].map((p) => (
            <Button
              key={p}
              variant={filterProvider === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterProvider(p)}
              className="h-8 text-xs capitalize"
            >
              {p === 'all' ? 'All' : p}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-3 py-2 font-medium cursor-pointer hover:text-primary" onClick={() => handleSort('name')}>
                Model <SortIcon field="name" />
              </th>
              <th className="text-left px-3 py-2 font-medium cursor-pointer hover:text-primary" onClick={() => handleSort('provider')}>
                Provider <SortIcon field="provider" />
              </th>
              <th className="text-left px-3 py-2 font-medium">Status</th>
              <th className="text-right px-3 py-2 font-medium cursor-pointer hover:text-primary" onClick={() => handleSort('inputCost')}>
                Input Cost <SortIcon field="inputCost" />
              </th>
              <th className="text-right px-3 py-2 font-medium cursor-pointer hover:text-primary" onClick={() => handleSort('outputCost')}>
                Output Cost <SortIcon field="outputCost" />
              </th>
              <th className="text-right px-3 py-2 font-medium cursor-pointer hover:text-primary" onClick={() => handleSort('totalCost')}>
                Total Cost <SortIcon field="totalCost" />
              </th>
              <th className="text-right px-3 py-2 font-medium">AI Credits</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {modelData.map(({ model, costs }, index) => (
              <tr key={model.id} className={index === 0 && sortField === 'totalCost' && sortDir === 'asc' ? 'bg-green-50 dark:bg-green-950/20' : ''}>
                <td className="px-3 py-2.5 font-medium">{model.name}</td>
                <td className="px-3 py-2.5">
                  <Badge className={`text-xs border ${providerColor(model.provider)}`} variant="outline">
                    {model.provider}
                  </Badge>
                </td>
                <td className="px-3 py-2.5">{releaseStatusBadge(model.releaseStatus)}</td>
                <td className="text-right px-3 py-2.5 tabular-nums">{formatUsd(costs.inputCostUsd, 4)}</td>
                <td className="text-right px-3 py-2.5 tabular-nums">{formatUsd(costs.outputCostUsd, 4)}</td>
                <td className="text-right px-3 py-2.5 tabular-nums font-semibold">{formatUsd(costs.totalUsd, 4)}</td>
                <td className="text-right px-3 py-2.5 tabular-nums">{formatCredits(costs.totalCredits)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Showing {modelData.length} model{modelData.length !== 1 ? 's' : ''}. Click column headers to sort.
        {sortField === 'totalCost' && sortDir === 'asc' && modelData.length > 0 && (
          <span className="text-green-600 dark:text-green-400 ml-2">✓ Cheapest model highlighted</span>
        )}
      </p>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────
export function CopilotCalculator({ activeTab, onTabChange }: CopilotCalculatorProps) {
  const tabConfig = [
    { id: 'calculator' as const, label: 'Token Calculator', icon: Coins },
    { id: 'prompt' as const, label: 'Prompt Estimator', icon: TextT },
    { id: 'plans' as const, label: 'Plan Comparison', icon: ChartBar },
    { id: 'models' as const, label: 'Model Comparison', icon: TableIcon },
  ]

  return (
    <div className="space-y-6">
      {/* Header card */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Robot size={22} weight="duotone" />
            </div>
            <div>
              <CardTitle className="text-2xl">GitHub Copilot Cost Calculator</CardTitle>
              <CardDescription>
                Estimate costs for usage-based Copilot billing (token-based, effective June 1, 2026)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>💡 <strong>1 AI Credit = $0.01 USD</strong></span>
            <span>·</span>
            <span>Prices are per 1M tokens consumed</span>
            <span>·</span>
            <span>{COPILOT_MODELS.length} models across {COPILOT_PROVIDERS.length} providers</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as CopilotTab)}>
        <TabsList className="flex h-auto flex-wrap gap-1 bg-muted p-1">
          {tabConfig.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 text-xs sm:text-sm">
              <tab.icon size={15} weight="duotone" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="calculator">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Coins size={20} weight="duotone" />
                Token-Based Cost Calculator
              </CardTitle>
              <CardDescription>
                Select a model and input token amounts to see a detailed cost breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TokenCalculatorTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompt">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <TextT size={20} weight="duotone" />
                Prompt-Based Cost Estimator
              </CardTitle>
              <CardDescription>
                Paste a prompt to estimate token count and cost across models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PromptEstimatorTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <ChartBar size={20} weight="duotone" />
                Plan Comparison
              </CardTitle>
              <CardDescription>
                Compare total monthly cost across all Copilot plans for your usage level
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlanComparisonTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <TableIcon size={20} weight="duotone" />
                Model Comparison
              </CardTitle>
              <CardDescription>
                Side-by-side cost comparison of all available models — sort and filter to find the best option
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ModelComparisonTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
