import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Warehouse, ScanLine, FileText, TrendingUp } from "lucide-react"

export function StockManagement() {
  const navigate = useNavigate()

  const stockActions = [
    {
      title: "Scan IN",
      description: "Scan items into stock",
      icon: ScanLine,
      href: "/stock-management/scan-in",
      color: "bg-green-500",
      details: "Record incoming stock movements"
    },
    {
      title: "Scan OUT",
      description: "Scan items out of stock",
      icon: ScanLine,
      href: "/stock-management/scan-out",
      color: "bg-blue-500",
      details: "Record outgoing stock movements"
    },
    {
      title: "Report",
      description: "Generate stock reports",
      icon: FileText,
      href: "/stock-management/report",
      color: "bg-purple-500",
      details: "Export activity reports and mark as adjusted"
    }
  ]

  // Mock statistics
  const stats = [
    {
      title: "Items in Stock",
      value: "1,247",
      change: "+89 today",
      icon: Warehouse,
      color: "text-green-600"
    },
    {
      title: "Scan IN Today",
      value: "156",
      change: "+12 this hour",
      icon: ScanLine,
      color: "text-blue-600"
    },
    {
      title: "Scan OUT Today",
      value: "78",
      change: "+5 this hour",
      icon: ScanLine,
      color: "text-orange-600"
    },
    {
      title: "Pending Reports",
      value: "3",
      change: "Ready to export",
      icon: FileText,
      color: "text-purple-600"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 flex items-center justify-center">
          <Warehouse className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Stock Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage stock movements, scanning operations, and generate reports
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <Card key={index} className="bg-white/60 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      {stat.change}
                    </p>
                  </div>
                  <IconComponent className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Stock Actions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Stock Operations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stockActions.map((action, index) => {
            const IconComponent = action.icon
            return (
              <Card
                key={index}
                className="bg-white/60 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                onClick={() => navigate(action.href)}
              >
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                    {action.title}
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
                    {action.details}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-slate-50 dark:group-hover:bg-slate-800"
                  >
                    Access
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}