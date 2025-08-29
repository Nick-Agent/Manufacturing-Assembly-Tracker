import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import {
  Package,
  Clipboard,
  TestTube,
  Warehouse,
  Database,
  Shield,
  TrendingUp,
  Activity
} from "lucide-react"

export function Home() {
  const navigate = useNavigate()

  const quickActions = [
    {
      title: "Batch Creation",
      description: "Create new manufacturing batches",
      icon: Package,
      href: "/batch-creation",
      color: "bg-blue-500"
    },
    {
      title: "Serial Registration",
      description: "Register serial numbers to batches",
      icon: Clipboard,
      href: "/serial-registration",
      color: "bg-green-500"
    },
    {
      title: "Test Log",
      description: "Record and view test results",
      icon: TestTube,
      href: "/test-log",
      color: "bg-purple-500"
    },
    {
      title: "Stock Management",
      description: "Manage stock movements",
      icon: Warehouse,
      href: "/stock-management",
      color: "bg-orange-500"
    }
  ]

  const adminActions = [
    {
      title: "Database View",
      description: "Manage system databases",
      icon: Database,
      href: "/admin/database",
      color: "bg-red-500"
    },
    {
      title: "User Permissions",
      description: "Control user access",
      icon: Shield,
      href: "/admin/permissions",
      color: "bg-indigo-500"
    }
  ]

  // Mock statistics
  const stats = [
    {
      title: "Active Batches",
      value: "24",
      change: "+3 today",
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Registered Serials",
      value: "1,247",
      change: "+89 today",
      icon: Clipboard,
      color: "text-green-600"
    },
    {
      title: "Tests Completed",
      value: "156",
      change: "+12 today",
      icon: TestTube,
      color: "text-purple-600"
    },
    {
      title: "Stock Movements",
      value: "78",
      change: "+5 today",
      icon: Activity,
      color: "text-orange-600"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200">
          Manufacturing Assembly Tracker
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Comprehensive tracking system for manufacturing batches, serial numbers, 
          test results, and stock movements.
        </p>
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

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
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

      {/* Admin Actions */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Admin Functions
          </h2>
          <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
            Admin Only
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminActions.map((action, index) => {
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
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-slate-50 dark:group-hover:bg-slate-800"
                  >
                    Manage
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