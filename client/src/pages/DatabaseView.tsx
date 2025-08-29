import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/useToast"
import { Database, Upload, Download, Edit, Save, X } from "lucide-react"
import { getDatabases, getDatabaseRecords, importDatabaseCSV, exportDatabaseCSV, updateDatabaseRecord } from "@/api/database"

export function DatabaseView() {
  const { toast } = useToast()
  const [databases, setDatabases] = useState<string[]>([])
  const [selectedDatabase, setSelectedDatabase] = useState<string>("")
  const [records, setRecords] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [editFormData, setEditFormData] = useState<any>({})

  // Load databases on component mount
  useEffect(() => {
    loadDatabases()
  }, [])

  // Load records when database selection changes
  useEffect(() => {
    if (selectedDatabase) {
      loadRecords()
    }
  }, [selectedDatabase])

  const loadDatabases = async () => {
    try {
      const response = await getDatabases()
      setDatabases(response.databases)
    } catch (error: any) {
      console.error("Error loading databases:", error)
      toast({
        title: "Error",
        description: "Failed to load databases",
        variant: "destructive"
      })
    }
  }

  const loadRecords = async () => {
    if (!selectedDatabase) return

    setIsLoading(true)
    try {
      const response = await getDatabaseRecords(selectedDatabase)
      setRecords(response.records)
    } catch (error: any) {
      console.error("Error loading records:", error)
      toast({
        title: "Error",
        description: "Failed to load database records",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedDatabase) return

    setIsImporting(true)
    try {
      const csvData = await file.text()
      const response = await importDatabaseCSV(selectedDatabase, csvData)
      
      toast({
        title: "Success",
        description: response.message
      })
      
      // Reload records
      await loadRecords()
    } catch (error: any) {
      console.error("Error importing CSV:", error)
      toast({
        title: "Error",
        description: "Failed to import CSV file",
        variant: "destructive"
      })
    } finally {
      setIsImporting(false)
      // Reset file input
      event.target.value = ""
    }
  }

  const handleExport = async () => {
    if (!selectedDatabase) return

    setIsExporting(true)
    try {
      const response = await exportDatabaseCSV(selectedDatabase)
      
      // Create and download CSV file
      const blob = new Blob([response.csvData], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedDatabase}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Database exported successfully"
      })
    } catch (error: any) {
      console.error("Error exporting database:", error)
      toast({
        title: "Error",
        description: "Failed to export database",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleEditRecord = (record: any) => {
    setEditingRecord(record)
    setEditFormData({ ...record })
  }

  const handleSaveRecord = async () => {
    if (!editingRecord || !selectedDatabase) return

    try {
      const response = await updateDatabaseRecord(selectedDatabase, editingRecord._id, editFormData)
      
      toast({
        title: "Success",
        description: response.message
      })
      
      // Update local records
      setRecords(prev => prev.map(record => 
        record._id === editingRecord._id ? { ...editFormData } : record
      ))
      
      setEditingRecord(null)
      setEditFormData({})
    } catch (error: any) {
      console.error("Error updating record:", error)
      toast({
        title: "Error",
        description: "Failed to update record",
        variant: "destructive"
      })
    }
  }

  const getTableColumns = () => {
    if (records.length === 0) return []
    return Object.keys(records[0]).filter(key => key !== '_id')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center">
          <Database className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Database View
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage system databases, import/export data, and edit records
          </p>
        </div>
      </div>

      {/* Database Selection and Controls */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
        <CardHeader>
          <CardTitle>Database Management</CardTitle>
          <CardDescription>
            Select a database to view, import, export, or edit records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="database">Select Database</Label>
              <Select onValueChange={setSelectedDatabase}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a database" />
                </SelectTrigger>
                <SelectContent>
                  {databases.map((db) => (
                    <SelectItem key={db} value={db}>
                      {db}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDatabase && (
              <div className="flex gap-2">
                <div className="relative">
                  <Input
                    type="file"
                    accept=".csv"
                    onChange={handleImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isImporting}
                  />
                  <Button
                    variant="outline"
                    disabled={isImporting}
                    className="pointer-events-none"
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import CSV
                      </>
                    )}
                  </Button>
                </div>

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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      {selectedDatabase && (
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
          <CardHeader>
            <CardTitle>{selectedDatabase} Records</CardTitle>
            <CardDescription>
              View and edit database records. Click the edit button to modify a record.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600" />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No records found in this database
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-800">
                        {getTableColumns().map((column) => (
                          <TableHead key={column} className="whitespace-nowrap">
                            {column.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </TableHead>
                        ))}
                        <TableHead className="w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {records.map((record) => (
                        <TableRow key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                          {getTableColumns().map((column) => (
                            <TableCell key={column} className="whitespace-nowrap">
                              {record[column]?.toString() || '-'}
                            </TableCell>
                          ))}
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRecord(record)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Record Dialog */}
      <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
            <DialogDescription>
              Modify the record fields and save changes
            </DialogDescription>
          </DialogHeader>
          
          {editingRecord && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {getTableColumns().map((column) => (
                <div key={column} className="space-y-2">
                  <Label htmlFor={column}>
                    {column.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                  <Input
                    id={column}
                    value={editFormData[column] || ''}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      [column]: e.target.value
                    }))}
                  />
                </div>
              ))}
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingRecord(null)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveRecord}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}