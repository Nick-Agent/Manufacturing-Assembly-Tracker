import { useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { 
  Home,
  Shield,
  Database,
  Package,
  Clipboard,
  TestTube,
  ScanLine,
  FileText,
  ChevronDown,
  ChevronRight,
  Warehouse,
  Settings
} from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"

interface NavigationItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavigationItem[]
  adminOnly?: boolean
}

const navigationItems: NavigationItem[] = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Admin",
    icon: Shield,
    adminOnly: true,
    children: [
      {
        title: "Permission Control",
        href: "/admin/permissions",
        icon: Shield,
      },
      {
        title: "Database View",
        href: "/admin/database",
        icon: Database,
      },
      {
        title: "Enums",
        href: "/admin/enums",
        icon: Settings,
      },
    ],
  },
  {
    title: "Batch Creation",
    href: "/batch-creation",
    icon: Package,
  },
  {
    title: "Serial Registration",
    href: "/serial-registration",
    icon: Clipboard,
  },
  {
    title: "Test Log",
    icon: TestTube,
    children: [
      {
        title: "Test Log Hub",
        href: "/test-log",
        icon: TestTube,
      },
      {
        title: "Test Log (PASS)",
        href: "/test-log/pass",
        icon: TestTube,
      },
      {
        title: "Test Log (FAIL)",
        href: "/test-log/fail",
        icon: TestTube,
      },
    ],
  },
  {
    title: "Stock Management",
    icon: Warehouse,
    children: [
      {
        title: "Stock Management Hub",
        href: "/stock-management",
        icon: Warehouse,
      },
      {
        title: "Scan IN",
        href: "/stock-management/scan-in",
        icon: ScanLine,
      },
      {
        title: "Scan OUT",
        href: "/stock-management/scan-out",
        icon: ScanLine,
      },
      {
        title: "Report",
        href: "/stock-management/report",
        icon: FileText,
      },
    ],
  },
]

export function SideNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const [openItems, setOpenItems] = useState<string[]>([])

  // Mock user permissions - in real app this would come from context/API
  const isAdmin = true // This should come from auth context
  const userPermissions = ['batch-creation', 'serial-registration', 'test-log', 'stock-management'] // Mock permissions

  const toggleItem = (title: string) => {
    setOpenItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = item.href === location.pathname
    const isOpen = openItems.includes(item.title)
    const hasChildren = item.children && item.children.length > 0
    
    // Check permissions
    if (item.adminOnly && !isAdmin) return null

    const IconComponent = item.icon

    if (hasChildren) {
      return (
        <Collapsible key={item.title} open={isOpen} onOpenChange={() => toggleItem(item.title)}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-11 px-4 text-left font-medium transition-all duration-200",
                level > 0 && "ml-4 w-[calc(100%-1rem)]",
                "hover:bg-slate-800/60 hover:text-slate-100",
                "text-slate-300"
              )}
            >
              <IconComponent className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{item.title}</span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map(child => renderNavigationItem(child, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <Button
        key={item.title}
        variant="ghost"
        onClick={() => item.href && navigate(item.href)}
        className={cn(
          "w-full justify-start gap-3 h-11 px-4 font-medium transition-all duration-200",
          level > 0 && "ml-4 w-[calc(100%-1rem)]",
          isActive 
            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:from-blue-600 hover:to-indigo-700" 
            : "hover:bg-slate-800/60 hover:text-slate-100 text-slate-300"
        )}
      >
        <IconComponent className="h-5 w-5 flex-shrink-0" />
        <span>{item.title}</span>
      </Button>
    )
  }

  return (
    <nav className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-slate-900/95 backdrop-blur-md border-r border-slate-700/50 overflow-y-auto">
      <div className="p-4 space-y-2">
        {navigationItems.map(item => renderNavigationItem(item))}
      </div>
    </nav>
  )
}