export type CopilotModelCategory = 'standard' | 'premium' | 'experimental'
export type ReleaseStatus = 'ga' | 'preview' | 'beta'

export type CopilotModel = {
  id: string
  name: string
  provider: string
  releaseStatus: ReleaseStatus
  category: CopilotModelCategory
  inputPricePerMillion: number
  cachedInputPricePerMillion: number
  outputPricePerMillion: number
  cacheWritePricePerMillion?: number // Anthropic only
}

export const COPILOT_MODELS: CopilotModel[] = [
  // OpenAI
  {
    id: 'gpt-5.4',
    name: 'GPT-5.4',
    provider: 'OpenAI',
    releaseStatus: 'ga',
    category: 'premium',
    inputPricePerMillion: 10.00,
    cachedInputPricePerMillion: 2.50,
    outputPricePerMillion: 40.00,
  },
  {
    id: 'gpt-5.2-codex',
    name: 'GPT-5.2-Codex',
    provider: 'OpenAI',
    releaseStatus: 'ga',
    category: 'premium',
    inputPricePerMillion: 3.00,
    cachedInputPricePerMillion: 0.75,
    outputPricePerMillion: 12.00,
  },
  {
    id: 'gpt-5.1-codex',
    name: 'GPT-5.1-Codex',
    provider: 'OpenAI',
    releaseStatus: 'ga',
    category: 'standard',
    inputPricePerMillion: 1.50,
    cachedInputPricePerMillion: 0.375,
    outputPricePerMillion: 6.00,
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'OpenAI',
    releaseStatus: 'ga',
    category: 'standard',
    inputPricePerMillion: 2.00,
    cachedInputPricePerMillion: 0.50,
    outputPricePerMillion: 8.00,
  },
  {
    id: 'gpt-5-mini',
    name: 'GPT-5 mini',
    provider: 'OpenAI',
    releaseStatus: 'ga',
    category: 'standard',
    inputPricePerMillion: 0.40,
    cachedInputPricePerMillion: 0.10,
    outputPricePerMillion: 1.60,
  },

  // Anthropic
  {
    id: 'claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    releaseStatus: 'ga',
    category: 'standard',
    inputPricePerMillion: 0.80,
    cachedInputPricePerMillion: 0.08,
    outputPricePerMillion: 4.00,
    cacheWritePricePerMillion: 1.00,
  },
  {
    id: 'claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    releaseStatus: 'ga',
    category: 'premium',
    inputPricePerMillion: 3.00,
    cachedInputPricePerMillion: 0.30,
    outputPricePerMillion: 15.00,
    cacheWritePricePerMillion: 3.75,
  },
  {
    id: 'claude-sonnet-4.6',
    name: 'Claude Sonnet 4.6',
    provider: 'Anthropic',
    releaseStatus: 'ga',
    category: 'premium',
    inputPricePerMillion: 3.00,
    cachedInputPricePerMillion: 0.30,
    outputPricePerMillion: 15.00,
    cacheWritePricePerMillion: 3.75,
  },
  {
    id: 'claude-opus-4.6',
    name: 'Claude Opus 4.6',
    provider: 'Anthropic',
    releaseStatus: 'ga',
    category: 'premium',
    inputPricePerMillion: 15.00,
    cachedInputPricePerMillion: 1.50,
    outputPricePerMillion: 75.00,
    cacheWritePricePerMillion: 18.75,
  },
  {
    id: 'claude-opus-4.7',
    name: 'Claude Opus 4.7',
    provider: 'Anthropic',
    releaseStatus: 'preview',
    category: 'premium',
    inputPricePerMillion: 15.00,
    cachedInputPricePerMillion: 1.50,
    outputPricePerMillion: 75.00,
    cacheWritePricePerMillion: 18.75,
  },

  // Google
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    releaseStatus: 'ga',
    category: 'premium',
    inputPricePerMillion: 1.25,
    cachedInputPricePerMillion: 0.31,
    outputPricePerMillion: 10.00,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    releaseStatus: 'ga',
    category: 'standard',
    inputPricePerMillion: 0.15,
    cachedInputPricePerMillion: 0.037,
    outputPricePerMillion: 0.60,
  },
  {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro',
    provider: 'Google',
    releaseStatus: 'preview',
    category: 'premium',
    inputPricePerMillion: 2.00,
    cachedInputPricePerMillion: 0.50,
    outputPricePerMillion: 15.00,
  },
  {
    id: 'gemini-3-flash',
    name: 'Gemini 3 Flash',
    provider: 'Google',
    releaseStatus: 'preview',
    category: 'standard',
    inputPricePerMillion: 0.20,
    cachedInputPricePerMillion: 0.05,
    outputPricePerMillion: 0.80,
  },

  // xAI
  {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xAI',
    releaseStatus: 'ga',
    category: 'premium',
    inputPricePerMillion: 3.00,
    cachedInputPricePerMillion: 0.75,
    outputPricePerMillion: 15.00,
  },
  {
    id: 'grok-3-mini',
    name: 'Grok 3 mini',
    provider: 'xAI',
    releaseStatus: 'ga',
    category: 'standard',
    inputPricePerMillion: 0.30,
    cachedInputPricePerMillion: 0.075,
    outputPricePerMillion: 0.50,
  },

  // Fine-tuned (GitHub)
  {
    id: 'raptor-mini',
    name: 'Raptor mini',
    provider: 'GitHub',
    releaseStatus: 'ga',
    category: 'standard',
    inputPricePerMillion: 0.20,
    cachedInputPricePerMillion: 0.05,
    outputPricePerMillion: 0.80,
  },
  {
    id: 'goldeneye',
    name: 'Goldeneye',
    provider: 'GitHub',
    releaseStatus: 'preview',
    category: 'standard',
    inputPricePerMillion: 0.40,
    cachedInputPricePerMillion: 0.10,
    outputPricePerMillion: 1.60,
  },
]

