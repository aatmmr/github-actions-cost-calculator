import { resolveRunnerCost } from '@/data/runners'

export type UsageRow = {
  job: string
  workflow: string
  totalMinutes: number
  jobRuns: number
  runnerType: string
  runnerLabels: string
  // Computed fields
  pricePerMinute: number
  totalCost: number
  rateMatched: boolean
}

export type ParseResult = {
  rows: UsageRow[]
  errors: string[]
}

/**
 * Clean the GitHub export field format.
 * GitHub exports use a peculiar format: """'value"""
 * This strips the outer quotes and leading apostrophe.
 */
function cleanField(field: string): string {
  // Remove outer whitespace
  let cleaned = field.trim()
  
  // Handle """'value""" format
  if (cleaned.startsWith('"""\'') && cleaned.endsWith('"""')) {
    cleaned = cleaned.slice(4, -3)
  }
  // Handle ""'value"" format
  else if (cleaned.startsWith('""\'') && cleaned.endsWith('""')) {
    cleaned = cleaned.slice(3, -2)
  }
  // Handle "'value" format
  else if (cleaned.startsWith('\'')) {
    cleaned = cleaned.slice(1)
  }
  // Handle standard "value" format
  else if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1)
  }
  
  return cleaned.trim()
}

/**
 * Parse a CSV line handling quoted fields with commas.
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  let quoteChar = ''
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true
      quoteChar = char
      current += char
    } else if (inQuotes && char === quoteChar) {
      // Check for escaped quote (doubled)
      if (i + 1 < line.length && line[i + 1] === quoteChar) {
        current += char + line[i + 1]
        i++
      } else {
        current += char
        inQuotes = false
      }
    } else if (!inQuotes && char === ',') {
      fields.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  // Don't forget the last field
  fields.push(current)
  
  return fields
}

/**
 * Parse GitHub Actions usage CSV export.
 * Expected columns: Job, Workflow, Total minutes, Job runs, Runner type, Runner labels
 */
export function parseUsageCsv(content: string): ParseResult {
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== '')
  const errors: string[] = []
  const rows: UsageRow[] = []

  if (lines.length < 2) {
    return { rows: [], errors: ['CSV file is empty or has no data rows'] }
  }

  // Parse header to validate columns
  const headerFields = parseCSVLine(lines[0]).map(cleanField)
  const expectedHeaders = ['Job', 'Workflow', 'Total minutes', 'Job runs', 'Runner type', 'Runner labels']
  
  // Check if headers match (case-insensitive)
  const headersMatch = expectedHeaders.every((expected, idx) => {
    const actual = headerFields[idx]?.toLowerCase() || ''
    return actual === expected.toLowerCase()
  })

  if (!headersMatch && headerFields.length < 6) {
    errors.push(`Invalid CSV format. Expected columns: ${expectedHeaders.join(', ')}`)
    return { rows, errors }
  }

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const fields = parseCSVLine(line)
    
    if (fields.length < 6) {
      errors.push(`Row ${i + 1}: Expected 6 columns, got ${fields.length}`)
      continue
    }

    const job = cleanField(fields[0])
    const workflow = cleanField(fields[1])
    const totalMinutesStr = cleanField(fields[2])
    const jobRunsStr = cleanField(fields[3])
    const runnerType = cleanField(fields[4])
    const runnerLabels = cleanField(fields[5])

    const totalMinutes = parseInt(totalMinutesStr, 10)
    const jobRuns = parseInt(jobRunsStr, 10)

    if (isNaN(totalMinutes)) {
      errors.push(`Row ${i + 1}: Invalid total minutes value "${totalMinutesStr}"`)
      continue
    }

    if (isNaN(jobRuns)) {
      errors.push(`Row ${i + 1}: Invalid job runs value "${jobRunsStr}"`)
      continue
    }

    // Resolve cost for this runner label
    const { pricePerMinute, matched } = resolveRunnerCost(runnerLabels)
    const totalCost = totalMinutes * pricePerMinute

    rows.push({
      job,
      workflow,
      totalMinutes,
      jobRuns,
      runnerType,
      runnerLabels,
      pricePerMinute,
      totalCost,
      rateMatched: matched,
    })
  }

  return { rows, errors }
}

/**
 * Aggregate usage data by workflow.
 */
export type WorkflowAggregate = {
  workflow: string
  totalMinutes: number
  totalCost: number
  totalRuns: number
  jobs: UsageRow[]
}

export function aggregateByWorkflow(rows: UsageRow[]): WorkflowAggregate[] {
  const workflowMap = new Map<string, WorkflowAggregate>()

  for (const row of rows) {
    const existing = workflowMap.get(row.workflow)
    if (existing) {
      existing.totalMinutes += row.totalMinutes
      existing.totalCost += row.totalCost
      existing.totalRuns += row.jobRuns
      existing.jobs.push(row)
    } else {
      workflowMap.set(row.workflow, {
        workflow: row.workflow,
        totalMinutes: row.totalMinutes,
        totalCost: row.totalCost,
        totalRuns: row.jobRuns,
        jobs: [row],
      })
    }
  }

  return Array.from(workflowMap.values()).sort((a, b) => b.totalCost - a.totalCost)
}

/**
 * Format workflow name for display (extract filename from path).
 */
export function formatWorkflowName(workflow: string): string {
  // Handle dynamic workflows like "dynamic/copilot-swe-agent/copilot"
  if (workflow.startsWith('dynamic/')) {
    const parts = workflow.split('/')
    return parts[parts.length - 1] || workflow
  }
  
  // Handle file paths like ".github/workflows/deploy-pages.yml"
  if (workflow.includes('/')) {
    const parts = workflow.split('/')
    const filename = parts[parts.length - 1] || workflow
    return filename.replace(/\.yml$|\.yaml$/, '')
  }
  
  return workflow
}

/**
 * Format currency for display.
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}
