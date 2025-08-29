import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/useToast"
import { Shield, Users, Settings, CheckCircle } from "lucide-react"
import { getUsers, updateUserPermissions, getAvailablePermissions } from "@/api/permissions"

export function AdminPermissions() {
  const { toast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [availablePermissions, setAvailablePermissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState<string | null>(null)

  // Load users and permissions on component mount
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [usersResponse, permissionsResponse] = await Promise.all([
        getUsers(),
        getAvailablePermissions()
      ])
      setUsers(usersResponse.users)
      setAvailablePermissions(permissionsResponse.permissions)
    } catch (error: any) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load users and permissions",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePermissionToggle = async (userId: string, permissionKey: string, enabled: boolean) => {
    const user = users.find(u => u.id === userId)
    if (!user) return

    // Don't allow changes to admin users
    if (user.role === 'admin') {
      toast({
        title: "Not Allowed",
        description: "Cannot modify admin user permissions",
        variant: "destructive"
      })
      return
    }

    setIsSaving(userId)

    try {
      let newPermissions = [...user.permissions]
      
      if (enabled) {
        if (!newPermissions.includes(permissionKey)) {
          newPermissions.push(permissionKey)
        }
      } else {
        newPermissions = newPermissions.filter(p => p !== permissionKey)
      }

      await updateUserPermissions(userId, newPermissions)

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, permissions: newPermissions }
          : u
      ))

      toast({
        title: "Success",
        description: "User permissions updated successfully"
      })
    } catch (error: any) {
      console.error("Error updating permissions:", error)
      toast({
        title: "Error",
        description: "Failed to update user permissions",
        variant: "destructive"
      })
    } finally {
      setIsSaving(null)
    }
  }

  const hasPermission = (user: any, permissionKey: string) => {
    return user.role === 'admin' || user.permissions.includes(permissionKey)
  }

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-200">Admin</Badge>
    }
    return <Badge variant="secondary">Operator</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            User Permissions
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage user access to different pages and features
          </p>
        </div>
      </div>

      {/* Available Permissions Info */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Available Permissions
          </CardTitle>
          <CardDescription>
            These are the permissions that can be granted to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availablePermissions.map((permission) => (
              <div key={permission.key} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-medium text-slate-800">{permission.label}</h4>
                <p className="text-sm text-slate-600 mt-1">{permission.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Grant or revoke page access for each user
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {users.map((user) => (
                <div key={user.id} className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{user.email}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {getRoleBadge(user.role)}
                          {user.role === 'admin' && (
                            <span className="text-xs text-slate-500">All permissions granted</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSaving === user.id && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600" />
                    )}
                  </div>

                  {user.role !== 'admin' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availablePermissions.map((permission) => (
                        <div key={permission.key} className="flex items-center justify-between p-3 bg-white rounded border border-slate-200">
                          <div>
                            <h4 className="font-medium text-slate-700">{permission.label}</h4>
                            <p className="text-xs text-slate-500">{permission.description}</p>
                          </div>
                          <Switch
                            checked={hasPermission(user, permission.key)}
                            onCheckedChange={(checked) => 
                              handlePermissionToggle(user.id, permission.key, checked)
                            }
                            disabled={isSaving === user.id}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}