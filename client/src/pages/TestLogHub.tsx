import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/useToast"
import { useNavigate } from "react-router-dom"
import { TestTube, CheckCircle, XCircle, Download, Filter, TrendingUp } from "lucide-react"
import { getActivityLog, exportActivityLog } from "@/api/test"

export function TestLogHub() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [activities, setActivities] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [filters, setFilters] = useState({
    outcome: "",
    logType: "",
    serialNumber: ""
  })

  // Load activity log on component mount
  useEffect(() => {
    loadActivityLog()
  }, [])

  const loadActivityLog = async () => {
    setIsLoading(true)
    try {
      const response = await getActivityLog(filters)
      setActivities(response.activities)
      setAnalytics(response.analytics)
    } catch (error: any) {
      console.error("Error loading activity log:", error)
      toast({
        title: "Error",
        description: "Failed to load activity log",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await exportActivityLog()

      // Create and download CSV file
      const blob = new Blob([response.csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `activity_log_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Activity log exported successfully"
      })
    } catch (error: any) {
      console.error("Error exporting activity log:", error)
      toast({
        title: "Error",
        description: "Failed to export activity log",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getOutcomeBadge = (outcome: string) => {
    if (outcome === "PASS") {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-200">PASS</Badge>
    } else if (outcome === "FAIL") {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">FAIL</Badge>
    }
    return <Badge variant="secondary">{outcome}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-center">
          <TestTube className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Test Log Hub
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            View test results, analytics, and manage test operations
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className="bg-white/60 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-all duration-200 cursor-pointer group"
          onClick={() => navigate("/test-log/pass")}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Submit Test (PASS)</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Record successful test results</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-white/60 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-all duration-200 cursor-pointer group"
          onClick={() => navigate("/test-log/fail")}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Submit Test (FAIL)</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Record failed test results</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics */}
      {analytics && (
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Test Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Today", data: analytics.today },
                { label: "Last 7 Days", data: analytics.last7Days },
                { label: "Last Month", data: analytics.lastMonth },
                { label: "Last Year", data: analytics.lastYear }
              ].map((period, index) => (
                <div key={index} className="text-center space-y-2">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">{period.label}</h4>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      {period.data.total}
                    </p>
                    <div className="flex justify-center gap-4 text-sm">
                      <span className="text-green-600">✓ {period.data.passed}</span>
                      <span className="text-red-600">✗ {period.data.failed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Export */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Activity Log
            </CardTitle>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Serial Number</label>
              <Input
                placeholder="Filter by serial number"
                value={filters.serialNumber}
                onChange={(e) => setFilters(prev => ({ ...prev, serialNumber: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Outcome</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, outcome: value === "all" ? "" : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All outcomes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All outcomes</SelectItem>
                  <SelectItem value="PASS">PASS</SelectItem>
                  <SelectItem value="FAIL">FAIL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Log Type</label>
              <Select onValueChange={(value) => setFilters(prev => ({ ...prev, logType: value === "all" ? "" : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="QA Test">QA Test</SelectItem>
                  <SelectItem value="Scan IN">Scan IN</SelectItem>
                  <SelectItem value="Scan OUT">Scan OUT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={loadActivityLog} className="mb-4">
            Apply Filters
          </Button>

          {/* Activity Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800">
                  <TableHead>Serial Number</TableHead>
                  <TableHead>Product Code</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Log Type</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-slate-500">
                      No activity records found
                    </TableCell>
                  </TableRow>
                ) : (
                  activities.map((activity) => (
                    <TableRow key={activity._id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                      <TableCell className="font-mono">{activity.serialNumber}</TableCell>
                      <TableCell>{activity.productCode}</TableCell>
                      <TableCell>{activity.user}</TableCell>
                      <TableCell>{activity.date}</TableCell>
                      <TableCell>{activity.time}</TableCell>
                      <TableCell>{activity.logType}</TableCell>
                      <TableCell>{getOutcomeBadge(activity.outcome)}</TableCell>
                      <TableCell>{activity.reference}</TableCell>
                      <TableCell className="max-w-xs truncate">{activity.note}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}