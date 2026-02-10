import { useRef, useState, useCallback } from 'react'
import { Upload, Clock, Coins, ListChecks, ChartPie, ChartBar, Table as TableIcon, Trash } from '@phosphor-icons/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useUsageAnalysis, type GroupingMode } from '@/hooks/useUsageAnalysis'
import { UsageCostPieChart } from '@/components/UsageCostPieChart'
import { UsageCostBarChart } from '@/components/UsageCostBarChart'
import { UsageTable } from '@/components/UsageTable'
import { formatCurrency } from '@/utils/usageCsvService'

export function UsageAnalysis() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorMessages, setErrorMessages] = useState<string[]>([])

  const {
    hasData,
    parseErrors,
    groupingMode,
    chartData,
    workflowAggregates,
    jobsSortedByCost,
    summary,
    importCsv,
    clearData,
    setGroupingMode,
  } = useUsageAnalysis()

  const handleFileSelect = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const result = importCsv(content)
      if (result.errors.length > 0) {
        setErrorMessages(result.errors)
        setShowErrorDialog(true)
      }
    }
    reader.readAsText(file)
  }, [importCsv])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.name.endsWith('.csv')) {
      handleFileSelect(file)
    }
  }

  return (
    <>
      {/* Empty State / Import */}
      {!hasData ? (
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Import GitHub Actions Usage Data</CardTitle>
              <CardDescription>
                Upload a CSV export from GitHub to analyze runner costs and usage patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`
                  border-2 border-dashed rounded-lg p-12 text-center transition-colors
                  ${isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-muted-foreground/50'
                  }
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Drop your CSV file here</p>
                <p className="text-muted-foreground mb-4">or</p>
                <Button type="button" onClick={() => fileInputRef.current?.click()}>
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <div className="mt-6 pt-4 border-t border-border/50">
                  <p className="text-sm font-medium text-foreground mb-3">How to get the CSV:</p>
                  <ol className="text-xs text-muted-foreground space-y-1.5 inline-block text-left">
                    <li className="flex gap-2">
                      <span className="font-semibold text-foreground/70">1.</span>
                      Go to your repository or organization on GitHub
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-foreground/70">2.</span>
                      Navigate to <strong>Insights</strong> → <strong>Action Usage Metrics</strong>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-foreground/70">3.</span>
                      Select the <strong>Jobs</strong> tab
                    </li>
                    <li className="flex gap-2">
                      <span className="font-semibold text-foreground/70">4.</span>
                      Click <strong>Export CSV</strong> to download
                    </li>
                  </ol>
                  <p className="text-xs text-muted-foreground mt-3">
                    <a 
                      href="https://docs.github.com/en/actions/how-tos/administer/view-metrics" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary underline hover:no-underline"
                    >
                      View full documentation →
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Data Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
                  <Upload className="w-4 h-4" />
                  Import New
                </Button>
                <Button variant="ghost" size="sm" onClick={clearData} className="gap-2 text-muted-foreground">
                  <Trash className="w-4 h-4" />
                  Clear
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>

              {/* Grouping Toggle */}
              <Tabs value={groupingMode} onValueChange={(v) => setGroupingMode(v as GroupingMode)}>
                <TabsList>
                  <TabsTrigger value="workflow" className="gap-1.5">
                    <ListChecks className="w-4 h-4" />
                    By Workflow
                  </TabsTrigger>
                  <TabsTrigger value="job" className="gap-1.5">
                    <TableIcon className="w-4 h-4" />
                    By Job
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Coins className="w-5 h-5 text-primary" weight="duotone" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="text-2xl font-bold">{formatCurrency(summary.totalCost)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Clock className="w-5 h-5 text-blue-500" weight="duotone" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Minutes</p>
                      <p className="text-2xl font-bold">{summary.totalMinutes.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <ListChecks className="w-5 h-5 text-green-500" weight="duotone" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {groupingMode === 'workflow' ? 'Workflows' : 'Jobs'}
                      </p>
                      <p className="text-2xl font-bold">
                        {groupingMode === 'workflow' ? summary.workflowCount : summary.jobCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ChartPie className="w-5 h-5" weight="duotone" />
                    Cost Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UsageCostPieChart data={chartData} totalCost={summary.totalCost} />
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ChartBar className="w-5 h-5" weight="duotone" />
                    Cost Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UsageCostBarChart data={chartData} groupingMode={groupingMode} />
                </CardContent>
              </Card>
            </div>

            {/* Data Table */}
            <Card className="shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TableIcon className="w-5 h-5" weight="duotone" />
                  Detailed Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UsageTable
                  groupingMode={groupingMode}
                  workflowAggregates={workflowAggregates}
                  jobsSortedByCost={jobsSortedByCost}
                  summary={summary}
                />
              </CardContent>
            </Card>
          </>
        )}

        {/* Parse Errors Dialog */}
        <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Warnings</DialogTitle>
              <DialogDescription>
                Some rows could not be fully parsed. The remaining data has been imported.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-48 overflow-y-auto text-sm space-y-1">
              {errorMessages.map((error, idx) => (
                <p key={idx} className="text-muted-foreground">{error}</p>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={() => setShowErrorDialog(false)}>OK</Button>
            </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  )
}
