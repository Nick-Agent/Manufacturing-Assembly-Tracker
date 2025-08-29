import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/useToast"
import { Shield, Users, Settings, CheckCircle, User } from "lucide-react"
import { getUsers, updateUserPermissions, getAvailablePermissions } from "@/api/permissions"

export function AdminPermissions() {
  const { toast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [availablePermissions, setAvailablePermissions] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

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

  const handlePermissionToggle = async (permissionKey: string, enabled: boolean) => {
    if (!selectedUserId) return

    const user = users.find(u => u.id === selectedUserId)
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

    setIsSaving(true)

    try {
      let newPermissions = [...user.permissions]

      if (enabled) {
        if (!newPermissions.includes(permissionKey)) {
          newPermissions.push(permissionKey)
        }
      } else {
        newPermissions = newPermissions.filter(p => p !== permissionKey)
      }

      await updateUserPermissions(selectedUserId, newPermissions)

      // Update local state
      setUsers(prev => prev.map(u =>
        u.id === selectedUserId
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
      setIsSaving(false)
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

  const selectedUser = users.find(u => u.id === selectedUserId)
  const operatorUsers = users.filter(u => u.role !== 'admin')

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

      {/* User Selection */}
      <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Select User
          </CardTitle>
          <CardDescription>
            Choose a user to manage their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">User</label>
              <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a user to manage permissions" />
                </SelectTrigger>
                <SelectContent>
                  {operatorUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span>{user.email}</span>
                        {getRoleBadge(user.role)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUser && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {selectedUser.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{selectedUser.email}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(selectedUser.role)}
                      <span className="text-xs text-slate-500">
                        {selectedUser.permissions.length} permission{selectedUser.permissions.length !== 1 ? 's' : ''} granted
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permissions Management */}
      {selectedUser && (
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Manage Permissions
            </CardTitle>
            <CardDescription>
              Grant or revoke page access for {selectedUser.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600" />
              </div>
            ) : (
              <div className="space-y-4">
                {availablePermissions.map((permission) => (
                  <div key={permission.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{permission.label}</h4>
                      <p className="text-sm text-slate-600 mt-1">{permission.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isSaving && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600" />
                      )}
                      <Switch
                        checked={hasPermission(selectedUser, permission.key)}
                        onCheckedChange={(checked) =>
                          handlePermissionToggle(permission.key, checked)
                        }
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}