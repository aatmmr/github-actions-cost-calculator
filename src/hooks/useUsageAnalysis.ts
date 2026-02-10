import { useState, useMemo, useCallback } from 'react'
import {
  parseUsageCsv,
  aggregateByWorkflow,
  type UsageRow,
  type WorkflowAggregate,
  type ParseResult,
} from '@/utils/usageCsvService'

export type GroupingMode = 'workflow' | 'job'

export type UsageAnalysisSummary = {
  totalMinutes: number
  totalCost: number
  totalRuns: number
  jobCount: number
  workflowCount: number
  unmatchedRateCount: number
}

export function useUsageAnalysis() {
  const [usageData, setUsageData] = useState<UsageRow[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [groupingMode, setGroupingMode] = useState<GroupingMode>('workflow')
  const [isLoading, setIsLoading] = useState(false)

  const importCsv = useCallback((content: string): ParseResult => {
    setIsLoading(true)
    try {
      const result = parseUsageCsv(content)
      setUsageData(result.rows)
      setParseErrors(result.errors)
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearData = useCallback(() => {
    setUsageData([])
    setParseErrors([])
  }, [])

  const workflowAggregates = useMemo(
    () => aggregateByWorkflow(usageData),
    [usageData]
  )

  const jobsSortedByCost = useMemo(
    () => [...usageData].sort((a, b) => b.totalCost - a.totalCost),
    [usageData]
  )

  const summary = useMemo((): UsageAnalysisSummary => {
    const totalMinutes = usageData.reduce((sum, row) => sum + row.totalMinutes, 0)
    const totalCost = usageData.reduce((sum, row) => sum + row.totalCost, 0)
    const totalRuns = usageData.reduce((sum, row) => sum + row.jobRuns, 0)
    const unmatchedRateCount = usageData.filter((row) => !row.rateMatched).length

    return {
      totalMinutes,
      totalCost,
      totalRuns,
      jobCount: usageData.length,
      workflowCount: workflowAggregates.length,
      unmatchedRateCount,
    }
  }, [usageData, workflowAggregates])

  // Data formatted for charts based on grouping mode
  const chartData = useMemo(() => {
    if (groupingMode === 'workflow') {
      return workflowAggregates.map((wf) => ({
        name: wf.workflow,
        cost: wf.totalCost,
        minutes: wf.totalMinutes,
        runs: wf.totalRuns,
      }))
    }
    return jobsSortedByCost.map((job) => ({
      name: job.job,
      cost: job.totalCost,
      minutes: job.totalMinutes,
      runs: job.jobRuns,
    }))
  }, [groupingMode, workflowAggregates, jobsSortedByCost])

  return {
    // State
    usageData,
    parseErrors,
    groupingMode,
    isLoading,
    hasData: usageData.length > 0,

    // Computed
    workflowAggregates,
    jobsSortedByCost,
    summary,
    chartData,

    // Actions
    importCsv,
    clearData,
    setGroupingMode,
  }
}
