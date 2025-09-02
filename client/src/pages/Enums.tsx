import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/useToast"
import { Settings, Code, AlertCircle, Info } from "lucide-react"
import { getEnums } from "@/api/enums"

export function Enums() {
  const { toast } = useToast()
  const [enums, setEnums] = useState<{ [key: string]: string[] }>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load enums on component mount
  useEffect(() => {
    loadEnums()
  }, [])

  const loadEnums = async () => {
    setIsLoading(true)
    try {
      const response = await getEnums()
      setEnums(response.enums)
    } catch (error: any) {
      console.error("Error loading enums:", error)
      toast({
        title: "Error",
        description: "Failed to load enum definitions",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getEnumColor = (enumName: string) => {
    const colors = {
      'Activity': 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      'Outcome': 'bg-green-100 text-green-700 hover:bg-green-200',
      'Status': 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      'Scan IN Destination': 'bg-orange-100 text-orange-700 hover:bg-orange-200',
      'Scan OUT Destination': 'bg-red-100 text-red-700 hover:bg-red-200'
    }
    return colors[enumName as keyof typeof colors] || 'bg-slate-100 text-slate-700 hover:bg-slate-200'
  }

  const getEnumIcon = (enumName: string) => {
    switch (enumName) {
      case 'Activity':
        return '🔄'
      case 'Outcome':
        return '✅'
      case 'Status':
        return '📊'
      case 'Scan IN Destination':
        return '📥'
      case 'Scan OUT Destination':
        return '📤'
      default:
        return '⚙️'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Enums Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            View and manage enumeration values used across the application
          </p>
        </div>
      </div>

      {/* Information Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Read-Only View:</strong> Enum definitions are stored in the backend code under version control. 
          To modify these values, update the backend configuration files and redeploy the application.
        </AlertDescription>
      </Alert>

      {/* Development Note */}
      <Alert className="bg-amber-50 border-amber-200">
        <Code className="h-4 w-4" />
        <AlertDescription>
          <strong>For Developers:</strong> These enum values are defined in the backend configuration. 
          Changes require code modification and deployment through the development workflow.
        </AlertDescription>
      </Alert>

      {/* Enums Display */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(enums).map(([enumName, values]) => (
            <Card key={enumName} className="bg-white/60 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">{getEnumIcon(enumName)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                      {enumName}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {values.length} value{values.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {values.map((value, index) => (
                    <Badge
                      key={index}
                      className={`${getEnumColor(enumName)} font-medium px-3 py-1 transition-colors duration-200`}
                    >
                      {value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Usage Information */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-slate-600" />
            Usage Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Activity Types</h4>
              <p className="text-sm text-slate-600">
                Used in activity logs to categorize different types of operations performed on serial numbers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Test Outcomes</h4>
              <p className="text-sm text-slate-600">
                Results of quality assurance tests and other validation processes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Item Status</h4>
              <p className="text-sm text-slate-600">
                Current state of items in the manufacturing and testing pipeline.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Scan Destinations</h4>
              <p className="text-sm text-slate-600">
                Predefined locations for stock movement operations (IN/OUT).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}