export const COPILOT_PROVIDERS = [...new Set(COPILOT_MODELS.map((m) => m.provider))]

export type CopilotPlanId = 'free' | 'pro' | 'pro_plus' | 'business' | 'enterprise'

export type CopilotPlan = {
  id: CopilotPlanId
  name: string
  monthlyPriceUsd: number
  priceNote?: string
  includedCreditsUsd: number
  creditsNote?: string
  overageRateNote: string
  isPerUser: boolean
}

// 1 AI Credit = $0.01 USD
export const AI_CREDIT_VALUE_USD = 0.01

export const COPILOT_PLANS: CopilotPlan[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPriceUsd: 0,
    includedCreditsUsd: 0.50, // ~50 premium requests × $0.01
    creditsNote: '~50 premium requests',
    overageRateNote: 'No overage — capped at allowance',
    isPerUser: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPriceUsd: 10,
    includedCreditsUsd: 3.00, // ~300 premium requests × $0.01
    creditsNote: '~300 premium requests',
    overageRateNote: 'Pay-as-you-go at model rates',
    isPerUser: false,
  },
  {
    id: 'pro_plus',
    name: 'Pro+',
    monthlyPriceUsd: 39,
    includedCreditsUsd: 15.00, // ~1,500 premium requests × $0.01
    creditsNote: '~1,500 premium requests',
    overageRateNote: 'Pay-as-you-go at model rates',
    isPerUser: false,
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPriceUsd: 19,
    priceNote: '$19/user/mo (promotional; $19 after Aug 2026)',
    includedCreditsUsd: 30, // $30 pooled per user
    creditsNote: '$30 pooled per user (promotional)',
    overageRateNote: 'Pay-as-you-go at model rates',
    isPerUser: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPriceUsd: 39,
    priceNote: '$39/user/mo (promotional; $39 after Aug 2026)',
    includedCreditsUsd: 70, // $70 pooled per user
    creditsNote: '$70 pooled per user (promotional)',
    overageRateNote: 'Pay-as-you-go at model rates',
    isPerUser: true,
  },
]

/**
 * Calculate the cost in USD for a given model and token usage.
 */
export function calculateTokenCost(
  model: CopilotModel,
  inputTokens: number,
  outputTokens: number,
  cachedInputTokens: number = 0,
  cacheWriteTokens: number = 0
): {
  inputCostUsd: number
  cachedInputCostUsd: number
  cacheWriteCostUsd: number
  outputCostUsd: number
  totalUsd: number
  totalCredits: number
} {
  const inputCostUsd = (inputTokens / 1_000_000) * model.inputPricePerMillion
  const cachedInputCostUsd = (cachedInputTokens / 1_000_000) * model.cachedInputPricePerMillion
  const cacheWriteCostUsd =
    model.cacheWritePricePerMillion !== undefined
      ? (cacheWriteTokens / 1_000_000) * model.cacheWritePricePerMillion
      : 0
  const outputCostUsd = (outputTokens / 1_000_000) * model.outputPricePerMillion
  const totalUsd = inputCostUsd + cachedInputCostUsd + cacheWriteCostUsd + outputCostUsd
  const totalCredits = totalUsd / AI_CREDIT_VALUE_USD

  return {
    inputCostUsd,
    cachedInputCostUsd,
    cacheWriteCostUsd,
    outputCostUsd,
    totalUsd,
    totalCredits,
  }
}

/**
 * Estimate token count from text (~4 chars per token heuristic).
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4)
}
