import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/useToast"
import { FileText, Download, CheckCircle } from "lucide-react"
import { exportStockReport } from "@/api/stock"

export function Report() {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await exportStockReport()

      // Create and download CSV file
      const blob = new Blob([response.csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `stock_report_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: `Stock report exported successfully. ${response.exportedCount} records marked as adjusted.`
      })
    } catch (error: any) {
      console.error("Error exporting stock report:", error)
      toast({
        title: "Error",
        description: "Failed to export stock report",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-center">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Stock Report
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Export activity list and mark records as stock adjusted
          </p>
        </div>
      </div>

      {/* Export Card */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Activity Report
          </CardTitle>
          <CardDescription>
            Generate a CSV export of the complete activity list. After export, all records will be marked as "Stock Adjusted = YES".
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Export Process</h4>
                <p className="text-sm text-blue-700 mt-1">
                  This will export all activity log records to a CSV file and automatically mark them as stock adjusted. 
                  This operation ensures proper stock reconciliation and audit trail.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  Exporting Report...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-3" />
                  Export Stock Report
                </>
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-slate-500">
            <p>The exported file will include all activity log entries with stock adjustment status.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}