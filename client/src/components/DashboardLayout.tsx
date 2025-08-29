import { ReactNode } from "react"
import { TopBanner } from "./TopBanner"
import { SideNavigation } from "./SideNavigation"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <TopBanner />
      <div className="flex pt-16">
        <SideNavigation />
        <main className="flex-1 ml-64 p-6 overflow-y-auto min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}