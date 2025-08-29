import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { DashboardLayout } from "./components/DashboardLayout"
import { Home } from "./pages/Home"
import { AdminPermissions } from "./pages/AdminPermissions"
import { DatabaseView } from "./pages/DatabaseView"
import { BatchCreation } from "./pages/BatchCreation"
import { SerialRegistration } from "./pages/SerialRegistration"
import { TestLogHub } from "./pages/TestLogHub"
import { TestLogPass } from "./pages/TestLogPass"
import { TestLogFail } from "./pages/TestLogFail"
import { StockManagement } from "./pages/StockManagement"
import { ScanIn } from "./pages/ScanIn"
import { ScanOut } from "./pages/ScanOut"
import { Report } from "./pages/Report"

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Home />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/permissions" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AdminPermissions />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/database" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DatabaseView />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/batch-creation" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BatchCreation />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/serial-registration" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SerialRegistration />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/test-log" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TestLogHub />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/test-log/pass" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TestLogPass />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/test-log/fail" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TestLogFail />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/stock-management" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <StockManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/stock-management/scan-in" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ScanIn />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/stock-management/scan-out" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ScanOut />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/stock-management/report" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Report />
                </DashboardLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App