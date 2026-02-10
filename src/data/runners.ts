export type RunnerType = {
  id: string
  name: string
  os: 'Linux' | 'Windows' | 'macOS'
  pricePerMinute: number
  category: 'standard' | 'x64-large' | 'arm64-large' | 'gpu'
  imageLabels?: string[]
}

export type GitHubPlan = {
  id: 'enterprise' | 'team' | 'free'
  name: string
  includedMinutes: number
  budgetUsd: number
}

export const GITHUB_HOSTED_RUNNERS: RunnerType[] = [
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

export const DEFAULT_RUNNER_OVERVIEW = GITHUB_HOSTED_RUNNERS.filter(
  (runner) => runner.imageLabels && runner.imageLabels.length > 0
)

export const DEFAULT_RUNNER_IDS = DEFAULT_RUNNER_OVERVIEW.map((runner) => runner.id)

export const MINUTES_IN_WEEK = 7 * 24 * 60
export const MINUTES_IN_MONTH = 30 * 24 * 60 // simplified 30-day month for comparison

export const GITHUB_PLANS: GitHubPlan[] = [
  { id: 'enterprise', name: 'Enterprise', includedMinutes: 50000, budgetUsd: 400 },
  { id: 'team', name: 'Team', includedMinutes: 3000, budgetUsd: 24 },
  { id: 'free', name: 'Free', includedMinutes: 2000, budgetUsd: 16 },
]

// Default fallback rates by OS when runner label can't be matched
export const DEFAULT_RATES_BY_OS: Record<'Linux' | 'Windows' | 'macOS', number> = {
  Linux: 0.006,   // Linux 2-core standard
  Windows: 0.010, // Windows 2-core standard
  macOS: 0.062,   // macOS 3-core/4-core standard
}

/**
 * Find runner by image label (e.g., 'ubuntu-latest', 'windows-latest')
 */
export function findRunnerByLabel(label: string): RunnerType | undefined {
  const normalizedLabel = label.toLowerCase().trim()
  return GITHUB_HOSTED_RUNNERS.find(
    (runner) => runner.imageLabels?.some((l) => l.toLowerCase() === normalizedLabel)
  )
}

/**
 * Resolve price per minute for a given runner label.
 * Returns the matched runner's rate, or a fallback based on OS prefix.
 */
export function resolveRunnerCost(label: string): { pricePerMinute: number; matched: boolean; runner?: RunnerType } {
  const runner = findRunnerByLabel(label)
  if (runner) {
    return { pricePerMinute: runner.pricePerMinute, matched: true, runner }
  }

  // Fallback: detect OS from label prefix
  const normalizedLabel = label.toLowerCase()
  if (normalizedLabel.includes('ubuntu') || normalizedLabel.includes('linux')) {
    return { pricePerMinute: DEFAULT_RATES_BY_OS.Linux, matched: false }
  }
  if (normalizedLabel.includes('windows')) {
    return { pricePerMinute: DEFAULT_RATES_BY_OS.Windows, matched: false }
  }
  if (normalizedLabel.includes('macos') || normalizedLabel.includes('mac-')) {
    return { pricePerMinute: DEFAULT_RATES_BY_OS.macOS, matched: false }
  }

  // Ultimate fallback: Linux standard rate
  return { pricePerMinute: DEFAULT_RATES_BY_OS.Linux, matched: false }
}
