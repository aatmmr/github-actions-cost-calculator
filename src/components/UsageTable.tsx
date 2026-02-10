import { useState } from 'react'
import { CaretDown, CaretRight, Warning } from '@phosphor-icons/react'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatWorkflowName, formatCurrency, type UsageRow, type WorkflowAggregate } from '@/utils/usageCsvService'
import type { UsageAnalysisSummary, GroupingMode } from '@/hooks/useUsageAnalysis'

type UsageTableProps = {
  groupingMode: GroupingMode
  workflowAggregates: WorkflowAggregate[]
  jobsSortedByCost: UsageRow[]
  summary: UsageAnalysisSummary
}

function JobRow({ row }: { row: UsageRow }) {
  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-medium">{row.job}</TableCell>
      <TableCell className="text-muted-foreground">{row.totalMinutes.toLocaleString()}</TableCell>
      <TableCell className="text-muted-foreground">{row.jobRuns.toLocaleString()}</TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="font-normal text-xs">
            {row.runnerLabels}
          </Badge>
          {!row.rateMatched && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Warning className="w-4 h-4 text-amber-500" weight="fill" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Runner label not matched – using default rate (${row.pricePerMinute.toFixed(3)}/min)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right font-medium">{formatCurrency(row.totalCost)}</TableCell>
    </TableRow>
  )
}

function WorkflowRow({ aggregate }: { aggregate: WorkflowAggregate }) {
  const [expanded, setExpanded] = useState(false)
  const hasMultipleJobs = aggregate.jobs.length > 1

  return (
    <>
      <TableRow 
        className={hasMultipleJobs ? 'cursor-pointer hover:bg-muted/50' : 'hover:bg-muted/50'}
        onClick={() => hasMultipleJobs && setExpanded(!expanded)}
      >
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            {hasMultipleJobs && (
              expanded ? (
                <CaretDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <CaretRight className="w-4 h-4 text-muted-foreground" />
              )
            )}
            {!hasMultipleJobs && <span className="w-4" />}
            <span title={aggregate.workflow}>{formatWorkflowName(aggregate.workflow)}</span>
            {hasMultipleJobs && (
              <Badge variant="outline" className="text-xs font-normal">
                {aggregate.jobs.length} jobs
              </Badge>
            )}
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground">{aggregate.totalMinutes.toLocaleString()}</TableCell>
        <TableCell className="text-muted-foreground">{aggregate.totalRuns.toLocaleString()}</TableCell>
        <TableCell>
          {aggregate.jobs.length === 1 ? (
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="font-normal text-xs">
                {aggregate.jobs[0].runnerLabels}
              </Badge>
              {!aggregate.jobs[0].rateMatched && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Warning className="w-4 h-4 text-amber-500" weight="fill" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Runner label not matched – using default rate</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Multiple</span>
          )}
        </TableCell>
        <TableCell className="text-right font-medium">{formatCurrency(aggregate.totalCost)}</TableCell>
      </TableRow>
      {expanded && aggregate.jobs.map((job, idx) => (
        <TableRow key={idx} className="bg-muted/30">
          <TableCell className="pl-10 text-muted-foreground">{job.job}</TableCell>
          <TableCell className="text-muted-foreground">{job.totalMinutes.toLocaleString()}</TableCell>
          <TableCell className="text-muted-foreground">{job.jobRuns.toLocaleString()}</TableCell>
          <TableCell>
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="font-normal text-xs">
                {job.runnerLabels}
              </Badge>
              {!job.rateMatched && (
                <Warning className="w-4 h-4 text-amber-500" weight="fill" />
              )}
            </div>
          </TableCell>
          <TableCell className="text-right">{formatCurrency(job.totalCost)}</TableCell>
        </TableRow>
      ))}
    </>
  )
}

export function UsageTable({ groupingMode, workflowAggregates, jobsSortedByCost, summary }: UsageTableProps) {
  const nameColumnLabel = groupingMode === 'workflow' ? 'Workflow' : 'Job'

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">{nameColumnLabel}</TableHead>
            <TableHead className="font-semibold">Minutes</TableHead>
            <TableHead className="font-semibold">Runs</TableHead>
            <TableHead className="font-semibold">Runner</TableHead>
            <TableHead className="text-right font-semibold">Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupingMode === 'workflow' ? (
            workflowAggregates.map((aggregate) => (
              <WorkflowRow key={aggregate.workflow} aggregate={aggregate} />
            ))
          ) : (
            jobsSortedByCost.map((row, idx) => (
              <JobRow key={`${row.workflow}-${row.job}-${idx}`} row={row} />
            ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-muted/50 font-semibold">
            <TableCell>Total</TableCell>
            <TableCell>{summary.totalMinutes.toLocaleString()}</TableCell>
            <TableCell>{summary.totalRuns.toLocaleString()}</TableCell>
            <TableCell>
              {summary.unmatchedRateCount > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                        <Warning className="w-3 h-3 mr-1" weight="fill" />
                        {summary.unmatchedRateCount} unmatched
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{summary.unmatchedRateCount} runner label(s) couldn't be matched to known pricing</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </TableCell>
            <TableCell className="text-right">{formatCurrency(summary.totalCost)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
