// client/src/app/(main)/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Icons } from '@/components/ui/icons'
import { useToast } from '@/hooks/useToast'
import { formatCurrency, formatNumber, formatDate, formatDateTime, getTimeAgo } from '@/lib/utils'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = ['#06B6D4', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1']

// ============================================
// ADMIN DASHBOARD MAIN COMPONENT
// ============================================

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [notificationMessage, setNotificationMessage] = useState('')
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationType, setNotificationType] = useState('SYSTEM_ALERT')
  const [showNotificationDialog, setShowNotificationDialog] = useState(false)
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [withdrawalFilter, setWithdrawalFilter] = useState('PENDING')

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    )
  }

  if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MODERATOR') {
    redirect('/dashboard')
  }

  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-space-grotesk text-3xl font-bold">Admin Control Panel</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isAdmin ? 'Full platform administration' : 'Moderator dashboard'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={isAdmin ? 'destructive' : 'secondary'} className="text-sm">
            {session?.user?.role}
          </Badge>
          <Button variant="outline" onClick={() => setShowBroadcastDialog(true)}>
            <Icons.megaphone className="mr-2 h-4 w-4" />
            Broadcast Notification
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="freelancers">
          <FreelancersTab />
        </TabsContent>

        <TabsContent value="clients">
          <ClientsTab />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsTab />
        </TabsContent>

        <TabsContent value="withdrawals">
          <WithdrawalsTab isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="disputes">
          <DisputesTab />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab isAdmin={isAdmin} />
        </TabsContent>
      </Tabs>

      {/* Broadcast Notification Dialog */}
      <BroadcastDialog 
        open={showBroadcastDialog} 
        onOpenChange={setShowBroadcastDialog}
      />
    </div>
  )
}

// ============================================
// OVERVIEW TAB
// ============================================

function OverviewTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const res = await fetch('/api/admin/overview')
      return res.json()
    },
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(data?.totalRevenue || 0)}
          change={data?.revenueGrowth}
          icon={<Icons.dollarSign className="h-5 w-5" />}
        />
        <StatsCard
          title="Active Users"
          value={formatNumber(data?.activeUsers || 0)}
          change={data?.userGrowth}
          icon={<Icons.users className="h-5 w-5" />}
        />
        <StatsCard
          title="Active Projects"
          value={formatNumber(data?.activeProjects || 0)}
          change={data?.projectGrowth}
          icon={<Icons.briefcase className="h-5 w-5" />}
        />
        <StatsCard
          title="Pending Withdrawals"
          value={formatNumber(data?.pendingWithdrawals || 0)}
          change={data?.pendingWithdrawalsValue ? formatCurrency(data.pendingWithdrawalsValue) : undefined}
          icon={<Icons.wallet className="h-5 w-5" />}
          alert={data?.pendingWithdrawals > 0}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly platform revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data?.revenueChart || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New registrations per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.userChart || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="freelancers" stroke="#06B6D4" />
                <Line type="monotone" dataKey="clients" stroke="#F59E0B" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Distribution</CardTitle>
            <CardDescription>By category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data?.categoryDistribution || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {(data?.categoryDistribution || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Real-time metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <HealthMetric label="API Response Time" value="124ms" status="good" />
            <HealthMetric label="Database Connections" value="8/20" status="good" />
            <HealthMetric label="Redis Cache Hit Rate" value="94%" status="good" />
            <HealthMetric label="Storage Usage" value="45.2 GB / 100 GB" status="warning" />
            <HealthMetric label="WebSocket Connections" value="247 active" status="good" />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
          <CardDescription>Latest events across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityFeed activities={data?.recentActivity || []} />
        </CardContent>
      </Card>

      {/* Alerts */}
      {data?.alerts?.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader>
            <CardTitle className="text-amber-600">⚠️ Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.alerts.map((alert: any) => (
                <div key={alert.id} className="flex items-center justify-between rounded-lg bg-amber-50 p-3 dark:bg-amber-950/20">
                  <div className="flex items-center space-x-3">
                    <Icons.alertTriangle className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.description}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================
// USERS TAB
// ============================================

function UsersTab({ isAdmin }: { isAdmin: boolean }) {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showNotifyDialog, setShowNotifyDialog] = useState(false)
  const [showSuspendDialog, setShowSuspendDialog] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, filter, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), filter, search })
      const res = await fetch(`/api/admin/users?${params}`)
      return res.json()
    },
  })

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, action, data }: any) => {
      const res = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast({ title: 'Success', description: 'User updated successfully' })
      setShowUserDialog(false)
      setShowSuspendDialog(false)
    },
  })

  const sendNotificationMutation = useMutation({
    mutationFn: async ({ userId, title, message, type }: any) => {
      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, title, message, type }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast({ title: 'Success', description: 'Notification sent' })
      setShowNotifyDialog(false)
    },
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-80"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => {
          setSelectedUser(null)
          setShowUserDialog(true)
        }}>
          <Icons.plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email Verified</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Spent/Earned</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.users?.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs font-mono text-gray-400">ID: {user.uniqueUserId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      user.status === 'ACTIVE' ? 'success' :
                      user.status === 'SUSPENDED' ? 'warning' : 'destructive'
                    }>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.emailVerified ? (
                      <Icons.checkCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Icons.xCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>{user.lastActive ? getTimeAgo(user.lastActive) : 'Never'}</TableCell>
                  <TableCell>{user.projectsCount || 0}</TableCell>
                  <TableCell>{formatCurrency(user.totalAmount || 0)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Icons.moreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          setSelectedUser(user)
                          setShowUserDialog(true)
                        }}>
                          <Icons.edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedUser(user)
                          setShowNotifyDialog(true)
                        }}>
                          <Icons.bell className="mr-2 h-4 w-4" />
                          Send Notification
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/profile/${user.id}`}>
                            <Icons.user className="mr-2 h-4 w-4" />
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}/activity`}>
                            <Icons.activity className="mr-2 h-4 w-4" />
                            View Activity Log
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === 'ACTIVE' ? (
                          <DropdownMenuItem 
                            className="text-amber-500"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowSuspendDialog(true)
                            }}
                          >
                            <Icons.alertCircle className="mr-2 h-4 w-4" />
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            className="text-green-500"
                            onClick={() => updateUserMutation.mutate({ userId: user.id, action: 'activate' })}
                          >
                            <Icons.checkCircle className="mr-2 h-4 w-4" />
                            Activate User
                          </DropdownMenuItem>
                        )}
                        {isAdmin && (
                          <>
                            <DropdownMenuItem onClick={() => updateUserMutation.mutate({ 
                              userId: user.id, 
                              action: 'role',
                              data: { role: user.role === 'ADMIN' ? 'MODERATOR' : 'ADMIN' }
                            })}>
                              <Icons.shield className="mr-2 h-4 w-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">
                              <Icons.ban className="mr-2 h-4 w-4" />
                              Ban User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.pagination && (
        <Pagination
          page={page}
          total={data.pagination.total}
          limit={data.pagination.limit}
          onPageChange={setPage}
        />
      )}

      {/* Edit User Dialog */}
      <UserEditDialog
        open={showUserDialog}
        onOpenChange={setShowUserDialog}
        user={selectedUser}
        onSave={(data: any) => updateUserMutation.mutate({ userId: selectedUser?.id, action: 'update', data })}
      />

      {/* Send Notification Dialog */}
      <SendNotificationDialog
        open={showNotifyDialog}
        onOpenChange={setShowNotifyDialog}
        user={selectedUser}
        onSend={(data: any) => sendNotificationMutation.mutate({ userId: selectedUser?.id, ...data })}
      />

      {/* Suspend User Dialog */}
      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend {selectedUser?.firstName} {selectedUser?.lastName}?
              They will not be able to access their account until reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => updateUserMutation.mutate({ 
                userId: selectedUser?.id, 
                action: 'suspend',
                data: { reason: 'Administrative action' }
              })}
            >
              Suspend User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ============================================
// FREELANCERS TAB
// ============================================

function FreelancersTab() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-freelancers', page, filter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), filter })
      const res = await fetch(`/api/admin/freelancers?${params}`)
      return res.json()
    },
  })

  const sendDeadlineReminderMutation = useMutation({
    mutationFn: async ({ freelancerId, projectId, message }: any) => {
      const res = await fetch('/api/admin/freelancers/remind-deadline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerId, projectId, message }),
      })
      return res.json()
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Deadline reminder sent' })
      setShowReminderDialog(false)
    },
  })

  const verifyFreelancerMutation = useMutation({
    mutationFn: async ({ freelancerId, verificationLevel }: any) => {
      const res = await fetch('/api/admin/freelancers/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ freelancerId, verificationLevel }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-freelancers'] })
      toast({ title: 'Success', description: 'Freelancer verification updated' })
      setShowVerifyDialog(false)
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Freelancers</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
              <SelectItem value="elaccess">ELACCESS Graduates</SelectItem>
              <SelectItem value="active-projects">Has Active Projects</SelectItem>
              <SelectItem value="inactive">Inactive (30+ days)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => {
            // Export freelancers list
          }}>
            <Icons.download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Freelancer</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Active Projects</TableHead>
                <TableHead>Deadlines</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Total Earned</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.freelancers?.map((freelancer: any) => (
                <TableRow key={freelancer.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={freelancer.avatar} />
                        <AvatarFallback>{freelancer.firstName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{freelancer.firstName} {freelancer.lastName}</p>
                        <p className="text-sm text-gray-500">{freelancer.headline}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      freelancer.verificationLevel === 'PREMIUM' ? 'success' :
                      freelancer.verificationLevel === 'VERIFIED' ? 'secondary' : 'outline'
                    }>
                      {freelancer.verificationLevel || 'UNVERIFIED'}
                    </Badge>
                    {freelancer.elaccessGraduate && (
                      <Badge className="ml-1 bg-amber-500">ELACCESS</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {freelancer.skills?.slice(0, 3).map((skill: string) => (
                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                      {freelancer.skills?.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{freelancer.skills.length - 3}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(freelancer.hourlyRate)}/hr</TableCell>
                  <TableCell>
                    {freelancer.activeProjects > 0 ? (
                      <Link href={`/admin/projects?freelancer=${freelancer.id}`} className="text-cyan-500 hover:underline">
                        {freelancer.activeProjects} active
                      </Link>
                    ) : (
                      'None'
                    )}
                  </TableCell>
                  <TableCell>
                    {freelancer.upcomingDeadlines?.length > 0 ? (
                      <div className="space-y-1">
                        {freelancer.upcomingDeadlines.slice(0, 2).map((deadline: any) => (
                          <div key={deadline.id} className="text-xs">
                            <span className={deadline.daysLeft < 2 ? 'text-red-500 font-medium' : ''}>
                              {deadline.projectTitle}: {deadline.daysLeft} days left
                            </span>
                          </div>
                        ))}
                        {freelancer.upcomingDeadlines.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{freelancer.upcomingDeadlines.length - 2} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">No deadlines</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={freelancer.completionRate} className="w-16" />
                      <span className="text-sm">{freelancer.completionRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(freelancer.totalEarned)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Icons.moreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem asChild>
                          <Link href={`/freelancers/${freelancer.id}`}>
                            <Icons.eye className="mr-2 h-4 w-4" />
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedFreelancer(freelancer)
                          setShowReminderDialog(true)
                        }}>
                          <Icons.bell className="mr-2 h-4 w-4" />
                          Send Deadline Reminder
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedFreelancer(freelancer)
                          setShowVerifyDialog(true)
                        }}>
                          <Icons.shield className="mr-2 h-4 w-4" />
                          Update Verification
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Icons.messageCircle className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Icons.flag className="mr-2 h-4 w-4" />
                          Flag for Review
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Pagination
        page={page}
        total={data?.pagination?.total || 0}
        limit={data?.pagination?.limit || 20}
        onPageChange={setPage}
      />

      {/* Deadline Reminder Dialog */}
      <DeadlineReminderDialog
        open={showReminderDialog}
        onOpenChange={setShowReminderDialog}
        freelancer={selectedFreelancer}
        onSend={(data: any) => sendDeadlineReminderMutation.mutate(data)}
      />

      {/* Verify Freelancer Dialog */}
      <VerifyFreelancerDialog
        open={showVerifyDialog}
        onOpenChange={setShowVerifyDialog}
        freelancer={selectedFreelancer}
        onVerify={(data: any) => verifyFreelancerMutation.mutate(data)}
      />
    </div>
  )
}

// ============================================
// WITHDRAWALS TAB
// ============================================

function WithdrawalsTab({ isAdmin }: { isAdmin: boolean }) {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('PENDING')
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-withdrawals', page, filter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), filter })
      const res = await fetch(`/api/admin/withdrawals?${params}`)
      return res.json()
    },
    refetchInterval: filter === 'PENDING' ? 30000 : false, // Auto-refresh pending every 30s
  })

  const approveWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, notes }: any) => {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] })
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
      toast({ title: 'Success', description: 'Withdrawal approved successfully' })
      setShowApproveDialog(false)
    },
  })

  const rejectWithdrawalMutation = useMutation({
    mutationFn: async ({ withdrawalId, reason }: any) => {
      const res = await fetch(`/api/admin/withdrawals/${withdrawalId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] })
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
      toast({ title: 'Success', description: 'Withdrawal rejected' })
      setShowRejectDialog(false)
      setRejectionReason('')
    },
  })

  const bulkApproveMutation = useMutation({
    mutationFn: async ({ withdrawalIds }: any) => {
      const res = await fetch('/api/admin/withdrawals/bulk-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalIds }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-withdrawals'] })
      toast({ title: 'Success', description: 'Selected withdrawals approved' })
    },
  })

  const [selectedIds, setSelectedIds] = useState<string[]>([])

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Withdrawals</CardDescription>
            <CardTitle className="text-2xl">{formatNumber(data?.summary?.pending || 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-500">Total: {formatCurrency(data?.summary?.pendingAmount || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved Today</CardDescription>
            <CardTitle className="text-2xl">{formatNumber(data?.summary?.approvedToday || 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-500">Total: {formatCurrency(data?.summary?.approvedAmount || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rejected Today</CardDescription>
            <CardTitle className="text-2xl">{formatNumber(data?.summary?.rejectedToday || 0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-500">Total: {formatCurrency(data?.summary?.rejectedAmount || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Processed (MTD)</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(data?.summary?.processedMTD || 0)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          
          {filter === 'PENDING' && selectedIds.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => bulkApproveMutation.mutate({ withdrawalIds: selectedIds })}
            >
              Bulk Approve ({selectedIds.length})
            </Button>
          )}
        </div>
        
        <Button variant="outline" onClick={() => {
          // Export withdrawals
        }}>
          <Icons.download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Withdrawals Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {filter === 'PENDING' && (
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(data?.withdrawals?.map((w: any) => w.id) || [])
                        } else {
                          setSelectedIds([])
                        }
                      }}
                    />
                  </TableHead>
                )}
                <TableHead>ID</TableHead>
                <TableHead>Freelancer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.withdrawals?.map((withdrawal: any) => (
                <TableRow key={withdrawal.id}>
                  {filter === 'PENDING' && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(withdrawal.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds([...selectedIds, withdrawal.id])
                          } else {
                            setSelectedIds(selectedIds.filter(id => id !== withdrawal.id))
                          }
                        }}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-mono text-sm">{withdrawal.withdrawalId}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={withdrawal.freelancer?.avatar} />
                        <AvatarFallback>{withdrawal.freelancer?.firstName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{withdrawal.freelancer?.firstName} {withdrawal.freelancer?.lastName}</p>
                        <p className="text-xs text-gray-500">{withdrawal.freelancer?.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{formatCurrency(withdrawal.amount)}</p>
                    <p className="text-xs text-gray-500">
                      Fee: {formatCurrency(withdrawal.fee)} ({withdrawal.feeType})
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {withdrawal.method === 'BANK' && <Icons.building className="h-4 w-4" />}
                      {withdrawal.method === 'PAYPAL' && <Icons.paypal className="h-4 w-4" />}
                      {withdrawal.method === 'CRYPTO' && <Icons.bitcoin className="h-4 w-4" />}
                      <span>{withdrawal.method}</span>
                    </div>
                    <p className="text-xs text-gray-500">{withdrawal.destination}</p>
                  </TableCell>
                  <TableCell>{formatDateTime(withdrawal.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      withdrawal.status === 'COMPLETED' ? 'success' :
                      withdrawal.status === 'PENDING' ? 'warning' :
                      withdrawal.status === 'PROCESSING' ? 'secondary' : 'destructive'
                    }>
                      {withdrawal.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      withdrawal.riskScore < 30 ? 'success' :
                      withdrawal.riskScore < 60 ? 'warning' : 'destructive'
                    }>
                      {withdrawal.riskScore}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {withdrawal.status === 'PENDING' && isAdmin && (
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-500"
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal)
                            setShowApproveDialog(true)
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500"
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal)
                            setShowRejectDialog(true)
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Icons.moreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Icons.eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Icons.fileText className="mr-2 h-4 w-4" />
                          View Transaction History
                        </DropdownMenuItem>
                        {withdrawal.status === 'PENDING' && (
                          <DropdownMenuItem className="text-amber-500">
                            <Icons.flag className="mr-2 h-4 w-4" />
                            Flag for Review
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Pagination
        page={page}
        total={data?.pagination?.total || 0}
        limit={data?.pagination?.limit || 20}
        onPageChange={setPage}
      />

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Withdrawal</AlertDialogTitle>
            <AlertDialogDescription>
              Approve withdrawal of {formatCurrency(selectedWithdrawal?.amount)} to {selectedWithdrawal?.freelancer?.firstName} {selectedWithdrawal?.freelancer?.lastName}?
              <br /><br />
              <strong>Destination:</strong> {selectedWithdrawal?.destination}<br />
              <strong>Method:</strong> {selectedWithdrawal?.method}<br />
              <strong>Risk Score:</strong> {selectedWithdrawal?.riskScore}/100
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-4">
            <Label>Internal Notes (Optional)</Label>
            <Textarea placeholder="Add notes for audit trail..." />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => approveWithdrawalMutation.mutate({ 
                withdrawalId: selectedWithdrawal?.id,
                notes: 'Approved by admin'
              })}
            >
              Approve Withdrawal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Withdrawal</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejection. This will be shared with the freelancer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-4">
            <Label>Rejection Reason</Label>
            <Select value={rejectionReason} onValueChange={setRejectionReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INSUFFICIENT_BALANCE">Insufficient Balance</SelectItem>
                <SelectItem value="INVALID_BANK_DETAILS">Invalid Bank Details</SelectItem>
                <SelectItem value="SUSPICIOUS_ACTIVITY">Suspicious Activity</SelectItem>
                <SelectItem value="ACCOUNT_UNDER_REVIEW">Account Under Review</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            <Textarea 
              placeholder="Additional details..."
              value={rejectionReason === 'OTHER' ? '' : undefined}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => rejectWithdrawalMutation.mutate({ 
                withdrawalId: selectedWithdrawal?.id,
                reason: rejectionReason
              })}
            >
              Reject Withdrawal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ============================================
// PROJECTS TAB
// ============================================

function ProjectsTab() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('all')
  const { data, isLoading } = useQuery({
    queryKey: ['admin-projects', page, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), status })
      const res = await fetch(`/api/admin/projects?${params}`)
      return res.json()
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="DISPUTED">Disputed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Freelancer</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.projects?.map((project: any) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link href={`/projects/${project.id}`} className="font-medium hover:text-cyan-500">
                      {project.title}
                    </Link>
                    <p className="text-xs text-gray-500">{project.category}</p>
                  </TableCell>
                  <TableCell>{project.client?.firstName} {project.client?.lastName}</TableCell>
                  <TableCell>
                    {project.freelancer ? (
                      `${project.freelancer?.firstName} ${project.freelancer?.lastName}`
                    ) : (
                      <span className="text-gray-400">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(project.budget)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      project.status === 'COMPLETED' ? 'success' :
                      project.status === 'IN_PROGRESS' ? 'warning' :
                      project.status === 'DISPUTED' ? 'destructive' : 'secondary'
                    }>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={project.progress} className="w-16" />
                      <span className="text-sm">{project.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {project.deadline ? (
                      <span className={project.daysLeft < 3 ? 'text-red-500 font-medium' : ''}>
                        {formatDate(project.deadline)}
                        <br />
                        <span className="text-xs">{project.daysLeft} days left</span>
                      </span>
                    ) : (
                      <span className="text-gray-400">No deadline</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Icons.moreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/projects/${project.id}`}>
                            <Icons.eye className="mr-2 h-4 w-4" />
                            View Project
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Icons.messageCircle className="mr-2 h-4 w-4" />
                          Message Parties
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Icons.flag className="mr-2 h-4 w-4" />
                          Flag for Review
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Pagination
        page={page}
        total={data?.pagination?.total || 0}
        limit={data?.pagination?.limit || 20}
        onPageChange={setPage}
      />
    </div>
  )
}

// ============================================
// CLIENTS TAB
// ============================================

function ClientsTab() {
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const { data, isLoading } = useQuery({
    queryKey: ['admin-clients', page, filter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), filter })
      const res = await fetch(`/api/admin/clients?${params}`)
      return res.json()
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.clients?.map((client: any) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={client.avatar} />
                        <AvatarFallback>{client.firstName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{client.firstName} {client.lastName}</p>
                        <p className="text-sm text-gray-500">{client.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{client.projectsCount || 0}</TableCell>
                  <TableCell>{formatCurrency(client.totalSpent || 0)}</TableCell>
                  <TableCell>{formatDate(client.createdAt)}</TableCell>
                  <TableCell>{client.lastActive ? getTimeAgo(client.lastActive) : 'Never'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Icons.moreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// DISPUTES TAB
// ============================================

function DisputesTab() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['admin-disputes', page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) })
      const res = await fetch(`/api/admin/disputes?${params}`)
      return res.json()
    },
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispute ID</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Parties</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.disputes?.map((dispute: any) => (
                <TableRow key={dispute.id}>
                  <TableCell className="font-mono text-sm">{dispute.disputeId}</TableCell>
                  <TableCell>{dispute.projectTitle}</TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <p>Client: {dispute.clientName}</p>
                      <p>Freelancer: {dispute.freelancerName}</p>
                    </div>
                  </TableCell>
                  <TableCell>{dispute.type}</TableCell>
                  <TableCell>
                    <Badge variant={dispute.status === 'RESOLVED' ? 'success' : 'warning'}>
                      {dispute.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={dispute.priority === 'HIGH' ? 'destructive' : 'secondary'}>
                      {dispute.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/disputes/${dispute.id}`}>Review</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// SETTINGS TAB
// ============================================

function SettingsTab({ isAdmin }: { isAdmin: boolean }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/settings')
      return res.json()
    },
  })

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Platform Configuration</CardTitle>
          <CardDescription>Global platform settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
            <Switch id="maintenance-mode" checked={data?.maintenanceMode} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="new-registrations">Allow New Registrations</Label>
            <Switch id="new-registrations" checked={data?.allowRegistrations} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platform-fee">Platform Fee (%)</Label>
            <Input id="platform-fee" type="number" value={data?.platformFee} />
          </div>
        </CardContent>
        {isAdmin && (
          <CardFooter>
            <Button>Save Settings</Button>
          </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security & Audit</CardTitle>
          <CardDescription>System security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <Icons.lock className="mr-2 h-4 w-4" />
            2FA Requirements
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Icons.activity className="mr-2 h-4 w-4" />
            System Audit Log
          </Button>
          <Button variant="outline" className="w-full justify-start text-red-500">
            <Icons.trash className="mr-2 h-4 w-4" />
            Clear System Cache
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// DIALOG COMPONENTS
// ============================================

function BroadcastDialog({ open, onOpenChange }: any) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('SYSTEM_ALERT')
  const [targetRole, setTargetRole] = useState('all')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const broadcastMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/admin/notifications/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Broadcast notification sent' })
      onOpenChange(false)
      setTitle('')
      setMessage('')
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Broadcast Notification</DialogTitle>
          <DialogDescription>
            Send a notification to all users or specific user groups
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Select value={targetRole} onValueChange={setTargetRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="FREELANCER">Freelancers Only</SelectItem>
                <SelectItem value="CLIENT">Clients Only</SelectItem>
                <SelectItem value="ADMIN">Admins Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notification Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SYSTEM_ALERT">System Alert</SelectItem>
                <SelectItem value="ANNOUNCEMENT">Announcement</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="PROMOTION">Promotion</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="Notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              placeholder="Notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => broadcastMutation.mutate({ title, message, type, targetRole })}
            disabled={!title || !message}
          >
            Send Broadcast
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function UserEditDialog({ open, onOpenChange, user, onSave }: any) {
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (user) setFormData(user)
  }, [user])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={formData.firstName || ''} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={formData.lastName || ''} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave(formData)}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SendNotificationDialog({ open, onOpenChange, user, onSend }: any) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('SYSTEM_ALERT')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Notification</DialogTitle>
          <DialogDescription>
            Send a notification to {user?.firstName} {user?.lastName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SYSTEM_ALERT">System Alert</SelectItem>
                <SelectItem value="ACCOUNT_UPDATE">Account Update</SelectItem>
                <SelectItem value="VERIFICATION_REQUIRED">Verification Required</SelectItem>
                <SelectItem value="PAYMENT">Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="Notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              placeholder="Notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSend({ title, message, type })} disabled={!title || !message}>
            Send Notification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeadlineReminderDialog({ open, onOpenChange, freelancer, onSend }: any) {
  const [projectId, setProjectId] = useState('')
  const [message, setMessage] = useState('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Deadline Reminder</DialogTitle>
          <DialogDescription>
            Remind {freelancer?.firstName} about an upcoming project deadline
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {freelancer?.upcomingDeadlines?.map((deadline: any) => (
                  <SelectItem key={deadline.id} value={deadline.projectId}>
                    {deadline.projectTitle} - {deadline.daysLeft} days left
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Custom Message (Optional)</Label>
            <Textarea
              placeholder="Add a personal note..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onSend({ freelancerId: freelancer?.id, projectId, message })}>
            Send Reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function VerifyFreelancerDialog({ open, onOpenChange, freelancer, onVerify }: any) {
  const [level, setLevel] = useState('VERIFIED')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Verification Level</DialogTitle>
          <DialogDescription>
            Update verification status for {freelancer?.firstName} {freelancer?.lastName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Verification Level</Label>
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">None</SelectItem>
                <SelectItem value="BASIC">Basic</SelectItem>
                <SelectItem value="VERIFIED">Verified</SelectItem>
                <SelectItem value="PREMIUM">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onVerify({ freelancerId: freelancer?.id, verificationLevel: level })}>
            Update Verification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// HELPER COMPONENTS
// ============================================

function LoadingSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Icons.spinner className="h-8 w-8 animate-spin text-cyan-500" />
    </div>
  )
}

function StatsCard({ title, value, change, icon, alert }: any) {
  return (
    <Card className={alert ? 'border-amber-500' : ''}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription>{title}</CardDescription>
        <div className="text-gray-500">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${typeof change === 'string' && change.startsWith('+') ? 'text-green-500' : 'text-gray-500'}`}>
            {change} from last month
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function HealthMetric({ label, value, status }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="flex items-center space-x-2">
        <span className="font-medium">{value}</span>
        <Badge variant={status === 'good' ? 'success' : status === 'warning' ? 'warning' : 'destructive'}>
          {status}
        </Badge>
      </div>
    </div>
  )
}

function ActivityFeed({ activities }: any) {
  return (
    <div className="space-y-4">
      {activities?.map((activity: any) => (
        <div key={activity.id} className="flex items-start space-x-4">
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
            activity.type === 'USER' ? 'bg-blue-100' :
            activity.type === 'PAYMENT' ? 'bg-green-100' :
            activity.type === 'PROJECT' ? 'bg-purple-100' :
            'bg-gray-100'
          }`}>
            {activity.type === 'USER' && <Icons.user className="h-4 w-4 text-blue-500" />}
            {activity.type === 'PAYMENT' && <Icons.dollarSign className="h-4 w-4 text-green-500" />}
            {activity.type === 'PROJECT' && <Icons.briefcase className="h-4 w-4 text-purple-500" />}
            {activity.type === 'ALERT' && <Icons.alertTriangle className="h-4 w-4 text-amber-500" />}
          </div>
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">{activity.user}</span> {activity.action}
            </p>
            <p className="text-xs text-gray-500">{getTimeAgo(activity.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function Pagination({ page, total, limit, onPageChange }: any) {
  const totalPages = Math.ceil(total / limit)
  
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">
        Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} of {total} results
      </p>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

function CardFooter({ children }: any) {
  return <div className="flex items-center p-6 pt-0">{children}</div>
}
